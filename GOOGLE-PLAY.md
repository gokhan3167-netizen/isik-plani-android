# Işık Planı – Google Play'e yayınlama rehberi

Paket adı: `com.isikplani.app` (bir kez yayınlanınca değişmez)
Destek e-postası: isikplani.destek@gmail.com
Gizlilik politikası: Netlify sitenin adresi + `/gizlilik.html`
(ör. https://SITE-ADIN.netlify.app/gizlilik.html)

## 0. Önemli kural: 12 test kullanıcısı, 14 gün

2023 sonrası açılan kişisel geliştirici hesaplarında uygulama herkese açılmadan önce
kapalı testte en az 12 kişinin 14 gün boyunca kesintisiz test kullanıcısı olarak kalması
gerekir. Dahili test bu süreye sayılmaz. Bu yüzden derlemeler varsayılan olarak
kapalı test (alpha) kanalına gider. 12-15 Gmail adresi topla (biri çıkarsa sayı düşmesin).

## 1. Geliştirici hesabı (bir kez)

1. play.google.com/console → isikplani.destek@gmail.com ile giriş → Kişisel hesap.
2. 25 $ tek seferlik ücret, kimlik doğrulama, telefon doğrulaması, bir Android telefonda
   Play Console uygulamasıyla cihaz doğrulaması.
3. Geliştirici adı mağazada görünür ("Gökhan Gülçebi" ya da "Işık Planı").
   Uygulama ücretsiz olduğu sürece ev adresin herkese gösterilmez.

## 2. Uygulamayı oluştur

Tüm uygulamalar → Uygulama oluştur → Ad: "Işık Planı – Rider Çizimi", dil Türkçe,
Uygulama, Ücretsiz → beyanları işaretle → Oluştur.

## 3. Kontrol panelindeki formlar

| Form | Cevap |
|---|---|
| Gizlilik politikası | https://SITE-ADIN.netlify.app/gizlilik.html |
| Uygulama erişimi | Tüm işlevler özel erişim gerektirmeden kullanılabilir |
| Reklamlar | Hayır |
| İçerik derecelendirmesi | Kategori "Tüm diğer uygulama türleri"; şiddet, cinsellik, kumar, uyuşturucu, kullanıcılar arası iletişim, konum paylaşımı, dijital satın alma: hepsi Hayır → "Herkes / 3+" |
| Hedef kitle | Yalnızca "18 ve üzeri"; çocuklara yönelik değil |
| Haber uygulaması | Hayır |
| Veri güvenliği | Veri toplamıyor / paylaşmıyor → "Hayır" (aşağıya bak) |
| Devlet uygulaması | Hayır |
| Finansal özellikler | Hiçbiri |
| Sağlık uygulaması | Hayır |

Veri güvenliği: "Uygulamanız gerekli kullanıcı veri türlerinden herhangi birini toplar
veya paylaşır mı?" → Hayır. Planlar, kütüphane ve ayarlar yalnızca cihazda; hesap,
analiz, reklam yok; online kütüphane isteklerinde kişisel veri gönderilmiyor.

## 4. Mağaza girişi (Büyüme → Mağaza varlığı → Ana mağaza girişi)

- Metinler: `store/magaza-metinleri.md`
- Simge: `store/play-icon-512.png`
- Öne çıkan grafik: `store/play-feature-graphic-1024x500.png`
- Telefon ekran görüntüleri: `store/play-ekran-1..6.png`
- Kategori: Verimlilik · E-posta: isikplani.destek@gmail.com

## 5. GitHub secret'ları (bir kez)

Depo → Settings → Secrets and variables → Actions:
- `PLAY_UPLOAD_KEYSTORE`, `PLAY_UPLOAD_PASSWORD` → play-yukleme-anahtari.txt içindeki değerler
- `ANDROID_DEBUG_KEYSTORE` → android-imza-anahtari.txt (zaten varsa dokunma)
Bu .txt dosyalarını asla depoya yükleme; yedeğini USB'de / şifre yöneticisinde tut.

## 6. İlk derleme ve ilk yükleme (elle)

1. GitHub → Actions → "Android APK derle" → Run workflow → kanal: alpha → Run.
2. Bitince Artifacts'tan `isik-plani-play-aab` indir, zipten `.aab` çıkar.
3. Play Console → Test ve yayınla → Kapalı test → Alpha → Yönet:
   - Test kullanıcıları: e-posta listesi oluştur, 12+ Gmail adresi ekle.
   - Ülkeler: Türkiye (ve istediğin diğerleri).
   - Yeni sürüm oluştur → Play Uygulama İmzalama'yı kabul et → `.aab` yükle →
     sürüm notu → Kaydet → İncelemeye gönder.
4. Onaydan sonra (genelde 1-7 gün) Test kullanıcıları sekmesindeki katılım bağlantısını
   12 kişiye gönder; her biri "Test kullanıcısı ol" deyip Play'den kurar. Kimse kaldırmasın.

## 7. Otomatik yükleme (isteğe bağlı, ilk elle yüklemeden sonra)

1. console.cloud.google.com → proje → "Google Play Android Developer API"yi etkinleştir.
2. IAM → Hizmet hesapları → oluştur → Anahtarlar → JSON indir.
3. Play Console → Kullanıcılar ve izinler → hizmet hesabının e-postasını davet et →
   Işık Planı için "Test kanallarına sürüm yayınla" izni.
4. JSON'un tamamını GitHub secret `PLAY_SERVICE_ACCOUNT` olarak ekle.
Sonra Actions'ta kanal seçip çalıştırmak yeterli.

## 8. Herkese açık yayın

14 gün dolunca Kontrol paneli → "Üretim erişimi için başvur" → birkaç soru (kaç kişi
test etti, ne geri bildirim aldın, neyi düzelttin). Onaydan sonra Üretim kanalına yayınla.

## Teknik notlar
- Hedef API 36 (Android 16): Play'in yeni uygulama şartı; workflow otomatik ayarlıyor.
- versionCode = GitHub çalıştırma numarası, her derlemede artar.
- Eski APK kurulu telefonda Play sürümü üstüne kurulmaz (imza farklı): önce
  Aktar › Projeyi kaydet (.json) ile yedekle, eskiyi kaldır, Play'den kur, yedeği aç.
