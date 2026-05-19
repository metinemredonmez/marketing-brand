/**
 * MarkaRadar AI prompt library.
 * Strateji dokümanı 8.2.x'ten alındı, MarkaRadar editöryel kurallarına uygun.
 * Tüm prompt'lar `source_text` placeholder'ı bekler.
 */

export type GenerationType =
  | "title"
  | "spot"
  | "body"
  | "ai_summary"
  | "linkedin_post"
  | "instagram_carousel"
  | "reels_script"
  | "seo_meta"
  | "cover_image_prompt";

interface PromptTemplate {
  buildUserMessage: (vars: Record<string, string>) => string;
  responseFormat?: "text" | "json";
  temperature?: number;
}

export const PROMPTS: Record<GenerationType, PromptTemplate> = {
  // ─── Başlık üretici (5 varyant)
  title: {
    responseFormat: "json",
    temperature: 0.8,
    buildUserMessage: ({ source_text }) => `Aşağıdaki kaynak için 5 farklı başlık öner. Her başlık 50-65 karakter arası olsun.
Başlıklar şunları içersin:
- 1 adet "haber dili" başlık (kim, ne yaptı)
- 1 adet "soru" başlık
- 1 adet "rakam/veri" odaklı başlık
- 1 adet "analitik" başlık ("Neden..." veya "Nasıl...")
- 1 adet "kısa-vurucu" başlık

Çıktı JSON:
{
  "titles": [
    { "style": "haber", "text": "..." },
    { "style": "soru", "text": "..." },
    { "style": "veri", "text": "..." },
    { "style": "analitik", "text": "..." },
    { "style": "kisa", "text": "..." }
  ]
}

KAYNAK:
"""
${source_text}
"""`,
  },

  // ─── Spot (3 varyant)
  spot: {
    responseFormat: "json",
    temperature: 0.7,
    buildUserMessage: ({ source_text }) => `Aşağıdaki kaynak için 3 farklı spot (200-280 karakter) öner.
Hem sosyal medya hem meta description için kullanılacak.

Çıktı JSON:
{ "spots": ["...", "...", "..."] }

KAYNAK:
"""
${source_text}
"""`,
  },

  // ─── Haber gövdesi (500-800 kelime)
  body: {
    responseFormat: "json",
    temperature: 0.5,
    buildUserMessage: ({ source_text, tone = "kurumsal" }) => `Aşağıdaki kaynaktan 500-800 kelime arası özgün bir Türkçe haber yaz.

Yapı:
- 1. paragraf: Olayı 2-3 cümleyle özetle (lead).
- 2-4. paragraf: Detaylar, bağlam, ilgili markalar/kişiler.
- 5. paragraf: Sektör için anlamı.
- Son paragraf: Sonraki adım veya açık kalan soru.

Dil: profesyonel, akıcı, gazetecilik standartlarında. Ton: ${tone}.

ÖNEMLİ:
- Kaynak cümlelerini kelime kelime kopyalama; kendi cümlenle yaz.
- Alıntı verirsen "dedi/belirtti/açıkladı" gibi atıf yap.
- Doğrulanmamış bilgi varsa "kaynağa göre" diye belirt.
- Markdown veya HTML kullanma; sadece düz metin, paragraflar boş satırla ayrılsın.

Çıktı JSON:
{
  "body": "...",
  "word_count": 0,
  "uncertain_facts": ["..."]
}

KAYNAK:
"""
${source_text}
"""`,
  },

  // ─── AI özet + Neden önemli + Çıkarımlar
  ai_summary: {
    responseFormat: "json",
    temperature: 0.4,
    buildUserMessage: ({
      article_body,
    }) => `Aşağıdaki haberi okuyup şunları üret:

1. ai_summary: 3 madde, her madde 1-2 cümle, toplam 250 kelimeyi geçmesin.
2. why_matters: 2-3 cümlelik analitik bir paragraf. "Bu haber neden önemli?" sorusuna stratejik düzeyde cevap.
3. brand_takeaways: Markalar için 3 madde çıkarım. Her madde uygulanabilir, somut bir öneri içersin.
4. agency_takeaways: Ajanslar için 3 madde çıkarım. Operasyonel veya stratejik öneri içersin.
5. tr_adaptation: Eğer haber globalse, "Türkiye pazarında nasıl uygulanabilir veya farklı olur?" sorusuna 2-3 cümlelik cevap. Türkiye haberiyse boş bırak.

Çıktı JSON:
{
  "ai_summary": ["...", "...", "..."],
  "why_matters": "...",
  "brand_takeaways": ["...", "...", "..."],
  "agency_takeaways": ["...", "...", "..."],
  "tr_adaptation": "..."
}

HABER:
"""
${article_body}
"""`,
  },

  // ─── LinkedIn post
  linkedin_post: {
    responseFormat: "json",
    temperature: 0.7,
    buildUserMessage: ({
      article_body,
      tone = "profesyonel",
      target_audience = "Türkiye'deki CMO, marka müdürleri, ajans sahipleri",
    }) => `Aşağıdaki haberden profesyonel bir LinkedIn postu üret.

Kurallar:
- 800-1300 karakter arası.
- İlk satır kanca olsun (scroll'u durdursun); ünlem ve emoji bombardımanı yok.
- Akıcı, ilk tekil veya editöryel "biz" diliyle yaz.
- Paragraflar kısa, satır araları boş bırak.
- 3-5 maddelik "çıkarım" listesi olsun (bullet yerine satır başına).
- Sonda 1 soru veya tartışma daveti.
- 3-5 hashtag, sonda, alakalı ve aşırıya kaçmadan.
- Marka veya kişi adlarını @mention notasyonuyla işaretle (sistem sonra link'ler).

Ton: ${tone}. Hedef kitle: ${target_audience}.

HABER:
"""
${article_body}
"""

Çıktı JSON:
{
  "post_text": "...",
  "mentions": ["Marka X", "Kişi Y"],
  "hashtags": ["#pazarlama", "#aimarketing"]
}`,
  },

  // ─── Instagram carousel (6-8 slayt)
  instagram_carousel: {
    responseFormat: "json",
    temperature: 0.7,
    buildUserMessage: ({ article_body }) => `Aşağıdaki haberden 7 slayttan oluşan bir Instagram carousel metni üret.

Slayt yapısı:
1. KAPAK: Kanca başlık (max 8 kelime) + alt destek satırı (max 12 kelime)
2-6. İÇERİK: Her slayt 1 ana fikir; başlık (max 6 kelime) + 2-3 satır kısa metin
7. CTA: "Kaydet, paylaş, takipte kal" tarzı + hesap adı

Dil: kısa, vurucu, genç ama profesyonel. Emoji'yi minimum kullan.

Ayrıca caption üret:
- 150-300 karakter
- İlk satır kanca
- 5-8 hashtag

HABER:
"""
${article_body}
"""

Çıktı JSON:
{
  "slides": [
    { "n": 1, "type": "cover", "title": "...", "subtitle": "..." },
    { "n": 2, "type": "content", "title": "...", "text": "..." },
    ...
    { "n": 7, "type": "cta", "title": "...", "text": "..." }
  ],
  "caption": "...",
  "hashtags": ["..."]
}`,
  },

  // ─── Reels script (30s)
  reels_script: {
    responseFormat: "json",
    temperature: 0.7,
    buildUserMessage: ({ article_body }) => `Aşağıdaki haberden 30 saniyelik bir Instagram Reels / TikTok script'i üret.

Yapı:
- 0-3s: Kanca (görsel ve sözel)
- 3-10s: Sorun/durum
- 10-20s: Detay/örnek
- 20-27s: Çıkarım
- 27-30s: CTA

Her sahne için: ekrandaki yazı (max 6 kelime) + voiceover (max 15 kelime) + görsel öneri (1 cümle).

HABER:
"""
${article_body}
"""

Çıktı JSON:
{
  "scenes": [
    { "time": "0-3", "on_screen": "...", "vo": "...", "visual": "..." }
  ],
  "caption": "...",
  "hashtags": ["..."],
  "sound_suggestion": "trendde olan akustik beat"
}`,
  },

  // ─── SEO meta
  seo_meta: {
    responseFormat: "json",
    temperature: 0.4,
    buildUserMessage: ({ title, body }) => `Aşağıdaki haber için SEO meta üret.

Kurallar:
- seo_title: 55-60 karakter; ana anahtar kelime başa yakın; marka veya yer adı varsa korunsun.
- seo_description: 150-160 karakter; meraklandırıcı ama clickbait değil; bir fiil + bir fayda içersin.
- keywords: 8-12 anahtar kelime, virgülle ayrılmış, uzun kuyruklu varyasyonlar dahil.
- h2_suggestions: 3-5 H2 başlık önerisi.

Çıktı JSON:
{
  "seo_title": "...",
  "seo_description": "...",
  "keywords": ["..."],
  "h2_suggestions": ["...", "..."]
}

HABER BAŞLIĞI: ${title}
HABER GÖVDESİ:
"""
${body}
"""`,
  },

  // ─── Kapak görseli prompt'u (DALL-E / Midjourney için)
  cover_image_prompt: {
    responseFormat: "json",
    temperature: 0.6,
    buildUserMessage: ({ title, spot }) => `Aşağıdaki haber için bir kapak görseli oluşturma prompt'u yaz.

Tarz: editöryel illüstrasyon, sade, MarkaRadar renk paletinde
(lacivert #0a1f4a, elektrik mavisi #1e40af, beyaz, aksan turuncu #f97316).
İnsan figürü çiziliyorsa minimal/soyut, marka logosu YOK, telif risk YOK.

Çıktı JSON:
{
  "prompt_en": "Editorial flat illustration about ... in navy, electric blue and warm orange accent, no logos, no real faces, clean composition, 16:9",
  "alt_text_tr": "..."
}

HABER: """${title} — ${spot}"""`,
  },
};
