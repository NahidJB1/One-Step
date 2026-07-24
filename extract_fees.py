import os
import glob
import json
from bs4 import BeautifulSoup
import re

html_files = glob.glob('Fees_Chart/*.html')
fees_data = {}

for filepath in html_files:
    filename = os.path.basename(filepath)
    uni_key = filename.replace('-fees.html', '').replace('.html', '')
    
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    # Extract root CSS variables (Theme Colors)
    style_tag = soup.find('style')
    theme = {
        'theme_color': '#0066CC',
        'theme_dark': '#004C99',
        'theme_accent': '#231F20',
        'theme_light': '#e0f2fe'
    }
    if style_tag:
        style_text = style_tag.text
        for line in style_text.split('\n'):
            line = line.strip()
            if line.startswith('--theme-color:'): theme['theme_color'] = line.split(':')[1].split(';')[0].strip()
            elif line.startswith('--theme-dark:'): theme['theme_dark'] = line.split(':')[1].split(';')[0].strip()
            elif line.startswith('--theme-accent:'): theme['theme_accent'] = line.split(':')[1].split(';')[0].strip()
            elif line.startswith('--theme-light:'): theme['theme_light'] = line.split(':')[1].split(';')[0].strip()

    # Extract Header Text
    header_text_div = soup.find('div', class_='header-text')
    h1 = header_text_div.find('h1').text.strip() if header_text_div and header_text_div.find('h1') else ''
    h2 = header_text_div.find('h2').text.strip() if header_text_div and header_text_div.find('h2') else ''
    p_desc = header_text_div.find('p').text.strip() if header_text_div and header_text_div.find('p') else ''

    # Extract Logo
    logo_img = soup.find('img', class_='static-logo')
    logo_src = logo_img['src'] if logo_img and logo_img.has_attr('src') else ''

    # Extract Categories and Tables
    categories = []
    accordions = soup.find_all('button', class_='accordion')
    for acc in accordions:
        cat_name = acc.text.strip()
        panel = acc.find_next_sibling('div', class_='panel')
        if not panel: continue
        
        table = panel.find('table')
        table_data = {'headers': [], 'rows': []}
        if table:
            trs = table.find_all('tr')
            if trs:
                # First row is headers
                th_elements = trs[0].find_all(['th', 'td'])
                table_data['headers'] = [th.text.strip() for th in th_elements]
                
                # Rest are rows
                for tr in trs[1:]:
                    tds = tr.find_all('td')
                    table_data['rows'].append([td.text.strip() for td in tds])

        # Extract Notes and PDF link
        note_div = panel.find('div', class_='note')
        pdf_link = ''
        remarks = ''
        if note_div:
            # find download_bar
            dl_bar = note_div.find('div', class_='download-bar')
            if dl_bar and dl_bar.has_attr('onclick'):
                match = re.search(r"downloadPDF\(['\"]([^'\"]+)['\"]\)", dl_bar['onclick'])
                if match:
                    pdf_link = match.group(1)
                dl_bar.extract() # remove it from note text
                
            # clean up remaining note text (convert <br> to \n for JSON, or keep HTML)
            # Keeping HTML is safer to preserve formatting
            remarks = note_div.decode_contents().strip()

        categories.append({
            'category_name': cat_name,
            'table': table_data,
            'pdf_link': pdf_link,
            'remarks': remarks
        })

    fees_data[uni_key] = {
        'id': uni_key,
        'title': h1,
        'subtitle': h2,
        'validity': p_desc,
        'logo': logo_src,
        'theme': theme,
        'categories': categories
    }

with open('data/fees_data.json', 'w', encoding='utf-8') as out:
    json.dump(fees_data, out, indent=2, ensure_ascii=False)

print("Extraction complete. data/fees_data.json created.")
