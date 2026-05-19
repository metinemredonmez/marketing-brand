/**
 * Türkçe çeviri sözlüğü — MarkaRadar web (Brand Portal + marketing).
 * Aynı path'i en.ts'e ekle.
 */
export type MessageTree = { [key: string]: string | MessageTree };

export const tr = {
  common: {
    save: "Kaydet",
    cancel: "İptal",
    delete: "Sil",
    edit: "Düzenle",
    create: "Oluştur",
    loading: "Yükleniyor...",
    error: "Hata",
    success: "Başarılı",
    search: "Ara...",
    logout: "Çıkış",
    backToSite: "Siteye dön",
    optional: "opsiyonel",
    required: "zorunlu",
  },

  theme: {
    label: "Tema",
    light: "Açık",
    dark: "Koyu",
    system: "Sistem",
  },

  locale: {
    label: "Dil",
    tr: "Türkçe",
    en: "English",
  },

  reportsPage: {
    eyebrow: "Raporlar",
    title: "Pazarlama\nendüstri raporları.",
    subtitle:
      "120+ pazarlamacı ile yapılmış araştırmalar, sektör trendleri, AI maturity skorları.",
    empty: "Henüz yayınlanmış rapor yok.",
    free: "Ücretsiz",
    includedInTier: "{tier} dahil",
    pages: "{n} sayfa",
    downloads: "{count} indirme",
    freeCta: "İndir",
    buyCta: "Satın al — {price} ₺",
    tierCta: "{tier} üye ol",
  },

  eventsPage: {
    eyebrow: "Etkinlikler",
    title: "Pazarlamanın\nbuluşma noktaları.",
    subtitle:
      "Zirveler, ödül törenleri ve webinar'lar — Türkiye pazarlama profesyonelleri için.",
    empty: "Henüz duyurulmuş etkinlik yok.",
    registered: "{count} kayıtlı",
    learnMore: "Detay",
    statusLabel: {
      announced: "Duyuruldu",
      registration_open: "Kayıtlar açık",
      sold_out: "Doldu",
      in_progress: "Devam ediyor",
      completed: "Tamamlandı",
      canceled: "İptal",
    },
    typeLabel: {
      summit: "Zirve",
      workshop: "Workshop",
      webinar: "Webinar",
      meetup: "Buluşma",
      awards: "Ödül",
    },
  },

  about: {
    eyebrow: "Hakkımızda",
    title: "Türkiye'nin\nAI-native pazarlama medyası.",
    subtitle:
      "Pazarlamanın hızını AI ile yakalayan tek Türk medyası. Editöryel içerik + ajans rehberi + AI üretim aracı + topluluk.",
    vision: {
      label: "Vizyon",
      body:
        "Türkiye'nin pazarlama profesyonellerinin her sabahki ritüeli olmak. Morning Brew + Stratechery + Clutch'un Türk hibridi.",
    },
    mission: {
      label: "Misyon",
      body:
        'Pazarlamacılara sadece haber değil, "markalar için çıkarım" seviyesinde analitik değer üretmek; ajansları verified review\'la şeffaflaştırmak.',
    },
    whatWeDo: "Ne yapıyoruz?",
    features: {
      newsletter: "Günlük 'Pazarlama 5' — 5 dakikada günün gündemi.",
      directory: "AjansRadar — doğrulanmış müşteri yorumlu rehber.",
      aiStudio: "AI Stüdyo — 1 kaynak metinden 8 farklı format üretimi.",
      premium: "MarkaRadar+ Premium — haftalık deep-dive + CMO Club Slack.",
      awards: "Türkiye AI Marketing Ödülleri — yıllık ödül programı.",
      academy: "MarkaRadar Akademi — kohort tabanlı eğitimler.",
    },
    contactCta: {
      title: "İletişim",
      body: "Sponsorluk, basın, ortaklık için:",
      advertise: "Reklam ver",
      contact: "Form ile iletişim",
    },
  },

  contact: {
    eyebrow: "İletişim",
    title: "Bizimle konuş.",
    subtitle:
      "Sponsorluk, ajans rehberi premium, basın talepleri için 24 saat içinde dönüş.",
    email: "E-posta",
    inbox: "hello@markaradar.com",
    cards: {
      sponsor: {
        title: "Sponsorluk + reklam",
        desc: "Newsletter, sponsor makale, banner. Brief gönder, 24 saatte dönüş.",
        cta: "Brief gönder",
      },
      agency: {
        title: "Ajans premium başvurusu",
        desc: "Featured / Elite tier için satış ekibimizle görüş.",
        cta: "Detay",
      },
      press: {
        title: "Basın & medya",
        desc: "Röportaj, demo, ortak yayın talepleri.",
        cta: "İletişim",
      },
    },
  },

  jobsPage: {
    eyebrow: "Kariyer",
    title: "Pazarlamacının\nkariyer fırsatları.",
    subtitle:
      "Türkiye'nin pazarlama, reklam ve marka kariyer fırsatları — doğrulanmış işverenlerden.",
    countLabel: "{count} ilan",
    searchPlaceholder: "Pozisyon veya şirket ara...",
    allLevels: "Tüm seviyeler",
    remoteOnly: "Sadece uzaktan",
    filterCta: "Filtrele",
    clear: "Temizle",
    empty: "Henüz aktif iş ilanı yok.",
    remote: "Uzaktan",
    detail: {
      back: "Tüm ilanlar",
      apply: "Başvur",
      company: "Şirket",
      location: "Lokasyon",
      seniority: "Seviye",
      employment: "Çalışma türü",
      salary: "Maaş",
      postedOn: "Yayınlandı",
      expiresOn: "Son başvuru",
    },
  },

  academyPage: {
    eyebrow: "Akademi",
    title: "Pazarlamacının\nyeni nesil eğitimleri.",
    subtitle:
      "Kohort tabanlı yoğun programlar, self-paced eğitimler ve in-person workshop'lar — gerçek case study'lerle.",
    empty: "Henüz yayında kurs yok.",
    nextCohort: "Sıradaki kohort",
    earlyBird: "Erken kayıt",
    enroll: "Kayıt ol",
    detail: {
      back: "Tüm kurslar",
      outcomes: "Ne öğreneceksin",
      instructor: "Eğitmen",
      cohorts: "Yaklaşan kohortlar",
      enrolled: "kayıtlı",
      duration: "{weeks} hafta",
    },
    format: {
      online: "Online",
      inPerson: "Yüz yüze",
      selfPaced: "Self-paced",
    },
  },

  agencyDirectory: {
    eyebrow: "Doğrulanmış review",
    title: "Türkiye'nin\najans rehberi.",
    subtitle:
      "Müşteri e-postası + LinkedIn doğrulamalı yorumlar. Doğru ajansı, doğrulanmış geri bildirimlerle bul.",
    countLabel: "{count} ajans",
    searchPlaceholder: "Ajans, servis, lokasyon...",
    allTiers: "Tüm tier'lar",
    cityPlaceholder: "Şehir",
    filterCta: "Filtrele",
    clear: "Temizle",
    empty: "Bu filtrede ajans yok.",
    seeAll: "Tüm ajansları gör",
    verified: "Doğrulanmış",
    reviewCount: "{count} review",
    detail: {
      back: "Tüm ajanslar",
      reviewsTab: "Yorumlar",
      aboutTab: "Hakkında",
      teamSize: "Ekip büyüklüğü",
      founded: "Kuruluş",
      services: "Hizmetler",
      industries: "Sektörler",
      writeReview: "Yorum yaz",
      noReviews: "Henüz yorum yok.",
    },
  },

  advertise: {
    eyebrow: "Brand Studio",
    title: "Reklamını sen ver,\nAI ürettsin.",
    subtitle:
      "Türkçe AI ile sponsor içerik üret, MarkaRadar'da yayınla. KVKK uyumlu, self-serve, cüzdan bazlı.",
    primaryCta: "Marka hesabı aç",
    secondaryCta: "Demo iste",

    how: {
      eyebrow: "Nasıl çalışır",
      title: "4 adımda yayında.",
      step1Title: "Marka hesabı aç",
      step1Desc: "Firma bilgileri + vergi numarası. 5 dakika.",
      step2Title: "AI ile içerik üret",
      step2Desc:
        "8 farklı format — banner, sponsor makale, newsletter blurb, reels script…",
      step3Title: "Bütçe + tarih",
      step3Desc:
        "Cüzdana yükle, placement seç, kampanya başlat. Min 5.000 ₺.",
      step4Title: "Editör onayı + yayın",
      step4Desc:
        "24 saat içinde inceleme. Onay sonrası otomatik yayında.",
    },

    pricing: {
      eyebrow: "Şeffaf fiyatlandırma",
      title: "Cüzdan + onay bazlı.",
      subtitle:
        "Aylık abonelik yok. Yüklediğin bakiyenin %100'ü kampanyaya gider.",
      minBudgetTitle: "Min 5.000 ₺ / kampanya",
      minBudgetDesc: "Küçük testler için doğru başlangıç bütçesi.",
      cpmTitle: "CPM 80-180 ₺",
      cpmDesc: "Placement ve segmente göre. Saydam fatura.",
      approvalTitle: "24 saat içinde onay",
      approvalDesc: "Editöryel ekibi inceler. Reddetme oranı %12.",
      noLockInTitle: "Lock-in yok",
      noLockInDesc: "Cüzdanda para kalırsa iade edilir. Sözleşme yok.",
    },

    rules: {
      eyebrow: "Editöryel kurallar",
      title: "Hangi içerik kabul edilmez?",
      r1: "Yanıltıcı reklam (Reklam Kurulu uyumsuz).",
      r2: "Rakipleri ad vererek karalama.",
      r3: '"En iyi", "tek", "şampiyon" gibi ölçülemez iddialar.',
      r4: "Sponsorlu olduğu net gösterilmeyen içerik.",
      r5: "KVKK ihlal eden kişisel veri toplama vaadi.",
      r6: "Editöryel bağımsızlığı zedeleyen baskı.",
    },

    faq: {
      title: "Sıkça sorulanlar",
      q1: "Hangi markalar başvurabilir?",
      a1: "Türkiye'de vergi mükellefi her firma. MLM, kumar, alkol+sigara markaları kabul edilmez.",
      q2: "AI üretimi ne kadar sürer?",
      a2: "Format başına 10-30 saniye. 8 format birden üretilebilir.",
      q3: "Tek kampanyada birden fazla creative kullanabilir miyim?",
      a3: "Hayır, her kampanyaya 1 creative. Aynı bütçeyle yeni kampanya açabilirsin.",
      q4: "Kampanya iptal edersem para iade olur mu?",
      a4: "Henüz harcanmamış bakiye 14 iş günü içinde iade edilir.",
    },
  },

  premiumPage: {
    eyebrow: "MarkaRadar+",
    title: "Pazarlamanın profesyonelleri için.",
    subtitle:
      "Haftalık deep dive analiz, CMO Club Slack erişimi ve Türkiye'nin tek AI-native pazarlama endeksi.",
    yearly: "yıl",
    seats: "{n} koltuk dahil",
    cta: "Üye ol",
    foundingCta: "Founding Member ol",
    badgePopular: "En popüler",
    badgeFounding: "Sınırlı: ilk 200",
    noTiers: "Tarife bilgileri yüklenemedi.",
    paymentBanner:
      "Stripe ile uluslararası ödeme, iyzico ile Türkiye'den TL ödeme. 30 gün money-back garantisi. KDV dahil.",
    faq: {
      title: "Sıkça sorulanlar",
      q1: "İptal nasıl olur?",
      a1: "İstediğin zaman tek tıkla iptal et. Mevcut dönem sonuna kadar erişimin devam eder.",
      q2: "Premium içerik ne sıklıkla yayınlanıyor?",
      a2: "Marka Hamlesi haftada 1-2, Sektör raporları çeyrek başı, premium webinar ayda 1.",
      q3: "Türk Lirası ile ödeyebilir miyim?",
      a3: "Evet — iyzico ile TL bazlı tutar gösterilir. 3D Secure desteklenir.",
      q4: "Şirket adına fatura çıkartabilir miyim?",
      a4: "Stripe veya iyzico ile şirket adı + vergi numarası girip e-arşiv fatura alabilirsin.",
    },
  },

  landing: {
    hero: {
      eyebrow: "Türkiye'nin AI-native pazarlama medyası",
      title: "Pazarlamanın hızını\nAI ile yakala.",
      subtitle:
        "Reklam, marka ve ajans dünyasının günlük gündemi — analitik, doğrulanmış, markalar için çıkarımıyla.",
      emailPlaceholder: "iş e-postan",
      cta: "Pazarlama 5'e abone ol",
      micro: "12.000+ pazarlamacı · ücretsiz · spam yok",
    },
    trust: {
      label: "Şu firmalarda okunuyor",
    },
    publications: {
      eyebrow: "Yayınlar",
      heading: "Pazarlamayı her açıdan görmenin yolu",
      subtitle: "Markalar için strateji, ajanslar için pazar verisi, herkes için günlük gündem.",
      pazarlama5: {
        title: "Pazarlama 5",
        meta: "Günlük · ücretsiz",
        desc: "Her sabah 08:30 — Türkiye ve global pazarlama gündemi 5 dakikada özet.",
        cta: "Abone ol",
      },
      markaHamlesi: {
        title: "Marka Hamlesi",
        meta: "Haftalık · premium",
        desc: "Markaların aksiyonlarını derinden analiz — strateji + sayısal sonuç.",
        cta: "Örnek oku",
      },
      ajansRehberi: {
        title: "Ajans Rehberi",
        meta: "Sürekli güncel · ücretsiz",
        desc: "Türkiye'nin ilk verified review tabanlı ajans veritabanı.",
        cta: "Rehberi keşfet",
      },
      brandStudio: {
        title: "Brand Studio",
        meta: "Self-serve · markaya özel",
        desc: "Markaysan AI ile reklam içeriği üret, MarkaRadar'da yayınla.",
        cta: "Hesap aç",
      },
    },
    semaform: {
      eyebrow: "AI-native analiz",
      title: "Her haberde 4 perspektif.",
      subtitle:
        'Sadece "ne oldu" değil — markalar ve ajanslar için somut çıkarımıyla. Sadece MarkaRadar\'da.',
      labels: {
        news: "Haber",
        brand: "Markalar için çıkarım",
        agency: "Ajanslar için çıkarım",
        notable: "Dikkat çekenler",
      },
      example: {
        headline: "Coca-Cola Türkiye, AI-driven kampanyaya geçiyor",
        lede: "Marka, 2026'da TVC bütçesinin %40'ını AI üretim platformlarına kaydırdı.",
        brandTake:
          "CMO'lar için: prodüksiyon maliyeti %60 düşüyor ama brand-fit denetimi insan ekibinde kalmalı.",
        agencyTake:
          "Ajanslar için: 6 ay içinde TVC briefleri %30 azalacak — yeni hizmet katmanı planlayın.",
        notable:
          "Bütçenin AI'ya kayışı ilk kez %40 eşiğini aştı · Beş Ajans hâlâ tek ana ajans · 12 ay sonra reklam kurulu denetimi devreye girebilir",
      },
    },
    premium: {
      eyebrow: "Premium",
      title: "Pazarlamanın iç yüzünü gör.",
      subtitle:
        "Ayda 49 ₺. Marka Hamlesi tam erişim, raporlar, premium webinar arşivi.",
      cta: "Premium'a bak",
      free: {
        title: "Ücretsiz",
        item1: "Pazarlama 5 günlük",
        item2: "Haber arşivi",
        item3: "Ajans Rehberi temel",
      },
      paid: {
        title: "MarkaRadar+",
        item1: "Marka Hamlesi tam erişim",
        item2: "Sektör raporları (4/yıl)",
        item3: "Akademi indirimi (%30)",
        item4: "Premium webinar arşivi",
      },
    },
    studioCta: {
      eyebrow: "Markalar için",
      title: "Reklamını sen ver, AI ürettsin.",
      subtitle:
        "Türkçe AI ile sponsor içerik üret, MarkaRadar'da yayınla. KVKK uyumlu, self-serve, cüzdan bazlı.",
      cta: "Marka hesabı aç",
      learn: "Nasıl çalışır?",
    },
    audience: {
      eyebrow: "Kime uygun",
      title: "Markalar, ajanslar ve içerik üreticileri için ayrı değer",
      subtitle: "Tek platform, üç farklı kullanım senaryosu.",
      tabs: {
        brand: "Markalar",
        agency: "Ajanslar",
        creator: "Yazar / Creator",
      },
      brand: {
        f1: {
          title: "Sektör verisi",
          desc: "Türkiye'de hangi kampanya ne yaptı? CMO seviyesinde kanıt-bazlı kararlar al.",
        },
        f2: {
          title: "Brand Studio",
          desc: "AI ile reklam içeriği üret, MarkaRadar'ın 12.000+ pazarlamacı kitlesine ulaş.",
        },
        f3: {
          title: "Verified ekosistem",
          desc: "Doğrulanmış ajans rehberi + verified review — anlamlı seçim yap.",
        },
      },
      agency: {
        f1: {
          title: "Görünürlük",
          desc: "Türkiye'nin ilk verified review ajans rehberinde marka müşterileri seni bulsun.",
        },
        f2: {
          title: "İlan platformu",
          desc: "Premium plan ile ilanlarını 12.000+ pazarlamacıya ulaştır, başvuru sayısını 3x'le.",
        },
        f3: {
          title: "Rekabet zekâsı",
          desc: "Hangi ajans hangi briefi aldı, AI hazırlığı nasıl — pazarın tamamını gör.",
        },
      },
      creator: {
        f1: {
          title: "Akademi",
          desc: "AI Prompt, Performans, Brand Strategy — sektörden uzmanlarla kohort eğitimleri.",
        },
        f2: {
          title: "Yayın",
          desc: "MarkaRadar kontribütör programı — yazılarını yayınlat, kitleye ulaş.",
        },
        f3: {
          title: "Raporlar",
          desc: "Türkiye Ajans Ekosistemi, AI Maturity Index — birinci-elden veri.",
        },
      },
    },
    faq: {
      eyebrow: "Sıkça sorulanlar",
      title: "Aklında ne varsa, burada.",
      q1: {
        q: "MarkaRadar ücretsiz mi?",
        a: "Temel içeriklerin tamamı ücretsiz. Premium üyelik (yıllık) ile derinlemesine analizler, raporlar ve akademi indirimleri açılır.",
      },
      q2: {
        q: "Brand Studio nasıl çalışıyor?",
        a: "Marka hesabı aç → cüzdana TL yükle → AI ile içerik üret → moderasyon onayı sonrası MarkaRadar'da yayınlanır. CPC bazlı ücretlendirme.",
      },
      q3: {
        q: "Ajans rehberi ücretli mi?",
        a: "Ücretsiz görünürlük — Free tier. Premium tier (Featured/Elite) ile öne çıkma, anahtar kelime, lead form gibi avantajlar.",
      },
      q4: {
        q: "KVKK uyumluluğu var mı?",
        a: "Veri sorumlusu olarak KVKK kapsamında tüm yükümlülükleri karşılıyoruz. /me sayfasından verilerini indirebilir veya hesabını silebilirsin.",
      },
      q5: {
        q: "İçerik AI tarafından mı yazılıyor?",
        a: "Hayır. Editörler tarafından yazılır. AI sadece özet, kategorizasyon ve 'brand/agency takeaways' üretiminde destekçi. Her makalede AI-Human Ratio şeffaf şekilde gösterilir.",
      },
    },
    recent: {
      title: "Son haberler",
      subtitle: "Pazarlama gündeminden öne çıkanlar",
      all: "Tüm haberler",
    },
  },

  marketing: {
    nav: {
      home: "Ana Sayfa",
      aiMarketing: "AI Marketing",
      agencyDirectory: "Ajans Rehberi",
      jobs: "İş İlanları",
      academy: "Akademi",
      premium: "Premium",
      brandStudio: "Brand Studio",
    },
    auth: {
      login: "Giriş",
      register: "Kayıt",
      logout: "Çıkış",
    },
    footer: {
      tagline: "Türkiye'nin AI-native pazarlama medyası",
      sectionDiscover: "Keşfet",
      sectionCompany: "Şirket",
      sectionLegal: "Yasal",
      about: "Hakkımızda",
      contact: "İletişim",
      advertise: "Reklam Ver",
      mediaKit: "Medya Kit",
      kvkk: "KVKK",
      privacy: "Gizlilik",
      cookie: "Çerez",
      tos: "Kullanım",
      rights: "Tüm hakları saklıdır.",
      reports: "Raporlar",
    },
  },

  auth: {
    common: {
      submitting: "İşleniyor...",
    },
    login: {
      title: "Giriş yap",
      subtitle: "Henüz üye değil misin?",
      createAccount: "Hesap oluştur",
      email: "E-posta",
      password: "Şifre",
      forgot: "Unuttun mu?",
      submit: "Giriş Yap",
      submitting: "Giriş yapılıyor...",
      failed: "Giriş başarısız",
    },
    register: {
      title: "Hesap oluştur",
      subtitle: "Zaten üye misin?",
      login: "Giriş yap",
      fullName: "Ad Soyad",
      email: "E-posta",
      password: "Şifre",
      passwordHint: "Min 8 karakter",
      submit: "Hesabı oluştur",
      submitting: "Hesap oluşturuluyor...",
      failed: "Kayıt başarısız",
    },
    forgot: {
      title: "Şifremi unuttum",
      subtitle:
        "E-posta adresini gir, sıfırlama linki yollayalım.",
      email: "E-posta",
      submit: "Sıfırlama linki gönder",
      submitting: "Gönderiliyor...",
      backToLogin: "Giriş sayfasına dön",
      sent: "Eğer bu e-posta sistemimizde kayıtlıysa link gönderildi.",
    },
    reset: {
      title: "Yeni şifre belirle",
      subtitle: "Yeni şifreni gir.",
      newPassword: "Yeni şifre",
      confirmPassword: "Şifreyi tekrar gir",
      submit: "Şifreyi güncelle",
      submitting: "Güncelleniyor...",
      mismatch: "Şifreler eşleşmiyor",
      success: "Şifren güncellendi. Şimdi giriş yapabilirsin.",
    },
    verify: {
      title: "E-posta doğrulama",
      verifying: "Doğrulanıyor...",
      success: "E-posta adresin doğrulandı.",
      failed: "Doğrulama başarısız. Link geçersiz veya süresi dolmuş.",
      goLogin: "Giriş yap",
    },
  },

  brandPortal: {
    nav: {
      dashboard: "Özet",
      ai: "Brand AI Studio",
      campaigns: "Kampanyalar",
      wallet: "Cüzdan",
      reports: "Raporlar",
      team: "Ekip",
    },
    studioLabel: "Brand Studio",
    balance: "Bakiye",
    pendingKyc: "KYC onayı bekleniyor",

    dashboard: {
      hello: "Merhaba, {company}",
      subtitle:
        "AI ile reklam üret, kampanya yayınla, performansı takip et.",
      kycCardTitle: "KYC bilgilerini tamamla",
      kycCardBody:
        "Kampanya yayınlamadan önce vergi numarası ve resmi bilgilerini onaylamalıyız. Reklam Kurulu uyumluluğu için gerekli.",
      stat: {
        balance: "Cüzdan bakiyesi",
        activeCampaigns: "Aktif kampanya",
        impressions: "Toplam gösterim",
        clicks: "{count} tıklama",
      },
      quickActions: "Hızlı eylemler",
      action: {
        generate: "AI ile reklam içeriği üret",
        newCampaign: "Yeni kampanya başlat",
        recharge: "Bakiye yükle (Stripe)",
        topUp: "Bakiye yükle",
        seeAll: "Tümünü gör",
      },
      recentCampaigns: "Son kampanyalar",
      emptyCampaigns:
        "Henüz kampanyan yok. AI Studio'dan bir reklam üretip yayınlamaya başla.",
    },

    kyc: {
      taxNumber: "Vergi No",
      taxNumberPlaceholder: "10-11 hane",
      taxOffice: "Vergi Dairesi",
      taxOfficePlaceholder: "Beşiktaş VD",
      website: "Web sitesi",
      submit: "KYC bilgilerini gönder",
      submitting: "Gönderiliyor...",
      ok: "KYC bilgileri kaydedildi",
    },

    ai: {
      title: "Reklam içeriği üret",
      subtitle:
        "Türkçe, MarkaRadar editöryel tonunda sponsorlu içerik. Lansman postu, case study, banner brief, newsletter blurb ve daha fazlası.",
      contentType: "İçerik türü",
      output: "Çıktı",
      creativeName: "Creative adı",
      creativeNamePlaceholder: "Kütüphanede görünecek isim",
      clickUrl: "Tıklama URL'si (opsiyonel)",
      generate: "İçeriği üret",
      generating: "Üretiyor...",
      save: "Kütüphaneye kaydet",
      saved:
        "Creative kaydedildi (Kampanyalar > Yeni'den yayınlayabilirsin)",
    },

    campaigns: {
      title: "Reklam Kampanyaları",
      subtitle:
        "AI ile ürettiğin creative'leri kampanya olarak yayınla.",
      new: "Yeni kampanya",
      empty: "Henüz kampanyan yok",
      emptyBody: "Önce AI Studio'dan bir reklam içeriği üret, sonra yayınla.",
      goToAi: "AI Studio'ya git",
      startManual: "Manuel kampanya başlat",
      column: {
        impressions: "Gösterim",
        clicks: "Tıklama",
        budget: "Bütçe",
      },
      status: {
        draft: "Taslak",
        pending_approval: "İnceleme",
        scheduled: "Planlandı",
        active: "Yayında",
        paused: "Duraklatıldı",
        completed: "Tamamlandı",
        canceled: "İptal",
        rejected: "Reddedildi",
      },
      detail: {
        backToCampaigns: "Kampanyalar",
        rejectedReason: "Reddedilme nedeni",
        details: "Kampanya detayları",
        goal: "Hedef",
        source: "Kaynak",
        targeting: "Hedefleme",
        impressions: "Gösterim",
        clicks: "Tıklama",
        ctr: "CTR",
        spent: "Harcama",
        budgetLabel: "Bütçe: {value} ₺",
        actions: "İşlemler",
        pause: "Kampanyayı duraklat",
        resume: "Kampanyayı sürdür",
        noActions: "Mevcut durumda yapılabilecek işlem yok.",
      },
      builder: {
        title: "Self-Serve Kampanya Oluştur",
        subtitle:
          "Hazır bir creative seç, hedef + bütçe + tarih belirle. Onay sonrası otomatik yayına alınır.",
        step1: "1. Kampanya bilgileri",
        step2: "2. Creative seç",
        step3: "3. Hedefleme (opsiyonel)",
        step4: "4. Bütçe & Tarih",
        name: "Kampanya adı",
        namePlaceholder: "Spring Launch 2026",
        goal: "Hedef",
        type: "Kampanya tipi",
        placement: "Placement",
        placementOpt: {
          homepageTop: "Anasayfa Üst (970x250) — yüksek visibility",
          categoryTop: "Kategori Üst — segmente göre",
          sidebar: "Sidebar Sticky (300x600)",
          articleInline: "Makale içi (728x90)",
          mobileSticky: "Mobil Sticky alt",
          newsletter: "Newsletter üst — Pazarlama 5",
        },
        typeOpt: {
          banner: "Banner",
          sponsored: "Sponsorlu İçerik (Marka Hamlesi)",
          newsletter: "Newsletter Sponsorluğu",
          native: "Native (feed içi)",
        },
        goalOpt: {
          awareness: "Marka bilinirliği",
          traffic: "Trafik",
          leadGen: "Lead generation",
          brandStory: "Marka hikayesi",
        },
        creativeReady: "hazır",
        creativeApprove: "Onayla",
        noCreativesYet: "Henüz creative'in yok.",
        generateFromAi: "AI Studio'dan üret",
        audience: "Hedef kitle açıklaması",
        audiencePlaceholder: "35-50 yaş, FMCG markası CMO'su",
        categories: "Kategoriler (virgülle ayır)",
        categoriesPlaceholder: "ai-marketing, performans",
        cities: "Şehirler (virgülle ayır)",
        citiesPlaceholder: "İstanbul, Ankara",
        budget: "Toplam bütçe (₺)",
        budgetHint: "Min 5.000 ₺. Cüzdandan düşülür.",
        startAt: "Başlangıç",
        endAt: "Bitiş",
        balanceLabel: "Mevcut bakiye: ",
        balanceInsufficient: "Bakiye yetersiz. ",
        topUp: "Yükle",
        nextStep: "Sıradaki adım",
        flow1: "1. Editör ekibi 24 saat içinde inceler",
        flow2: "2. Reklam Kurulu uyumu kontrol edilir",
        flow3: "3. Onay sonrası bütçe rezerve edilir",
        flow4: "4. Belirlenen tarihte otomatik yayın",
        submit: "Onaya gönder",
        submitting: "Gönderiliyor...",
        fillRequired: "Tüm zorunlu alanları doldur",
        minBudget: "Minimum bütçe 5.000 ₺",
      },
    },

    wallet: {
      title: "Reklam Bakiyesi",
      subtitle:
        "Kampanya harcamaları cüzdandan düşülür. Stripe ile yükleme yap, anında kullanılabilir.",
      balance: "Mevcut bakiye",
      spent: "Toplam harcama",
      topped: "Toplam yükleme",
      rechargeTitle: "Bakiye Yükle",
      rechargeSubtitle:
        "Stripe Checkout ile güvenli ödeme. KVKK uyumlu. Min 1.000 ₺.",
      customAmount: "Özel tutar (₺)",
      customAmountHint: "Min 1.000 ₺ — Max 500.000 ₺ tek seferde",
      payWith: "Stripe ile {amount} ₺ yükle",
      paymentFailed: "Ödeme başlatılamadı",
      minAmount: "Minimum 1.000 ₺ yükleme yapılabilir",
    },

    reports: {
      title: "Performans Raporları",
      subtitle: "Tüm kampanyalarının toplu performansı.",
      stat: {
        impressions: "Toplam gösterim",
        clicks: "Toplam tıklama",
        spent: "Toplam harcama",
        ctr: "CTR",
        cpc: "Ortalama CPC",
        cpm: "Ortalama CPM",
      },
      campaignBreakdown: "Kampanya bazında",
      empty: "Henüz veri yok — kampanya başlat.",
      column: {
        campaign: "Kampanya",
        impressions: "Gösterim",
        clicks: "Tıklama",
        ctr: "CTR",
        spent: "Harcama",
      },
    },

    team: {
      title: "Firma Ekibi",
      subtitle: "Reklam paneline kimlerin erişebileceğini yönet.",
      inviteTitle: "Yeni üye davet et",
      inviteHint:
        "Davet edilen kişi önce MarkaRadar'a kayıt olmalı, sonra panele eklenebilir.",
      email: "E-posta",
      role: "Rol",
      sendInvite: "Davet gönder",
      sending: "Gönderiliyor...",
      sent: "Davet gönderildi",
      rolesTitle: "Roller",
      roles: {
        owner: "Owner — Tüm yetki, fatura erişimi",
        manager: "Manager — Kampanya yönetimi + ekip daveti",
        editor: "Editor — Creative üretebilir, kampanya başlatabilir",
        viewer: "Viewer — Sadece okuma (raporlar)",
      },
    },

    signup: {
      tagline: "MarkaRadar Brand Studio",
      title: "Marka hesabı oluştur",
      subtitle:
        "AI ile reklam içeriği üret, MarkaRadar'da yayınla. Türkçe, KVKK uyumlu, self-serve.",
      companyName: "Firma adı",
      contactName: "İletişim kişisi",
      contactPhone: "Telefon",
      contactEmail: "İş e-postası",
      industry: "Sektör",
      industryPlaceholder: "FMCG, Banka, SaaS...",
      companySize: "Firma büyüklüğü",
      companySizePlaceholder: "Seç",
      website: "Web sitesi",
      password: "Şifre",
      passwordHint: "Min 8 karakter — büyük/küçük harf + rakam önerilir",
      submit: "Marka hesabı oluştur",
      submitting: "Kayıt oluşturuluyor...",
      tos1: "Kayıt olarak ",
      tos2: " ve ",
      tos3: "'ni kabul etmiş olursun.",
      tosTerms: "Kullanım Koşulları",
      tosKvkk: "KVKK Aydınlatma Metni",
      already: "Zaten kayıtlı mısın?",
      login: "Giriş yap",
      passwordTooShort: "Şifre en az 8 karakter olmalı",
      fillRequired: "Tüm zorunlu alanları doldur",
    },
  },
} satisfies MessageTree;

export type Messages = typeof tr;
