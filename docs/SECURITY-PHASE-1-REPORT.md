# تقرير تنفيذ المرحلة الأمنية الأولى — AliFleet

- التاريخ: 2026-09-06
- الفرع: `security/hardening` (commits `9f85c32` و `af2418d`)
- المرجع: الثغرات مرقّمة بنفس أرقام [SECURITY-AUDIT.md](SECURITY-AUDIT.md)
- الحالة: 12 بند مُصلَح ومُختبَر. C1 مطبّق على سيرفر ووردبريس فعلاً. باقي البنود في الكود وتحتاج دمج ونشر.

## 1. جدول الإصلاحات والاختبارات

| # | الثغرة | الإصلاح | الملفات | الاختبار | النتيجة |
|---|--------|---------|---------|----------|---------|
| C1 | `/wp-json/wp/v2/users` يكشف اسم مستخدم الأدمن، وفهرس REST يعلن 774 مسار | فلتر `rest_endpoints` يحذف مسارات users للزوار، وفلتر `rest_index` يخفي قائمة المسارات | `wordpress/mu-plugin/alifleet-cms.php` | على السيرفر الحي: قبل 200 + `"slug":"ali"`، بعد 404. الفهرس 774 → 0. GraphQL و `wc/store` و `alifleet/v1/session` سليمة | ✅ حي |
| C2 | `/cms/*` بروكسي مفتوح لأي مسار وأي method على ووردبريس (wp-login، xmlrpc، REST) بكوكيز الزائر | قائمة سماح: أصول ثابتة تحت `wp-content` و `wp-includes` + `wp-admin/admin-ajax.php` فقط؛ حذف PUT/PATCH/DELETE | `app/cms/[[...path]]/route.ts`, `lib/checkout/cms-allowlist.ts` | 30 اختبار وحدة + 7 اختبارات HTTP (wp-login 404، xmlrpc 404، users 404، PUT 405، jquery 200، admin-ajax يصل لووردبريس) + فحص HTML صفحة الدفع الفعلية: 12/12 أصل مسموح | ✅ |
| C3 | `/api/chat` بدون مصادقة أو حدود، يستهلك رصيد OpenAI، وبرومبت فيه معلومات خاطئة عن الشركة | حذف الـ endpoint بالكامل (غير مستخدم في أي مكوّن) | `app/api/chat/route.ts` | POST → 404 | ✅ |
| H1 | لا `Content-Security-Policy` ولا `X-Frame-Options` | CSP كامل على كل المسارات + `X-Frame-Options: DENY` + CSP sandbox أشد على `/api/img` | `next.config.mjs` | رؤوس الاستجابة عبر curl + متصفح حقيقي: 7 صفحات (الرئيسية، المنتجات، منتج، مقال، سياسة، اتصل، السلة) صفر مخالفات CSP | ✅ |
| H2 | HTML خام من ووردبريس يُحقن في الصفحة بدون تنظيف (المدونة والسياسات) | تمرير المحتوى عبر `sanitize-html` بقائمة سماح عند حدود الجلب | `lib/wp/sanitize.ts`, `lib/wp/posts.ts`, `lib/wp/policies.ts` | 10 اختبارات وحدة: `<script>`، `onerror`، `javascript:`، `<form>`، iframe من نطاق غريب، وسوم عادية تمر كما هي | ✅ |
| H4 | البروكسي يقرأ أي حجم جسم في الذاكرة | حد 1 MB مع قراءة streaming وإلغاء عند التجاوز | `lib/checkout/proxy.ts` | 2 MB → 413 على `/cms` و `/checkout/` و `/wc-ajax` (chunked بدون content-length). 1 KB يمر | ✅ |
| H5 | `.gitignore` يتجاهل `.env*.local` فقط | `.env`, `.env.*`, `!.env.example`, `package-lock.json` | `.gitignore` | `git check-ignore` على 6 أسماء | ✅ |
| M1 | بروكسي الصور يصل لأي مسار على a-f.site | `/wp-content/uploads/` فقط + امتداد صورة + استجابة `image/*` + حد 25 MB + رفض redirect خارج النطاق + CSP sandbox | `app/api/img/route.ts`, `next.config.mjs` | 5 حالات رفض (wp-login، نطاق غريب، traversal، php، REST) + صورة حقيقية 200 مع الرؤوس | ✅ |
| M2 | `sanitizeRedirect` يمنع `//` فقط ويقبل `/\evil.com` | regex صارم + إعادة parse للتأكد من نفس الأصل | `lib/auth/redirect.ts`, `lib/auth/actions.ts` | 19 اختبار وحدة | ✅ |
| M3 | `x-forwarded-host` موثوق بلا شرط ويُحقن في form action الدفع | يُقبل فقط لو `alifleet.com` أو `www.alifleet.com`، وإلا الأصل القانوني | `lib/checkout/public-host.ts`, `lib/checkout/proxy.ts` | 3 اختبارات وحدة (11 حالة) | ✅ |
| M4 | علم `Secure` للكوكيز معتمد على رؤوس البروكسي | `Secure` دائماً في production | `lib/auth/session.ts` | فحص أنواع + بناء (لا اختبار تشغيلي بدون حساب عميل) | ✅ مراجعة كود |
| M5 | سر الـ revalidate مقبول في `?secret=` (يظهر في اللوجات) | header فقط؛ ووردبريس يرسله بالـ header أصلاً | `app/api/revalidate/route.ts` | header صحيح 200، `?secret=` فقط 401، header خاطئ 401، GET 405 | ✅ |

**الإجمالي:** 62 اختبار وحدة (`node --test`) + 36 فحص HTTP على `next start` محلياً + فحص متصفح على 7 صفحات. الكل ناجح. `tsc --noEmit` نظيف، والبناء الإنتاجي ناجح.

## 2. كيف تعيد تشغيل الاختبارات

```bash
pnpm test:security
```

```bash
pnpm build
```

## 3. النشر

1. الـ mu-plugin (C1) مرفوع على السيرفر ومُفعّل الآن. لا يحتاج نشر.
2. الفرونت: في GitHub Desktop انتقل لفرع `main`، ثم Branch → Merge into current branch → اختر `security/hardening`، ثم Push.
3. في Coolify اعمل Redeploy.
4. تحقق بعد النشر:

```bash
curl -sI https://alifleet.com | grep -i -E "content-security-policy|x-frame-options"
```

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://alifleet.com/cms/wp-login.php
```

المتوقع: رأسان موجودان، و404 للسطر الثاني.

## 4. بنود لازم تعملها بنفسك (خارج الكود)

1. **ووردبريس:** ثبّت إضافة Limit Login Attempts Reloaded، وفعّل التحقق بخطوتين (WP 2FA) لحساب `ali`، وغيّر كلمة المرور لواحدة طويلة عشوائية.
2. **XML-RPC** على a-f.site ما زال مفتوحاً لأن Jetpack يستخدمه. لو Jetpack غير ضروري: احذفه وأضف `add_filter('xmlrpc_enabled','__return_false')` في الـ mu-plugin.
3. **Coolify env:** أضف `SITE_ORIGIN=https://alifleet.com` و `NEXT_PUBLIC_SITE_URL=https://alifleet.com` و `WORDPRESS_REVALIDATE_SECRET` (نفس القيمة المخزنة في ووردبريس بـ `wp option alifleet_revalidate_secret`).
4. **Vercel Analytics:** المكوّن يطلب `/_vercel/insights/script.js` ويرجع 404 في كل صفحة لأن الموقع ليس على Vercel. ليس أمنياً لكنه ضوضاء في الكونسول. يُحذف من `app/layout.tsx` أو يُستبدل بـ GA4.
5. **حزم لم تعد مستخدمة** بعد حذف الشات: `ai` و `@ai-sdk/react`. يمكن حذفها من `package.json`.
6. **HSTS:** إضافة `includeSubDomains; preload` بعد التأكد أن كل الـ subdomains تعمل بـ HTTPS.
7. **نسخ احتياطي دوري** لقاعدة بيانات ووردبريس و `wp-content/uploads`، وتحديث الإضافات شهرياً.

## 5. قرارات تصميم تستحق المعرفة

- الـ CSP يسمح `'unsafe-inline'` للسكربت لأن Next.js و Meta Pixel يحقنان سكربت inline. الترقية لنظام nonce تحتاج middleware وتُؤجَّل لمرحلة لاحقة. الحماية الفعلية الآن: منع أي نطاق سكربت غريب، منع الإطارات، منع `<base>`، وترقية http تلقائياً.
- `form-action` غير مضاف عمداً لأنه يمنع أيضاً الـ redirect الذي تفعله بوابة الدفع بعد إرسال الطلب.
- صفحة الدفع تتطلب تسجيل دخول عميل، فاختبار CSP عليها تم على HTML الصفحة الفعلية عبر البروكسي (مسار `order-received`) وأثبت أنها لا تشير لأي سكربت أو CSS خارجي.
- الشات حُذف بدل تقييده لأنه غير مستخدم في أي مكوّن. لو أردت شات لاحقاً، يجب أن يُبنى مع مصادقة وحد معدل من البداية.
