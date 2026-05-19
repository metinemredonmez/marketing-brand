import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("basit string'i slug'a çevirir", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("Türkçe karakterleri dönüştürür", () => {
    expect(slugify("Merhaba Dünya")).toBe("merhaba-dunya");
    expect(slugify("Çağdaş Şıracılar İş İlanı")).toBe(
      "cagdas-siracilar-is-ilani",
    );
  });

  it("özel karakterleri siler", () => {
    expect(slugify("AI & Pazarlama (2026)!")).toBe("ai-pazarlama-2026");
  });

  it("birden fazla boşluğu tek tire yapar", () => {
    expect(slugify("çok    fazla     boşluk")).toBe("cok-fazla-bosluk");
  });

  it("maksimum uzunlukta keser", () => {
    const result = slugify("a".repeat(150), 50);
    expect(result.length).toBeLessThanOrEqual(50);
  });

  it("baş ve sondaki tireleri siler", () => {
    expect(slugify("---test---")).toBe("test");
  });
});

describe("uniqueSlug", () => {
  it("çakışma yoksa orijinali döner", async () => {
    const result = await uniqueSlug("merhaba", async () => false);
    expect(result).toBe("merhaba");
  });

  it("çakışma varsa suffix ekler", async () => {
    let calls = 0;
    const result = await uniqueSlug("test", async (s) => {
      calls++;
      return s === "test" || s === "test-1";
    });
    expect(result).toBe("test-2");
    expect(calls).toBeGreaterThanOrEqual(3);
  });

  it("boş input'ta fallback üretir", async () => {
    const result = await uniqueSlug("###", async () => false);
    expect(result).toMatch(/^entry-/);
  });
});
