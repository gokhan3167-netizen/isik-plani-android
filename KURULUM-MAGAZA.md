# Işık Planı – App Store ve Google Play’e yükleme rehberi

Bu klasör, programın **Capacitor** ile hazırlanmış telefon uygulaması projesidir. Aynı kod hem iPhone hem Android uygulamasına dönüşür. Aşağıdaki adımları bir kere yaptıktan sonra güncellemeler çok daha kısa sürer.

## Gerekenler
| | Android | iPhone |
|---|---|---|
| Bilgisayar | Windows, Mac ya da Linux | **Mac zorunlu** |
| Program | Node.js (LTS), Android Studio | Node.js (LTS), Xcode |
| Mağaza hesabı | Google Play Console (bir kerelik ücret) | Apple Developer Program (yıllık ücret) |

Hesap ücretlerini ve şartlarını kayıt olurken kontrol et; zaman zaman değişiyor.


## 0. Hızlı yol: Android APK'yı GitHub'a ürettir (bilgisayara hiçbir şey kurmadan)
1. Bu klasörün içindekileri GitHub'da yeni bir depoya yükle (`.github` klasörü dahil).
2. **Actions › Android APK derle › Run workflow**.
3. 10–15 dakika sonra çalışmanın sayfasının altındaki **Artifacts** bölümünden `isik-plani-android` dosyasını indir; içinde **isik-plani.apk** var.
4. APK'yı telefona gönder (WhatsApp, Drive, USB), dokun, "Bilinmeyen kaynaklardan yüklemeye izin ver" de, kur.
Bu APK test/ekip içi kullanım içindir. Google Play'e yüklemek için aşağıdaki 2. adımdaki imzalı .aab gerekir.

## 1. Projeyi hazırla (bir kere)
Klasörde bir terminal aç:
```
npm install
npm run vendor
npx cap add android
npx cap add ios          (sadece Mac'te)
npm run assets           (ikon ve açılış ekranlarını otomatik üretir)
npx cap sync
```

**Önemli:** `capacitor.config.json` içindeki `"appId": "com.isikplani.app"` mağazada uygulamanın kimliğidir ve sonradan değiştirilemez. Kendine özel bir şey yap, ör. `com.gokhanadin.isikplani`. Değiştirdikten sonra `npx cap sync` çalıştır (platformları eklemeden önce değiştirmek en iyisi).

## 2. Android → Google Play
1. `npx cap open android` → Android Studio açılır.
2. Önce telefonda dene: telefonu USB ile bağla, yeşil ▶ düğmesi.
3. Mağaza dosyası: **Build › Generate Signed App Bundle / APK › Android App Bundle**.
   - İlk seferde yeni bir **keystore** (imza dosyası) oluştur.
   - **Bu dosyayı ve şifresini kaybetme, yedekle.** Kaybedersen uygulamayı güncelleyemezsin.
4. Çıkan `.aab` dosyasını Play Console’da yeni uygulama oluşturup yükle.
5. Mağaza sayfası: `store/` klasöründeki ikon (512), tanıtım görseli (1024×500), metinler ve gizlilik politikası adresi.
6. Yeni kişisel geliştirici hesaplarında Google, yayından önce bir süre **kapalı test** (belirli sayıda test kullanıcısıyla) istiyor; Play Console sana tam şartı gösterecek. Tiyatrodan arkadaşlarını test kullanıcısı olarak ekleyebilirsin.

## 3. iPhone → App Store
1. `npx cap open ios` → Xcode açılır.
2. Sol üstte **App** projesi › **Signing & Capabilities** › Team: Apple Developer hesabını seç. Bundle Identifier = appId.
3. Önce telefonda dene: iPhone’u bağla, ▶.
4. **Info.plist**’e şifreleme beyanı ekle (yoksa her yüklemede sorar):
   `App Uses Non-Exempt Encryption` = **NO**
5. App Store Connect’te yeni uygulama oluştur (aynı Bundle ID).
6. Xcode’da cihaz olarak **Any iOS Device** seç › **Product › Archive** › **Distribute App** › App Store Connect.
7. Önce **TestFlight** ile kendi telefonunda dene, sonra mağaza sayfasını doldurup incelemeye gönder.
8. Gizlilik: “Data Not Collected”. İnceleme notu `store/magaza-metinleri.md` içinde hazır.

Not: Apple, sadece web sitesini kutuya koyan uygulamaları reddedebiliyor. Bu uygulama internetsiz çalışan, dosya paylaşan, kendi başına bir araç olduğu için şansı iyi; yine de ret gelirse gerekçesini bana getir, birlikte düzeltelim.

## 4. Güncelleme yayınlamak
1. Yeni `index.html`’i `www/` klasörüne koy.
2. `npx cap sync`
3. Sürüm numarasını artır:
   - Android: `android/app/build.gradle` › `versionCode` (1→2…) ve `versionName` (1.0.1)
   - iPhone: Xcode › General › Version ve Build
4. Android’de yeni .aab, iPhone’da yeni Archive; mağazaya yükle.

## Uygulamaya özel davranışlar
- **Dışa aktar:** Dosya oluşturulur ve telefonun paylaş menüsü açılır (WhatsApp, Mail, Dosyalar’a kaydet).
- **Android geri tuşu:** önce açık pencereyi/paneli kapatır, seçim yoksa uygulamadan çıkar.
- **İnternetsiz:** Yazı tipleri ve PDF/GDTF araçları uygulamanın içine gömülüdür (`npm run vendor`).
- Planlar telefonun kendi hafızasında saklanır; uygulama silinirse planlar da silinir. Önemli planları “Projeyi kaydet (.json)” ile yedekle.
