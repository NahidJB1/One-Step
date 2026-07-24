import os
import json
import re
import html

file_names = [
    "alfa-fees.html", "bac-fees.html", "binary-fees.html",
    "city-university-fees.html", "cyberjaya-fees.html",
    "cybernetics-fees.html", "genovasi-fees.html"
]

base_dir = r"C:\Users\User\Desktop\Projects\One-Step\Fees_Chart"
out_path = r"C:\Users\User\Desktop\Projects\One-Step\data\fees_part1.json"

result = {}

for fname in file_names:
    path = os.path.join(base_dir, fname)
    if not os.path.exists(path):
        print("Missing:", path)
        continue
    
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    uni_id = fname.replace('-fees.html', '')
    
    # Title
    m_title = re.search(r'<h1>(.*?)</h1>', content, re.IGNORECASE)
    title = html.unescape(m_title.group(1).strip()) if m_title else uni_id
    
    # Theme
    theme = {}
    m_style = re.search(r'<style>(.*?)</style>', content, re.IGNORECASE | re.DOTALL)
    if m_style:
        style_text = m_style.group(1)
        vars_match = re.findall(r'(--[^:]+):\s*([^;]+);', style_text)
        for k, v in vars_match:
            theme[k.replace('--', '').replace('-', '_')] = v.strip()
            
    # Logo
    logo = ""
    m_img = re.search(r'<img[^>]*class=["\'][^"\']*static-logo[^"\']*["\'][^>]*src=["\']([^"\']+)["\']', content, re.IGNORECASE)
    if not m_img:
        m_img = re.search(r'<img[^>]*src=["\']([^"\']+)["\'][^>]*class=["\'][^"\']*static-logo[^"\']*["\']', content, re.IGNORECASE)
    if m_img:
        logo = m_img.group(1)
        
    categories = []
    
    # Check if there are accordions
    accordions = list(re.finditer(r'<button[^>]*class=["\'][^"\']*accordion[^"\']*["\'][^>]*>(.*?)</button>', content, re.IGNORECASE))
    
    if accordions:
        # has accordions
        for i in range(len(accordions)):
            cat_name = html.unescape(accordions[i].group(1).strip())
            
            # Find the panel that follows this accordion
            start_pos = accordions[i].end()
            end_pos = accordions[i+1].start() if i+1 < len(accordions) else len(content)
            
            panel_chunk = content[start_pos:end_pos]
            
            m_panel = re.search(r'<div[^>]*class=["\'][^"\']*panel[^"\']*["\'](.*?)</div>\s*(?:<button|<div\s+class="view-details)', panel_chunk, re.IGNORECASE | re.DOTALL)
            if not m_panel:
                m_panel = re.search(r'<div[^>]*class=["\'][^"\']*panel[^"\']*["\'](.*)', panel_chunk, re.IGNORECASE | re.DOTALL)
                
            if m_panel:
                panel_html = m_panel.group(1)
                
                table_data = {"headers": [], "rows": []}
                m_table = re.search(r'<table[^>]*>(.*?)</table>', panel_html, re.IGNORECASE | re.DOTALL)
                if m_table:
                    table_html = m_table.group(1)
                    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table_html, re.IGNORECASE | re.DOTALL)
                    for r in rows:
                        th = re.findall(r'<th[^>]*>(.*?)</th>', r, re.IGNORECASE | re.DOTALL)
                        td = re.findall(r'<td[^>]*>(.*?)</td>', r, re.IGNORECASE | re.DOTALL)
                        if th:
                            table_data["headers"] = [html.unescape(re.sub(r'<[^>]+>', '', t).strip()) for t in th]
                        elif td:
                            table_data["rows"].append([html.unescape(re.sub(r'<[^>]+>', '', t).strip()) for t in td])
                
                remarks = ""
                pdf_link = ""
                m_note = re.search(r'<div[^>]*class=["\'][^"\']*note[^"\']*["\'][^>]*>(.*?)</div>\s*</div>', panel_html + "</div>", re.IGNORECASE | re.DOTALL)
                if not m_note:
                    m_note = re.search(r'<div[^>]*class=["\'][^"\']*note[^"\']*["\'][^>]*>(.*)', panel_html, re.IGNORECASE | re.DOTALL)
                    
                if m_note:
                    note_html = m_note.group(1)
                    m_dl = re.search(r'downloadPDF\([\'"]([^\'"]+)[\'"]\)', note_html)
                    if m_dl:
                        pdf_link = m_dl.group(1)
                    
                    # remove download bar
                    note_html = re.sub(r'<div[^>]*class=["\'][^"\']*download-bar[^"\']*["\'][^>]*>.*?</div>', '', note_html, flags=re.IGNORECASE|re.DOTALL)
                    
                    remarks_text = html.unescape(re.sub(r'<br\s*/?>', '\n', note_html, flags=re.IGNORECASE))
                    remarks_text = re.sub(r'<[^>]+>', '', remarks_text)
                    remarks_text = re.sub(r'\n\s*\n', '\n', remarks_text).strip()
                    remarks = remarks_text
                    
                categories.append({
                    "category_name": cat_name,
                    "table": table_data,
                    "remarks": remarks,
                    "pdf_link": pdf_link
                })
    else:
        # no accordions, just panel
        panels = re.findall(r'<div[^>]*class=["\'][^"\']*panel[^"\']*["\'][^>]*>(.*?)</div>\s*<div\s+class="view-details', content, re.IGNORECASE | re.DOTALL)
        if not panels:
             panels = re.findall(r'<div[^>]*class=["\'][^"\']*panel[^"\']*["\'][^>]*>(.*)', content, re.IGNORECASE | re.DOTALL)
             
        for panel_html in panels:
            cat_name = "All Programs"
            
            table_data = {"headers": [], "rows": []}
            m_table = re.search(r'<table[^>]*>(.*?)</table>', panel_html, re.IGNORECASE | re.DOTALL)
            if m_table:
                table_html = m_table.group(1)
                rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table_html, re.IGNORECASE | re.DOTALL)
                for r in rows:
                    th = re.findall(r'<th[^>]*>(.*?)</th>', r, re.IGNORECASE | re.DOTALL)
                    td = re.findall(r'<td[^>]*>(.*?)</td>', r, re.IGNORECASE | re.DOTALL)
                    if th:
                        table_data["headers"] = [html.unescape(re.sub(r'<[^>]+>', '', t).strip()) for t in th]
                    elif td:
                        table_data["rows"].append([html.unescape(re.sub(r'<[^>]+>', '', t).strip()) for t in td])
                        
            remarks = ""
            pdf_link = ""
            m_note = re.search(r'<div[^>]*class=["\'][^"\']*note[^"\']*["\'][^>]*>(.*?)</div>\s*(?:</div>|$)', panel_html, re.IGNORECASE | re.DOTALL)
            if not m_note:
                m_note = re.search(r'<div[^>]*class=["\'][^"\']*note[^"\']*["\'][^>]*>(.*)', panel_html, re.IGNORECASE | re.DOTALL)
                
            if m_note:
                note_html = m_note.group(1)
                m_dl = re.search(r'downloadPDF\([\'"]([^\'"]+)[\'"]\)', note_html)
                if m_dl:
                    pdf_link = m_dl.group(1)
                
                note_html = re.sub(r'<div[^>]*class=["\'][^"\']*download-bar[^"\']*["\'][^>]*>.*?</div>', '', note_html, flags=re.IGNORECASE|re.DOTALL)
                
                remarks_text = html.unescape(re.sub(r'<br\s*/?>', '\n', note_html, flags=re.IGNORECASE))
                remarks_text = re.sub(r'<[^>]+>', '', remarks_text)
                remarks_text = re.sub(r'\n\s*\n', '\n', remarks_text).strip()
                remarks = remarks_text
                
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

os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)
print("Done!")
