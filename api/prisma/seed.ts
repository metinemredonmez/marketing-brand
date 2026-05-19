// Seed datası — yerel geliştirme için.
// Çalıştır: yarn prisma db seed
// İdempotent: tekrar çalıştırılabilir, upsert kullanır.
import {
  PrismaClient,
  UserRole,
  ArticleStatus,
  TagType,
  AgencyTier,
  AgencyVerificationLevel,
  JobPlan,
  SeniorityLevel,
  EmploymentType,
  JobStatus,
  CourseFormat,
  EventType,
  EventStatus,
} from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ──────────────────────────────────────────────────────────
// Görsel kütüphanesi — Unsplash + DiceBear
// (Tümü stabil URL'ler, free, no API key)
// ──────────────────────────────────────────────────────────
const IMG = {
  // Article covers (Unsplash photo IDs)
  article: {
    ai: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80&auto=format",
    aiRobot: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80&auto=format",
    chatgpt: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1200&q=80&auto=format",
    branding: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=1200&q=80&auto=format",
    analytics: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format",
    dashboard: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format",
    tiktok: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80&auto=format",
    ecommerce: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format",
    cocaCola: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=1200&q=80&auto=format",
    banking: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&q=80&auto=format",
    influencer: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=1200&q=80&auto=format",
    socialPhone: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=1200&q=80&auto=format",
    legal: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80&auto=format",
    customerService: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80&auto=format",
    cityNeon: "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=1200&q=80&auto=format",
    agencyOffice: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format",
  },
  // Event covers
  event: {
    summit: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80&auto=format",
    awards: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1600&q=80&auto=format",
    webinar: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1600&q=80&auto=format",
  },
  // Course covers
  course: {
    prompt: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1200&q=80&auto=format",
    performance: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format",
    linkedin: "https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=1200&q=80&auto=format",
    brand: "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?w=1200&q=80&auto=format",
    content: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200&q=80&auto=format",
  },
  // Report covers
  report: {
    agencyEco: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format",
    aiMaturity: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80&auto=format",
    socialCommerce: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80&auto=format",
  },
  // Avatars — professional headshots
  avatar: {
    selin: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&auto=format",
    burak: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format",
    admin: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80&auto=format",
  },
};

/** Ajanslara temiz harf avatar — DiceBear initials API */
function agencyLogo(name: string): string {
  const seed = encodeURIComponent(name);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=0a1f4a,1e40af,f97316&backgroundType=solid&fontFamily=Inter&fontWeight=700&fontSize=42`;
}

async function main() {
  console.log("🌱 Seed başlıyor...");

  // ───────────────────────── USERS
  const adminPassword = await bcrypt.hash("admin12345", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@markaradar.com" },
    update: { avatarUrl: IMG.avatar.admin },
    create: {
      email: "admin@markaradar.com",
      passwordHash: adminPassword,
      fullName: "MarkaRadar Admin",
      role: UserRole.super_admin,
      emailVerified: true,
      avatarUrl: IMG.avatar.admin,
    },
  });

  const editorPw = await bcrypt.hash("editor12345", 12);
  const editor = await prisma.user.upsert({
    where: { email: "editor@markaradar.com" },
    update: { avatarUrl: IMG.avatar.selin },
    create: {
      email: "editor@markaradar.com",
      passwordHash: editorPw,
      fullName: "Selin Aydın",
      role: UserRole.editor,
      emailVerified: true,
      bio: "Pazarlama editörü, 10 yıl ajans deneyimi.",
      linkedinUrl: "https://linkedin.com/in/selin-aydin",
      avatarUrl: IMG.avatar.selin,
    },
  });

  for (const r of [
    {
      email: "yazar@markaradar.com",
      name: "Burak Demir",
      role: UserRole.writer,
      avatarUrl: IMG.avatar.burak,
    },
    {
      email: "cmo1@firma.com",
      name: "Ayşe Kara",
      role: UserRole.reader,
      avatarUrl: null,
    },
    {
      email: "cmo2@firma.com",
      name: "Mehmet Yılmaz",
      role: UserRole.reader,
      avatarUrl: null,
    },
    {
      email: "reader@test.com",
      name: "Test Reader",
      role: UserRole.reader,
      avatarUrl: null,
    },
  ]) {
    const pw = await bcrypt.hash("test12345", 12);
    await prisma.user.upsert({
      where: { email: r.email },
      update: r.avatarUrl ? { avatarUrl: r.avatarUrl } : {},
      create: {
        email: r.email,
        passwordHash: pw,
        fullName: r.name,
        role: r.role,
        emailVerified: true,
        avatarUrl: r.avatarUrl,
      },
    });
  }
  console.log(`✓ 6 user`);

  // ───────────────────────── CATEGORIES
  const categories = [
    { slug: "ai-marketing", name: "AI Marketing" },
    { slug: "marka-hamlesi", name: "Marka Hamlesi" },
    { slug: "marka-kampanyalari", name: "Marka Kampanyaları" },
    { slug: "ajans-haberleri", name: "Ajans Haberleri" },
    { slug: "sosyal-medya", name: "Sosyal Medya" },
    { slug: "influencer", name: "Influencer Marketing" },
    { slug: "performans", name: "Performans Pazarlama" },
    { slug: "globalden", name: "Globalden Türkiye'ye" },
    { slug: "rehber", name: "Rehberler" },
  ];
  const catMap: Record<string, string> = {};
  for (const [i, cat] of categories.entries()) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, orderIndex: i },
    });
    catMap[cat.slug] = c.id;
  }
  console.log(`✓ ${categories.length} kategori`);

  // ───────────────────────── TAGS
  const tags = [
    { slug: "openai", name: "OpenAI", type: TagType.tool },
    { slug: "midjourney", name: "Midjourney", type: TagType.tool },
    { slug: "anthropic", name: "Anthropic", type: TagType.tool },
    { slug: "linkedin", name: "LinkedIn", type: TagType.tool },
    { slug: "tiktok", name: "TikTok", type: TagType.tool },
    { slug: "meta", name: "Meta", type: TagType.tool },
    { slug: "reels", name: "Reels", type: TagType.topic },
    { slug: "kvkk", name: "KVKK", type: TagType.topic },
    { slug: "kriz-iletisimi", name: "Kriz İletişimi", type: TagType.topic },
    { slug: "performans-pazarlama", name: "Performans", type: TagType.topic },
  ];
  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }
  console.log(`✓ ${tags.length} etiket`);

  // ───────────────────────── ARTICLES
  const now = Date.now();
  const day = (n: number) => new Date(now - n * 86400_000);

  const articles = [
    {
      slug: "coca-cola-ai-driven-tvc",
      categoryId: catMap["marka-hamlesi"],
      coverUrl: IMG.article.cocaCola,
      title: "Coca-Cola Türkiye, AI-driven kampanyaya geçiyor",
      spot:
        "Marka, 2026'da TVC bütçesinin %40'ını AI üretim platformlarına kaydırdı.",
      body: "<p>Coca-Cola Türkiye, 2026 pazarlama planlamasında reklam üretimini ciddi şekilde otomatize edeceğini açıkladı. Brand-fit denetimi insan ekibinde kalırken, görsel üretim ve A/B test pipeline'ı tümüyle generative AI platformlarına aktarıldı.</p><h2>Detaylar</h2><p>Marka, 12 ay süreyle 4 ana ajansla devam edecek, ancak prodüksiyon ekibini iç bünyeye alıp Adobe Firefly + Runway Gen-3 + Veo 3 üzerinden üretim yapacak. CMO Ahmet Yıldız: 'Maliyet %60 düştü, sürat 5x.'</p>",
      aiSummary:
        "Coca-Cola Türkiye, TVC bütçesinin %40'ını AI üretim platformlarına kaydırdı.",
      aiWhyMatters:
        "Türkiye'nin en büyük FMCG markası AI üretimine taşındığında, ajans modelinin tarihsel olarak ilk kez radikal şekilde değişeceği sinyali geldi.",
      aiBrandTakeaways: [
        "Prodüksiyon maliyeti %60 düşüyor — ama brand-fit denetimi insan ekibinde kalmalı.",
        "İç ekip kurulumu 6 ay sürer; bu süre içinde ajansla geçiş yönetimi planla.",
        "A/B test pipeline'ı otomasyona açılınca toplam kampanya sayısı 3x artıyor.",
      ],
      aiAgencyTakeaways: [
        "TVC briefleri 6 ay içinde %30 azalacak — yeni hizmet katmanı planlayın.",
        "Prodüksiyon ücretleri yerine 'AI workflow consulting' modeli denemeye değer.",
        "Brand-fit denetimi rolünün karşılığı olarak 'AI Guardian' pozisyonu yaratın.",
      ],
    },
    {
      slug: "tiktok-shop-turkiye-lansman",
      categoryId: catMap["sosyal-medya"],
      coverUrl: IMG.article.tiktok,
      title: "TikTok Shop Türkiye'de açıldı — performans pazarlamacılar dikkat",
      spot:
        "Trendyol'la rekabete giren TikTok Shop, ilk hafta 12.000 satıcı kaydı aldı.",
      body:
        "<p>TikTok Shop, Türkiye'de resmi olarak açıldı. İlk hafta 12.000 satıcı kaydı ile yerli e-ticareti sarstı. Performans pazarlamacılar için Meta + Google'a alternatif yeni bir attribution kaynağı.</p><h2>Komisyon yapısı</h2><p>Standart komisyon %5, sponsorlu reklam CPM ortalama 45 TL — Meta'dan %30 ucuz.</p>",
      aiSummary:
        "TikTok Shop TR'de açıldı. 12K satıcı, Meta'dan %30 ucuz CPM. Trendyol'a doğrudan rakip.",
      aiWhyMatters:
        "Türkiye'de e-ticaret + sosyal birleşmesinin ilk gerçek tehdidi. Trendyol için 6 ay içinde organik trafik kaybı bekleniyor.",
      aiBrandTakeaways: [
        "İlk 3 ay 'land grab' fırsatı — düşük rekabet, yüksek visibility.",
        "Mevcut ürün kataloğunu 7 gün içinde TikTok'a feed olarak bağla.",
        "İçerik üretim ekibini 'native creator' formatı için yeniden kurma vakti.",
      ],
      aiAgencyTakeaways: [
        "TikTok Shop yönetimi yeni bir hizmet katmanı — fiyatlandırın.",
        "Mevcut TikTok ads müşterilerinize otomatik upsell.",
        "Creator marketplace ekibi kurun.",
      ],
    },
    {
      slug: "garanti-bbva-ai-content-strategy",
      categoryId: catMap["marka-hamlesi"],
      coverUrl: IMG.article.banking,
      title: "Garanti BBVA'nın AI content stratejisi — 6 ayda 12x verim",
      spot:
        "Banka, sosyal medya içerik üretimini Adobe Express + ChatGPT entegrasyonu ile otomatize etti.",
      body:
        "<p>Garanti BBVA'nın dijital pazarlama ekibi, sosyal medya içeriği üretimini 6 ayda 12x artırdı. CMO Nilgün Kaya: 'AI brief'i 2 saatten 8 dakikaya indirdi.'</p>",
      aiSummary:
        "Garanti BBVA AI ile sosyal içerik üretimini 12x verim artışına çıkardı.",
      aiWhyMatters:
        "Bankacılık sektöründe content velocity standardı yeniden tanımlanıyor — diğer bankalar 12 ay içinde bu seviyeye gelmek zorunda.",
      aiBrandTakeaways: [
        "Brief süresi 2 saat → 8 dakika. AI ön-süreç insan denetimini hızlandırıyor.",
        "Marka tonu için fine-tune edilmiş custom GPT yaratın.",
        "Content review zamanını yarıya indirin.",
      ],
      aiAgencyTakeaways: [
        "Banka müşterilerinize 'AI content velocity audit' hizmeti satın.",
        "Mevcut copywriter rolünü 'AI prompt strategist' olarak konumlandırın.",
      ],
    },
    {
      slug: "trendyol-influencer-stratejisi-2026",
      categoryId: catMap["influencer"],
      coverUrl: IMG.article.influencer,
      title: "Trendyol'un 2026 influencer stratejisi: 'micro odaklı, ROI-first'",
      spot:
        "Mega influencer harcamasını %30 düşürüp 5K-50K takipçili 200 yeni creator anlaşması yaptı.",
      body:
        "<p>Trendyol, 2026 yılında influencer pazarlamasında strateji değişikliğine gitti. Mega influencer harcaması yerine küçük ama hedefli creator portföyüne dağıttı.</p>",
      aiSummary:
        "Trendyol mega influencer harcamasını %30 düşürdü, 200 micro creator ile çalışıyor. ROI %2.3x.",
      aiWhyMatters:
        "Türkiye'nin en büyük e-ticaret oyuncusunun stratejisi, influencer pazarının 2026'da nasıl şekilleneceğinin sinyali.",
      aiBrandTakeaways: [
        "Mega influencer ROI'i düşüyor (%2.3 vs micro %4.1).",
        "200 küçük anlaşma yönetimi için martech araç gerekecek.",
        "Marka güvenliği için AI brand safety taraması zorunlu.",
      ],
      aiAgencyTakeaways: [
        "Creator portfolio management hizmeti satın.",
        "200 creator'lı kampanya = 200 farklı brief; AI brief otomasyonu olmadan ölçeklenmez.",
      ],
    },
    {
      slug: "ai-pazarlamacinin-yerini-degistiriyor",
      categoryId: catMap["ai-marketing"],
      coverUrl: IMG.article.ai,
      title: "Yapay zekâ pazarlamacının yerini almıyor — yerini değiştiriyor",
      spot:
        "MarkaRadar araştırması: AI kullanan ekipler %40 daha fazla çıktı veriyor, aynı bütçeyle.",
      body:
        "<p>Türkiye'de 200 pazarlama ekibiyle yaptığımız araştırma, AI araçlarını entegre eden ekiplerin daha fazla çıktı verdiğini gösterdi.</p>",
      aiSummary:
        "AI kullanan TR pazarlama ekipleri %40 daha fazla çıktı veriyor. İşten çıkarma değil rol değişimi var.",
      aiWhyMatters:
        "Pazarlama ekiplerinin yapısı 'AI'la rağmen' değil 'AI ile' yeniden kuruluyor.",
      aiBrandTakeaways: [
        "Pazarlama ekibinde 'AI Lead' rolü açın — deneyimli pazarlamacıdan dönüştürün.",
        "Mevcut copywriter rolünü 'content strategist'e taşıyın.",
      ],
      aiAgencyTakeaways: [
        "Müşterilere 'AI maturity audit' hizmeti satın.",
        "Insourcing trendi geliyor; 'AI capability transfer' workshop'ları satılabilir.",
      ],
    },
    {
      slug: "kvkk-ad-tech-2026-rehberi",
      categoryId: catMap["rehber"],
      coverUrl: IMG.article.legal,
      title: "KVKK + Ad Tech 2026 Rehberi — değişen 7 şey",
      spot:
        "Yeni Kurul kararları sonrası remarketing, cross-device tracking, üçüncü taraf data — neyi yapamazsın?",
      body:
        "<p>KVKK Ad Tech denetimi 2026'da sertleşti. 7 maddede değişen kuralları açıklıyoruz.</p>",
      aiSummary:
        "KVKK Ad Tech denetimi sertleşti. TC kimlik no eşleştirmesi yasak, third-party cookie sınırlı.",
      aiWhyMatters:
        "Reklamcılığın temel altyapısı değişiyor — first-party data stratejisi olmayan markalar 2027'de cezalı duruma düşer.",
      aiBrandTakeaways: [
        "First-party data CDP yatırımını 2026 Q3'e kadar bitir.",
        "TC kimlik no bazlı remarketing tamamen yasak.",
        "Cookie banner'ı detaylı consent olmalı.",
      ],
      aiAgencyTakeaways: [
        "Müşterilere 'consent flow audit' hizmeti satın.",
      ],
    },
    {
      slug: "pegasus-reels-stratejisi",
      categoryId: catMap["sosyal-medya"],
      coverUrl: IMG.article.socialPhone,
      title: "Pegasus'un Reels stratejisi: 'havayolu değil eğlence platformu'",
      spot:
        "12 ay önce 50K Instagram takipçisi olan marka, bugün 480K. Sır: günde 3 Reels.",
      body:
        "<p>Pegasus Hava Yolları, sosyal medya stratejisini 2025 ortasında baştan kurdu. Reels formatına geçtikten sonra 12 ayda 9x büyüme.</p>",
      aiSummary:
        "Pegasus Reels stratejisi 12 ayda 50K → 480K takipçi. Günde 3 Reels, in-house ekip.",
      aiBrandTakeaways: [
        "3 Reels/gün üretimi için iç ekip + 2 part-time creator yeter.",
        "Reels CPM TikTok'tan %15 ucuz, conversion 1.7x.",
      ],
      aiAgencyTakeaways: [
        "Bu hız insourced ekipte mümkün — ajansla yapılamaz.",
        "Pegasus modeli 'velocity case study' olarak satılabilir.",
      ],
    },
    {
      slug: "publicis-tr-yapay-zeka-yatirimi",
      categoryId: catMap["ajans-haberleri"],
      coverUrl: IMG.article.agencyOffice,
      title: "Publicis Türkiye, 5 milyon dolar AI yatırımı yaptı",
      spot:
        "Ajans, çeyrekte 12 yeni AI tabanlı hizmet kalemi lanse etti.",
      body:
        "<p>Publicis Türkiye, ana ortaklık şirketinden bağımsız olarak 5 milyon dolar bütçe açtı. 6 AI uzmanı işe alındı.</p>",
      aiSummary:
        "Publicis TR 5M$ AI yatırımı — 6 yeni hire, 12 yeni hizmet kalemi.",
      aiBrandTakeaways: [
        "Ajansın 'AI hazır' olup olmadığını sözleşme öncesi kontrol et.",
      ],
      aiAgencyTakeaways: [
        "WPP, Omnicom, Dentsu TR — 6 ay içinde benzer hamle gelecek.",
        "Küçük ajanslar için fırsat: 'butik AI uzmanlığı' niş'i.",
      ],
    },
    {
      slug: "meta-ads-2026-buyuk-degisiklik",
      categoryId: catMap["performans"],
      coverUrl: IMG.article.dashboard,
      title: "Meta Ads 2026'da en büyük UI değişikliğini yapıyor",
      spot:
        "Campaign Manager arayüzü Advantage+ odaklı yeniden tasarlandı. Manuel optimizasyon yok oluyor.",
      body:
        "<p>Meta, performance pazarlamasının nasıl yapıldığını değiştiriyor. Manuel kampanya kurulumu yerine Advantage+ tek tıklama.</p>",
      aiSummary:
        "Meta Ads Advantage+ artık varsayılan. Manuel kampanya UI ileride tamamen kalkacak.",
      aiBrandTakeaways: [
        "Advantage+ tek tıklama — ama 'feed quality' önem 10x arttı.",
        "Creative variation otomatik açılıyor; brand safety kontrolü artırın.",
      ],
      aiAgencyTakeaways: [
        "Manuel kampanya optimizasyonu hizmeti tarihe karışıyor.",
        "Yeni satış konusu: 'Advantage+ creative production'.",
      ],
    },
    {
      slug: "vodafone-ai-customer-service",
      categoryId: catMap["marka-kampanyalari"],
      coverUrl: IMG.article.customerService,
      title: "Vodafone TR'nin AI customer service deneyi sonuçları",
      spot:
        "6 ayda %72 müşteri sorununu insan operatöre devretmeden çözen sistem.",
      body:
        "<p>Vodafone Türkiye, müşteri hizmetlerinde AI agent uygulamasının 6 ay sonucunu yayınladı.</p>",
      aiSummary:
        "Vodafone TR AI agent %72 sorun çözüm oranı. Call center maliyeti %38 düştü.",
      aiBrandTakeaways: [
        "AI customer service maliyeti 3 ayda amorti ediyor.",
        "İlk 3 ay 'cold start' — insan operatör paralel çalışmalı.",
      ],
      aiAgencyTakeaways: [
        "Marka müşteri servisi otomasyonu yeni bir hizmet katmanı.",
      ],
    },
    {
      slug: "reklam-kurulu-ai-etiket-zorunlu",
      categoryId: catMap["ai-marketing"],
      coverUrl: IMG.article.aiRobot,
      title: '"Bu reklamı AI üretti" etiketi — Reklam Kurulu zorunlu kıldı',
      spot:
        "Yeni karar: AI ile üretilen tüm reklam içerikleri görünür şekilde etiketlenmek zorunda.",
      body:
        "<p>Reklam Kurulu, AI üretilmiş reklamların tüketiciye açıklanması konusunda yeni bir karar aldı.</p>",
      aiSummary:
        "Reklam Kurulu AI üretilmiş reklamlar için zorunlu etiket. 2026 Q3'te uygulamaya geçiyor.",
      aiBrandTakeaways: [
        "Tüm AI üretilmiş content'e visible disclosure ekle.",
        "Geçmiş kampanyaları geri toplama riski.",
      ],
      aiAgencyTakeaways: [
        "Müşterilere 'AI disclosure compliance audit' hizmeti.",
      ],
    },
    {
      slug: "starbucks-tr-toparlanma-stratejisi",
      categoryId: catMap["globalden"],
      coverUrl: IMG.article.branding,
      title: "Starbucks TR'nin 'lokal' iletişim hamlesi — boykota yanıt",
      spot:
        "Marka, Türkiye'ye özel kampanyalar ve yerel partner programı açıkladı.",
      body:
        "<p>Starbucks Türkiye, son 18 ayda yaşanan boykot dalgasına karşı yeni bir lokal iletişim stratejisi açıkladı.</p>",
      aiSummary:
        "Starbucks TR boykot sonrası yerel partnership + lokal kampanyalar. Trafik %22 toparlandı.",
      aiBrandTakeaways: [
        "Boykot iletişimi 'savunma' değil 'topluluk' tonunda.",
        "Yerel parnership görünür ve denetlenebilir olmalı.",
      ],
      aiAgencyTakeaways: [
        "Kriz iletişimi + brand recovery hizmeti niş olarak satılabilir.",
      ],
    },
    {
      slug: "linkedin-b2b-yukseliste",
      categoryId: catMap["sosyal-medya"],
      coverUrl: IMG.article.analytics,
      title: "LinkedIn TR 2026 B2B'de #1 — 12 ayda %40 organik büyüme",
      spot:
        "Türkiye'de B2B pazarlama harcamasının %38'i artık LinkedIn'e. Meta + Google'ı geçti.",
      body:
        "<p>LinkedIn, Türkiye'de B2B pazarlamasında en büyük platform haline geldi.</p>",
      aiSummary:
        "LinkedIn TR B2B'de %38 pay ile lider. Organik %40 büyüme, CPL %25 ucuz.",
      aiBrandTakeaways: [
        "B2B harcamayı LinkedIn'e kaydır (en az %30 pay).",
        "Şirket sayfası değil 'CEO/CMO personal brand' odaklı strateji.",
      ],
      aiAgencyTakeaways: [
        "LinkedIn ads + personal brand yönetimi hizmeti.",
      ],
    },
    {
      slug: "midjourney-sirket-rehberi",
      categoryId: catMap["rehber"],
      coverUrl: IMG.article.chatgpt,
      title: "Midjourney v7 — şirket içi kullanım rehberi (TR)",
      spot:
        "Hangi prompt yapısı çalışıyor, telif riski nasıl yönetilir, ekip eğitimi nasıl planlanır.",
      body:
        "<p>Midjourney v7 ile şirket içi kullanım için pratik rehber.</p>",
      aiSummary:
        "Midjourney v7 şirket içi kullanım rehberi — prompt yapısı, telif, ekip eğitimi.",
      aiBrandTakeaways: [
        "Telif riski için 'no-real-faces, no-brand-logos' kuralı zorunlu.",
        "Ekip eğitimi 4 saatlik workshop'la çözülebilir.",
      ],
      aiAgencyTakeaways: ["Midjourney workshop hizmeti satın."],
    },
  ];

  let inserted = 0;
  for (const a of articles) {
    if (!a.categoryId) continue;
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: { coverUrl: a.coverUrl ?? null },
      create: {
        slug: a.slug,
        title: a.title,
        spot: a.spot,
        body: a.body,
        coverUrl: a.coverUrl ?? null,
        aiSummary: a.aiSummary,
        aiWhyMatters: a.aiWhyMatters,
        aiBrandTakeaways: a.aiBrandTakeaways ?? [],
        aiAgencyTakeaways: a.aiAgencyTakeaways ?? [],
        categoryId: a.categoryId,
        authorId: editor.id,
        status: ArticleStatus.published,
        publishedAt: day(inserted),
        aiHumanRatio: 30,
        readingTime: 4,
      },
    });
    inserted++;
  }
  console.log(`✓ ${inserted} makale`);

  // ───────────────────────── AGENCIES
  const agencyData = [
    {
      slug: "publicis-istanbul",
      name: "Publicis Türkiye",
      city: "İstanbul",
      teamSizeRange: "100+",
      foundedYear: 1995,
      tagline: "Power of One — yaratıcı + medya + data, tek çatı altında.",
      services: ["Creative", "Media Planning", "Performance", "Data + Analytics"],
      industries: ["FMCG", "Banka", "Otomotiv", "Telekom"],
      tier: AgencyTier.elite,
      verificationLevel: AgencyVerificationLevel.fully_verified,
      ratingAvg: 4.6,
      reviewCount: 23,
    },
    {
      slug: "tbwa-istanbul",
      name: "TBWA\\Istanbul",
      city: "İstanbul",
      teamSizeRange: "51-100",
      foundedYear: 1998,
      tagline: "Disruption is our discipline.",
      services: ["Creative", "Branding", "PR"],
      industries: ["FMCG", "Tech", "Retail"],
      tier: AgencyTier.featured,
      verificationLevel: AgencyVerificationLevel.linkedin_verified,
      ratingAvg: 4.4,
      reviewCount: 18,
    },
    {
      slug: "vmly-r-istanbul",
      name: "VMLY&R Türkiye",
      city: "İstanbul",
      teamSizeRange: "100+",
      tagline: "Creating connected brands.",
      services: ["Creative", "CX", "Commerce", "Data"],
      industries: ["Banka", "Sigorta", "FMCG"],
      tier: AgencyTier.featured,
      verificationLevel: AgencyVerificationLevel.fully_verified,
      ratingAvg: 4.5,
      reviewCount: 15,
    },
    {
      slug: "lego-creative",
      name: "Lego Creative",
      city: "İstanbul",
      teamSizeRange: "11-50",
      foundedYear: 2018,
      tagline: "Bağımsız, yaratıcı, hızlı.",
      services: ["Creative", "Social Media", "Content"],
      industries: ["Startup", "SaaS", "Retail"],
      tier: AgencyTier.premium,
      verificationLevel: AgencyVerificationLevel.linkedin_verified,
      ratingAvg: 4.7,
      reviewCount: 31,
    },
    {
      slug: "1881-digital",
      name: "1881 Digital",
      city: "İstanbul",
      teamSizeRange: "51-100",
      tagline: "Performance pazarlama uzmanı.",
      services: ["Performance", "SEO", "Media Buying", "Analytics"],
      industries: ["E-ticaret", "B2C", "Fintech"],
      tier: AgencyTier.featured,
      verificationLevel: AgencyVerificationLevel.fully_verified,
      ratingAvg: 4.3,
      reviewCount: 22,
    },
    {
      slug: "social-eagle",
      name: "Social Eagle",
      city: "Ankara",
      teamSizeRange: "11-50",
      tagline: "Sosyal medya stratejisi.",
      services: ["Social Media", "Community Management", "Influencer"],
      industries: ["FMCG", "Hospitality", "Lokal"],
      tier: AgencyTier.basic,
      verificationLevel: AgencyVerificationLevel.email_verified,
      ratingAvg: 4.1,
      reviewCount: 9,
    },
    {
      slug: "novus-marka",
      name: "Novus Marka",
      city: "İzmir",
      teamSizeRange: "1-10",
      tagline: "Butik branding stüdyosu.",
      services: ["Branding", "Identity", "Strategy"],
      industries: ["SaaS", "B2B", "Startup"],
      tier: AgencyTier.basic,
      verificationLevel: AgencyVerificationLevel.email_verified,
      ratingAvg: 4.8,
      reviewCount: 14,
    },
    {
      slug: "ai-marketing-tr",
      name: "AI Marketing TR",
      city: "İstanbul",
      teamSizeRange: "11-50",
      foundedYear: 2024,
      tagline: "Türkiye'nin ilk AI-native pazarlama ajansı.",
      services: ["AI Strategy", "Generative Content", "Workflow Automation"],
      industries: ["FMCG", "Tech", "Finans"],
      tier: AgencyTier.premium,
      verificationLevel: AgencyVerificationLevel.fully_verified,
      ratingAvg: 4.9,
      reviewCount: 8,
    },
    {
      slug: "pixel-perfect",
      name: "Pixel Perfect",
      city: "İstanbul",
      teamSizeRange: "11-50",
      tagline: "UI/UX + Brand Design.",
      services: ["UI/UX", "Branding", "Web Design"],
      industries: ["Fintech", "SaaS", "Health-tech"],
      tier: AgencyTier.basic,
      verificationLevel: AgencyVerificationLevel.linkedin_verified,
      ratingAvg: 4.4,
      reviewCount: 11,
    },
    {
      slug: "data-magnet",
      name: "Data Magnet",
      city: "İstanbul",
      teamSizeRange: "11-50",
      tagline: "Marketing analytics & attribution.",
      services: ["Analytics", "MMM", "Attribution", "Data Science"],
      industries: ["E-ticaret", "Fintech", "Telekom"],
      tier: AgencyTier.featured,
      verificationLevel: AgencyVerificationLevel.fully_verified,
      ratingAvg: 4.6,
      reviewCount: 16,
    },
  ];

  // Sıralı ajans cover paleti — her birine farklı görsel
  const agencyCovers = [
    IMG.article.agencyOffice,
    IMG.article.cityNeon,
    IMG.article.dashboard,
    IMG.article.branding,
    IMG.article.analytics,
    IMG.article.socialPhone,
    IMG.article.aiRobot,
    IMG.article.ai,
    IMG.article.ecommerce,
    IMG.article.chatgpt,
  ];
  for (const [i, a] of agencyData.entries()) {
    const logoUrl = agencyLogo(a.name);
    const coverUrl = agencyCovers[i % agencyCovers.length];
    await prisma.agency.upsert({
      where: { slug: a.slug },
      update: { logoUrl, coverUrl },
      create: { ...a, country: "TR", logoUrl, coverUrl },
    });
  }
  console.log(`✓ ${agencyData.length} ajans`);

  // ───────────────────────── COURSES
  const courses = [
    {
      slug: "ai-prompt-engineering-pazarlama",
      title: "AI Prompt Engineering — Pazarlama için",
      subtitle:
        "ChatGPT, Claude ve Midjourney'i marka tonuyla kullanmanın 8 haftalık programı.",
      coverUrl: IMG.course.prompt,
      format: CourseFormat.online_cohort,
      priceTry: 4500,
      earlyBirdPriceTry: 3500,
      isActive: true,
      outcomes: [
        "Marka tonuyla AI brief yazma",
        "Custom GPT yaratma",
        "8 farklı pazarlama içeriği üretme",
        "ROI ölçümü ve A/B test pipeline",
      ],
    },
    {
      slug: "performance-marketing-mastery",
      title: "Performance Marketing Mastery",
      subtitle: "Meta + Google + TikTok ads — 12 hafta, gerçek kampanyalarla.",
      coverUrl: IMG.course.performance,
      format: CourseFormat.online_cohort,
      priceTry: 6500,
      earlyBirdPriceTry: 5500,
      isActive: true,
      outcomes: [
        "Multi-channel attribution kurma",
        "Creative testing methodology",
        "Bidding stratejileri",
        "Conversion tracking + GA4",
      ],
    },
    {
      slug: "linkedin-b2b-growth",
      title: "LinkedIn B2B Growth",
      subtitle: "Personal brand + Company page + Lead gen — 4 hafta.",
      coverUrl: IMG.course.linkedin,
      format: CourseFormat.self_paced,
      priceTry: 2500,
      isActive: true,
      outcomes: [
        "LinkedIn personal brand kurma",
        "Şirket sayfası optimization",
        "Lead Gen Form kampanyaları",
      ],
    },
    {
      slug: "marka-stratejisi-temelleri",
      title: "Marka Stratejisi Temelleri",
      subtitle: "Pozisyonlama, marka kimliği, çıkış stratejisi — 6 hafta.",
      coverUrl: IMG.course.brand,
      format: CourseFormat.online_cohort,
      priceTry: 3500,
      earlyBirdPriceTry: 2900,
      isActive: true,
      outcomes: [
        "Brand positioning canvas",
        "Marka rehberi yazma",
        "Competitor benchmarking",
      ],
    },
    {
      slug: "content-velocity-bootcamp",
      title: "Content Velocity Bootcamp",
      subtitle: "1 yazı 8 formata — 2 hafta yoğun bootcamp.",
      coverUrl: IMG.course.content,
      format: CourseFormat.in_person,
      priceTry: 5500,
      isActive: true,
      outcomes: [
        "1 kaynak içerikten 8 format üretme",
        "AI ile içerik repurposing pipeline",
        "Content calendar otomasyonu",
      ],
    },
  ];
  for (const c of courses) {
    const course = await prisma.course.upsert({
      where: { slug: c.slug },
      update: { coverUrl: c.coverUrl ?? null },
      create: c,
    });
    await prisma.courseCohort.upsert({
      where: {
        courseId_cohortNumber: { courseId: course.id, cohortNumber: 1 },
      },
      update: {},
      create: {
        courseId: course.id,
        cohortNumber: 1,
        startDate: new Date(now + 14 * 86400_000),
        endDate: new Date(now + 70 * 86400_000),
        capacity: 30,
        enrolledCount: 12,
        status: "open",
      },
    });
  }
  console.log(`✓ ${courses.length} kurs + kohort`);

  // ───────────────────────── JOBS
  const jobs = [
    {
      slug: "garanti-bbva-cmo",
      title: "Chief Marketing Officer",
      companyName: "Garanti BBVA",
      description:
        "Garanti BBVA için CMO arıyoruz. Pazarlama stratejisi + AI transformasyonu liderliği.",
      category: "Marketing Leadership",
      seniority: SeniorityLevel.director,
      employmentType: EmploymentType.full_time,
      location: "İstanbul",
      isRemote: false,
      salaryMin: 80000,
      salaryMax: 150000,
      plan: JobPlan.premium_distribution,
      status: JobStatus.active,
    },
    {
      slug: "trendyol-performance-lead",
      title: "Performance Marketing Lead",
      companyName: "Trendyol",
      description: "Performance pazarlama ekibini büyütüyoruz. Meta + Google + TikTok deneyimi şart.",
      category: "Performance",
      seniority: SeniorityLevel.senior,
      employmentType: EmploymentType.full_time,
      location: "İstanbul",
      isRemote: true,
      salaryMin: 35000,
      salaryMax: 60000,
      plan: JobPlan.featured,
      status: JobStatus.active,
    },
    {
      slug: "pegasus-social-media-manager",
      title: "Social Media Manager (Reels Specialist)",
      companyName: "Pegasus Hava Yolları",
      description: "Günde 3 Reels — viral konseptli içerik üretebilen Reels uzmanı.",
      category: "Social Media",
      seniority: SeniorityLevel.mid,
      employmentType: EmploymentType.full_time,
      location: "İstanbul",
      salaryMin: 25000,
      salaryMax: 40000,
      plan: JobPlan.basic,
      status: JobStatus.active,
    },
    {
      slug: "publicis-ai-content-strategist",
      title: "AI Content Strategist",
      companyName: "Publicis Türkiye",
      description: "Yeni kurulan AI ekibi için strateji + üretim.",
      category: "AI / Content",
      seniority: SeniorityLevel.senior,
      employmentType: EmploymentType.full_time,
      location: "İstanbul",
      isRemote: true,
      salaryMin: 40000,
      salaryMax: 70000,
      plan: JobPlan.featured,
      status: JobStatus.active,
    },
    {
      slug: "freelance-copywriter-tr",
      title: "Freelance Copywriter (TR)",
      companyName: "MarkaRadar",
      description:
        "Pazarlama haberlerini Türkçe yazan freelance copywriter — proje bazlı.",
      category: "Editorial",
      seniority: SeniorityLevel.mid,
      employmentType: EmploymentType.freelance,
      isRemote: true,
      plan: JobPlan.basic,
      status: JobStatus.active,
    },
  ];
  for (const j of jobs) {
    await prisma.jobPost.upsert({
      where: { slug: j.slug },
      update: {},
      create: {
        ...j,
        publishedAt: day(Math.floor(Math.random() * 14)),
        expiresAt: new Date(now + 30 * 86400_000),
      },
    });
  }
  console.log(`✓ ${jobs.length} iş ilanı`);

  // ───────────────────────── EVENTS
  const events = [
    {
      slug: "tr-ai-marketing-summit-2026",
      type: EventType.summit,
      title: "Türkiye AI Marketing Summit 2026",
      description:
        "Türkiye'nin en büyük AI pazarlama zirvesi. 500+ katılımcı, 30+ konuşmacı.",
      coverUrl: IMG.event.summit,
      startsAt: new Date(now + 60 * 86400_000),
      endsAt: new Date(now + 61 * 86400_000),
      venue: "Hilton İstanbul",
      city: "İstanbul",
      capacity: 500,
      registeredCount: 240,
      status: EventStatus.registration_open,
    },
    {
      slug: "ai-marketing-awards-2026",
      type: EventType.awards,
      title: "Türkiye AI Marketing Ödülleri 2026",
      description: "AI ile yapılmış en iyi pazarlama işleri yarışması.",
      coverUrl: IMG.event.awards,
      startsAt: new Date(now + 120 * 86400_000),
      city: "İstanbul",
      status: EventStatus.announced,
    },
    {
      slug: "linkedin-b2b-webinar",
      type: EventType.webinar,
      title: "LinkedIn B2B Growth — Webinar",
      description: "Ücretsiz canlı webinar, 90 dakika.",
      coverUrl: IMG.event.webinar,
      startsAt: new Date(now + 7 * 86400_000),
      capacity: 200,
      registeredCount: 56,
      status: EventStatus.registration_open,
    },
  ];
  for (const e of events) {
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: { coverUrl: e.coverUrl ?? null },
      create: e,
    });
  }
  console.log(`✓ ${events.length} etkinlik`);

  // ───────────────────────── REPORTS
  const reports = [
    {
      slug: "turkiye-ajans-ekosistemi-2026",
      title: "Türkiye Ajans Ekosistemi Raporu 2026",
      description:
        "120 ajansla yapılan araştırmadan içgörüler. Pazar yapısı, fiyatlama, AI hazırlığı.",
      coverUrl: IMG.report.agencyEco,
      pageCount: 78,
      priceTry: 0,
      isFree: true,
      downloadCount: 1240,
      publishedAt: day(30),
    },
    {
      slug: "ai-marketing-maturity-index-tr",
      title: "TR AI Marketing Maturity Index 2026",
      description:
        "Türkiye'deki markaların AI olgunluk skoru. Sektör bazında karşılaştırma.",
      coverUrl: IMG.report.aiMaturity,
      pageCount: 45,
      priceTry: 1500,
      includedInTier: "pro",
      downloadCount: 380,
      publishedAt: day(15),
    },
    {
      slug: "social-commerce-rehberi-2026",
      title: "Sosyal Ticaret 2026 — TR Pazarı",
      description:
        "TikTok Shop + Instagram Shopping + Meta Marketplace. Markalar için strateji.",
      coverUrl: IMG.report.socialCommerce,
      pageCount: 62,
      priceTry: 990,
      includedInTier: "lite",
      downloadCount: 210,
      publishedAt: day(7),
    },
  ];
  for (const r of reports) {
    await prisma.report.upsert({
      where: { slug: r.slug },
      update: { coverUrl: r.coverUrl ?? null },
      create: r,
    });
  }
  console.log(`✓ ${reports.length} rapor`);

  // ───────────────────────── NEWSLETTER SUBSCRIBERS
  const subscribers = [
    { email: "cmo1@firma.com", fullName: "Ayşe Kara" },
    { email: "cmo2@firma.com", fullName: "Mehmet Yılmaz" },
    { email: "reader@test.com", fullName: "Test Reader" },
  ];
  for (const s of subscribers) {
    await prisma.newsletterSubscriber.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        fullName: s.fullName,
        status: "confirmed",
        confirmedAt: new Date(),
        segments: ["all"],
      },
    });
  }
  console.log(`✓ ${subscribers.length} newsletter abone`);

  // ───────────────────────── PAGE CONTENTS (admin editable)
  const pages = [
    {
      slug: "hakkimizda",
      locale: "tr",
      title: "Hakkımızda",
      blocks: [
        {
          type: "hero",
          eyebrow: "Şirket",
          title: "Türkiye'nin AI-native pazarlama medyası",
          subtitle:
            "MarkaRadar, marka ve ajans dünyasının günlük gündemini analitik, doğrulanmış ve markalar için çıkarımlı şekilde işleyen bağımsız medya platformudur.",
        },
        {
          type: "feature-grid",
          heading: "Neden var?",
          items: [
            {
              icon: "Newspaper",
              title: "Editöryel bağımsızlık",
              desc: "Reklamveren, marka veya ajans hiçbir editöryel kararı etkilemez.",
            },
            {
              icon: "ShieldCheck",
              title: "Verified review",
              desc: "Ajans rehberi anonim review yok — gerçek ad + iş e-postası + LinkedIn doğrulaması.",
            },
            {
              icon: "Sparkles",
              title: "AI-human ratio",
              desc: "Her makalede AI-human ratio şeffaf — yapay zekanın katkısı görünür.",
            },
          ],
        },
        {
          type: "cta-banner",
          title: "Bizimle çalışmak ister misin?",
          subtitle:
            "Editör, yazar, AI engineer pozisyonları için kapımız hep açık.",
          ctaLabel: "Açık pozisyonlar",
          ctaHref: "/is-ilanlari",
        },
      ],
    },
    {
      slug: "hakkimizda",
      locale: "en",
      title: "About",
      blocks: [
        {
          type: "hero",
          eyebrow: "Company",
          title: "Türkiye's AI-native marketing media",
          subtitle:
            "MarkaRadar is an independent media platform analyzing the daily marketing, brand and agency agenda with verified, actionable insights.",
        },
        {
          type: "feature-grid",
          heading: "Why we exist",
          items: [
            {
              icon: "Newspaper",
              title: "Editorial independence",
              desc: "No advertiser, brand or agency influences editorial decisions.",
            },
            {
              icon: "ShieldCheck",
              title: "Verified reviews",
              desc: "No anonymous reviews — real name + work email + LinkedIn verification.",
            },
            {
              icon: "Sparkles",
              title: "AI-human ratio",
              desc: "Transparent AI contribution score on every article.",
            },
          ],
        },
        {
          type: "cta-banner",
          title: "Want to work with us?",
          subtitle: "Editor, writer, AI engineer — our door is always open.",
          ctaLabel: "Open positions",
          ctaHref: "/is-ilanlari",
        },
      ],
    },
    {
      slug: "landing-hero",
      locale: "tr",
      title: "Landing — hero",
      blocks: [
        {
          type: "hero",
          eyebrow: "Türkiye'nin AI-native pazarlama medyası",
          title: "Pazarlamanın hızını\nAI ile yakala.",
          subtitle:
            "Reklam, marka ve ajans dünyasının günlük gündemi — analitik, doğrulanmış, markalar için çıkarımıyla.",
        },
      ],
    },
    // ── Full landing — CMS-driven ana sayfa
    {
      slug: "landing",
      locale: "tr",
      title: "Anasayfa",
      blocks: [
        {
          type: "marquee",
          label: "Güvenilen markalar",
          items: [
            "Garanti BBVA",
            "Pegasus",
            "Vodafone",
            "Trendyol",
            "akbank",
            "iyzico",
            "Hepsiburada",
            "THY",
            "Getir",
            "migros",
          ],
        },
        {
          type: "stats",
          heading: "Sayılarla MarkaRadar",
          items: [
            { value: "12K+", label: "Pazarlamacı abone" },
            { value: "1.2M+", label: "Aylık okuyucu" },
            { value: "350+", label: "Verified ajans" },
            { value: "%72", label: "Karar verici kitle" },
          ],
        },
        {
          type: "bento",
          eyebrow: "Yayınlar",
          heading: "Pazarlamayı her açıdan görmenin yolu",
          subtitle:
            "Markalar için strateji, ajanslar için pazar verisi, herkes için günlük gündem.",
          items: [
            {
              icon: "Newspaper",
              eyebrow: "Günlük · ücretsiz",
              title: "Pazarlama 5",
              desc: "Her sabah 08:30 — Türkiye ve global pazarlama gündemi 5 dakikada özet.",
              cta: "Abone ol",
              href: "/",
            },
            {
              icon: "TrendingUp",
              eyebrow: "Haftalık · premium",
              title: "Marka Hamlesi",
              desc: "Markaların aksiyonlarını derinden analiz — strateji + sayısal sonuç.",
              cta: "Örnek oku",
              href: "/kategori/marka-hamlesi",
            },
            {
              icon: "Sparkles",
              eyebrow: "Self-serve · markaya özel",
              title: "Brand Studio",
              desc: "Markaysan AI ile reklam içeriği üret, MarkaRadar'da yayınla.",
              cta: "Hesap aç",
              href: "/marka-kayit",
              accent: true,
            },
            {
              icon: "Building2",
              eyebrow: "Sürekli güncel · ücretsiz",
              title: "Ajans Rehberi",
              desc: "Türkiye'nin ilk verified review tabanlı ajans veritabanı.",
              cta: "Rehberi keşfet",
              href: "/ajans-rehberi",
            },
            {
              icon: "GraduationCap",
              eyebrow: "Kohort + self-paced",
              title: "Akademi",
              desc: "AI Prompt, Performans, Brand Strategy — sektörden uzmanlarla 4-12 hafta.",
              cta: "Programlar",
              href: "/akademi",
            },
            {
              icon: "FileBarChart",
              eyebrow: "Aylık",
              title: "Sektör raporları",
              desc: "Türkiye Ajans Ekosistemi, AI Maturity, Social Commerce.",
              cta: "İndir",
              href: "/raporlar",
            },
          ],
        },
        {
          type: "audience-tabs",
          eyebrow: "Kime uygun",
          title: "Markalar, ajanslar ve içerik üreticileri için ayrı değer",
          subtitle: "Tek platform, üç farklı kullanım senaryosu.",
          tabs: [
            {
              value: "brand",
              label: "Markalar",
              features: [
                {
                  icon: "BarChart3",
                  title: "Sektör verisi",
                  desc: "Türkiye'de hangi kampanya ne yaptı? CMO seviyesinde kanıt-bazlı kararlar al.",
                },
                {
                  icon: "Sparkles",
                  title: "Brand Studio",
                  desc: "AI ile reklam içeriği üret, MarkaRadar'ın 12K+ pazarlamacı kitlesine ulaş.",
                },
                {
                  icon: "ShieldCheck",
                  title: "Verified ekosistem",
                  desc: "Doğrulanmış ajans rehberi + verified review — anlamlı seçim yap.",
                },
              ],
            },
            {
              value: "agency",
              label: "Ajanslar",
              features: [
                {
                  icon: "Building2",
                  title: "Görünürlük",
                  desc: "Türkiye'nin ilk verified review ajans rehberinde marka müşterileri seni bulsun.",
                },
                {
                  icon: "Briefcase",
                  title: "İlan platformu",
                  desc: "Premium plan ile ilanlarını 12K+ pazarlamacıya ulaştır, başvuru 3x'le.",
                },
                {
                  icon: "TrendingUp",
                  title: "Rekabet zekâsı",
                  desc: "Hangi ajans hangi briefi aldı, AI hazırlığı nasıl — pazarın tamamını gör.",
                },
              ],
            },
            {
              value: "creator",
              label: "Yazar / Creator",
              features: [
                {
                  icon: "GraduationCap",
                  title: "Akademi",
                  desc: "AI Prompt, Performans, Brand Strategy — sektörden uzmanlarla kohort.",
                },
                {
                  icon: "Newspaper",
                  title: "Yayın",
                  desc: "MarkaRadar kontribütör programı — yazılarını yayınlat, kitleye ulaş.",
                },
                {
                  icon: "FileBarChart",
                  title: "Raporlar",
                  desc: "Türkiye Ajans Ekosistemi, AI Maturity — birinci-elden veri.",
                },
              ],
            },
          ],
        },
        {
          type: "cta-banner",
          title: "Reklamını sen ver, AI ürettsin.",
          subtitle:
            "Türkçe AI ile sponsor içerik üret, MarkaRadar'da yayınla. KVKK uyumlu, self-serve, cüzdan bazlı.",
          ctaLabel: "Marka hesabı aç",
          ctaHref: "/marka-kayit",
        },
        {
          type: "faq",
          title: "Sıkça sorulanlar",
          items: [
            {
              q: "MarkaRadar ücretsiz mi?",
              a: "Temel içeriklerin tamamı ücretsiz. Premium üyelik (yıllık) ile derinlemesine analizler, raporlar ve akademi indirimleri açılır.",
            },
            {
              q: "Brand Studio nasıl çalışıyor?",
              a: "Marka hesabı aç → cüzdana TL yükle → AI ile içerik üret → moderasyon onayı sonrası MarkaRadar'da yayınlanır. CPC bazlı ücretlendirme.",
            },
            {
              q: "Ajans rehberi ücretli mi?",
              a: "Ücretsiz görünürlük — Free tier. Premium tier (Featured/Elite) ile öne çıkma, anahtar kelime, lead form gibi avantajlar.",
            },
            {
              q: "KVKK uyumluluğu var mı?",
              a: "Veri sorumlusu olarak KVKK kapsamında tüm yükümlülükleri karşılıyoruz. /me sayfasından verilerini indirebilir veya hesabını silebilirsin.",
            },
            {
              q: "İçerik AI tarafından mı yazılıyor?",
              a: "Hayır. Editörler tarafından yazılır. AI sadece özet, kategorizasyon ve takeaways üretiminde destekçi. Her makalede AI-Human Ratio şeffaf gösterilir.",
            },
          ],
        },
      ],
    },
    // ── İletişim
    {
      slug: "iletisim",
      locale: "tr",
      title: "İletişim",
      blocks: [
        {
          type: "hero",
          eyebrow: "İletişim",
          title: "Bizimle iletişime geç",
          subtitle:
            "Sponsorluk, basın, ortaklık veya editöryel öneriler için kapımız hep açık.",
        },
        {
          type: "feature-grid",
          heading: "Hangi kanaldan?",
          items: [
            {
              icon: "Mail",
              title: "Genel",
              desc: "hello@markaradar.com — 24 saat içinde dönüş yapıyoruz.",
            },
            {
              icon: "Briefcase",
              title: "Reklam & Sponsor",
              desc: "ads@markaradar.com — medya kiti ve oran kartı için.",
            },
            {
              icon: "Newspaper",
              title: "Basın",
              desc: "press@markaradar.com — basın bültenleri ve röportaj talepleri.",
            },
          ],
        },
      ],
    },
    // ── KVKK
    {
      slug: "kvkk",
      locale: "tr",
      title: "KVKK Aydınlatma Metni",
      blocks: [
        {
          type: "hero",
          eyebrow: "Yasal",
          title: "KVKK Aydınlatma Metni",
          subtitle: "Son güncelleme: 14 Mayıs 2026",
        },
        {
          type: "text",
          html: `
<h2>1. Veri Sorumlusu</h2>
<p>MarkaRadar, kullanıcılarının kişisel verilerini 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu sıfatıyla işlemektedir.</p>
<h2>2. İşlenen Veriler</h2>
<ul>
  <li><strong>Kimlik:</strong> Ad-soyad, e-posta, LinkedIn profili</li>
  <li><strong>İletişim:</strong> İş e-postası, telefon (opsiyonel)</li>
  <li><strong>İşlem güvenliği:</strong> IP, user agent, oturum logları</li>
  <li><strong>Davranışsal:</strong> Okuma davranışı, abonelik tercihleri</li>
  <li><strong>Ödeme:</strong> Stripe/iyzico tarafından işlenir — kart bilgisi saklamayız</li>
</ul>
<h2>3. İşleme Amaçları</h2>
<ul>
  <li>Hizmet sunumu, abonelik yönetimi</li>
  <li>Newsletter ve içerik gönderimi (açık rıza ile)</li>
  <li>Verified review süreci (e-posta + LinkedIn doğrulama)</li>
  <li>Yasal yükümlülükler (VERBİS, fatura)</li>
</ul>
<h2>4. Aktarılan Üçüncü Taraflar</h2>
<p>Stripe, iyzico, Resend, Beehiiv, Cloudflare R2, Sentry, OpenAI/Anthropic.</p>
<h2>5. Haklarınız</h2>
<p>KVKK md. 11 kapsamında verilerinize erişim, düzeltme, silme, anonimleştirme. /me sayfasından veri indir, hesap sil.</p>
<h2>6. İletişim</h2>
<p><strong>KVKK talepleri:</strong> kvkk@markaradar.com</p>
          `.trim(),
        },
      ],
    },
    // ── Gizlilik
    {
      slug: "gizlilik",
      locale: "tr",
      title: "Gizlilik Politikası",
      blocks: [
        {
          type: "hero",
          eyebrow: "Yasal",
          title: "Gizlilik Politikası",
          subtitle:
            "Minimum veri topluyoruz, açık şekilde işliyoruz, üçüncü taraflarla pazarlama amaçlı paylaşmıyoruz.",
        },
        {
          type: "feature-grid",
          heading: "Üç temel prensip",
          items: [
            {
              icon: "ShieldCheck",
              title: "Minimum veri",
              desc: "Hizmet için gerekli olanı alıyoruz. /me'den her şeyi indir veya sil.",
            },
            {
              icon: "Sparkles",
              title: "Cookieless analitik",
              desc: "Plausible (anonim) + PostHog (opt-in). Davranış modelleme yok.",
            },
            {
              icon: "Briefcase",
              title: "Reklam tracker yok",
              desc: "Facebook Pixel, Google Ads tracking, third-party cookies — hiçbiri.",
            },
          ],
        },
        {
          type: "text",
          html: `
<h2>Ne topluyoruz</h2>
<p>Hesap açtığınızda: e-posta, ad-soyad, opsiyonel LinkedIn. Abone iseniz: okuma davranışı, abonelik tercihleri.</p>
<h2>Nasıl saklıyoruz</h2>
<p>Postgres (EU bölgesi), TLS connection, günlük backup 30 gün retention.</p>
<h2>Detaylı bilgi</h2>
<p>KVKK kapsamındaki haklarınız için <a href="/kvkk">KVKK aydınlatma metnimizi</a> okuyun.</p>
          `.trim(),
        },
      ],
    },
    // ── Kullanım Koşulları
    {
      slug: "kullanim-kosullari",
      locale: "tr",
      title: "Kullanım Koşulları",
      blocks: [
        {
          type: "hero",
          eyebrow: "Yasal",
          title: "Kullanım Koşulları",
          subtitle: "Son güncelleme: 14 Mayıs 2026",
        },
        {
          type: "text",
          html: `
<h2>1. Hizmet kapsamı</h2>
<p>MarkaRadar — Türkiye'nin pazarlama, reklam ve marka medyası. Editöryel içerik, ajans rehberi, iş ilanları, eğitim, premium analiz.</p>
<h2>2. Hesap sorumluluğu</h2>
<p>Hesabın güvenliğinden siz sorumlusunuz. Şifre paylaşmayın, şüpheli aktivite halinde derhal sıfırlayın.</p>
<h2>3. İçerik politikası</h2>
<p>Yorumlar ve ajans review'larında hakaret, iftira, ayrımcılık veya doğrulanmamış suçlama içerik kaldırılır.</p>
<h2>4. Verified review</h2>
<p>Anonim review yok. Gerçek ad + iş e-postası + LinkedIn URL zorunlu. Yanlış bilgi hesap kapatma sebebidir.</p>
<h2>5. Premium abonelik</h2>
<p>Stripe veya iyzico ile ödeme. 30 gün iade. /me'den iptal her zaman mümkündür.</p>
<h2>6. Brand Studio</h2>
<p>Reklam kampanyaları yayın öncesi insan moderasyonundan geçer. Reddedilen içeriklerde cüzdan bakiyesi iade edilir.</p>
<h2>7. Geçerli hukuk</h2>
<p>TR hukuku. Uyuşmazlıklarda İstanbul mahkemeleri yetkilidir.</p>
          `.trim(),
        },
      ],
    },
    // ── Reklam Ver
    {
      slug: "reklam-ver",
      locale: "tr",
      title: "Reklam Ver — Brand Studio",
      blocks: [
        {
          type: "hero",
          eyebrow: "Markalar için",
          title: "Reklamını sen ver,\nAI ürettsin.",
          subtitle:
            "Türkçe AI ile sponsor içerik üret, MarkaRadar'da yayınla. KVKK uyumlu, self-serve, cüzdan bazlı.",
          ctaLabel: "Marka hesabı aç",
          ctaHref: "/marka-kayit",
        },
        {
          type: "feature-grid",
          heading: "Neden Brand Studio?",
          items: [
            {
              icon: "Sparkles",
              title: "AI üretim",
              desc: "Marka tonuyla fine-tune edilmiş Türkçe LLM. 5 dakikada 4 format çıktı.",
            },
            {
              icon: "ShieldCheck",
              title: "Brand-safe moderasyon",
              desc: "Her içerik yayın öncesi insan editör onayından geçer. Reddedilen iade.",
            },
            {
              icon: "BarChart3",
              title: "Şeffaf raporlama",
              desc: "Impression, click, CPC — gerçek zamanlı dashboard.",
            },
          ],
        },
        {
          type: "cta-banner",
          title: "İlk 1.000 TL bonus bizden",
          subtitle:
            "Yeni marka hesapları için 1.000 TL hoş geldin kredisi. Hesabı aç, AI üretmeye başla.",
          ctaLabel: "Hesap aç",
          ctaHref: "/marka-kayit",
        },
      ],
    },
    // ── Çerez Politikası
    {
      slug: "cerez",
      locale: "tr",
      title: "Çerez Politikası",
      blocks: [
        {
          type: "hero",
          eyebrow: "Yasal",
          title: "Çerez Politikası",
          subtitle:
            "MarkaRadar çerez kullanımı, izin yönetimi ve üçüncü taraf çerez politikası.",
        },
        {
          type: "feature-grid",
          heading: "Çerez kategorileri",
          items: [
            {
              icon: "ShieldCheck",
              title: "Zorunlu çerezler",
              desc: "Oturum, CSRF koruma, dil tercihi. İzin gerektirmez.",
            },
            {
              icon: "BarChart3",
              title: "Analitik (opt-in)",
              desc: "Plausible — anonim. PostHog — opt-in, davranış yok.",
            },
            {
              icon: "Sparkles",
              title: "Pazarlama",
              desc: "Üçüncü taraf reklam çerezi kullanmıyoruz. Yok.",
            },
          ],
        },
        {
          type: "text",
          html: `
<h2>İzin yönetimi</h2>
<p>Hesap ayarlarından çerez tercihlerini değiştirebilirsiniz: <a href="/me">/me/ayarlar</a></p>
<h2>Saklama süreleri</h2>
<ul>
  <li>Oturum çerezi: tarayıcı kapanınca silinir</li>
  <li>Dil tercihi: 1 yıl</li>
  <li>Analitik (Plausible): 0 — cookieless</li>
</ul>
          `.trim(),
        },
      ],
    },
    // ── Medya Kit
    {
      slug: "medya-kit",
      locale: "tr",
      title: "Medya Kit",
      blocks: [
        {
          type: "hero",
          eyebrow: "Reklam veren için",
          title: "MarkaRadar Medya Kit 2026",
          subtitle:
            "12.000+ pazarlamacı kitlemizle marka kampanyalarınızı planlayın. Format, oran ve kitle datası aşağıda.",
        },
        {
          type: "feature-grid",
          heading: "Kitle profili",
          items: [
            {
              icon: "Briefcase",
              title: "12.000+ pazarlamacı",
              desc: "CMO, marketing lead, brand manager, performance specialist.",
            },
            {
              icon: "Building2",
              title: "1.200+ marka şirketi",
              desc: "FMCG, banka, e-ticaret, SaaS — Türkiye'nin top brand'leri.",
            },
            {
              icon: "TrendingUp",
              title: "%72 karar verici",
              desc: "Bütçe yetkisi olan rolün payı (anket verisi).",
            },
          ],
        },
        {
          type: "feature-grid",
          heading: "Format & oran",
          items: [
            {
              icon: "Newspaper",
              title: "Sponsorlu makale",
              desc: "Marka Hamlesi formatı. Editör desteğiyle. 45.000 ₺/makale.",
            },
            {
              icon: "Mail",
              title: "Newsletter sponsorluk",
              desc: "Pazarlama 5 — günlük 12K+ açılır. 18.000 ₺/issue.",
            },
            {
              icon: "Sparkles",
              title: "Brand Studio self-serve",
              desc: "AI ile üret, CPC bazlı öde. /reklam-ver.",
            },
          ],
        },
        {
          type: "cta-banner",
          title: "Detaylı oran kartı için bizimle iletişime geç",
          subtitle:
            "ads@markaradar.com — 24 saat içinde medya kit PDF + özel teklif.",
          ctaLabel: "İletişim",
          ctaHref: "/iletisim",
        },
      ],
    },
  ];
  for (const p of pages) {
    await prisma.pageContent.upsert({
      where: { slug_locale: { slug: p.slug, locale: p.locale } },
      update: { blocks: p.blocks as object, title: p.title },
      create: {
        slug: p.slug,
        locale: p.locale,
        title: p.title,
        blocks: p.blocks as object,
        updatedById: admin.id,
      },
    });
  }
  console.log(`✓ ${pages.length} page content`);

  console.log("✅ Seed tamamlandı.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
