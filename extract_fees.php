<?php
// extract_fees.php
$html_files = glob('Fees_Chart/*.html');
$fees_data = [];

if (!is_dir('data')) {
    mkdir('data', 0777, true);
}

foreach ($html_files as $filepath) {
    $filename = basename($filepath);
    $uni_key = str_replace(['-fees.html', '.html'], '', $filename);
    
    $html = file_get_contents($filepath);
    
    // Suppress warnings for malformed HTML
    libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    $dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
    libxml_clear_errors();
    
    $xpath = new DOMXPath($dom);
    
    // Extract root CSS variables
    $theme = [
        'theme_color' => '#0066CC',
        'theme_dark' => '#004C99',
        'theme_accent' => '#231F20',
        'theme_light' => '#e0f2fe'
    ];
    $style_nodes = $xpath->query('//style');
    if ($style_nodes->length > 0) {
        $style_text = $style_nodes->item(0)->nodeValue;
        $lines = explode("\n", $style_text);
        foreach ($lines as $line) {
            $line = trim($line);
            if (strpos($line, '--theme-color:') === 0) $theme['theme_color'] = trim(explode(';', explode(':', $line)[1])[0]);
            if (strpos($line, '--theme-dark:') === 0) $theme['theme_dark'] = trim(explode(';', explode(':', $line)[1])[0]);
            if (strpos($line, '--theme-accent:') === 0) $theme['theme_accent'] = trim(explode(';', explode(':', $line)[1])[0]);
            if (strpos($line, '--theme-light:') === 0) $theme['theme_light'] = trim(explode(';', explode(':', $line)[1])[0]);
        }
    }

    // Extract Header Text
    $h1 = ''; $h2 = ''; $p_desc = '';
    $header_texts = $xpath->query('//div[contains(@class, "header-text")]');
    if ($header_texts->length > 0) {
        $header_div = $header_texts->item(0);
        $h1_node = $xpath->query('.//h1', $header_div);
        if ($h1_node->length > 0) $h1 = trim($h1_node->item(0)->nodeValue);
        $h2_node = $xpath->query('.//h2', $header_div);
        if ($h2_node->length > 0) $h2 = trim($h2_node->item(0)->nodeValue);
        $p_node = $xpath->query('.//p', $header_div);
        if ($p_node->length > 0) $p_desc = trim($p_node->item(0)->nodeValue);
    }

    // Extract Logo
    $logo_src = '';
    $logos = $xpath->query('//img[contains(@class, "static-logo")]');
    if ($logos->length > 0) {
        $logo_src = $logos->item(0)->getAttribute('src');
    }

    // Extract Categories and Tables
    $categories = [];
    $accordions = $xpath->query('//button[contains(@class, "accordion")]');
    
    foreach ($accordions as $acc) {
        $cat_name = trim($acc->nodeValue);
        
        // Find the next div with class "panel"
        $panel = $acc->nextSibling;
        while ($panel && ($panel->nodeType !== XML_ELEMENT_NODE || strpos($panel->getAttribute('class'), 'panel') === false)) {
            $panel = $panel->nextSibling;
        }
        
        if (!$panel) continue;
        
        $table_data = ['headers' => [], 'rows' => []];
        $tables = $xpath->query('.//table', $panel);
        if ($tables->length > 0) {
            $table = $tables->item(0);
            $trs = $xpath->query('.//tr', $table);
            if ($trs->length > 0) {
                // Headers
                $ths = $xpath->query('.//th', $trs->item(0));
                if ($ths->length == 0) $ths = $xpath->query('.//td', $trs->item(0));
                foreach ($ths as $th) {
                    $table_data['headers'][] = trim($th->nodeValue);
                }
                
                // Rows
                for ($i = 1; $i < $trs->length; $i++) {
                    $row = [];
                    $tds = $xpath->query('.//td', $trs->item($i));
                    foreach ($tds as $td) {
                        $row[] = trim($td->nodeValue);
                    }
                    $table_data['rows'][] = $row;
                }
            }
        }
        
        // Extract Note / PDF link
        $pdf_link = '';
        $remarks = '';
        $notes = $xpath->query('.//div[contains(@class, "note")]', $panel);
        if ($notes->length > 0) {
            $note_div = $notes->item(0);
            
            // Extract download bar
            $dl_bars = $xpath->query('.//div[contains(@class, "download-bar")]', $note_div);
            if ($dl_bars->length > 0) {
                $dl_bar = $dl_bars->item(0);
                $onclick = $dl_bar->getAttribute('onclick');
                if (preg_match("/downloadPDF\(['\"]([^'\"]+)['\"]\)/", $onclick, $matches)) {
                    $pdf_link = $matches[1];
                }
                // Remove download bar from DOM to get just remarks
                $dl_bar->parentNode->removeChild($dl_bar);
            }
            
            // Get innerHTML of note
            $remarks = '';
            foreach ($note_div->childNodes as $child) {
                $remarks .= $dom->saveHTML($child);
            }
            $remarks = trim($remarks);
        }
        
        $categories[] = [
            'category_name' => $cat_name,
            'table' => $table_data,
            'pdf_link' => $pdf_link,
            'remarks' => $remarks
        ];
    }
    
    $fees_data[$uni_key] = [
        'id' => $uni_key,
        'title' => $h1,
        'subtitle' => $h2,
        'validity' => $p_desc,
        'logo' => $logo_src,
        'theme' => $theme,
        'categories' => $categories
    ];
}

file_put_contents('data/fees_data.json', json_encode($fees_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Extraction complete. data/fees_data.json created.\n";
?>
