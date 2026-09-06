# ALI FLEET — واجهة المتجر (Next.js)

الواجهة العامة لموقع [alifleet.com](https://alifleet.com): قطع غيار بديلة للشاحنات والمركبات التجارية، سيارات للبيع، واستيراد شخصي. الواجهة مبنية بـ Next.js وتقرأ كل المحتوى والمنتجات من ووردبريس/WooCommerce على `a-f.site` عبر WPGraphQL.

## البنية

| الطبقة | التقنية | الدور |
|--------|---------|-------|
| الواجهة | Next.js 16 (App Router)، React 19، Tailwind 4، GSAP | الصفحات، السلة، تسجيل الدخول، SEO |
| الباك إند | WordPress + WooCommerce + ACF + WPGraphQL | المنتجات، السيارات، المقالات، السياسات، إعدادات المتجر |
| الربط | `lib/wp/*` (GraphQL) + `lib/checkout/*` (بروكسي الدفع) + `wordpress/mu-plugin/alifleet-cms.php` | حقول GraphQL المخصصة، الجلسة، تسليم السلة لصفحة دفع WooCommerce |
| الاستضافة | Coolify (Docker + Traefik) على سيرفر واحد | يبني فرع `main` من هذا المستودع عند كل push |

النصوص الثابتة للواجهة (القوائم، الأزرار، العناوين) في `lib/i18n/dictionaries/{he,ar,en}.ts`. أي شيء يخص المنتجات أو السيارات أو المقالات يُعدَّل من ووردبريس لا من الكود.

## التشغيل محلياً

المتطلبات: Node 22 أو أحدث، و pnpm.

```bash
pnpm install
```

```bash
pnpm dev
```

بدون أي متغير بيئة الواجهة تتصل بـ `https://a-f.site/graphql` مباشرة.

## متغيرات البيئة

| المتغير | مطلوب في الإنتاج | الوظيفة |
|---------|------------------|---------|
| `WORDPRESS_GRAPHQL_ENDPOINT` | نعم | رابط GraphQL، مثل `https://a-f.site/graphql` |
| `WORDPRESS_STORE_URL` | لا | أصل متجر WooCommerce إن اختلف عن نطاق GraphQL |
| `SITE_ORIGIN` | نعم | الأصل العام للواجهة `https://alifleet.com`، يُستخدم في نماذج الدفع |
| `NEXT_PUBLIC_SITE_URL` | نعم | الرابط القانوني لـ sitemap و Open Graph |
| `WORDPRESS_REVALIDATE_SECRET` | نعم | سر webhook تفريغ الكاش؛ نفس القيمة تُخزَّن في ووردبريس بالخيار `alifleet_revalidate_secret` |
| `NEXT_PUBLIC_META_PIXEL_ID` | لا | Meta Pixel |
| `DNS_FALLBACK` | لا | `off` لتعطيل احتياط DNS في `lib/server/dns-fallback.mjs` |
| `AI_GATEWAY_API_KEY`, `WORDPRESS_USER`, `WORDPRESS_APP_PASSWORD` | لا | لسكربتات الصيانة في `scripts/` فقط |

ملفات `.env*` لا تُرفع إلى git أبداً.

## الأوامر

| الأمر | الوظيفة |
|-------|---------|
| `pnpm dev` | تشغيل محلي |
| `pnpm build` ثم `pnpm start` | بناء وتشغيل إنتاجي |
| `pnpm lint` | ESLint (إعداد Next.js + TypeScript) |
| `pnpm exec tsc --noEmit` | فحص الأنواع؛ أخطاء الأنواع تُفشل البناء |
| `pnpm test:security` | اختبارات وحدات الحماية في `scripts/security-tests/` |
| `pnpm translate` / `pnpm translate:dry` | ترجمة كتالوج المنتجات في ووردبريس |
| `pnpm migrate:cars` / `pnpm migrate:cars:dry` | ترحيل بيانات السيارات إلى ACF |

## هيكل المجلدات

```
app/            الصفحات والمسارات (App Router) + robots و sitemap و API routes
components/     مكوّنات الواجهة
lib/auth/       تسجيل الدخول (JWT في كوكيز httpOnly)
lib/checkout/   بروكسي صفحة دفع WooCommerce وقائمة السماح الخاصة به
lib/wp/         استعلامات GraphQL، التخزين المؤقت، تنظيف HTML القادم من ووردبريس
lib/i18n/       اللغات والقواميس
public/         الصور والأصول الثابتة
scripts/        سكربتات الصيانة واختبارات الحماية
wordpress/      الـ mu-plugin، مخطط ACF، سكربتات الاستيراد، وأداة wp-agent الخاصة بالسيرفر
docs/           التوثيق والتقارير
```

## النشر

1. ادمج التغييرات في `main` وارفعها (GitHub Desktop: Branch → Merge into current branch ثم Push).
2. في Coolify اضغط Redeploy.
3. تحقق:

```bash
curl -sI https://alifleet.com | grep -i -E "content-security-policy|x-frame-options"
```

تفاصيل أكثر في [docs/DEPLOY-GUIDE.md](docs/DEPLOY-GUIDE.md).

## جانب ووردبريس

- الـ mu-plugin الأساسي: `wordpress/mu-plugin/alifleet-cms.php`. يُرفع إلى السيرفر بأداة `wp-agent` (انظر `wordpress/server/` و [docs/AGENT.md](docs/AGENT.md)).
- بعد أي تعديل في الـ mu-plugin: `sudo wp-agent put` ثم `sudo wp-agent lint`.

## التوثيق

- [docs/HOW-IT-WORKS.md](docs/HOW-IT-WORKS.md): كيف تتصل الواجهة بووردبريس ومتى يُعدَّل الكود ومتى يُعدَّل ووردبريس.
- [docs/SECURITY-AUDIT.md](docs/SECURITY-AUDIT.md) و [docs/SECURITY-PHASE-1-REPORT.md](docs/SECURITY-PHASE-1-REPORT.md): الفحص الأمني وما نُفِّذ منه.
- [docs/INFRA-AUDIT-2026-09-06.md](docs/INFRA-AUDIT-2026-09-06.md): فحص البنية التحتية وتنظيف الكود.
- [docs/WORDPRESS-SETUP.md](docs/WORDPRESS-SETUP.md): إعداد ووردبريس من الصفر.
