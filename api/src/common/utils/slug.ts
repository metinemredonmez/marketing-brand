/**
 * Türkçe karakter dahil slug üreteci.
 * "Merhaba Dünya!" → "merhaba-dunya"
 */
const TURKISH_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

export function slugify(input: string, maxLength = 100): string {
  let s = input.trim().toLowerCase();

  // Türkçe karakterleri değiştir
  s = s.replace(/[çÇğĞıİöÖşŞüÜ]/g, (c) => TURKISH_MAP[c] ?? c);

  // Sadece a-z, 0-9, boşluk, tire — diğerlerini sil
  s = s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // diakritikleri sil
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return s.slice(0, maxLength);
}

/**
 * Veritabanında çakışma varsa numara ekleyerek tekilleştir.
 *
 * @example
 *   const slug = await uniqueSlug(
 *     "Merhaba Dünya",
 *     async (s) => !!(await prisma.article.findUnique({ where: { slug: s } })),
 *   );
 */
export async function uniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
  maxLength = 100,
): Promise<string> {
  const slug = slugify(base, maxLength);
  if (!slug) return `entry-${Date.now()}`;

  if (!(await exists(slug))) return slug;

  let n = 1;
  while (n < 1000) {
    const suffix = `-${n}`;
    const candidate = `${slug.slice(0, maxLength - suffix.length)}${suffix}`;
    if (!(await exists(candidate))) return candidate;
    n += 1;
  }
  return `${slug.slice(0, maxLength - 14)}-${Date.now()}`;
}
