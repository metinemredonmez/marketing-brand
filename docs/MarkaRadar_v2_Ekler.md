# MarkaRadar v2 — Ekler

**Format:** Ana strateji dokümanının (v2) operasyonel derinleştirmesi.
**İçerik:** Ek A (Verified Reviews), Ek B (Mini MBA), Ek C (Premium Subscription Onboarding), Ek D (7 Günlük Operasyonel Checklist).

---

# EK A — AjansRadar Verified Reviews: Tam Akış Tasarımı

> Bu modül, hibrit modelin **#1 diferansiyon noktası**. Clutch.co'nun Türkiye versiyonu — ama daha sıkı doğrulama, daha hızlı moderasyon, KVKK uyumlu.

## A.1 Neden bu modül kritik?

- Türkiye'de **hiçbir ajans rehberinde gerçek müşteri review'u yok.** Ne Pazarlama Türkiye, ne MediaCat, ne Ajansgiller, ne yerel directory'ler.
- Clutch ABD'de bu tek özellik üzerine $200M+ değerleme yaptı.
- Müşteri review'u = **B2B karar verici trafiği**. Bir CMO "X ajansı nasıl?" diye Google'da arar; bizde 7 doğrulanmış review varsa → SEO + güven.
- Aynı zamanda **ajansın premium üyelik almasının nedeni**: review yönetim paneli + öne çıkma.

## A.2 Submission flow — kullanıcı yolu (UI)

### Adım 1 — Tetikleyici
3 yerden başlayabilir:
1. Ajans profilinden "Bu ajansla çalıştın mı? Deneyimini paylaş" CTA
2. Newsletter aboneye 90 günde 1 hatırlatma: "Çalıştığın ajansları değerlendir"
3. Ajansın kendi davet linki (`/review/invite/{token}`) — ajans müşterilerine kendi gönderiyor

### Adım 2 — Reviewer doğrulama (ön)
```
Form 1: Kim olduğunu söyle
- Tam adın (gerçek ad zorunlu, anonim YOK)
- İş e-postan (şirket maili — gmail/yahoo kabul edilmez)
- LinkedIn URL'in (zorunlu)
- Çalıştığın şirket
- Rolün
- [Devam et →]
```

**★ Anti-fake önlem:** E-posta domaini ile çalıştığı şirket adı match etmeli. Mismatch varsa manuel moderasyona gider.

### Adım 3 — Proje detayları
```
Form 2: Bu ajansla nasıl bir iş yaptınız?
- Proje tipi: [Dijital / Sosyal Medya / Performans / Marka / PR / Influencer / Diğer]
- Proje süresi: [< 3 ay / 3-6 ay / 6-12 ay / 12+ ay / Devam ediyor]
- Bütçe aralığı: [< 50K / 50-200K / 200K-1M / 1M+ / Bilgi vermek istemiyorum]
- İş başlangıç tarihi: [Ay/Yıl]
```

### Adım 4 — Puanlama (5 boyut, 1-5 yıldız)
```
1. Genel memnuniyet ⭐⭐⭐⭐⭐
2. Yaratıcı / iş kalitesi ⭐⭐⭐⭐⭐
3. İletişim ⭐⭐⭐⭐⭐
4. Süre / zamanlama ⭐⭐⭐⭐⭐
5. Fiyat / değer ⭐⭐⭐⭐⭐
```

### Adım 5 — Yazılı review
```
Form 3: Deneyimini anlat
- Başlık (max 100 karakter): "..."
- Detaylı yorum (min 200 kelime, max 1000 kelime):
- Beğendiklerin (en az 1):
- Geliştirilmesi gerekenler (en az 1):
- Tekrar çalışır mıydın? [Evet / Belki / Hayır]
- Tavsiye eder misin? [1-10 NPS]

[ ] MarkaRadar'ın KVKK ve review politikasını okudum, kabul ediyorum
[ ] Yazdıklarımın gerçek deneyimimi yansıttığını taahhüt ediyorum
[Gönder →]
```

### Adım 6 — Doğrulama e-postası
- "Review'unu aldık. 24 saat içinde doğrulayıp yayınlayacağız."
- Spam değil, gerçek e-postaya doğrulama linki: `/review/verify/{token}` — link tıklanmazsa review yayınlanmaz

### Adım 7 — Backend doğrulama (otomatik + manuel)
**Otomatik kontrolün geçtiği yerler:**
- E-posta domaini şirket adıyla match ediyor mu? (ör. selin@unilever.com.tr → şirket "Unilever Türkiye" ile %80+ match)
- LinkedIn URL'inde belirtilen şirket reviewer'ın yazdığıyla aynı mı? (LinkedIn scraping veya manuel kontrol)
- IP adresinden son 30 günde aynı ajans için 3+ review gönderildi mi? (fake review pattern)
- Review metni semantically copy-paste mi? (LLM ile kontrol — başka review'larla benzerlik %85+ ise flag)

**Manuel kontrol durumu:**
- Otomatik kontrol başarısız → moderasyon kuyruğuna düşer
- Editor onaylar veya reddeder, gerekirse reviewer'a ek soru gönderir
- SLA: 72 saat içinde karar

### Adım 8 — Yayın + bildirim
- Review yayınlandığında reviewer'a e-posta: "Review'un yayında, link"
- Ajansa bildirim: "Yeni review aldınız. 14 gün içinde yanıt verebilirsiniz."
- Reviewer'a teşekkür: 6 ay ücretsiz MarkaRadar+ Lite hediye

## A.3 Right to reply — ajans yanıt hakkı

- Ajans, review yayınlandıktan sonra **14 gün içinde** halka açık yanıt verebilir
- Yanıt review'un altında "Ajansın yanıtı" başlığıyla görünür
- Yanıt tek seferlik — sonradan edit YOK, sadece append-only
- Yanıt da MarkaRadar moderasyonundan geçer (hakaret/iftira kontrolü)

## A.4 Review display algoritması

### Sıralama mantığı (varsayılan)
```python
score = (
    rating_overall * 0.40 +
    recency_weight * 0.30 +    # son 12 ay = 1.0, sonra düşer
    detail_score * 0.15 +       # kelime sayısı, beş boyut hepsi dolu mu
    verification_strength * 0.15 # email_verified, linkedin_verified, fully_verified
)
```

### Görsel hiyerarşi
- **Featured / Elite tier ajanslar:** review'ları üstte göster (sponsorlu değil, ama tier önceliği)
- **★ "Doğrulanmış" rozeti** her review'da görünür: ✅ E-posta doğrulandı / ✅ LinkedIn doğrulandı / ✅ Tam doğrulandı (görüşme yapıldı)
- **Negatif review'lar gizlenmez** — etik şartı. Ortalama puanı düşürse bile.

## A.5 Fraud detection — fake review patterns

| Pattern | Tetikleyici | Aksiyon |
|---|---|---|
| Aynı IP, 3+ review/30 gün | IP rate limit | Manuel moderasyon |
| Yeni kayıt + ilk review 5 yıldız | Yaşam süresi <24 saat | Manuel moderasyon |
| Aynı şirketten 5+ review aynı ajansa | Şirket review limiti | Manuel moderasyon |
| LinkedIn URL boş veya gizli profil | Doğrulanamaz | Reddedilir |
| Review metni başka review ile %85+ benzer | LLM similarity check | Reddedilir |
| Şirket maili dışı (gmail, hotmail) | Domain whitelist | Reddedilir, kurumsal mail iste |
| Ajans çalışanı kendi ajansına review yazıyor | LinkedIn cross-check | Otomatik gizlenir |

## A.6 Verification rozetleri — 4 seviye

| Rozet | Kriter | Görsel |
|---|---|---|
| ⚪ Doğrulanmamış | E-posta verify edilmedi | (gösterilmez — yayında değil) |
| 🟡 E-posta Doğrulandı | Reviewer linkten doğruladı | "Email Verified" rozet |
| 🔵 LinkedIn Doğrulandı | LinkedIn profili kontrol edildi | "LinkedIn Verified" rozet |
| ✅ Tam Doğrulandı | MarkaRadar editörü reviewer'la 5 dk görüşme yaptı | "Fully Verified" — premium rozet |

## A.7 Hukuki çerçeve

- **KVKK:** Reviewer'ın açık rızası ile veriler işlenir. Saklama süresi 5 yıl, sonra anonim hale getirilir.
- **Defamation:** Açıkça yanlış/iftira içeren review'lar moderasyon kuruluyla kaldırılır. Karar yazılı şekilde reviewer'a iletilir.
- **Right to be forgotten:** Reviewer her zaman review'unu silmek isteyebilir; 7 gün içinde silinir.
- **Ajansın itiraz hakkı:** Ajans bir review'a itiraz ederse, 14 gün içinde MarkaRadar moderasyon kurulu karar verir. Kararı kabul etmezse review kalır; ajans hukuki yola başvurabilir.
- **Anonim review YOK:** Glassdoor modeli değil, Clutch modeli. Gerçek ad + iş e-postası zorunlu.

## A.8 Admin moderasyon panel akışı

```
/admin/ajans/reviews/queue
├─ Pending verification (otomatik kontrol sonrası bekleyen) — 24 saat SLA
├─ Manual review (anomali tespit edilen) — 72 saat SLA
├─ Appeals (ajans itirazları) — 14 gün SLA
├─ Right to be forgotten istekleri — 7 gün SLA
├─ Flagged (kullanıcı raporladı) — 48 saat SLA
└─ Approved/Published archive
```

Her review için editör 4 aksiyondan birini alır:
- **Onayla & yayınla**
- **Reddet** (sebep yaz, reviewer'a e-posta)
- **Ek bilgi iste** (reviewer'a soru gönder)
- **Eskale et** (founder/yayın yönetmenine)

## A.9 Lansman planı (ay 5-6)

### Hafta 1: Pilot
- 20 ajansa özel davet: "İlk doğrulanmış review programının pilot katılımcısı olmak ister misiniz? Müşterilerinizden review toplama daveti gönderelim."
- Her ajans 3-5 müşterisine MarkaRadar branded e-posta gönderir
- Hedef: 60-100 ilk review

### Hafta 2-3: Public lansman
- "AjansRadar Verified Reviews resmi olarak açıldı" PR
- LinkedIn carousel: "Türkiye'nin ilk doğrulanmış ajans review sistemi"
- Newsletter feature
- Founding 50 ajansa "Pilot Member" rozeti

### Hafta 4: Top 50 ranking algoritma hazır
- Yıllık "Türkiye Top 50 Dijital Ajans" ranking metodolojisini yayınla
- Review sayısı + ortalama puan + verification rate + iş büyüklüğü ağırlıklı skor
- İlk ranking ay 12'de yayınlanacak

## A.10 12 ay sonrası metrikler hedefi

- 500+ ajans listelendi (ücretsiz + ücretli)
- 2.000+ doğrulanmış review
- Ortalama 8-15 review per top 100 ajansa
- "Top 50 ranking" yıllık PR olayı
- Aylık review iletişimi 50-100 yeni review/ay (steady state)
- ★ 25+ ajans Elite tier (149K TL/yıl × 25 = 3.7M TL/yıl gelir)

---

# EK B — AI Marketing Mini MBA: Tam Müfredat

> En yüksek margin'li ürün katmanı. Marketing Week Mini MBA modeli; Türkçeye uyarlanmış; AI marketing odaklı.

## B.1 Program özet

- **Süre:** 8 hafta
- **Format:** Online (Zoom), haftada 2 oturum (2 × 90 dk = 3 saat/hafta)
- **Toplam:** 24 saat senkron + ~30 saat asenkron (videolar, ödevler, okuma)
- **Kohort büyüklüğü:** 30-50 kişi (interactive bunun üstüne çıkmaz)
- **Fiyat:** 9.900 TL/kişi (early bird 7.900 TL, kohort açılışında ilk 15)
- **Çıktı:** Sertifika + LinkedIn badge + alumni Slack erişim
- **Eğitmen:** Kurucu + 4-6 sektör konuk eğitmen (her hafta 1 dış konuk)
- **Hedef:** Yılda 4 kohort (3 ay arayla) × 30 kişi = 120 öğrenci × 9.900 TL = ~1.2M TL/yıl

## B.2 Hedef öğrenci

- Orta-üst düzey pazarlama profesyoneli (Marketing Manager → CMO)
- Ajans sahibi / direktör (ekibini AI'ya hazırlamak isteyen)
- AI'yi pazarlama operasyonuna entegre etmek isteyen ancak nereden başlayacağını bilmeyen
- Şirketin AI strateji belgesini yazması istenen
- Yaş: 28-50, deneyim: 5-15 yıl

## B.3 Müfredat — Hafta hafta

### Hafta 0 — Onboarding (kohort başlamadan 1 hafta önce)
- Slack erişimi açılır
- Pre-kurs ödevi: "Şirketinizdeki 5 pazarlama sürecini yazın"
- Eğitmen tanışma videosu
- Kohortmate'lerle ön tanışma (Slack icebreaker)

### Hafta 1 — AI Marketing Landscape & Strateji
- **Oturum 1:** AI ne yapar, ne yapmaz? Pazarlama operasyonundaki 12 katman
- **Oturum 2:** AI strateji belgesi nasıl yazılır? (CMO sunumu)
- **Ödev:** Kendi şirketin için 1 sayfalık AI fırsat haritası
- **Konuk eğitmen:** Türkiye'den AI-native bir CMO

### Hafta 2 — İçerik Üretiminde AI
- **Oturum 1:** Prompt engineering temelleri + Türkçe ile prompt yazma
- **Oturum 2:** AI ile içerik pipeline kurmak — kaynak → 8 format
- **Ödev:** Şirketinize bir AI içerik pipeline çiz
- **Konuk:** İçerik ajansı kurucusu (AI workflow case study)
- **★ Bonus:** MarkaRadar AI Studio'sunu demo olarak göster

### Hafta 3 — Performans Pazarlama + AI
- **Oturum 1:** Programmatic + AI: Bid optimization, audience modeling, creative testing
- **Oturum 2:** Google/Meta'nın AI ürünleri (Performance Max, Advantage+) ile çalışma
- **Ödev:** A/B test setup'ı AI varyantlarıyla
- **Konuk:** Performance agency director

### Hafta 4 — Görsel + Video AI
- **Oturum 1:** Midjourney, DALL-E, Stable Diffusion — marka için kullanım
- **Oturum 2:** Video AI (Runway, Sora, Synthesia) — Reels/UGC üretimi
- **Ödev:** Bir kampanya için 5 görsel + 1 video AI ile üret
- **Konuk:** Yaratıcı yönetmen

### Hafta 5 — Müşteri Analitiği + AI
- **Oturum 1:** Müşteri segmentasyonu, churn prediction, CLV modeling — AI ile basit yaklaşımlar
- **Oturum 2:** Conversational AI (chatbot, voice agent) müşteri deneyiminde
- **Ödev:** Kendi müşteri datanız için 1 use case yazın
- **Konuk:** Data scientist / MarTech kurucusu

### Hafta 6 — SEO + AI
- **Oturum 1:** AI çağında SEO — Google AI Overviews, Bing AI, Perplexity için optimizasyon
- **Oturum 2:** İçerik kümeleri AI ile nasıl üretilir (scaled content + quality)
- **Ödev:** Şirket sitenize 5 pillar page + 25 cluster article önerin
- **Konuk:** SEO uzmanı

### Hafta 7 — AI Etik, KVKK, Marka Riski
- **Oturum 1:** AI ile telif, KVKK, deepfake, marka itibar riskleri
- **Oturum 2:** "AI policy" şirket içi nasıl yazılır?
- **Ödev:** Şirketiniz için 1 sayfalık AI kullanım politikası
- **Konuk:** Avukat / compliance uzmanı

### Hafta 8 — Final Project + Sunum
- **Oturum 1:** Final project pitch'leri (10'ar dakika, 6 sunum)
- **Oturum 2:** Final pitch'leri (kalan 6 sunum) + sertifika töreni + alumni Slack lansmanı
- **Final project:** Şirketin/müşterin için 15 dakikalık "AI Marketing Roadmap" sunumu

## B.4 Sertifikasyon

- **MarkaRadar AI Marketing Certificate** — final project tamamlama + kohort katılım %80+ şartı
- LinkedIn badge entegrasyonu (Credly veya kendi sistem)
- Sertifika URL'i public — paylaşılabilir
- Alumni profilleri MarkaRadar'da listelenebilir (opt-in)

## B.5 Alumni network

- Lifetime Slack erişim (#alumni kanalı)
- Yılda 1 alumni reunion (online + İstanbul)
- Alumni indirimi: gelecek kohortlara %25 indirim
- Alumni'lere özel webinarlar (3 ayda 1)
- Alumni'lerden iş ilanı + iş arayan board
- ★ Alumni → premium subscription dönüşüm oranı tarihsel olarak %35-50

## B.6 Kohort operasyon takvimi

| Hafta | Action |
|---|---|
| T-12 hafta | Kohort duyurusu + early bird açılır |
| T-8 hafta | Eğitmen daveti gönderilir, syllabus finalize |
| T-6 hafta | Marketing campaign aktif (LinkedIn ads, newsletter feature) |
| T-3 hafta | Early bird kapanır, normal fiyat başlar |
| T-1 hafta | Onboarding e-postası, Slack erişimi açılır |
| T-0 | Kurs başlar |
| Hafta 1-8 | Kurs sürer |
| T+1 hafta | Mezuniyet anketi (NPS), sertifika dağıtım |
| T+4 hafta | Alumni reunion (online) |

## B.7 İlk kohort lansmanı (ay 7-8)

- **Hedef:** 25 kişilik pilot kohort, early bird 7.900 TL × 25 = ~200K TL gelir
- **Maliyet:** Eğitmen ücretleri ~30K + platform 10K + marketing 30K = ~70K
- **Net:** ~130K TL ilk kohortta
- **Asıl değer:** Marka, testimonial, alumni'lerin LinkedIn'de paylaşımı, gelecek kohortlara akış

## B.8 İkincil ürünler (Akademi içinde)

### Self-paced kurslar (otomatize, faz 2)
- "30 günde AI Prompt Engineering" — 1.990 TL
- "ChatGPT ile Sosyal Medya Yönetimi" — 1.490 TL
- "Midjourney ile Marka Görsel Dili" — 1.990 TL
- 1 senaryo: 200 self-paced öğrenci/ay × ortalama 1.700 TL = ~340K TL/ay (faz 2-3'te)

### Kurumsal workshop (in-house)
- 1 günlük (online veya yüz yüze) müşteri ekibine
- Fiyat: 50-150K TL/oturum
- Hedef: ayda 2-4 workshop, ~100-300K TL/ay

### CMO Buluşması (executive roundtable)
- Üç ayda 1, max 15 kişi, premium üyelere özel
- Ücretsiz (Pro üyelere) — fakat ürün stickiness için kritik
- 1 günlük, içerik: closed-door tartışma + sektör datalı sunum

---

# EK C — MarkaRadar+ Premium Subscription Onboarding

> Premium subscription'ın churn'ü %5/ay altında tutmak için ilk 30 günü ve renewal cycle'ı çok dikkatli kurgulamak gerekiyor. Bu ek o operasyonel akışı içeriyor.

## C.1 Tarife yapısı (kısa tekrar)

| Tarife | Fiyat | Hedef kitle |
|---|---|---|
| **Lite** | $99/yıl (~3.300 TL) | Bireysel pazarlamacı, küçük ajans çalışanı |
| **Pro** | $499/yıl (~16.500 TL) | CMO, marketing director, ajans direktörü |
| **Enterprise** | $2.999/yıl (~99.000 TL) — 5 koltuk | Büyük marka pazarlama ekibi, holding |

## C.2 Sign-up flow

### Adım 1: Trigger
- 6 noktadan tetiklenir:
  1. Web makale paywall'ı (3 ücretsiz makale/ay, sonra paywall)
  2. Newsletter footer CTA
  3. Premium rapor satın alma flow'u (rapor + üyelik bundle indirim)
  4. CMO Club Slack davetiyesi (Pro tier zorunlu)
  5. Akademi kohort registration cross-sell
  6. Founding Member kampanyası (ay 0-3 özel)

### Adım 2: Tarife seçimi
- Modal aç, 3 tier yan yana
- Toggle: Aylık / Yıllık (yıllık %16 indirim)
- "En popüler: Pro" rozet
- "30 gün money-back guarantee" sosyal kanıt

### Adım 3: Hesap oluşturma (eğer yoksa)
- E-posta + isim + şirket + rol
- Sosyal login: LinkedIn (önerilen), Google
- KVKK + ToS checkbox

### Adım 4: Ödeme
- **Türkiye kullanıcı:** iyzico (TL fiyatı gösterilir)
- **Uluslararası kullanıcı:** Stripe (USD/EUR)
- Otomatik renewal default ON, kullanıcı opt-out edebilir
- Fatura/makbuz e-posta otomatik

### Adım 5: Welcome
- Confirmation sayfası: "Hoş geldin! İlk premium içeriklere şu linklerden ulaş..."
- Welcome e-postası anında (template C.4'te)
- Slack davet linki (Pro+ için)

## C.3 7 günlük welcome sequence (e-posta otomatik)

### Day 0 — Welcome (otomatik, sign-up sonrası 5 dk içinde)
**Konu:** Hoş geldin, [İsim]. MarkaRadar+ erişimin aktif.
**İçerik:**
- Kişisel selamla (kurucu sesinden)
- Bu hafta öne çıkan 3 premium içerik linki
- Slack erişim linki (Pro+ ise)
- "Sorun yaşarsan direkt bana yaz" — kurucu e-posta

### Day 1 — Premium ürünler turu
**Konu:** Premium üye olarak ne kazandın?
**İçerik:**
- 5 ana fayda madde madde
- Premium arşiv (eski deep dive'lar) link
- Bonus: "Türkiye Pazarlama Endeksi" son sayısı PDF eki

### Day 3 — İlk "deep dive" hatırlatması
**Konu:** Bu haftaki premium deep dive: [konu başlığı]
**İçerik:**
- Direct link, premium-only article
- 2 cümle teaser
- "Beğenirsen LinkedIn'de paylaş" CTA

### Day 7 — CMO Club daveti (Pro+ için)
**Konu:** CMO Club Slack'e seni bekliyoruz
**İçerik:**
- Topluluk neden var, ne tartışılıyor
- Kim katılıyor (5-10 örnek üye)
- Slack davet linki + ilk 24 saat içinde tanışma postu yazma daveti

### Day 14 — Feedback isteği
**Konu:** İlk 2 hafta nasıl geçti?
**İçerik:**
- Kısa 3 soruluk anket (NPS + open feedback)
- "Eksik bulduğun bir özellik var mı?" sorusu
- Yanıt verene 1 ay ek ücretsiz teklif

### Day 28 — Premium içerik özet + cross-sell
**Konu:** Geçen ay seninle paylaştığımız 8 deep dive
**İçerik:**
- Bookmark'a değer 8 link
- Akademi kohort cross-sell (Pro üye %20 indirim)
- "Networking" öneri: Slack'te bu hafta kimlerle tanış

## C.4 Welcome e-postası şablonu

```
Konu: Hoş geldin [İsim], MarkaRadar+ aktif.

Selam [İsim],

MarkaRadar+ ailesine hoş geldin. Bu hafta sana üç şey önereceğim:

1. Bu sabah yayınladığımız [Konu] deep dive'ı oku — şu link:
   [link]

2. Premium arşivimizden son 3 ayın en çok okunan 5 analizini şuradan
   indirebilirsin: [link]

3. Pro+ üyemizsen CMO Club Slack davet linki bu:
   [link]

Bir sorun olursa direkt bana yaz: [kurucu@markaradar.com]

İyi okumalar,
[Kurucu adı]
MarkaRadar Kurucu

PS: 30 gün içinde memnun kalmazsan tek tıkla iade alırsın.
Hesap ayarlarından: [link]
```

## C.5 Churn prevention — iptal flow'u

### Standart iptal akışı kötü: "Cancel" butonu → kayıp.
### Doğru iptal akışı: yapışkan ama saygılı.

**Adım 1:** Hesap ayarlarında "Üyeliğimi iptal et" butonuna tıkla

**Adım 2:** Anket sayfası (skip edilemez):
```
Bizi neden bırakıyorsun? (1 seçin)
○ Çok pahalı
○ İçerik beklediğim seviyede değil
○ Vaktim yok / okumuyorum
○ Şirket politikası (artık ödenmiyor)
○ Başka bir platforma geçtim
○ Diğer
```

**Adım 3:** Cevaba göre dinamik teklif:

| Sebep | Teklif |
|---|---|
| Çok pahalı | "Aylık ödemeye geçer misin? Yıllık $99 yerine $9.99/ay." |
| İçerik yeterli değil | "Editörümüzle 30 dk görüşür müsün? Eksiklerini anlamak istiyoruz. Sonra istersen yine iptal edebilirsin." |
| Vaktim yok | "Pause yap, 3 ay sonra otomatik geri başla. Para iade ederiz." |
| Şirket politikası | "Faturayı şirket adına yenileyelim mi? KDV'siz ofis paketi var." |
| Başka platforma geçtim | (Saygılı veda, NPS sor) |
| Diğer | Kurucu doğrudan e-posta ile uzanır |

**Adım 4:** "Yine de iptal et" tıklarsa:
- Üyelik dönem sonuna kadar aktif kalır (refund yok, sadece auto-renewal off)
- Kayıt arşivlenir, 90 gün sonra "Hoş geldin geri" winback campaign başlar

## C.6 Dunning — başarısız ödeme kurtarma

Kredi kartı expire, insufficient funds, vb. durumlarda:

| Gün | Aksiyon |
|---|---|
| Day 0 (ilk fail) | Sistem otomatik 3 gün sonra tekrar dener. Kullanıcıya e-posta: "Kartından çekilemedi, lütfen güncelle." |
| Day 3 (ikinci fail) | E-posta + SMS (varsa). "Premium erişimin 5 gün içinde kapanır." |
| Day 7 (üçüncü fail) | Erişim degraded (paywall geri gelir). E-posta: "Üyeliğin pasifleşti. 30 gün içinde güncellerse devam eder." |
| Day 30 | Hesap arşivlenir. "Geri dönmek istersen kart bilgini güncelle." |

★ Hibrit ipucu: Stripe + iyzico'nun retry logic'ini agresif kullan. Kart güncellemenin %70'i otomatik dunning ile yapılır.

## C.7 Renewal cycle

### Yıllık abone (önerilen)
- **T-60 gün:** "Üyeliğin 60 gün sonra yenilenecek. Tarife yükseltme/düşürme isteğin varsa şimdi yapabilirsin." e-posta
- **T-30 gün:** "Bu yıl seninle paylaştığımız 50 deep dive listesi" — value reminder
- **T-14 gün:** "Yenileme 14 gün sonra" — fiyat hatırlatma
- **T-0:** Otomatik renewal + "Yenilendi, fatura ekte"
- **T+30:** Anket: "Yeni yıl içinde ne görmek istersin?"

### Aylık abone (churn riski yüksek)
- Her ay otomatik renewal
- 3. ayda "Yıllığa geç, 2 ay bedava" teklif
- 6. ayda "Pro'ya yükselt" upsell
- 12. ayda "1 yılını kutlayalım, alumni rozet"

## C.8 Net Revenue Retention (NRR) hedefleri

- **Lite NRR:** %95+ (düşük tier, churn doğal)
- **Pro NRR:** %105+ (upsell + retention iyi)
- **Enterprise NRR:** %120+ (koltuk artışı + custom rapor upsell)
- **Genel hedef:** Yıl sonu NRR %105 (yani aynı müşteri tabanından gelir %5 büyüyor)

## C.9 Müşteri başarı uzmanı rolü (ay 6+)

Premium üye sayısı 500'ü geçtiğinde tam zamanlı bir Customer Success Manager (CSM) gerekir.

**CSM görevleri:**
- Yeni Pro+ üyeye 14 gün içinde 30 dakikalık tanışma (Zoom)
- Aylık aktif olmayan üyelere proactive reach
- Renewal yaklaşan üyelerin success story'sini topla (testimonial)
- Enterprise hesaplar için quarterly business review (QBR)
- Slack topluluğunda günlük 30 dk aktif (kurucu rolünden devralabilir)

## C.10 Founding Member programı (ay 0-3 özel)

İlk 200 üyeye özel:
- **Fiyat:** $49/yıl yerine $99 (yarı fiyat)
- **Lifetime price lock:** Fiyat artsa bile bu üyeler $49/yıl ödemeye devam eder (Stratechery modeli)
- **Founding Member rozet** — LinkedIn paylaşılabilir
- **Slack'te ayrı kanal** — kurucu ile direkt erişim
- **Ürün roadmap'a oy hakkı** — quarterly vote

**Etkisi:** Erken adopter'lara güçlü bağ kurar; LinkedIn'de paylaşırlar; sosyal kanıt motoru. Stratechery, Lenny, Sahil Bloom — hepsi bu modeli kullandı.

---

# EK D — 7 Günlük Operasyonel Checklist (kurucu için)

> Bu çizelge "kurulum haftası" için değil, **steady-state operasyon** içindir (ay 4-6 sonrası, lansman sonrası bir tipik hafta). Kurucu (yayın yönetmeni) günde 5-7 saat MarkaRadar'a harcıyor varsayımıyla.

## D.1 Genel ritim

| Bant | Saat | Konu |
|---|---|---|
| 🌅 Sabah blok | 07:30-09:30 | İçerik kontrol + newsletter onay + LinkedIn post |
| ☀️ Öğleden önce | 09:30-12:30 | Editöryel + AI Studio + ekip senkron |
| 🌤️ Öğleden sonra | 13:30-17:00 | Satış + outreach + ortak toplantıları |
| 🌙 Akşam blok | 19:00-20:00 | Topluluk + Slack + ertesi gün hazırlık |

## D.2 Pazartesi

### 🌅 Sabah (07:30-09:30)
- [ ] 07:30 — Kahve + son 12 saatlik sektör haberi tara (Reddit, X, LinkedIn) — 30 dk
- [ ] 08:00 — Newsletter ("Pazarlama 5") son onay → 08:30 gönderim
- [ ] 08:35 — Newsletter'ın LinkedIn versiyonu post (kurucu kişisel)
- [ ] 09:00 — Şirket sayfası post (haftaya bakış teması)
- [ ] 09:30 — Editör 1-on-1 (haftalık planlama — 30 dk)

### ☀️ Öğleden önce (09:30-12:30)
- [ ] Hafta içeriği planı: 25-35 haber backlog'u (editörle)
- [ ] AI Studio üretim batch çalıştır (12-15 makale ön draft)
- [ ] Editör reviews moderasyon kuyruğu (15-20 review, 30 dk)
- [ ] Premium üye Slack: günün tartışma sorusu post

### 🌤️ Öğleden sonra (13:30-17:00)
- [ ] LinkedIn outbound: 20 mesaj (premium ajans + sponsorlu hedefler)
- [ ] 1 satış toplantısı (discovery call veya teklif sunum) — 30-45 dk
- [ ] Inbound lead havuzu temizle (yanıtla, kalifiye et) — 30 dk
- [ ] Akademi kohort marketing kontrol (LinkedIn ads, landing CR) — 15 dk

### 🌙 Akşam (19:00-20:00)
- [ ] Slack CMO Club: günün tartışma yorumla, üyelere yanıt
- [ ] Salı içerik onayları
- [ ] X'te 2-3 thread / yanıt

## D.3 Salı

### 🌅 Sabah
- [ ] 08:30 — Newsletter (Salı teması: AI Marketing & MarTech)
- [ ] 08:35 — Kurucu LinkedIn post: AI Marketing günün analizi
- [ ] 09:00 — Şirket sayfası: yeni MarTech tool / AI araç incelemesi

### ☀️ Öğleden önce
- [ ] **Salı 10:00 — Haftalık ekip toplantısı (90 dk):** içerik review, satış pipeline, problemler
- [ ] AI üretim maliyet raporu kontrol (dünden bugüne)
- [ ] Premium üye onboarding kuyruğu (yeni sign-up'lara welcome)

### 🌤️ Öğleden sonra
- [ ] CMO outreach: 15 mesaj
- [ ] 1-2 satış toplantısı
- [ ] Newsletter sponsorluğu satışı (gelecek haftaya 2 slot bul)
- [ ] Ajans review moderasyon (kalan kuyruğu temizle)

### 🌙 Akşam
- [ ] Çarşamba içerik onayı
- [ ] Slack tartışmaya katıl
- [ ] Bu hafta kohort başvuruları kontrol (Akademi)

## D.4 Çarşamba

### 🌅 Sabah
- [ ] 08:30 — Newsletter (Çarşamba teması: Marka kampanyaları)
- [ ] 08:35 — LinkedIn post: bu haftanın kampanya analizi (uzun post, taşıyıcı içerik)
- [ ] 09:00 — Instagram carousel yayın (sosyal medya uzmanı yapar, sen onay)

### ☀️ Öğleden önce
- [ ] **Çarşamba 11:00 — Premium "Deep Dive" yazımı (90 dk):** haftalık özel premium içerik üret
- [ ] Editör ile premium içerik son okuma
- [ ] AI Studio: kapak görseli + LinkedIn carousel üret

### 🌤️ Öğleden sonra
- [ ] Akademi: kurs gelişimi (eğitmen sözleşme, müfredat finalize)
- [ ] Türkiye Pazarlama Endeksi anketi: bu ay sorularını editör + araştırmacı ile finalize
- [ ] 1 stratejik toplantı (yeni partner, eğitmen, danışma kurulu)

### 🌙 Akşam
- [ ] **Çarşamba 19:30 — CMO Club Slack AMA (45 dk):** kurucu canlı, üyeler soru sorar
- [ ] Perşembe içerik onayı

## D.5 Perşembe

### 🌅 Sabah
- [ ] 08:30 — Newsletter (Perşembe teması: Influencer + sosyal medya)
- [ ] 08:35 — Kurucu LinkedIn post: kontrarian view veya provokatif yorum
- [ ] 09:00 — Şirket sayfası: ajans haberi / atama

### ☀️ Öğleden önce
- [ ] **Perşembe 10:00 — Premium webinar (60-90 dk):** Pro+ üyelere özel canlı oturum (aylık)
- [ ] Webinar kayıt arşive yüklenir, alumni Slack'e gönderilir

### 🌤️ Öğleden sonra
- [ ] CMO outreach + satış toplantı
- [ ] Yeni feature roadmap planlama (geliştirici ile)
- [ ] İş ilanı satışları kontrol

### 🌙 Akşam
- [ ] Cuma haftalık özet hazırlık başlangıç (cuma sabah gidecek)
- [ ] Slack katılım

## D.6 Cuma

### 🌅 Sabah
- [ ] 08:30 — Newsletter (Cuma teması: Haftanın özeti, premium aboneye genişletilmiş)
- [ ] 09:00 — LinkedIn post: "Haftanın 5 Marka Hamlesi" carousel
- [ ] 09:30 — Instagram Reels yayın (sosyal medya uzmanı, onay)

### ☀️ Öğleden önce
- [ ] **Cuma 10:00 — Open Metrics raporu hazırla (60 dk):**
  - Bu hafta: kaç abone +, kaç premium +, kaç article view, top 3 article, AI maliyet
  - Public transparency raporu → LinkedIn'de post + premium üyelere e-posta

### 🌤️ Öğleden sonra
- [ ] Pazarlama performans kontrol (LinkedIn ads, Google ads, content)
- [ ] Bütçe / finansal review (haftalık)
- [ ] **Cuma 15:00 — Haftalık kurucu raporu (30 dk):** ne öğrendik, ne değişmeli (kendi için, deftere)

### 🌙 Akşam
- [ ] **Cuma 19:00 — Ekip happy hour / async stand-up (30 dk):** haftayı kapat, hafta sonu offline mode aktif

## D.7 Cumartesi

### Az iş günü.
- [ ] 10:00 — Cmt newsletter (Globalden Türkiye'ye teması) — önceden yazılmış, otomatik gönderim
- [ ] 11:00 — Long-form içerik okuma (sektör podcast, raporlar) — 2 saat blok
- [ ] 14:00 — Kurucu kişisel LinkedIn: thought leadership post (önceki gün yazılmış)
- [ ] Sosyal medyada düşük tempolu aktivite

## D.8 Pazar

### Toparlama günü.
- [ ] 10:00 — Pazar newsletter (Long-form rehber teması) — otomatik gönderim
- [ ] 11:00 — Gelecek hafta planı: 3 öncelik, 5 risk
- [ ] 14:00 — Long-form blog post yazma (kişisel LinkedIn için)
- [ ] 16:00 — Strateji + okuma blok (2 saat)
- [ ] Akşam offline

## D.9 Aylık takvim — bunların üstünde

| Hafta | Ekstra ritm |
|---|---|
| **Hafta 1 (ay başı)** | Aylık metrics review + open metrics raporu + Türkiye Pazarlama Endeksi anketi field |
| **Hafta 2** | Sponsorlu içerik dolu (büyük müşteri kampanyaları) |
| **Hafta 3** | Premium webinar + CMO Club online buluşma |
| **Hafta 4** | Aylık özet + gelecek ay planlama + ekip 1-on-1'lar |

## D.10 Çeyreklik takvim

| Çeyrek | Büyük olaylar |
|---|---|
| **Q başı** | Çeyrek sektör trend raporu yayını + premium üye renewal review |
| **Q ortası** | Akademi kohort açılışı (3 ayda 1 yeni kohort) |
| **Q sonu** | Çeyrek finansal review + ekip retro + strateji revizyonu |

## D.11 Tek seferlik kurulum komutları (kurucu için)

```bash
# Repo + organizasyon
gh repo create markaradar/web --private --description "MarkaRadar public site"
gh repo create markaradar/admin --private
gh repo create markaradar/content-pipeline --private

# Notion workspace
# - Bölümler: Editöryel, Satış CRM, Ürün Roadmap, Topluluk, Finans

# Tooling kurulumu
brew install gh node@20 postgresql@16 redis
npm i -g pnpm

# Domain'leri kontrol et
whois markaradar.com markaradar.com.tr ajansradar.com brandsignal.ai

# İlk e-postalar (gmail business veya google workspace)
# - emre@markaradar.com
# - hello@markaradar.com
# - sales@markaradar.com
# - support@markaradar.com

# Beehiiv hesabı
# https://beehiiv.com → newsletter platform sign-up
# Custom domain: newsletter.markaradar.com

# Stripe + iyzico
# Stripe.com → developer mode, API key alın
# iyzico.com → merchant başvurusu (KVKK uyumlu Türkiye ödeme)

# LinkedIn şirket sayfası
# https://linkedin.com/company/setup/new/

# Slack workspace
# markaradar.slack.com (toplulık + ekip iletişimi)

# Sentry, PostHog
# sentry.io → free tier
# posthog.com → free tier

# Cloudflare
# cloudflare.com → domain ekle, DNS yönet
```

## D.12 Haftalık metrics dashboard — kurucu görmesi gerekenler

```
NEWSLETTER:
  Toplam abone | + bu hafta | open rate | CTR | unsubscribe rate

WEB:
  Tekil ziyaretçi | sayfa görüntüleme | top 5 article | bounce rate

LINKEDIN:
  Şirket takipçi | + bu hafta | top post impression | kurucu kişisel takipçi

PREMIUM:
  Toplam üye | + bu hafta | churn | MRR | NRR

AJANS:
  Listelenen ajans | premium ajans | + bu hafta | review sayısı | + bu hafta

AKADEMİ:
  Aktif kohort doluluk | + bu hafta başvuru | next kohort açılış

GELIR:
  Bu ay (TL) | bu çeyrek (TL) | YTD (TL) | gerçekleşen / hedef oranı

OPERASYON:
  AI maliyet bu hafta | sunucu uptime | hata oranı (Sentry) | newsletter delivery rate
```

Bu dashboard her cuma 10:00'da otomatik üretilir ve kurucunun mailine düşer (cron job + script).

---

# Kapanış

Bu üç ek + 7 günlük çizelge, MarkaRadar v2 stratejisinin **operasyonel canlanmasıdır**. Strateji belgesi "ne yapacaksın"ı söyler; bu ekler "haftalık olarak nasıl yaşıyorsun"u söyler.

**3 ek hatırlatma:**

1. **Verified Reviews ay 5-6'da lansman** — bu modülün kalitesi, MarkaRadar'ın diğer ajans directory'lerinden farkını yaratır. Acele etme; ilk 100 review elinden geçecek, her birini moderete et.

2. **Mini MBA ilk kohort ay 7-8** — 25 kişilik küçük başla. Eğitmen ücretlerini gelişmesi için maaşa katma; kohort gelirinden öder. Alumni network seni 24. ayda ölçeklendirir.

3. **Premium subscription onboarding'i otomatize et** — Welcome sequence + churn flow + dunning. CSM rolü ay 6'da gelir; o zamana kadar kurucu manuel onboarding yapar (ilk 200 üyeye direkt e-posta).

İyi şanslar.

---

**MarkaRadar Strateji Ekleri · v2.0 · Mayıs 2026 · İç kullanım**
