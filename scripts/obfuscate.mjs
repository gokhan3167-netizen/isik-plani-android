// Yayın paketindeki kodu karıştırır (okunmasını ve değiştirilmesini zorlaştırır).
// Karıştırılmış sürüm gerçek bir tarayıcıda açılıp doğrulanmazsa küçültülmüş sürüm olduğu gibi kalır.
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process'; import { pathToFileURL } from 'url';
const f = process.argv[2] || 'www/index.html';
let JO; try { JO = (await import('javascript-obfuscator')).default; } catch (e) { console.log('javascript-obfuscator kurulu değil; karıştırma atlandı.'); process.exit(0); }
const src = fs.readFileSync(f, 'utf8');
const out = src.replace(/<script>([\s\S]*?)<\/script>/g, (m, code) => {
  if (code.length < 5000) return m;   // küçük betikler (hata kutusu) olduğu gibi
  const r = JO.obfuscate(code, {
    compact: true, simplify: true, target: 'browser', seed: 7,
    identifierNamesGenerator: 'hexadecimal', renameGlobals: false, transformObjectKeys: false,
    controlFlowFlattening: false, deadCodeInjection: false, selfDefending: false, debugProtection: false, disableConsoleOutput: false,
    stringArray: true, stringArrayEncoding: ['base64'], stringArrayThreshold: 0.6, stringArrayRotate: true, stringArrayShuffle: true,
    stringArrayWrappersCount: 1, splitStrings: false, unicodeEscapeSequence: false
  });
  return '<script>' + r.getObfuscatedCode().replace(/<\/script/gi, '<\\/script') + '</script>';
});
const chrome = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium-browser', '/usr/bin/chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean).find(p => { try { return fs.existsSync(p); } catch (_) { return false; } });
if (!chrome) { console.log('Doğrulama için tarayıcı bulunamadı; karıştırma uygulanmadı.'); process.exit(0); }
const tmp = path.join(path.dirname(path.resolve(f)), '__obf_test.html'); fs.writeFileSync(tmp, out);
let dom = '';
try { dom = execFileSync(chrome, ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--allow-file-access-from-files', '--virtual-time-budget=8000', '--dump-dom', pathToFileURL(tmp).href], { encoding: 'utf8', timeout: 120000, maxBuffer: 128 * 1024 * 1024 }); }
catch (e) { console.log('Doğrulama çalıştırılamadı: ' + e.message); }
try { fs.unlinkSync(tmp); } catch (_) {}
const ok = dom.length > 10000 && !/id="errbox"/.test(dom) && /data-type="wash"/.test(dom);
if (ok) { fs.writeFileSync(f, out); console.log('Kod karıştırıldı ve tarayıcıda doğrulandı: ' + f + ' (' + Math.round(out.length / 1024) + ' KB)'); }
else console.log('Doğrulama başarısız (' + dom.length + ' bayt DOM); küçültülmüş sürüm kullanılıyor.');
