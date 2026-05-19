/**
 * Brand Studio için AI prompt'ları — editöryel AI Studio'dan FARKLI.
 * Bunlar firmaların KENDİ reklam içeriğini üretirken kullanılır.
 *
 * Hiçbir prompt MarkaRadar editöryel bağımsızlığını ihlal etmez —
 * çıktı açıkça "Sponsorlu" etiketle yayınlanır.
 */

export type BrandGenerationType =
  | "product_launch_post"   // LinkedIn ürün lansman postu
  | "brand_story_article"   // 800 kelime "Marka Hamlesi" makalesi
  | "banner_creative_brief" // DALL-E banner görsel prompt'u
  | "newsletter_blurb"      // newsletter 80 kelimelik sponsor
  | "reels_brand_script"    // 30 saniye marka videosu script
  | "case_study"            // Challenge → Solution → Result formatı
  | "competitor_diff_angle" // Rakipten fark açısı
  | "target_audience_brief"; // Hangi CMO/segmente reach

interface PromptTemplate {
  buildUserMessage: (vars: Record<string, string>) => string;
  responseFormat?: "text" | "json";
  temperature?: number;
}

export const BRAND_SYSTEM_PROMPT = `Sen MarkaRadar Brand Studio'da çalışan bir reklam içerik üreticisin.
Markaların sponsorlu içeriklerini Türkçe, profesyonel ve "MarkaRadar editöryel tonunda"
üretiyorsun.

Kuralların:
1. Yanıltıcı reklam yazmazsın (Reklam Kurulu cezası riski).
2. Rakipleri ad vererek karalama yapmazsın.
3. "En iyi", "tek", "şampiyon" gibi ölçülemez iddialar yerine somut veri kullanırsın.
4. Sponsorlu olduğu açık olacak şekilde editöryel ton korunur (clickbait değil).
5. KVKK/GDPR ihlal eden kişisel veri toplama vaadi yok.
6. Türkçe yazım kurallarına uyar (TDK).
7. Markanın değer önerisini somutlaştır, slogan tekrarı yapma.

Çıktın her zaman geçerli JSON formatında olur; başka bir şey yazmazsın.`;

export const BRAND_PROMPTS: Record<BrandGenerationType, PromptTemplate> = {
  product_launch_post: {
    responseFormat: "json",
    temperature: 0.7,
    buildUserMessage: ({
      brand_name,
      product_name,
      product_description,
      key_benefits,
      target_audience,
      cta,
    }) => `Aşağıdaki bilgilerden, ${brand_name} markası için bir LinkedIn ürün lansman postu üret.

KURALLAR:
- 800-1300 karakter
- İlk satır kanca (ünlem/emoji bombardımanı yok)
- 3-5 madde "neden önemli?" listesi
- Sonda CTA + 3-5 hashtag

Ürün: ${product_name}
Açıklama: ${product_description}
Ana faydalar: ${key_benefits}
Hedef kitle: ${target_audience}
CTA: ${cta}

Çıktı JSON:
{
  "post_text": "...",
  "key_message": "ürünün özünü 1 cümleyle özetle",
  "hashtags": ["#pazarlama", ...],
  "image_prompt_en": "Editorial illustration about ... in clean modern style, no logos"
}`,
  },

  brand_story_article: {
    responseFormat: "json",
    temperature: 0.6,
    buildUserMessage: ({
      brand_name,
      story_topic,
      key_data,
      target_outcome,
    }) => `Aşağıdaki bilgilerden, ${brand_name} markası için "Marka Hamlesi" formatında 2000 kelimelik bir sponsor makale üret.

Yapı:
1. Lead (3 cümle): Olay özet
2. Bağlam (2 paragraf): Pazar durumu, neden bu hamle?
3. Hamle detayı (3-4 paragraf): Spesifik aksiyon, süreç, ekip
4. Veri ve sonuçlar (1-2 paragraf): Ölçülebilir KPI'lar
5. Sektör için ne anlama geliyor? (1 paragraf): Genelleme
6. Sonraki adım (1 cümle): Marka'nın açıklayabileceği gelecek

Ton: gazetecilik standartlarında, "Marka X anlatıyor" tarzı değil.
Açıkça "Sponsorlu içerik · ${brand_name} işbirliğiyle" rozeti olacak.

Konu: ${story_topic}
Anahtar veriler: ${key_data}
Hedef çıktı: ${target_outcome}

Çıktı JSON:
{
  "title": "...",
  "spot": "...",
  "body": "...",
  "key_data_points": ["...", "...", "..."],
  "suggested_cover_alt": "..."
}`,
  },

  banner_creative_brief: {
    responseFormat: "json",
    temperature: 0.6,
    buildUserMessage: ({
      brand_name,
      campaign_message,
      brand_colors,
      placement,
    }) => `Aşağıdaki bilgilerden, ${brand_name} için bir banner reklam görseli oluşturma prompt'u yaz.

KURALLAR:
- Editöryel görseller (logo YOK, gerçek insan yüzü YOK)
- ${brand_name}'in renk paleti: ${brand_colors}
- Placement: ${placement} (homepage_top 970x250 / sidebar_sticky 300x600 / article_inline 728x90 vs.)
- Mesaj alanı boş bırakılır — sonradan üzerine yazı eklenecek
- Telif riski sıfır

Kampanya mesajı: ${campaign_message}

Çıktı JSON:
{
  "prompt_en": "Modern editorial illustration about ..., flat design, brand-color palette (...), no text, no logos, no faces, leaving negative space for headline overlay",
  "alt_text_tr": "...",
  "suggested_headline": "max 8 kelime headline önerisi (banner üzerinde gösterilebilir)",
  "color_palette_hex": ["#...", "#...", "#..."]
}`,
  },

  newsletter_blurb: {
    responseFormat: "json",
    temperature: 0.6,
    buildUserMessage: ({
      brand_name,
      product_name,
      key_benefit,
      cta_url,
    }) => `Aşağıdaki bilgilerden, ${brand_name} için MarkaRadar "Pazarlama 5" newsletter'ında çıkacak 80 kelimelik bir sponsor blurb yaz.

KURALLAR:
- 70-90 kelime arası
- 1 cümle kanca + 1 cümle açıklama + 1 cümle CTA
- Açık "Sponsorlu" etiketi olacak (sen yazma, sistem ekler)
- Newsletter editöryel tonuyla uyumlu — vurucu, ama clickbait değil

Ürün: ${product_name}
Ana fayda: ${key_benefit}
CTA: ${cta_url}

Çıktı JSON:
{
  "blurb": "...",
  "cta_text": "Devamını oku" gibi kısa CTA,
  "subject_line_addon": "newsletter konusunda parantez içinde geçecek ek (max 30 karakter)"
}`,
  },

  reels_brand_script: {
    responseFormat: "json",
    temperature: 0.7,
    buildUserMessage: ({
      brand_name,
      product_name,
      key_message,
      target_audience,
    }) => `Aşağıdaki bilgilerden, ${brand_name} için 30 saniyelik bir Reels/TikTok script'i üret.

Yapı (her sahne için on_screen text + voiceover + visual öneri):
- 0-3s: Kanca (vurucu görsel + sözel)
- 3-10s: Sorun/durum
- 10-20s: Çözüm/ürün
- 20-27s: Çıkarım
- 27-30s: CTA

Ürün: ${product_name}
Ana mesaj: ${key_message}
Hedef kitle: ${target_audience}

Çıktı JSON:
{
  "scenes": [
    { "time": "0-3", "on_screen": "...", "vo": "...", "visual": "..." },
    ...
  ],
  "caption": "...",
  "hashtags": ["#..."],
  "sound_suggestion": "trendde olan ... beat"
}`,
  },

  case_study: {
    responseFormat: "json",
    temperature: 0.5,
    buildUserMessage: ({
      brand_name,
      challenge,
      solution,
      results,
      timeline,
    }) => `Aşağıdaki bilgilerden, ${brand_name} için bir vaka analizi (case study) yapısı oluştur.

Format: Effie/Cannes vaka analizi formatı.

Marka: ${brand_name}
Süreç: ${timeline}
Karşılaşılan sorun: ${challenge}
Uygulanan çözüm: ${solution}
Sonuçlar (sayısal): ${results}

Çıktı JSON:
{
  "title": "...",
  "subtitle": "...",
  "challenge_section": "1 paragraf",
  "insight_section": "1 paragraf — neden bu çözüm seçildi",
  "solution_section": "2 paragraf — ne yapıldı",
  "execution_section": "1 paragraf — nasıl yürütüldü",
  "results_section": "1 paragraf — sayısal sonuçlar",
  "key_learnings": ["...", "..."],
  "agency_credit_suggestion": "ajans kredisi yapısı önerisi"
}`,
  },

  competitor_diff_angle: {
    responseFormat: "json",
    temperature: 0.6,
    buildUserMessage: ({
      brand_name,
      product_name,
      competitors_text,
    }) => `Aşağıdaki bilgilerden, ${brand_name} için rakipten farkı vurgulayan bir konumlandırma açısı önerisi yaz.

KURALLAR:
- Rakipleri ad vererek karalama YOK
- Generic faydalar yerine somut data + benzersiz açı
- "Daha iyi" değil, "farklı" odaklı

Ürün: ${product_name}
Rakiplerle ilgili bilgi: ${competitors_text}

Çıktı JSON:
{
  "differentiation_angles": [
    { "angle": "...", "rationale": "...", "headline_suggestion": "..." }
  ],
  "weakness_to_avoid": "rakip kuvvetli olduğu alanlara değinme önerileri"
}`,
  },

  target_audience_brief: {
    responseFormat: "json",
    temperature: 0.5,
    buildUserMessage: ({
      brand_name,
      product_name,
      target_segment,
    }) => `Aşağıdaki marka/ürün için MarkaRadar kitlesinde hangi segmentlere reach edileceği analizi yap.

MarkaRadar segmentleri:
- CMO/Marka müdürü (FMCG, banka, holding)
- Ajans sahibi (15-100 kişilik)
- Sosyal medya / dijital uzmanı (25-40 yaş)
- MarTech kurucusu / SaaS
- İK / Employer brand
- Solo danışman / freelancer

Ürün: ${product_name}
Hedef segment: ${target_segment}

Çıktı JSON:
{
  "primary_segment": "...",
  "secondary_segments": ["...", "..."],
  "estimated_audience_size": "~10.000 reach gibi",
  "best_placement": "homepage_top, newsletter_top, sponsor_article gibi",
  "suggested_budget_range_try": "5000-25000 gibi"
}`,
  },
};
