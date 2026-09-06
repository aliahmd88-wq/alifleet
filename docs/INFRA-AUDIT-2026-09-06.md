# فحص البنية التحتية وتنظيف الكود — AliFleet

- التاريخ: 2026-09-06
- الفرع: `security/hardening` (يُكمل [SECURITY-PHASE-1-REPORT.md](SECURITY-PHASE-1-REPORT.md))
- النطاق: السيرفر من الداخل (عبر `wp-agent`)، الشبكة من الخارج (DNS، TLS، البورتات، الرؤوس، الملفات المكشوفة)، وأساس المشروع في المستودع (الإعدادات، الحزم، أدوات الجودة، بقايا التطوير).

## 1. الخلاصة

| المجال | اتصلح | يحتاج قرارك |
|--------|-------|-------------|
| الكود والمستودع | 14 بند (القسم 4) | 0 |
| سيرفر ووردبريس | 1 بند (فلتر REST يستثني WP-CLI) | 6 بنود (القسم 5) |
| الشبكة والاستضافة | تحويل www، إخفاء `x-powered-by` | 3 بنود: البورتات المفتوحة، DMARC/CAA، سر الـ revalidate |

أخطر بند مفتوح: لوحة Coolify متاحة من الإنترنت على البورت 8000 بدون تشفير.

## 2. السيرفر من الداخل

| البند | الحالة | التقييم |
|-------|--------|---------|
| النظام | Ubuntu 24.04.4 LTS، 4 CPU، 8 GB RAM (4.6 GB متاح)، القرص 22 GB من 96 | ✅ |
| الحمل | load 0.3–0.5، uptime 5 أيام | ✅ |
| WordPress | 7.1 (أحدث إصدار)، الصورة الرسمية، Apache 2.4.68 | ✅ |
| الإضافات | 22 إضافة كلها محدّثة، auto-update متوقف على الكل | ⚠️ |
| إضافات غير مفعّلة | ai-provider-for-anthropic، akismet، auto-listings-custom-page، hello (checksum لا يطابق)، simple-jwt-login | ⚠️ تُحذف |
| ثيمات غير مفعّلة | hello-elementor، twentytwentythree، twentytwentyfour، twentytwentyfive | ⚠️ تُحذف |
| حسابات الأدمن | اثنان: `ali` و `Khaled` | ⚠️ راجع الثاني |
| التسجيل | `users_can_register=1` (مطلوب لتسجيل العملاء من الموقع عبر GraphQL) ونموذج `wp-login.php?action=register` مفتوح أيضاً | ⚠️ |
| النسخ الاحتياطي | UpdraftPlus: آخر نسخة 2026-06-28 بدون جدولة. WPvivid مفعّل بالتوازي | 🔴 |
| `debug.log` | سطر واحد قديم (208 بايت) لكنه مقروء للعامة | ⚠️ |
| ملفات `.bak` في `mu-plugins` | قابلة للتحميل. فُحصت: لا تحتوي أسراراً | ⚠️ |
| `DISALLOW_FILE_EDIT` | غير مضبوط | ⚠️ |
| `WP_DEBUG` | متوقف | ✅ |
| المفاتيح | HMAC من `wp_salt('auth')` وJWT من `wp-config.php`، لا شيء في الكود | ✅ |
| GraphQL | introspection مغلق للعامة؛ استعلام `users` يعيد عقداً فارغة (يكشف العدد فقط) | ✅ |
| قاعدة البيانات | كونتينر مستقل، خارج صلاحيات `wp-agent` | للعلم |

## 3. الشبكة من الخارج

| البند | النتيجة | التقييم |
|-------|---------|---------|
| البورتات المفتوحة على `213.199.49.147` | 22، 80، 443، و**8000** (لوحة Coolify، HTTP بدون TLS)، **6001/6002** (Coolify realtime) | 🔴 |
| TLS | Let's Encrypt للنطاقات الثلاثة، ينتهي 2026-12-04، تجديد تلقائي | ✅ |
| DNS | `alifleet.com` و `www` و `a-f.site` → نفس الـ IP. SPF موجود (Outlook). لا DMARC ولا CAA | ⚠️ |
| http → https | 302 من Traefik | ✅ |
| www → alifleet.com | كان يخدم نسخة ثانية من الموقع (محتوى مكرر لمحركات البحث) → اتصلح في الكود (308) | ✅ |
| رؤوس `alifleet.com` | HSTS ✅، nosniff ✅، `x-powered-by: Next.js` كان يظهر → اتشال ✅، CSP يظهر بعد النشر | ✅ |
| الضغط والكاش | gzip على HTML، `immutable` سنة كاملة على `/_next/static` | ✅ |
| ملفات مكشوفة على `alifleet.com` | `.env`، `.git`، `package.json` كلها 404. صفحة `/setup` القديمة كانت 200 → اتحذفت | ✅ |
| ملفات مكشوفة على `a-f.site` | `readme.html` و `license.txt` 200 (كشف إصدار بسيط)، `debug.log` 200، `mu-plugins/*.bak` 200، `wp-config.php` يُنفَّذ ولا يُسرَّب | ⚠️ |
| `/api/revalidate` في الإنتاج | 503 = `WORDPRESS_REVALIDATE_SECRET` غير مضبوط في Coolify، فتفريغ الكاش من ووردبريس معطّل | ⚠️ |
| زمن الاستجابة | الرئيسية 0.24s. `/products` أول طلب بعد النشر 4.7s ثم 0.4s (الكاش يتعبأ عند أول زيارة) | ✅ |

## 4. أساس المشروع: ما اتصلح في هذا الفرع

| # | البند | التغيير |
|---|-------|---------|
| 1 | ESLint لم يكن مثبتاً أصلاً و `pnpm lint` كان يفشل | eslint 9 + eslint-config-next 16 مع `eslint.config.mjs`. 9 أخطاء اتصلحت: `site-loader` (استدعاء `Date.now` أثناء الرندر)، `sale-browser` (مكوّن يُنشأ في كل رندر)، `account-menu` و `policy-screen` (setState داخل effect). استثناءان موثقان في `cart-context` و `language-context`. النتيجة: صفر مشاكل |
| 2 | `ignoreBuildErrors: true` كان يخفي أخطاء الأنواع | صار `false`؛ `tsc --noEmit` نظيف |
| 3 | `x-powered-by: Next.js` في كل استجابة | `poweredByHeader: false` |
| 4 | patch لـ DNS بأربعين سطراً في أعلى `next.config.mjs` | انتقل إلى `lib/server/dns-fallback.mjs` بنفس السلوك، مع `DNS_FALLBACK=off` لتعطيله |
| 5 | `remotePatterns` لنطاق `sslip.io` من بيئة تطوير قديمة | اتشالت |
| 6 | `www.alifleet.com` يخدم الموقع كاملاً | تحويل دائم إلى `alifleet.com` |
| 7 | `package.json`: الاسم `my-project`، بدون `engines`، حزمة `@ai-sdk/react` غير مستخدمة | الاسم `alifleet`، `node >= 22`، الحزمة اتشالت (`ai` باقية لأن سكربت الترجمة يستخدمها) |
| 8 | 17 سطر لوج بالبادئة `[v0]` وبمستوى `console.log` | `[alifleet]` وبمستوى `console.warn` |
| 9 | صفحة `/setup` منشورة على الإنتاج بمحتوى قديم وعنوان سيرفر داخلي | اتحذفت مع مرجعها في `robots.ts` |
| 10 | `fleet-showcase-fix.patch` (مطبق فعلاً) و `graphql_test.py` في جذر المشروع | اتحذفا |
| 11 | مجلد `.agents/` (24 ملف من أتمتة سابقة) متتبَّع في git | اتشال وأُضيف إلى `.gitignore` |
| 12 | `next-env.d.ts` و `tsconfig.tsbuildinfo` (مخرجات بناء) متتبَّعان | خرجا من git و `.gitignore` أعيد كتابته |
| 13 | التوثيق موزع بين جذر المشروع ومجلد آخر خارج git | كله تحت `docs/` بما فيه تقرير الفحص الأمني ودليل النشر |
| 14 | README من قالب v0 | README يصف المشروع الفعلي والأوامر والمتغيرات والنشر |

كل تغيير اتحقق منه بـ: `pnpm lint` (صفر)، `pnpm exec tsc --noEmit` (نظيف)، `pnpm test:security` (62/62)، بناء إنتاجي ناجح، وتشغيل محلي مع فحص 14 مساراً + تحويل www + غياب `x-powered-by` + فحص متصفح لصفحتي `/cars` (الفلاتر تعمل) و `/privacy-policy` (RTL والمحتوى المنظّف).

## 5. اللي محتاج قرارك، بالأوامر

### 5.1 🔴 البورتات المفتوحة (الأهم)

لوحة Coolify على `http://213.199.49.147:8000` متاحة لأي شخص وبدون تشفير، أي أن كلمة مرور اللوحة تُرسل كنص صريح. خياران:

**أ. جدار ناري** (من جلسة SSH بحساب root، ولا تقفل الجلسة قبل التأكد):

```bash
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw default deny incoming && sudo ufw enable && sudo ufw status
```

ثم تدخل اللوحة عبر نفق SSH من جهازك:

```bash
ssh -L 8000:localhost:8000 root@213.199.49.147
```

وتفتح `http://localhost:8000`.

**ب. دومين + TLS للوحة** من Coolify: Settings → Instance FQDN مثل `https://panel.alifleet.com`، ثم تطبيق الجدار الناري أعلاه.

تنبيه: Docker يتجاوز `ufw` للبورتات التي ينشرها بنفسه في بعض الإعدادات؛ بعد التفعيل تحقق من الخارج:

```bash
curl -s -o /dev/null -m 5 -w "%{http_code}\n" http://213.199.49.147:8000/
```

المتوقع: timeout أو 000.

### 5.2 🔴 النسخ الاحتياطي

في UpdraftPlus → Settings: قاعدة البيانات يومياً، الملفات أسبوعياً، مخزن بعيد (Google Drive أو S3)، والاحتفاظ بـ 7 نسخ. ثم عطّل WPvivid واحذفه (نسختان بالتوازي تستهلكان القرص بلا فائدة).

### 5.3 ⚠️ منع تحميل `debug.log` وملفات `.bak` ومنع تنفيذ PHP داخل `uploads`

(هذه الخطوة منعها نظام الحماية عندي لأنها تغيّر إعدادات السيرفر، فتنفذها أنت.) أنشئ ملفين على جهازك:

`wp-content.htaccess`:

```
# ALI FLEET hardening: logs, backups and editor leftovers are never served.
<FilesMatch "(\.(log|bak|sql|swp|orig|old|tmp)|~|\.bak-[0-9-]+)$">
	Require all denied
</FilesMatch>
```

`uploads.htaccess`:

```
# ALI FLEET hardening: nothing under uploads may execute as PHP.
<FilesMatch "\.(php|php[0-9]|phtml|phar)$">
	Require all denied
</FilesMatch>
```

ثم:

```bash
scp wp-content.htaccess uploads.htaccess afagent@213.199.49.147:/tmp/
```

```bash
ssh afagent@213.199.49.147 "sudo wp-agent put /tmp/wp-content.htaccess .htaccess && sudo wp-agent put /tmp/uploads.htaccess uploads/.htaccess"
```

تحقق:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://a-f.site/wp-content/debug.log
```

المتوقع 403. ولو ظهرت 500 على الموقع، ارفع ملفاً فارغاً بنفس الأمرين للرجوع.

### 5.4 ⚠️ منع محرر الملفات في لوحة ووردبريس

```bash
ssh afagent@213.199.49.147 "sudo wp-agent wp config set DISALLOW_FILE_EDIT true --raw"
```

### 5.5 ⚠️ سر تفريغ الكاش

في Coolify أضف `WORDPRESS_REVALIDATE_SECRET` بقيمة عشوائية طويلة، و `SITE_ORIGIN=https://alifleet.com`، و `NEXT_PUBLIC_SITE_URL=https://alifleet.com`، ثم Redeploy. وفي ووردبريس نفس القيمة:

```bash
ssh afagent@213.199.49.147 "sudo wp-agent wp option update alifleet_revalidate_secret 'نفس-القيمة' && sudo wp-agent wp option update alifleet_revalidate_url 'https://alifleet.com/api/revalidate'"
```

### 5.6 ⚠️ تنظيف ووردبريس من لوحة الإدارة

- احذف الإضافات غير المفعّلة الخمس والثيمات غير المفعّلة الأربعة.
- فعّل التحديث التلقائي لـ WooCommerce و WPGraphQL و ACF و Yoast.
- حساب `Khaled`: لو المطوّر أنهى عمله، خفّضه إلى Editor أو احذفه.
- التسجيل: لو لا تحتاج تسجيل عملاء من الموقع، ضع `users_can_register=0`. لو تحتاجه، أضف حماية للنموذج (reCAPTCHA أو Cloudflare Turnstile) أو اطلب مني في المرحلة القادمة إغلاق نموذج `wp-login.php` وإبقاء التسجيل عبر GraphQL فقط.

### 5.7 ⚠️ سجلات DNS للبريد والشهادات

عند مزوّد الدومين أضف:

```
_dmarc.alifleet.com  TXT  "v=DMARC1; p=quarantine; rua=mailto:aliahmd88197@gmail.com"
alifleet.com         CAA  0 issue "letsencrypt.org"
```

الأول يمنع انتحال بريدك، والثاني يحصر إصدار الشهادات في Let's Encrypt.

## 6. ملاحظات

- Vercel Analytics كان يطلب `/_vercel/insights/script.js` ويرجع 404 على Coolify في كل صفحة → اتحذف من `app/layout.tsx` مع حزمته ونطاقاته في الـ CSP (بطلبك). لو أردت تحليلات لاحقاً: GA4 أو Plausible.
- `readme.html` و `license.txt` في جذر ووردبريس يكشفان الإصدار فقط؛ يعودان مع كل تحديث فتجاهلهما أو احذفهما بعد كل تحديث.
- `xmlrpc.php` يعيد 405 على GET لكنه يعمل لـ Jetpack؛ لو أزلت Jetpack، عطّله.
