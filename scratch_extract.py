import os
import json
import re

dir_path = r"C:\Users\User\Desktop\Projects\One-Step\Fees_Chart"
output_file = r"C:\Users\User\Desktop\Projects\One-Step\data\fees_part2.json"
files = [
    "inti-fees.html",
    "kings-fees.html",
    "klust-fees.html",
    "segi-fees.html",
    "taylors-fees.html",
    "ucmi-fees.html",
    "unirazak-fees.html"
]

result = {}

def clean_text(text):
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

for file in files:
    filepath = os.path.join(dir_path, file)
    if not os.path.exists(filepath):
        print(f"File not found: {file}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    uni_id = file.replace('-fees.html', '')
    
    # Title
    title_match = re.search(r'<h1>(.*?)</h1>', content)
    title = clean_text(title_match.group(1)) if title_match else uni_id.capitalize()
    
    # Theme
    theme = {}
    for var in ['theme-color', 'theme-dark', 'theme-accent', 'theme-light']:
        match = re.search(rf'--{var}:\s*(.*?);', content)
        if match:
            theme[var.replace('-', '_')] = match.group(1).strip()
            
    # Logo
    logo_match = re.search(r'<img[^>]*src="([^"]*)"[^>]*class="static-logo"[^>]*>', content)
    if not logo_match:
        logo_match = re.search(r'<img[^>]*src="([^"]*logo[^"]*)"', content)
    logo = logo_match.group(1) if logo_match else ""
    
    categories = []
    
    # Find all accordion/panel pairs
    panels = re.finditer(r'<button class="accordion">(.*?)</button>\s*<div class="panel">(.*?)</div>(?=\s*(?:<button class="accordion">|<div class="view-details-btn-container"|</div> <!-- global-footer|</body>|<script))', content, re.DOTALL | re.IGNORECASE)
    
    # Wait, the lookahead might be tricky, let's just find panels by splitting by <button class="accordion">
    parts = re.split(r'<button class="accordion">(.*?)</button>', content)
    # parts[0] is before first button. parts[1] is button 1 title, parts[2] is panel 1, parts[3] is button 2 title, etc.
    for i in range(1, len(parts), 2):
        cat_name = clean_text(parts[i])
        panel_content = parts[i+1]
        
        # We need to extract table and note from panel_content
        # To avoid eating up the next footer or similar, let's find the closing div of panel, 
        # But split already gives us till the next button. The last part might have footer.
        # Let's isolate the table
        table_match = re.search(r'<table[^>]*>(.*?)</table>', panel_content, re.DOTALL | re.IGNORECASE)
        table_data = {"headers": [], "rows": []}
        if table_match:
            table_html = table_match.group(1)
            # headers
            th_matches = re.findall(r'<th[^>]*>(.*?)</th>', table_html, re.DOTALL | re.IGNORECASE)
            table_data["headers"] = [clean_text(th) for th in th_matches]
            # rows
            tr_matches = re.findall(r'<tr[^>]*>(.*?)</tr>', table_html, re.DOTALL | re.IGNORECASE)
            for tr in tr_matches:
                td_matches = re.findall(r'<td[^>]*>(.*?)</td>', tr, re.DOTALL | re.IGNORECASE)
                if td_matches:
                    table_data["rows"].append([clean_text(td) for td in td_matches])
                    
        # Note
        note_match = re.search(r'<div class="note">(.*?)</div>\s*(?:</?div>)*\s*$', panel_content, re.DOTALL | re.IGNORECASE)
        # Sometimes the panel closes, so note_match might not capture properly if there are nested divs
        # Let's find <div class="note"> and then try to find the matching closing div, or just use regex up to next div end
        note_content = ""
        pdf_link = ""
        remarks = ""
        note_regex_match = re.search(r'<div class="note">(.*?)</div>(?=\s*<div class="view-details-btn-container"|\s*$|\s*</div>)', panel_content, re.DOTALL | re.IGNORECASE)
        if not note_regex_match:
            # fallback
            note_regex_match = re.search(r'<div class="note">(.*)', panel_content, re.DOTALL | re.IGNORECASE)
            if note_regex_match:
                note_str = note_regex_match.group(1)
                idx = note_str.rfind('</div>')
                if idx != -1:
                    note_content = note_str[:idx]
        else:
            note_content = note_regex_match.group(1)
            
        if note_content:
            pdf_match = re.search(r'downloadPDF\([\'"]([^\'"]+)[\'"]\)', note_content)
            if pdf_match:
                pdf_link = pdf_match.group(1)
            # remove download bar
            rem_text = re.sub(r'<div class="download-bar".*?</div>', '', note_content, flags=re.DOTALL | re.IGNORECASE)
            # preserve br as newline maybe? The user wants remarks string. Let's just clean text.
            rem_text = re.sub(r'<br\s*/?>', '\n', rem_text, flags=re.IGNORECASE)
            remarks = clean_text(rem_text)
            
        categories.append({
            "category_name": cat_name,
            "table": table_data,
            "remarks": remarks,
            "pdf_link": pdf_link
        })
        
    result[uni_id] = {
        "id": uni_id,
        "title": title,
        "theme": theme,
        "logo": logo,
        "categories": categories
    }

os.makedirs(os.path.dirname(output_file), exist_ok=True)
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print("Extraction complete. JSON saved.")
