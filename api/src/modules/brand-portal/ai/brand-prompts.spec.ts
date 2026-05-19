import { describe, it, expect } from "vitest";
import { BRAND_PROMPTS, BRAND_SYSTEM_PROMPT } from "./brand-prompts";

describe("brand prompts", () => {
  it("8 prompt türü tanımlı", () => {
    expect(Object.keys(BRAND_PROMPTS)).toHaveLength(8);
  });

  it("her prompt buildUserMessage fonksiyonu içerir", () => {
    for (const [key, t] of Object.entries(BRAND_PROMPTS)) {
      expect(typeof t.buildUserMessage).toBe("function");
      expect(t.responseFormat).toBe("json");
      expect(typeof t.temperature).toBe("number");
      // sanity — yer tutucusu doldurulabilir
      const msg = t.buildUserMessage({
        brand_name: "Test",
        product_name: "P1",
        product_description: "D",
        key_benefits: "B",
        target_audience: "T",
        cta: "C",
        story_topic: "S",
        key_data: "K",
        target_outcome: "O",
        campaign_message: "M",
        brand_colors: "#000",
        placement: "homepage_top",
        key_benefit: "B",
        cta_url: "https://x",
        key_message: "KM",
        challenge: "C",
        solution: "S",
        results: "R",
        timeline: "6 ay",
        competitors_text: "X",
        target_segment: "CMO",
      });
      expect(msg.length).toBeGreaterThan(50);
      // brand_name interpolasyonu çalışıyor mu
      if (msg.includes("${brand_name}")) {
        throw new Error(`${key}: brand_name interpolasyonu eksik`);
      }
    }
  });

  it("system prompt KVKK + reklam kurulu kurallarını içerir", () => {
    expect(BRAND_SYSTEM_PROMPT).toContain("KVKK");
    expect(BRAND_SYSTEM_PROMPT).toContain("Reklam Kurulu");
    expect(BRAND_SYSTEM_PROMPT).toContain("Sponsorlu");
  });

  it("product_launch_post — hashtag ve CTA bekler", () => {
    const t = BRAND_PROMPTS.product_launch_post;
    const msg = t.buildUserMessage({
      brand_name: "MarkaRadar",
      product_name: "Brand Studio",
      product_description: "Self-serve reklam",
      key_benefits: "Hızlı, Türkçe AI",
      target_audience: "CMO",
      cta: "Hemen dene",
    });
    expect(msg).toContain("MarkaRadar");
    expect(msg).toContain("Brand Studio");
    expect(msg).toContain("hashtags");
  });

  it("brand_story_article — Marka Hamlesi formatını tanımlar", () => {
    const t = BRAND_PROMPTS.brand_story_article;
    const msg = t.buildUserMessage({
      brand_name: "Test",
      story_topic: "X",
      key_data: "Y",
      target_outcome: "Z",
    });
    expect(msg).toContain("Marka Hamlesi");
    expect(msg).toContain("Lead");
    expect(msg).toContain("Sponsorlu");
  });
});
