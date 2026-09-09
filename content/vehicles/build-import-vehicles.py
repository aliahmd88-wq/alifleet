"""Build vehicles.json for wordpress/scripts/apply-import-cars.php.

Facts (make, model, model year, fuel, gearbox, engine size, power, gross weight,
payload, seats) come from public manufacturer data as listed on the Israeli
market; every sentence below is our own wording, no text or image is copied.
"""
import json, pathlib

OUT = pathlib.Path(__file__).with_name('vehicles.json')

# Featured images: illustrative renders already in the ALI FLEET media library.
IMG = {'van': 4357, 'minibus': 4364, 'pickup': 4361, 'truck': 4363, 'suv': 4359, 'mpv': 4362}

REGION = {
    'germany': {'he': 'אירופה', 'ar': 'أوروبا', 'en': 'Europe'},
    'usa': {'he': 'ארה"ב', 'ar': 'الولايات المتحدة', 'en': 'the USA'},
    'japan': {'he': 'יפן / אירופה', 'ar': 'اليابان / أوروبا', 'en': 'Japan or Europe'},
}
FUEL = {'diesel': {'he': 'דיזל', 'ar': 'ديزل', 'en': 'diesel'}, 'electric': {'he': 'חשמלי', 'ar': 'كهربائي', 'en': 'electric'}}
GEAR = {'auto': {'he': 'תיבת הילוכים אוטומטית', 'ar': 'ناقل حركة أوتوماتيكي', 'en': 'automatic gearbox'},
        'manual': {'he': 'תיבת הילוכים ידנית', 'ar': 'ناقل حركة يدوي', 'en': 'manual gearbox'}}
ETA = {'he': '4–6 שבועות', 'ar': '4–6 أسابيع', 'en': '4–6 weeks'}

V = []
def add(slug, model, title_he, body, img, origin, year, fuel, gear, engine, hp, *, seats=None, gvw=None, payload=None, drive='', sub, note, extra=None):
    V.append(dict(slug=slug, model=model, title_he=title_he, body=body, img=IMG[img], origin=origin, year=year, fuel=fuel, gear=gear,
                  engine=engine, hp=hp, seats=seats, gvw=gvw, payload=payload, drive=drive, sub=sub, note=note, extra=extra or {}))

# ---------------------------------------------------------------- Mercedes-Benz
add('mercedes-sprinter-519-minibus-20-seats', 'Mercedes-Benz Sprinter 519 · 20 seats', 'מרצדס-בנץ ספרינטר 519 מיניבוס 20 מקומות', 'minivan', 'minibus', 'germany', 2026, 'diesel', 'auto', '2.0L', 190, seats=20, gvw=5380,
    sub={'he': 'מיניבוס 20 מקומות להסעות ותיירות', 'ar': 'ميني باص 20 مقعداً للنقل والسياحة', 'en': '20-seat minibus for transport and tourism'},
    note={'he': 'הגרסה המבוקשת ביותר לחברות הסעות: מרכב ארוך, מיזוג כפול ומקום לציוד.', 'ar': 'الإصدار الأكثر طلباً لشركات النقل: هيكل طويل، تكييف مزدوج ومساحة للأمتعة.', 'en': 'The configuration transport companies ask for most: long body, dual air conditioning and luggage space.'})
add('mercedes-sprinter-517-minibus-14-seats', 'Mercedes-Benz Sprinter 517 · 14 seats', 'מרצדס-בנץ ספרינטר 517 מיניבוס 14 מקומות', 'minivan', 'minibus', 'germany', 2026, 'diesel', 'auto', '2.0L', 170, seats=14, gvw=5000,
    sub={'he': 'מיניבוס 14 מקומות לעסקים ולמוסדות', 'ar': 'ميني باص 14 مقعداً للشركات والمؤسسات', 'en': '14-seat minibus for businesses and institutions'},
    note={'he': 'מתאים להסעות עובדים ולתיירות בקבוצות קטנות, עם רישוי מיניבוס מלא.', 'ar': 'مناسب لنقل العمال والسياحة بالمجموعات الصغيرة، مع ترخيص ميني باص كامل.', 'en': 'Suited to staff transport and small-group tourism, with full minibus licensing.'})
add('mercedes-sprinter-519-panel-van', 'Mercedes-Benz Sprinter 519 panel van', 'מרצדס-בנץ ספרינטר 519 ואן סגור', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '2.0L', 190, seats=3, gvw=5380, payload=2360,
    sub={'he': 'ואן סגור כבד עם 190 כ"ס ועומס מורשה גבוה', 'ar': 'فان مغلق ثقيل بقوة 190 حصاناً وحمولة عالية', 'en': 'Heavy panel van with 190 hp and a high payload'},
    note={'he': 'הספרינטר החזק ביותר בסדרה, לחברות שינוע שצריכות נפח ומשקל.', 'ar': 'أقوى سبرينتر في السلسلة، لشركات النقل التي تحتاج الحجم والوزن معاً.', 'en': 'The strongest Sprinter in the range, for haulage businesses that need both volume and weight.'})
add('mercedes-sprinter-517-panel-van', 'Mercedes-Benz Sprinter 517 panel van', 'מרצדס-בנץ ספרינטר 517 ואן סגור', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '2.0L', 170, seats=3, gvw=5000, payload=2260,
    sub={'he': 'ואן סגור 5 טון עם 170 כ"ס', 'ar': 'فان مغلق 5 طن بقوة 170 حصاناً', 'en': '5-tonne panel van with 170 hp'},
    note={'he': 'איזון טוב בין כוח, צריכת דלק ועלות אחזקה לצי מסחרי.', 'ar': 'توازن جيد بين القوة واستهلاك الوقود وتكلفة الصيانة للأساطيل التجارية.', 'en': 'A good balance of power, fuel use and running cost for a commercial fleet.'})
add('mercedes-sprinter-317-panel-van', 'Mercedes-Benz Sprinter 317 panel van', 'מרצדס-בנץ ספרינטר 317 ואן סגור', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '2.0L', 190, seats=3, gvw=3550, payload=1150,
    sub={'he': 'ואן 3.5 טון לרישיון B עם 190 כ"ס', 'ar': 'فان 3.5 طن لرخصة B بقوة 190 حصاناً', 'en': '3.5-tonne van for a standard licence, 190 hp'},
    note={'he': 'ניתן לנהיגה ברישיון פרטי, עם מרכב ספרינטר מלא ותא מטען גדול.', 'ar': 'يمكن قيادته برخصة خاصة، مع هيكل سبرينتر كامل وصندوق شحن كبير.', 'en': 'Drivable on a standard car licence, with the full Sprinter body and cargo area.'})
add('mercedes-sprinter-315-compact', 'Mercedes-Benz Sprinter 315 compact', 'מרצדס-בנץ ספרינטר 315 קומפקט', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '2.0L', 150, seats=3, gvw=3550, payload=1320,
    sub={'he': 'ספרינטר קצר וזריז לעבודה בעיר', 'ar': 'سبرينتر قصير ورشيق للعمل داخل المدينة', 'en': 'Short, agile Sprinter for city work'},
    note={'he': 'הבסיס הקצר מקל על חניה ותמרון, עם עומס מורשה של יותר מ-1.3 טון.', 'ar': 'قاعدة العجلات القصيرة تسهّل الوقوف والمناورة، مع حمولة تتجاوز 1.3 طن.', 'en': 'The short wheelbase makes parking and manoeuvring easy, with over 1.3 tonnes of payload.'})
add('mercedes-sprinter-519-single-cab-chassis', 'Mercedes-Benz Sprinter 519 single cab chassis', 'מרצדס-בנץ ספרינטר 519 שלדה חד-קבינה', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '2.0L', 190, seats=3, gvw=5500, payload=3250,
    sub={'he': 'שלדה חד-קבינה לבניית ארגז, מנוף או מכולת קירור', 'ar': 'شاسيه كابينة مفردة لتركيب صندوق أو رافعة أو تبريد', 'en': 'Single-cab chassis for a box, crane or refrigerated body'},
    note={'he': 'מגיע כשלדה מוכנה למרכב לפי הצורך; נסגור איתכם את אורך הבסיס לפני ההזמנה.', 'ar': 'يصل كشاسيه جاهز لتركيب الهيكل حسب الحاجة؛ نحدد معك طول القاعدة قبل الطلب.', 'en': 'Delivered as a bare chassis ready for the body you need; we agree the wheelbase with you before ordering.'})
add('mercedes-sprinter-519-double-cab-chassis', 'Mercedes-Benz Sprinter 519 double cab chassis', 'מרצדס-בנץ ספרינטר 519 שלדה דאבל-קבינה', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '2.0L', 190, seats=7, gvw=5500, payload=3150,
    sub={'he': 'דאבל-קבינה ל-7 נוסעים עם שלדה לארגז', 'ar': 'كابينة مزدوجة لـ7 ركاب مع شاسيه للصندوق', 'en': 'Double cab for 7 people with a chassis for a body'},
    note={'he': 'לצוותי עבודה שנוסעים יחד עם הציוד: שתי שורות מושבים ופלטפורמה מאחור.', 'ar': 'لفرق العمل التي تتنقل مع معداتها: صفّان من المقاعد ومنصة خلفية.', 'en': 'For crews that travel with their gear: two rows of seats and a platform behind.'})
add('mercedes-vito-panel-van', 'Mercedes-Benz Vito panel van', 'מרצדס-בנץ ויטו ואן סגור', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '2.0L', 136, seats=3, gvw=3050, payload=950,
    sub={'he': 'ואן בינוני נוח לנהיגה יומיומית', 'ar': 'فان متوسط مريح للقيادة اليومية', 'en': 'Mid-size van that is easy to drive every day'},
    note={'he': 'תא מטען של כ-6.6 קוב במרכב שנכנס לכל חניון, לטכנאים ולשליחויות.', 'ar': 'صندوق شحن نحو 6.6 م³ في هيكل يدخل أي موقف، للفنيين والتوصيل.', 'en': 'About 6.6 m³ of cargo space in a body that fits any car park, for technicians and deliveries.'})

# ------------------------------------------------------------------ MAN / VW
add('man-tge-panel-van', 'MAN TGE panel van', 'מאן TGE ואן סגור', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '2.0L', 163, seats=3, gvw=5000, payload=2335,
    sub={'he': 'ואן 5 טון של מאן עם רשת שירות למשאיות', 'ar': 'فان 5 طن من MAN بشبكة خدمة الشاحنات', 'en': '5-tonne MAN van backed by the truck service network'},
    note={'he': 'אח של הקראפטר עם טיפולים במוסכי משאיות, כ-10.7 קוב מטען.', 'ar': 'شقيق الكرافتر مع صيانة في مراكز خدمة الشاحنات، نحو 10.7 م³ شحن.', 'en': 'The Crafter\'s sibling serviced at truck workshops, with about 10.7 m³ of cargo space.'})
add('man-tge-single-cab-chassis', 'MAN TGE single cab chassis', 'מאן TGE שלדה חד-קבינה', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '2.0L', 177, seats=3, gvw=5000, payload=2705,
    sub={'he': 'שלדה חד-קבינה 177 כ"ס לארגז או רמסע', 'ar': 'شاسيه كابينة مفردة 177 حصاناً لصندوق أو رافعة', 'en': 'Single-cab chassis with 177 hp for a box or tipper'},
    note={'he': 'עומס מורשה של כ-2.7 טון על השלדה, מוכן למרכב ישראלי.', 'ar': 'حمولة نحو 2.7 طن على الشاسيه، جاهز لتركيب هيكل محلي.', 'en': 'About 2.7 tonnes of payload on the chassis, ready for a locally built body.'})
add('man-tge-double-cab-chassis', 'MAN TGE double cab chassis', 'מאן TGE שלדה דאבל-קבינה', 'van', 'van', 'germany', 2025, 'diesel', 'auto', '2.0L', 177, seats=7, gvw=5000, payload=2705,
    sub={'he': 'דאבל-קבינה לצוות עם שלדה לארגז', 'ar': 'كابينة مزدوجة للطاقم مع شاسيه للصندوق', 'en': 'Double cab for a crew with a chassis for a body'},
    note={'he': 'שבעה מקומות ופלטפורמה, לקבלנים ולרשויות מקומיות.', 'ar': 'سبعة مقاعد ومنصة خلفية، للمقاولين والبلديات.', 'en': 'Seven seats and a platform, for contractors and municipalities.'})
add('volkswagen-crafter-panel-van', 'Volkswagen Crafter panel van', 'פולקסווגן קראפטר ואן סגור', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '2.0L', 163, seats=3, gvw=5000, payload=2335,
    sub={'he': 'ואן 5 טון גרמני עם תא נהג נוח', 'ar': 'فان ألماني 5 طن بكابينة مريحة', 'en': 'German 5-tonne van with a comfortable cab'},
    note={'he': 'תא נהג ברמת רכב פרטי ומערכות בטיחות מלאות, למי שמבלה את היום על הכביש.', 'ar': 'كابينة بمستوى سيارة خاصة وأنظمة أمان كاملة، لمن يقضي يومه على الطريق.', 'en': 'A passenger-car cab and full safety systems for drivers who spend the day on the road.'})

# ------------------------------------------------------------ Stellantis / Renault
add('fiat-ducato-panel-van', 'Fiat Ducato panel van', 'פיאט דוקאטו ואן סגור', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '2.2L', 140, seats=3, gvw=3510, payload=1485,
    sub={'he': 'הוואן הנמכר באירופה, אוטומט 2.2', 'ar': 'الفان الأكثر مبيعاً في أوروبا، أوتوماتيك 2.2', 'en': 'Europe\'s best-selling van, 2.2 automatic'},
    note={'he': 'תא מטען רחב במיוחד בין הכנפיים, מתאים גם להסבה לקרוואן או לרכב שירות.', 'ar': 'صندوق شحن عريض بين الرفارف، يناسب أيضاً التحويل إلى كرفان أو مركبة خدمة.', 'en': 'Extra-wide cargo bay between the wheel arches, also popular for camper and service conversions.'})
add('peugeot-boxer-panel-van', 'Peugeot Boxer panel van', "פיג'ו בוקסר ואן סגור", 'van', 'van', 'germany', 2026, 'diesel', 'manual', '2.2L', 140, seats=3, gvw=3510,
    sub={'he': 'ואן גדול עם תיבה ידנית במחיר נוח', 'ar': 'فان كبير بناقل يدوي وبسعر مريح', 'en': 'Large van with a manual gearbox at a friendly price'},
    note={'he': 'אותה פלטפורמה כמו הדוקאטו, לצי שמעדיף תיבה ידנית פשוטה לתחזוקה.', 'ar': 'نفس منصة الدوكاتو، للأساطيل التي تفضّل ناقلاً يدوياً سهل الصيانة.', 'en': 'Same platform as the Ducato, for fleets that prefer a simple manual gearbox.'})
add('fiat-scudo-m-panel-van', 'Fiat Scudo M panel van', 'פיאט סקודו M ואן סגור', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '2.0L', 177, seats=3, gvw=2790, payload=1013,
    sub={'he': 'ואן בינוני 177 כ"ס באורך M', 'ar': 'فان متوسط 177 حصاناً بطول M', 'en': 'Mid-size van with 177 hp, M length'},
    note={'he': 'גובה שמאפשר כניסה לחניונים תת-קרקעיים, עם מנוע חזק לסדרה.', 'ar': 'ارتفاع يسمح بدخول المواقف تحت الأرض، مع محرك قوي لهذه الفئة.', 'en': 'Low enough for underground car parks, with a strong engine for the class.'})
add('fiat-scudo-l-panel-van', 'Fiat Scudo L panel van', 'פיאט סקודו L ואן סגור', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '2.0L', 177, seats=3, gvw=3100, payload=1304,
    sub={'he': 'סקודו ארוך עם עומס מורשה של 1.3 טון', 'ar': 'سكودو طويل بحمولة 1.3 طن', 'en': 'Long Scudo with 1.3 tonnes of payload'},
    note={'he': 'הגרסה הארוכה מוסיפה כ-35 ס"מ לתא המטען, בלי לוותר על תיבה אוטומטית.', 'ar': 'الإصدار الطويل يضيف نحو 35 سم لصندوق الشحن مع ناقل أوتوماتيكي.', 'en': 'The long body adds roughly 35 cm of cargo length while keeping the automatic gearbox.'})
add('fiat-doblo-panel-van', 'Fiat Doblò panel van', 'פיאט דובלו ואן סגור', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '1.5L', 130, seats=2, gvw=2365, payload=802,
    sub={'he': 'ואן קטן וחסכוני לשליחויות בעיר', 'ar': 'فان صغير واقتصادي للتوصيل في المدينة', 'en': 'Small, economical van for city deliveries'},
    note={'he': 'צריכת דלק נמוכה ועלות רישוי של רכב קטן, עם תא מטען של כמעט 6 קוב.', 'ar': 'استهلاك وقود منخفض ورسوم ترخيص سيارة صغيرة، مع صندوق شحن يقارب 6 م³.', 'en': 'Low fuel use and small-car licensing costs, with nearly 6 m³ of cargo space.'})
add('citroen-berlingo-panel-van', 'Citroën Berlingo panel van', 'סיטרואן ברלינגו ואן סגור', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '1.5L', 130, seats=2, gvw=1536,
    sub={'he': 'ואן קומפקטי עם 130 כ"ס ואוטומט', 'ar': 'فان مدمج بقوة 130 حصاناً وناقل أوتوماتيكي', 'en': 'Compact van with 130 hp and an automatic'},
    note={'he': 'אח של הדובלו עם עיצוב סיטרואן, לטכנאים ולחנויות שצריכות רכב אחד לכל משימה.', 'ar': 'شقيق الدوبلو بتصميم سيتروين، للفنيين والمحلات التي تحتاج مركبة واحدة لكل مهمة.', 'en': 'The Doblò\'s sibling in Citroën form, for technicians and shops that need one van for everything.'})
add('citroen-jumpy-panel-van', 'Citroën Jumpy panel van', "סיטרואן ג'אמפי ואן סגור", 'van', 'van', 'germany', 2026, 'diesel', 'auto', '2.0L', 177, seats=3, gvw=3100, payload=1304,
    sub={'he': 'ואן בינוני 177 כ"ס עם 1.3 טון עומס', 'ar': 'فان متوسط 177 حصاناً بحمولة 1.3 طن', 'en': 'Mid-size van with 177 hp and 1.3 tonnes of payload'},
    note={'he': 'זהה מכנית לסקודו L, עם חבילת אבזור של סיטרואן.', 'ar': 'مطابق ميكانيكياً لسكودو L، مع تجهيزات سيتروين.', 'en': 'Mechanically identical to the Scudo L, with Citroën\'s equipment package.'})
add('renault-master-panel-van', 'Renault Master panel van', 'רנו מאסטר ואן סגור', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '2.0L', 170, seats=3, gvw=3500, payload=1288,
    sub={'he': 'הדור החדש של המאסטר, 170 כ"ס אוטומט', 'ar': 'الجيل الجديد من ماستر، 170 حصاناً أوتوماتيك', 'en': 'The new-generation Master, 170 hp automatic'},
    note={'he': 'תא מטען של כ-13 קוב ותא נהג חדש לגמרי, ברישיון B.', 'ar': 'صندوق شحن نحو 13 م³ وكابينة جديدة كلياً، برخصة B.', 'en': 'About 13 m³ of cargo space and an all-new cab, on a standard licence.'})
add('renault-trafic-panel-van', 'Renault Trafic panel van', 'רנו טראפיק ואן סגור', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '2.0L', 150, seats=3, gvw=3070, payload=1146,
    sub={'he': 'ואן בינוני נוח עם 150 כ"ס', 'ar': 'فان متوسط مريح بقوة 150 حصاناً', 'en': 'Comfortable mid-size van with 150 hp'},
    note={'he': 'כ-7.7 קוב מטען ונסיעה שקטה, לעסקים שנוסעים הרבה בין ערים.', 'ar': 'نحو 7.7 م³ شحن وقيادة هادئة، للشركات التي تتنقل كثيراً بين المدن.', 'en': 'About 7.7 m³ of cargo and a quiet ride, for businesses that drive a lot between cities.'})

# ------------------------------------------------------------------ Iveco / Isuzu
add('iveco-daily-52-tonne', 'Iveco Daily 5.2 t', 'איווקו דיילי 5.2 טון', 'van', 'van', 'germany', 2026, 'diesel', 'auto', '3.0L', 180, seats=3, gvw=5200, payload=2651,
    sub={'he': 'הדיילי הכבד: 3.0 ליטר, 180 כ"ס ו-2.6 טון עומס', 'ar': 'ديلي الثقيل: 3.0 لتر، 180 حصاناً و2.6 طن حمولة', 'en': 'The heavy Daily: 3.0 litres, 180 hp and 2.6 tonnes of payload'},
    note={'he': 'שלדת סולמות של משאית קטנה, לעומסים כבדים ולגרירה.', 'ar': 'شاسيه سلّمي كشاحنة صغيرة، للأحمال الثقيلة والقطر.', 'en': 'A ladder chassis like a small truck, built for heavy loads and towing.'})
add('isuzu-truck-75-tonne', 'Isuzu 7.5 t truck', 'משאית איסוזו 7.5 טון', 'truck', 'truck', 'japan', 2026, 'diesel', 'auto', '5.2L', 190, seats=3, gvw=7500,
    sub={'he': 'משאית 7.5 טון לרישיון C1, ידנית או אוטומט', 'ar': 'شاحنة 7.5 طن لرخصة C1، يدوي أو أوتوماتيك', 'en': '7.5-tonne truck for a C1 licence, manual or automatic'},
    note={'he': 'מנוע 5.2 ליטר ידוע באמינותו; אורך הארגז לפי בחירתכם.', 'ar': 'محرك 5.2 لتر معروف بموثوقيته؛ طول الصندوق حسب اختيارك.', 'en': 'A 5.2-litre engine known for reliability; body length to your choice.'})
add('isuzu-d-max-4x4-ls-premium', 'Isuzu D-Max 4x4 LS Premium', 'איסוזו די-מקס 4x4 LS פרימיום', 'pickup', 'pickup', 'japan', 2026, 'diesel', 'auto', '1.9L', 163, seats=5, gvw=3100, payload=1080, drive='4x4',
    sub={'he': 'טנדר 4x4 דאבל-קבינה ברמת גימור גבוהה', 'ar': 'بيك أب 4x4 كابينة مزدوجة بمستوى تجهيز عالٍ', 'en': 'Double-cab 4x4 pickup in a high trim level'},
    note={'he': 'טון עומס ורמת אבזור פרימיום, לעבודה בשטח וגם לנסיעות משפחה.', 'ar': 'طن حمولة وتجهيزات بريميوم، للعمل في الميدان ولرحلات العائلة أيضاً.', 'en': 'A tonne of payload and premium equipment, for site work and family trips alike.'})

# ------------------------------------------------------------------- American pickups
add('chevrolet-silverado-ev-wt', 'Chevrolet Silverado EV Work Truck · Max Range', 'שברולט סילברדו EV Work Truck מקס ריינג\' 2026', 'pickup', 'pickup', 'usa', 2026, 'electric', 'auto', 'Electric', 510, seats=5, drive='4x4',
    sub={'he': 'טנדר עבודה חשמלי עם סוללת Max Range לטווח של כ-790 ק"מ', 'ar': 'بيك أب عمل كهربائي ببطارية Max Range لمدى نحو 790 كم', 'en': 'Electric work truck with the Max Range battery, about 790 km of range'},
    note={'he': 'גרסת ה-Work Truck עם הסוללה הגדולה: הנעה כפולה, 510 כ"ס, טווח מוערך של כ-790 ק"מ לפי היצרן, ושקעי חשמל בארגז להפעלת כלי עבודה באתר.', 'ar': 'إصدار Work Truck بالبطارية الكبيرة: دفع رباعي، 510 حصان، مدى تقديري نحو 790 كم حسب الشركة المصنعة، ومقابس كهرباء في الصندوق لتشغيل معدات العمل في الموقع.', 'en': 'The Work Truck version with the big battery: dual-motor drive, 510 hp, a manufacturer-estimated range of about 790 km, and power outlets in the bed to run tools on site.'},
    extra={'range_km': 790})
add('ram-2500-heavy-duty', 'RAM 2500 Heavy Duty', 'ראם 2500 הבי דיוטי', 'pickup', 'pickup', 'usa', 2026, 'diesel', 'auto', '6.7L Cummins', 370, seats=5, gvw=4535, payload=1134, drive='4x4',
    sub={'he': 'טנדר כבד עם דיזל קאמינס 6.7 ליטר', 'ar': 'بيك أب ثقيل بمحرك ديزل كامينز 6.7 لتر', 'en': 'Heavy-duty pickup with the 6.7-litre Cummins diesel'},
    note={'he': 'מנוע הדיזל המפורסם של ראם לגרירה כבדה, מיובא ישירות מארה"ב.', 'ar': 'محرك الديزل الشهير من رام للقطر الثقيل، مستورد مباشرة من أمريكا.', 'en': 'RAM\'s famous diesel for heavy towing, imported directly from the USA.'})
add('ford-f-250-super-duty', 'Ford F-250 Super Duty', 'פורד F-250 סופר דיוטי', 'pickup', 'pickup', 'usa', 2026, 'diesel', 'auto', '6.7L Power Stroke', 475, seats=5, gvw=4808, payload=1378, drive='4x4',
    sub={'he': 'F-250 עם 475 כ"ס דיזל Power Stroke', 'ar': 'F-250 بقوة 475 حصاناً ديزل Power Stroke', 'en': 'F-250 with the 475 hp Power Stroke diesel'},
    note={'he': 'הטנדר הכבד של פורד, לגרירת נגררים כבדים ולעבודה יומיומית קשה.', 'ar': 'بيك أب فورد الثقيل، لقطر المقطورات الثقيلة والعمل اليومي الشاق.', 'en': 'Ford\'s heavy pickup, for towing big trailers and hard daily work.'})

# --------------------------------------------------------------------- electric vans
add('maxus-edeliver-9-electric-van', 'Maxus eDeliver 9', 'מקסוס eDeliver 9 ואן חשמלי', 'van', 'van', 'germany', 2026, 'electric', 'auto', 'Electric', 204, seats=3, gvw=4250, payload=1470,
    sub={'he': 'ואן חשמלי גדול עם 1.5 טון עומס', 'ar': 'فان كهربائي كبير بحمولة 1.5 طن', 'en': 'Large electric van with 1.5 tonnes of payload'},
    note={'he': 'כ-12 קוב מטען ללא פליטות, למי שנכנס לאזורי אוויר נקי או מספק לערים.', 'ar': 'نحو 12 م³ شحن بلا انبعاثات، لمن يدخل مناطق الهواء النظيف أو يوزّع داخل المدن.', 'en': 'About 12 m³ of zero-emission cargo space, for urban delivery and clean-air zones.'})
add('maxus-edeliver-3-short-electric-van', 'Maxus eDeliver 3 short', 'מקסוס eDeliver 3 קצר ואן חשמלי', 'van', 'van', 'germany', 2026, 'electric', 'auto', 'Electric', 120, seats=2, gvw=2525, payload=855,
    sub={'he': 'ואן חשמלי קומפקטי לשליחויות עירוניות', 'ar': 'فان كهربائي مدمج للتوصيل داخل المدينة', 'en': 'Compact electric van for urban deliveries'},
    note={'he': 'הגרסה הקצרה עם כ-4.8 קוב, קלה לתמרון ולחניה.', 'ar': 'الإصدار القصير بنحو 4.8 م³، سهل المناورة والوقوف.', 'en': 'The short version with about 4.8 m³, easy to manoeuvre and park.'})
add('maxus-edeliver-3-long-electric-van', 'Maxus eDeliver 3 long', 'מקסוס eDeliver 3 ארוך ואן חשמלי', 'van', 'van', 'germany', 2026, 'electric', 'auto', 'Electric', 120, seats=2, gvw=2630, payload=830,
    sub={'he': 'ואן חשמלי קומפקטי בגרסה הארוכה', 'ar': 'فان كهربائي مدمج بالإصدار الطويل', 'en': 'Compact electric van in the long version'},
    note={'he': 'כ-6.3 קוב מטען ואותה מערכת הנעה, לשליחים שצריכים עוד נפח.', 'ar': 'نحو 6.3 م³ شحن ونفس نظام الدفع، للموزعين الذين يحتاجون حجماً أكبر.', 'en': 'About 6.3 m³ of cargo with the same drivetrain, for couriers who need more room.'})
add('farizon-supervan-electric', 'Farizon SuperVan', 'פאריזון סופר-ואן חשמלי', 'van', 'van', 'germany', 2026, 'electric', 'auto', 'Electric', 228, seats=3, gvw=2330, payload=1170,
    sub={'he': 'ואן חשמלי חדש מקבוצת ג\'ילי עם 228 כ"ס', 'ar': 'فان كهربائي جديد من مجموعة جيلي بقوة 228 حصاناً', 'en': 'New electric van from the Geely group with 228 hp'},
    note={'he': 'תא מטען של כ-11 קוב ורצפה נמוכה, בעיצוב חדש לגמרי.', 'ar': 'صندوق شحن نحو 11 م³ وأرضية منخفضة، بتصميم جديد كلياً.', 'en': 'About 11 m³ of cargo with a low floor, in an all-new design.'})

# ------------------------------------------------------------------ text generation
def desc(v):
    fuel = FUEL[v['fuel']]; gear = GEAR[v['gear']]; reg = REGION[v['origin']]
    eng = {'he': f"מנוע {v['engine']} {fuel['he']} עם {v['hp']} כ\"ס" if v['fuel'] != 'electric' else f"הנעה חשמלית עם {v['hp']} כ\"ס",
           'ar': f"محرك {v['engine']} {fuel['ar']} بقوة {v['hp']} حصاناً" if v['fuel'] != 'electric' else f"دفع كهربائي بقوة {v['hp']} حصاناً",
           'en': f"{v['engine']} {fuel['en']} engine with {v['hp']} hp" if v['fuel'] != 'electric' else f"electric drive with {v['hp']} hp"}
    cap = {'he': '', 'ar': '', 'en': ''}
    if v['seats'] and v['body'] == 'minivan':
        cap = {'he': f" {v['seats']} מקומות ישיבה.", 'ar': f" {v['seats']} مقعداً.", 'en': f" {v['seats']} seats."}
    elif v['gvw'] and v['payload']:
        cap = {'he': f" משקל כולל מורשה {v['gvw']:,} ק\"ג ועומס מורשה של כ-{v['payload']:,} ק\"ג.", 'ar': f" الوزن الإجمالي {v['gvw']:,} كغ والحمولة نحو {v['payload']:,} كغ.", 'en': f" Gross weight {v['gvw']:,} kg with roughly {v['payload']:,} kg of payload."}
    elif v['gvw']:
        cap = {'he': f" משקל כולל מורשה {v['gvw']:,} ק\"ג.", 'ar': f" الوزن الإجمالي {v['gvw']:,} كغ.", 'en': f" Gross weight {v['gvw']:,} kg."}
    drive = {'he': ' הנעה כפולה 4x4.' if v['drive'] == '4x4' else '', 'ar': ' دفع رباعي 4x4.' if v['drive'] == '4x4' else '', 'en': ' 4x4 drive.' if v['drive'] == '4x4' else ''}
    return {
        'he': f"{v['model']} שנת {v['year']}, חדש מהיצרן. {eng['he']}, {gear['he']}.{drive['he']}{cap['he']} {v['note']['he']} "
              f"הרכב מגיע בייבוא אישי או ישיר של ALI FLEET מ{reg['he']}, כולל שילוח, מכס, מסים ורישוי בישראל, במחיר סופי שנסגר איתכם לפני ההזמנה. "
              f"זמן אספקה משוער {ETA['he']}. לקבלת הצעת מחיר שלחו לנו הודעה בוואטסאפ עם התצורה שאתם צריכים.",
        'ar': f"{v['model']} موديل {v['year']}، جديد من المصنع. {eng['ar']}، {gear['ar']}.{drive['ar']}{cap['ar']} {v['note']['ar']} "
              f"تصل المركبة عبر الاستيراد الشخصي أو المباشر من علي فليت من {reg['ar']}، شاملة الشحن والجمارك والضرائب والترخيص في إسرائيل، بسعر نهائي نتفق عليه معك قبل الطلب. "
              f"مدة التوريد المتوقعة {ETA['ar']}. للحصول على عرض سعر أرسل لنا رسالة واتساب مع المواصفات التي تحتاجها.",
        'en': f"{v['model']}, {v['year']} model year, brand new. {eng['en'][0].upper() + eng['en'][1:]}, {gear['en']}.{drive['en']}{cap['en']} {v['note']['en']} "
              f"ALI FLEET brings it in by personal or direct import from {reg['en']}, including shipping, customs, taxes and Israeli licensing, at a final price agreed with you before you order. "
              f"Estimated delivery {ETA['en']}. Message us on WhatsApp with the configuration you need to get a quote.",
    }

def highlights(v):
    """Up to eight spec lines, the way a dealer's data sheet reads: power, gearbox, drive,
    range, capacity (seats or payload), gross weight, body variant, then what the price includes."""
    fuel = FUEL[v['fuel']]; gear = GEAR[v['gear']]; h = []
    if v['fuel'] == 'electric':
        h.append({'he': f"הנעה חשמלית, {v['hp']} כ\"ס", 'ar': f"دفع كهربائي، {v['hp']} حصاناً", 'en': f"Electric drive, {v['hp']} hp"})
    else:
        h.append({'he': f"מנוע {v['engine']} {fuel['he']}, {v['hp']} כ\"ס", 'ar': f"محرك {v['engine']} {fuel['ar']}، {v['hp']} حصاناً", 'en': f"{v['engine']} {fuel['en']} engine, {v['hp']} hp"})
    h.append({'he': gear['he'], 'ar': gear['ar'], 'en': gear['en'][0].upper() + gear['en'][1:]})
    if v['drive'] == '4x4': h.append({'he': 'הנעה כפולה 4x4', 'ar': 'دفع رباعي 4x4', 'en': '4x4 drive'})
    if v['extra'].get('range_km'): h.append({'he': f"טווח נסיעה מוערך כ-{v['extra']['range_km']} ק\"מ", 'ar': f"مدى تقديري نحو {v['extra']['range_km']} كم", 'en': f"Estimated range about {v['extra']['range_km']} km"})
    if v['seats']:
        if v['body'] == 'minivan': h.append({'he': f"{v['seats']} מקומות ישיבה כולל נהג", 'ar': f"{v['seats']} مقعداً بما فيها السائق", 'en': f"{v['seats']} seats including the driver"})
        else: h.append({'he': f"{v['seats']} מקומות ישיבה", 'ar': f"{v['seats']} مقاعد", 'en': f"{v['seats']} seats"})
    if v['payload']: h.append({'he': f"עומס מורשה כ-{v['payload']:,} ק\"ג", 'ar': f"حمولة مسموحة نحو {v['payload']:,} كغ", 'en': f"About {v['payload']:,} kg payload"})
    if v['gvw']: h.append({'he': f"משקל כולל מורשה {v['gvw']:,} ק\"ג", 'ar': f"وزن إجمالي مسموح {v['gvw']:,} كغ", 'en': f"{v['gvw']:,} kg gross vehicle weight"})
    h.append({'he': f"שנת ייצור {v['year']}, חדש מהיצרן", 'ar': f"موديل {v['year']}، جديد من المصنع", 'en': f"{v['year']} model year, brand new"})
    h.append({'he': 'שילוח, מכס ורישוי ישראלי כלולים במחיר הסופי', 'ar': 'الشحن والجمارك والترخيص الإسرائيلي ضمن السعر النهائي', 'en': 'Shipping, customs and Israeli licensing in the final price'})
    return h[:8]

def engine_label(v):
    if v['fuel'] == 'electric': return f"Electric · {v['hp']} hp"
    return f"{v['engine']} diesel · {v['hp']} hp"

vehicles = []
for v in V:
    vehicles.append({
        'slug': v['slug'], 'title': v['title_he'], 'car_model': v['model'], 'body_type': v['body'], 'origin': v['origin'], 'status': 'available', 'stage': 1,
        'year': v['year'], 'mileage': 0, 'price': '', 'featured': 0, 'featured_image': v['img'],
        'subtitle': v['sub'], 'description': desc(v), 'highlights': highlights(v),
        'specs': {'engine': engine_label(v), 'transmission': v['gear'], 'fuel': v['fuel'], 'drivetrain': v['drive'] or ('4x2' if v['body'] in ('pickup', 'truck') else ''), 'seats': v['seats'] or ''},
        'eta': ETA,
    })
OUT.write_text(json.dumps({'vehicles': vehicles}, ensure_ascii=False, indent=1), encoding='utf-8')
print(len(vehicles), 'vehicles ->', OUT)
print(json.dumps(vehicles[0], ensure_ascii=False, indent=1)[:1600])
