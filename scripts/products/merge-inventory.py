#!/usr/bin/env python3
"""Merge the owner's inventory workbook (SKU, OE number, models text, photo numbers)
into the product review sheet: fills `model`, adds `oe_number`, `compat_models`,
`photos`, and writes a models-mapping table for the owner to check.

The models column is free text typed by the owner (Hebrew/English, sometimes
Excel auto-filled years). normalize_models() turns it into a short model label
for the product name and a list of compatible models, and flags anything it
could not read.

Usage: merge-inventory.py inventory-rows.json review.csv out-review.csv out-mapping.csv
"""
import csv, json, re, sys, collections

inv_rows, review_path, out_review, out_map = sys.argv[1:5]
INV = {r['sku']: r for r in json.load(open(inv_rows, encoding='utf-8'))}

BRAND_WORDS = {
    'דאף': 'DAF', 'דרף': 'DAF', 'daf': 'DAF', 'וולוו': 'Volvo', 'volvo': 'Volvo', 'מאן': 'MAN', 'man': 'MAN',
    'סקניה': 'Scania', 'סקאניה': 'Scania', 'scania': 'Scania', 'scanua': 'Scania', 'מרצדס': 'Mercedes', 'mercedes': 'Mercedes',
    'איווקו': 'Iveco', 'iveco': 'Iveco', 'רינו': 'Renault', 'renault': 'Renault', 'וולקסוואגן': 'VW',
}
MODEL_TOKENS = {
    'tgl': 'TGL', 'tgm': 'TGM', 'tgs': 'TGS', 'tgx': 'TGX', 'tga': 'TGA', 'xf': 'XF', 'cf': 'CF', 'lf': 'LF', 'xg': 'XG',
    'fh': 'FH', 'fm': 'FM', 'fl': 'FL', 'fe': 'FE', 'fmx': 'FMX', 'r': 'R', 's': 'S', 'g': 'G', 'p': 'P', 'l': 'L',
    'actros': 'Actros', 'אקטרוס': 'Actros', 'atego': 'Atego', 'אטגו': 'Atego', 'mp4': 'MP4', 's-way': 'S-Way', 'sway': 'S-Way',
    'קראפטר': 'Crafter', 'crafter': 'Crafter',
}

def normalize_models(text):
    """Return (model_label, compat_list, note). Label is Hebrew-market style
    (model codes stay Latin; tonnage/Euro in Hebrew and localised later)."""
    raw = text.strip()
    if not raw:
        return '', [], ''
    t = raw.lower().replace('־', '-').replace('–', '-').replace('[', ' ').replace(']', ' ')
    note = []
    # Excel drag-fill artefacts
    if re.search(r'euro\s*[789]', t):
        t = re.sub(r'euro\s*[789]', 'euro 6', t); note.append('Euro 7-9 → Euro 6 (Excel autofill)')
    if re.search(r'tgm\s*2005\s*-\s*202[2-9]', t):
        t = re.sub(r'tgm\s*2005\s*-\s*202[2-9]', 'tgm 2005-2021', t); note.append('TGM end year → 2021 (Excel autofill)')
    if re.search(r'202[7-9]', t):
        t = re.sub(r'202[7-9]', '2026', t); note.append('year > 2026 → 2026 (Excel autofill)')
    t = t.replace('s-way', 'sway').replace('s way', 'sway')
    # Euro class first (so "יורו 6 15 טון" cannot be read as 6-15 ton)
    euro = set(re.findall(r'(?:יורו|euro|יור|וירו)\s*(\d)', t))
    m2 = re.search(r'(?:יורו|euro|יור|וירו)\s*(\d)\s*ו\s*-?\s*(?:וירו|יורו)?\s*(\d)', t)
    if m2: euro.update(m2.groups())
    t_no_euro = re.sub(r'(?:יורו|euro|יור|וירו)\s*\d(\s*ו\s*-?\s*(?:וירו|יורו)?\s*\d)?', ' ', t)
    euro_label = ('יורו ' + '/'.join(sorted(euro))) if euro else ''
    # tonnage: "12 טון - 15 טון", "12-15 טון", "15-12טון", "12 טון"
    ton_label = ''
    m = re.search(r'(\d{1,2})\s*טון\s*-\s*(\d{1,2})\s*טון', t_no_euro) or re.search(r'(\d{1,2})\s*-\s*(\d{1,2})\s*טון', t_no_euro) or re.search(r'(\d{1,2})\s*טון', t_no_euro)
    if m:
        a = int(m.group(1)); b = int(m.group(2)) if m.lastindex and m.lastindex >= 2 and m.group(2) else None
        ton_label = (f"{min(a, b)}-{max(a, b)}" if b else str(a)) + ' טון'
    tokens = re.split(r'[\s\-\.,/]+', t_no_euro)
    models, brands = [], []
    for tok in tokens:
        if tok in MODEL_TOKENS and MODEL_TOKENS[tok] not in models: models.append(MODEL_TOKENS[tok])
        elif tok in BRAND_WORDS and BRAND_WORDS[tok] not in brands: brands.append(BRAND_WORDS[tok])
    if 'Scania' not in brands and 'scan' not in t:
        models = [x for x in models if x not in ('R', 'S', 'G', 'P', 'L')]
    if 'Actros' in models and 'MP4' in models:
        models = [x for x in models if x != 'MP4']; models[models.index('Actros')] = 'Actros MP4'
    if 'sway' in t and 'S-Way' not in models: models.append('S-Way')
    years = re.findall(r'(20\d\d)(?:\s*(?:-|עד)\s*(20\d\d))?', t_no_euro)
    year_label = ''
    if years and not ('tgl' in t and 'tgm' in t):
        y0, y1 = years[0]
        if y1 and int(y1) >= 2026: year_label = f"{y0}+"
        elif y1: year_label = f"{y0}-{y1}"
        else: year_label = f"{y0}+" if raw.rstrip().endswith('-') or re.search(r'20\d\d\s*$', raw) else y0
    parts = []
    if 'tgl' in t and 'tgm' in t: parts.append('TGL 2005-2021 / TGM 2005-2021')
    elif models: parts.append(' / '.join(models))
    if ton_label: parts.append(ton_label)
    if euro_label: parts.append(euro_label)
    if year_label: parts.append(year_label)
    label = ' '.join(parts).strip()
    if not label:
        note.append('brands only: ' + ', '.join(brands) if brands else 'could not read')
    compat = []
    if 'tgl' in t and 'tgm' in t: compat = ['MAN TGL 2005-2021', 'MAN TGM 2005-2021']
    elif models:
        b = brands[0] if len(brands) == 1 else ('Iveco' if 'S-Way' in models else '')
        compat = [f"{b} {x}".strip() + (f" {year_label}" if year_label else '') for x in models]
    elif len(brands) > 1: compat = brands
    return label, compat, '; '.join(note)

rows = list(csv.DictReader(open(review_path, encoding='utf-8-sig')))
mapping = collections.OrderedDict(); filled = 0
for r in rows:
    inv = INV.get(r['sku'])
    r['oe_number'] = inv['oe'] if inv else ''
    r['photos'] = inv['photos'] if inv else ''
    r['inventory_name_he'] = inv['name_he'] if inv else ''
    r['models_raw'] = inv['models'] if inv else ''
    label, compat, note = normalize_models(r['models_raw']) if inv else ('', [], 'not in inventory')
    if label and not r['model']:
        r['model'] = label; filled += 1
    r['compat_models'] = ' | '.join(compat)
    r['model_note'] = note
    if inv and inv['models']:
        mapping.setdefault(inv['models'], {'raw': inv['models'], 'model': label, 'compat': ' | '.join(compat), 'note': note, 'skus': []})['skus'].append(r['sku'])

fields = list(rows[0].keys())
with open(out_review, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(rows)
with open(out_map, 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.DictWriter(f, fieldnames=['raw', 'model', 'compat', 'note', 'count', 'skus']); w.writeheader()
    for m in mapping.values(): w.writerow({**{k: m[k] for k in ('raw', 'model', 'compat', 'note')}, 'count': len(m['skus']), 'skus': ' '.join(m['skus'])})
print(f"review v3: {len(rows)} rows, model filled for {filled}, OE for {sum(1 for r in rows if r['oe_number'])}, photos for {sum(1 for r in rows if r['photos'])} -> {out_review}")
print(f"models mapping: {len(mapping)} distinct texts -> {out_map}")
print("\n--- mapping (raw -> model | compat | note) ---")
for m in mapping.values(): print(f"  {len(m['skus']):2d}x  {m['raw'][:44]:44s} -> {m['model']:34s} | {m['compat'][:30]:30s} | {m['note']}")
