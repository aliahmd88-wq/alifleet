# المرحلة 2 — SEO الأساسي ✅ خلصت واتختبرت

**التاريخ:** 6 سبتمبر 2026
**حالة البناء:** ✅ نجح (صفر أخطاء)

---

## المهام الخمسة

| # | المهمة | الحالة | الاختبار |
|---|---|---|---|
| 2.1 | robots.txt | ✅ | اتولد فعليًا واتقرأ محتواه |
| 2.2 | sitemap.xml ديناميكي | ✅ | **152 رابط** مع المنتجات |
| 2.3 | عناوين ووصف meta | ✅ | قالب عناوين + وصف لكل صفحة |
| 2.4 | Open Graph | ✅ | الوسوم ظهرت في HTML |
| 2.5 | Schema.org | ✅ | منتج + شركة، بالبيانات الحقيقية |

---

## الملفات

### جديدة
| الملف | الوظيفة |
|---|---|
| `app/robots.ts` | بيولّد `/robots.txt` |
| `app/sitemap.ts` | بيولّد `/sitemap.xml` من ووردبريس |
| `lib/seo.ts` | دوال الروابط المطلقة |

### معدّلة
| الملف | التعديل |
|---|---|
| `app/layout.tsx` | `metadataBase` · Open Graph · Twitter · قالب العناوين · Schema الشركة |
| `app/products/[slug]/page.tsx` | Open Graph + Schema المنتج (سعر ومخزون) |
| `app/products/page.tsx` | عنوان ووصف للصفحة |

---

## نتائج الاختبار الفعلي

### robots.txt
```
User-Agent: *
Allow: /
Disallow: /api/  /account/  /cart  /checkout  /cms/  /wc-ajax/  /setup
Host: https://alifleet.com
Sitemap: https://alifleet.com/sitemap.xml
```
الصفحات الممنوعة دي بتخص جلسة الزائر — فهرستها بتسرّب روابط شخصية ومالهاش قيمة في البحث.

### sitemap.xml — 152 رابط
```
https://alifleet.com
https://alifleet.com/cars
https://alifleet.com/products
https://alifleet.com/products/1706993
...
```
**بيتحدث تلقائيًا كل ساعة** — أي منتج جديد تضيفه في ووردبريس يدخل لوحده من غير تعديل كود.

### Schema المنتج
```json
{
  "@type": "Product",
  "name": "Headlight Bracket – Right",
  "sku": "HTP-LF051R",
  "brand": { "@type": "Brand", "name": "Daf" },
  "offers": {
    "price": 500,
    "priceCurrency": "ILS",
    "availability": "https://schema.org/InStock"
  }
}
```
ده اللي بيخلي جوجل يعرض **السعر والتوفر** جنب المنتج في نتيجة البحث.

### Schema الشركة
```json
{
  "@type": "AutoPartsStore",
  "telephone": "053-957-3718",
  "email": "info@alifleet.com",
  "openingHours": "Sat–Thu 09:00–18:00 · Friday closed"
}
```
البيانات دي بتتقرأ من **ووردبريس** — لو غيّرت التليفون في لوحة التحكم، جوجل يشوف الجديد من غير نشر.

---

## 🔴 مشكلة اكتشفتها أثناء الشغل

الفولدر كان **ناقص 20 ملف** (منهم `tsconfig.json`) — البناء كان بيفشل بـ 100 خطأ. رجّعتهم من الجيت والبناء نجح.

**درس:** شغّل `npm run build` قبل أي push. لو رفعت وقتها كان الموقع هيقع.

---

## الخطوة الجاية — النشر

```bash
cd /Users/user/Desktop/web-folder
npm run build          # لازم ينجح
git add -A
git commit -m "SEO: robots, sitemap, Open Graph, Schema.org"
git push origin main
```
بعدين Redeploy من Coolify.

⚠️ **مهم:** اتأكد إن `WORDPRESS_GRAPHQL_ENDPOINT` مضبوط في Coolify — من غيره الخريطة هتطلع بـ 5 روابط بدل 152.

---

## بعد النشر — بلّغ جوجل

1. ادخل [Google Search Console](https://search.google.com/search-console)
2. ضيف `alifleet.com` وأثبت ملكيتك
3. Sitemaps → اكتب `sitemap.xml` → Submit

من غير الخطوة دي جوجل ممكن ياخد أسابيع عشان يلاقي الموقع.

---

## لسه مفتوح

| البند | الحالة |
|---|---|
| مسارات اللغات + hreflang | 🔴 أكبر عائق SEO — 3 لغات على رابط واحد |
| 36 منتج نافد المخزون | 🔴 مستني قرارك |
| 3 منتجات بلا سعر | 🔴 مستني أسعارها |
| الرمز البريدي `1694000` | ⚠️ أكده |
| بيكسل فيسبوك | ⚠️ الرقم `1422327476388484` بتاعك؟ |
