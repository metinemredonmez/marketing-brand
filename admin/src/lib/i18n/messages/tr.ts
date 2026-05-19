/**
 * Türkçe çeviri sözlüğü. Yeni anahtar eklerken aynı path'i `en.ts`'e de ekle.
 * Düz yapı (key1.key2.key3) — `t("nav.dashboard")` gibi kullanılır.
 *
 * Tip rekürsif object-of-strings olarak tanımlandı — şekil zorunlu,
 * literal değerler değil (EN'in farklı string'lere izin vermesi için).
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
    confirm: "Onayla",
    reject: "Reddet",
    approve: "Onayla",
    pause: "Duraklat",
    resume: "Devam et",
    active: "Aktif",
    inactive: "Pasif",
    suspended: "Askıda",
    actions: "İşlemler",
    status: "Durum",
    all: "Tümü",
    none: "Yok",
    yes: "Evet",
    no: "Hayır",
    optional: "opsiyonel",
    required: "zorunlu",
  },

  app: {
    title: "MarkaRadar Admin",
    adminBadge: "admin",
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

  nav: {
    section: {
      main: "Ana",
      content: "İçerik",
      marketing: "Pazarlama",
      community: "Topluluk",
      brandStudio: "Brand Studio",
      commerce: "Ticari",
      system: "Sistem",
    },
    dashboard: "Dashboard",
    analytics: "Analitik",
    articles: "Makaleler",
    aiStudio: "AI Stüdyo",
    comments: "Yorumlar",
    newsletter: "Newsletter",
    reports: "Raporlar",
    agencies: "Ajanslar",
    reviewModeration: "Review Moderasyon",
    jobs: "İş İlanları",
    academy: "Akademi",
    events: "Etkinlik & Ödül",
    brandAccounts: "Marka Hesapları",
    approvalQueue: "Onay Kuyruğu",
    premium: "Premium Üyeler",
    users: "Kullanıcılar",
    settings: "Ayarlar",
    auditLog: "Denetim Kaydı",
    pages: "Sayfalar (CMS)",
  },

  dashboard: {
    title: "Dashboard",
    subtitle: "Bu hafta MarkaRadar nasıl ilerliyor?",
    stat: {
      publishedNews: "Yayında haber",
      newsletterSubs: "Newsletter abone",
      premiumMembers: "Premium üye",
      listedAgencies: "Listelenen ajans",
      pendingReviews: "Bekleyen review",
      monthlyVisitors: "Aylık ziyaretçi",
      activeCourses: "Aktif kurs",
      activeJobs: "Aktif iş ilanı",
    },
    todayTasks: "Bugün yapılacaklar",
    recentActivity: "Son aktivite",
    noActivity: "Henüz aktivite yok.",
  },

  login: {
    title: "Yönetici Girişi",
    subtitle: "MarkaRadar Admin Paneline hoş geldiniz",
    email: "E-posta",
    password: "Şifre",
    submit: "Giriş Yap",
    submitting: "Giriş yapılıyor...",
    error: "Giriş başarısız",
  },

  articleStatus: {
    draft: "Taslak",
    in_review: "İncelemede",
    scheduled: "Zamanlanmış",
    published: "Yayında",
    archived: "Arşivde",
  },

  articles: {
    title: "İçerik",
    countLabel: "{count} makale",
    newArticle: "Yeni makale",
    firstArticle: "İlk makaleyi oluştur",
    empty: "Henüz makale yok.",
    column: {
      title: "Başlık",
      category: "Kategori",
      status: "Durum",
      author: "Yazar",
      views: "Görüntü",
      updated: "Güncellendi",
    },
    badge: {
      premium: "Premium",
      sponsored: "Sponsorlu",
    },
    edit: "Düzenle",
  },

  aiStudio: {
    title: "AI Stüdyo",
    subtitle:
      "Yapay zekâ ile makale taslakları, başlık önerileri ve sosyal post üret.",
  },

  newsletter: {
    title: "Newsletter",
    subtitle:
      'Günlük "Pazarlama 5" composer ve abone istatistikleri.',
  },

  agencies: {
    title: "Ajanslar",
    subtitle: "{count} ajans · Top 50 ranking: {top} aktif",
    new: "Yeni ajans",
    firstAgency: "İlk ajansı ekle",
    empty: "Henüz ajans yok.",
    topRanking: "Türkiye Top 50 Ranking (review puanına göre)",
    moreCount: "+{count} daha",
    column: {
      name: "Ajans",
      city: "Şehir",
      tier: "Tier",
      reviews: "Review",
      verification: "Doğrulama",
    },
  },

  academy: {
    title: "Akademi",
    subtitle: "{courses} kurs · {cohorts} kohort",
    newCourse: "Yeni kurs",
    openCohort: "Kohort aç",
    firstCourse: "İlk kursu oluştur",
    empty: "Henüz kurs yok.",
    inactive: "Pasif",
    price: "Fiyat",
    earlyBird: "early bird",
    cohortLabel: "Kohort #{n}",
    enrolledLabel: "kayıtlı",
    cohortStatus: {
      open: "Açık",
      full: "Dolu",
      in_progress: "Devam ediyor",
      completed: "Tamamlandı",
      canceled: "İptal",
    },
  },

  events: {
    title: "Etkinlik & Ödül",
    subtitle: "{count} etkinlik — zirve, ödül töreni, webinar",
    new: "Yeni etkinlik",
    empty:
      'Henüz etkinlik yok. "Türkiye AI Marketing Ödülleri" duyurusu için etkinlik oluştur.',
    juryPage: "Jüri sayfası",
    type: {
      summit: "Zirve",
      workshop: "Workshop",
      webinar: "Webinar",
      meetup: "Buluşma",
      awards: "Ödül",
    },
  },

  reviews: {
    title: "Review Moderasyon Kuyruğu",
    subtitle: "{count} review onay bekliyor. SLA: 72 saat.",
    empty: "Kuyrukta bekleyen review yok. İyi iş!",
  },

  comments: {
    title: "Yorum Moderasyon",
    subtitle:
      "{count} yorum onay veya inceleme bekliyor (raporlanan veya pending).",
    empty: "Kuyrukta yorum yok.",
    approve: "Onayla",
    rejectSpam: "Reddet (spam)",
    reportsLabel: "rapor",
  },

  analytics: {
    title: "Analitik",
    subtitle: "AI kullanımı, trafik, içerik üretim ve gelir özetleri.",
    stat: {
      publishedArticles: "Yayında makale",
      newsletterSubs: "Newsletter abone",
      newsletterHint: "Hedef ay 12: 15.000",
      listedAgencies: "Listelenen ajans",
      activeJobs: "Aktif iş ilanı",
    },
    ai: {
      title: "AI Kullanım — bu ay",
      generationsLabel: "{count} üretim",
      spent: "Bu ay harcanan",
      budget: "Bütçe limiti",
      remaining: "Kalan bütçe",
      used: "%{pct} kullanıldı",
      byType: "Tip bazında",
      byProvider: "Provider bazında",
      budgetWarn: "Bütçe %{pct}",
    },
    revenue: {
      title: "Gelir özeti",
      subtitle: "MRR, sponsorlu içerik, ajans premium, iş ilanı geliri.",
      phase2:
        "Faz 2: Stripe + iyzico subscription aggregate, sponsorlu içerik revenue ve ajans tier upgrade'leri burada gösterilecek.",
    },
  },

  reports: {
    title: "Raporlar",
    subtitle: "{count} rapor — premium PDF mağazası",
    new: "Yeni rapor",
    empty: "Henüz yayında rapor yok.",
    firstSuggestion:
      'İlk öneri: "Türkiye Ajans Ekosistemi Raporu 2026" (ücretsiz — lead magnet)',
    free: "Ücretsiz",
    includedInTier: "{tier} üyelere dahil",
    pages: "sayfa",
  },

  premium: {
    title: "Premium Üyeler",
    subtitle: "MarkaRadar+ subscription yönetimi, MRR ve churn metrikleri.",
    tiers: "Tarifeler",
    perYear: "yıl",
    stat: {
      active: "Aktif üye",
      mrr: "MRR (TL)",
      newThisMonth: "Bu ay yeni",
      churn: "Churn (30g)",
    },
    hint: {
      active: "Stripe webhook'tan gelir",
      mrr: "Aylık tekrar eden gelir",
      churn: "Hedef: < %5",
    },
    phase2Title: "Bu sayfa faz 2'de tamamlanacak",
    phase2Body:
      "Stripe + iyzico subscription listesi, abone filtreleme, manuel iptal/refund, churn analizi. Şu an backend'de /admin/subscriptions endpoint'leri (faz 2'de yazılacak) hazır olunca burası dolacak.",
  },

  jobs: {
    title: "İş İlanları",
    countLabel: "{count} ilan",
    new: "Yeni ilan",
    empty: "İlan yok.",
    remote: "Uzaktan",
    column: {
      role: "Pozisyon",
      company: "Şirket",
      seniority: "Seviye",
      plan: "Plan",
      status: "Durum",
      viewApply: "View / Apply",
      expires: "Bitiş",
    },
    status: {
      pending: "Beklemede",
      active: "Aktif",
      expired: "Süresi doldu",
      filled: "Dolduruldu",
      withdrawn: "Geri çekildi",
    },
  },

  users: {
    title: "Kullanıcılar",
    subtitle: "MarkaRadar üyeleri, rolleri ve durum yönetimi.",
    searchPlaceholder: "E-posta veya isim ile ara...",
    countLabel: "{count} kullanıcı",
    empty: "Bu filtrede kullanıcı yok.",
    column: {
      name: "İsim",
      email: "E-posta",
      role: "Rol",
      status: "Durum",
      verified: "Doğrulama",
      lastLogin: "Son giriş",
      joined: "Kayıt",
      actions: "İşlem",
    },
    statusActive: "Aktif",
    statusInactive: "Pasif",
    verified: "Doğrulanmış",
    notVerified: "Doğrulanmadı",
    never: "—",
    deactivate: "Pasifleştir",
    activate: "Aktifleştir",
    changeRole: "Rol değiştir",
    confirmDeactivate: "{name} kullanıcısını pasifleştirmek istediğine emin misin?",
  },

  settings: {
    title: "Ayarlar",
    subtitle: "Sistem yapılandırması ve servis durumu.",
    services: {
      title: "Servis durumu",
      database: "Veritabanı",
      redis: "Redis (queue + cache)",
      storage: "Object storage (S3/R2)",
      ai: "AI provider",
      mail: "E-posta servisi",
      payment: "Ödeme (Stripe + iyzico)",
      configured: "Yapılandırıldı",
      notConfigured: "Yapılandırılmadı",
      healthy: "Sağlıklı",
      unhealthy: "Sorunlu",
    },
    appInfo: {
      title: "Uygulama",
      version: "Versiyon",
      environment: "Ortam",
      uptime: "Çalışma süresi",
    },
    aiBudget: {
      title: "AI bütçesi (bu ay)",
      cap: "Aylık üst sınır",
      used: "Bu ay harcanan",
      remaining: "Kalan",
    },
    actions: {
      title: "Hızlı eylemler",
      revalidate: "Web cache yenile",
      flushQueue: "Kuyruğu temizle",
      sentTest: "Test maili gönder",
    },
    placeholder:
      "Bu sayfa faz 2'de genişletilecek — şu an servis durumu ve temel bilgi.",
  },

  audit: {
    title: "Denetim Kaydı",
    subtitle: "Tüm yönetici aksiyonları (audit trail). Filter + tarihçe.",
    countLabel: "{count} kayıt",
    empty: "Filtrede kayıt yok.",
    filter: {
      action: "Aksiyon",
      resource: "Kaynak",
      actorEmail: "Aktör e-postası",
      failedOnly: "Sadece başarısızlar",
      apply: "Uygula",
      clear: "Temizle",
    },
    column: {
      time: "Zaman",
      actor: "Aktör",
      action: "Aksiyon",
      resource: "Kaynak",
      status: "Durum",
      changes: "Değişiklik",
    },
    success: "Başarılı",
    failed: "Başarısız",
    showDetails: "Detay",
    hideDetails: "Gizle",
    noChanges: "Diff yok",
  },

  brandStudio: {
    accounts: {
      title: "Marka Hesapları",
      subtitle:
        "KYC onayı bekleyen ve aktif firmalar. Vergi numarası, web sitesi uyumluluğu kontrol edilir.",
      empty: "Bu filtrede firma yok.",
      filter: {
        all: "Tümü",
        pendingKyc: "KYC Bekliyor",
        active: "Aktif",
        suspended: "Askıda",
        rejected: "Reddedildi",
      },
      column: {
        company: "Firma",
        contact: "İletişim",
        tax: "Vergi",
        wallet: "Cüzdan",
        status: "Durum",
        actions: "İşlem",
      },
      action: {
        activate: "Aktive et",
        suspend: "Askıya al",
        reactivate: "Yeniden aktive et",
        reject: "Reddet",
      },
      rejectConfirm: "{company} firmasını reddetmek istediğine emin misin?",
      walletAdjust: {
        button: "Bakiye düzelt",
        title: "Bakiye düzeltmesi — {company}",
        currentBalance: "Mevcut bakiye",
        amount: "Tutar (₺)",
        amountHint:
          "Pozitif değer ekler (bonus, iade); negatif değer düşer (hata geri alma).",
        reason: "Gerekçe (min 5 karakter, audit log'a kayıt)",
        reasonPlaceholder:
          "Örn. müşteri şikayeti iadesi, promosyon kredisi, vb.",
        submit: "Bakiyeyi güncelle",
        submitting: "Güncelleniyor...",
        successAdded: "Bakiye +{amount} ₺ güncellendi",
        successDeducted: "Bakiye {amount} ₺ düşüldü",
      },
    },
    campaigns: {
      title: "Brand Kampanya Onay Kuyruğu",
      subtitle:
        "{count} kampanya onay bekliyor. Reklam Kurulu uyumu, yanlış bilgi, taklit marka kontrolü.",
      reminder:
        "Hatırlatma: Sponsorlu içerik / editöryel oranı %30 üstüne çıkmamalı. KVKK & Reklam Kurulu (RTÜK + 6502) uyumu zorunlu.",
      empty: "Onay bekleyen kampanya yok. İyi iş!",
      reviewCreative: "Creative içeriğini incele",
      targeting: "Hedefleme",
      approveAndPublish: "Onayla → yayına al",
      reject: "Reddet",
      rejectReason: "Reddetme gerekçesi (firma görür)",
      rejectPlaceholder:
        "Örn. Reklam Kurulu uyumsuz iddia: 'tek...' ifadesi ölçülemez.",
      sendReject: "Gönder",
      sending: "Gönderiliyor...",
    },
  },
  forms: {
    newArticle: {
      title: "Yeni Makale",
      subtitle: "AI Studio'dan üretim yaptıysan otomatik dolacak.",
    },
    editArticle: {
      title: "Makaleyi düzenle",
      subtitle: "Değişiklikler kaydedildiğinde anında geçerli olur.",
    },
    newAgency: {
      title: "Yeni Ajans",
      subtitle: "AjansRadar rehberine yeni ajans ekle. Tier varsayılan: free.",
    },
    newCourse: {
      title: "Yeni Kurs",
      subtitle: "Kurs detayları ve kohort kapasitesi.",
    },
    newCohort: {
      title: "Yeni kohort",
      subtitle: "Kurs için yeni dönem aç.",
    },
    newEvent: {
      title: "Yeni Etkinlik",
      subtitle: "Zirve, webinar, ödül töreni.",
    },
    newJob: {
      title: "Yeni İş İlanı",
      subtitle: "İlan plan tipine göre yayına alınır.",
    },
  },
} satisfies MessageTree;

export type Messages = typeof tr;
