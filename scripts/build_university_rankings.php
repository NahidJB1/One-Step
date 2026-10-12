<?php
// Run locally: php scripts/build_university_rankings.php [--check]
// No network, runtime page fetch, or deployment is performed by this builder.
require_once __DIR__ . '/../api/chatbot/Rankings.php';
use OneStep\Chat\Rankings;

$root = dirname(__DIR__);
$data = json_decode(file_get_contents($root . '/data/university_rankings.json'), true, 512, JSON_THROW_ON_ERROR);
$pageContent = json_decode(file_get_contents($root . '/data/university_seo_content.json'), true, 512, JSON_THROW_ON_ERROR);
$rankings = new Rankings($data);
$check = in_array('--check', $argv, true);
$changed = [];
function esc(string $s): string { return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function jsonText($v): string { return json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR); }
function saveRankingFile(string $file, string $next): void {
    global $check, $changed, $root;
    if (preg_match('/\.(?:html|xml)$/', $file)) $next = rtrim($next) . (strpos($next,"\r\n") !== false ? "\r\n" : "\n");
    if (file_get_contents($file) === $next) return;
    $changed[] = substr($file, strlen($root) + 1);
    if (!$check) file_put_contents($file, $next);
}
function sourceLinks(Rankings $rankings, array $ids): string {
    $links = [];
    foreach ($rankings->sources($ids) as $s) $links[] = '<a href="' . esc($s['url']) . '" rel="noopener" target="_blank">' . esc($s['title']) . '</a>';
    return implode(' · ', $links);
}

foreach ($rankings->records() as $id => $uni) {
    if (!$uni['page']) continue;
    $file = $root . '/' . $uni['page'];
    $html = file_get_contents($file);
    $nl = strpos($html, "\r\n") !== false ? "\r\n" : "\n";
    $canonical = 'https://www.onestepmy.com/' . preg_replace('/\.html$/', '', $uni['page']);
    $title = $uni['short_name'] . ' Malaysia: Courses, Fees & QS Rankings | One-Step';
    $description = $uni['short_name'] . ' ranking: QS World ' . $rankings->edition('world') . ' ' . $rankings->display($uni['world']) .
        ', QS Asia ' . $rankings->edition('asia') . ' ' . $rankings->display($uni['asia']) . '. Explore courses, tuition fee charts, scholarship guidance and campus details.';
    if (($uni['world']['scope'] ?? '') === 'parent') $description = 'UOW Malaysia rankings explained: the Australian parent university is ' . $rankings->display($uni['world']) . ' in QS World ' . $uni['world']['year'] . '. Check campus scope, Malaysia listing status and ranking FAQs.';
    $faqs = $rankings->faqs($id);
    if (isset($pageContent[$id])) {
        $title = $pageContent[$id]['detail_title'];
        $description = $pageContent[$id]['detail_description'];
    }
    $schema = ['@context'=>'https://schema.org', '@graph'=>[
        ['@type'=>'CollegeOrUniversity', '@id'=>$canonical . '#university', 'name'=>$uni['name'], 'url'=>$canonical],
        ['@type'=>'FAQPage', '@id'=>$canonical . '#ranking-faqs', 'about'=>['@id'=>$canonical . '#university'],
            'mainEntity'=>array_map(static function ($f) { return ['@type'=>'Question', 'name'=>$f['q'], 'acceptedAnswer'=>['@type'=>'Answer', 'text'=>$f['a']]]; }, $faqs)]
    ]];
    // Replace only the existing SEO fields; keep fonts, styles, scripts and page-specific code.
    $headEnd = strpos($html, '</head>');
    if ($headEnd === false) throw new RuntimeException('Missing head: ' . $file);
    $head = substr($html, 0, $headEnd);
    $body = substr($html, $headEnd);
    $head = preg_replace('/[ \t]*<!-- rankings:seo:start -->[\s\S]*?<!-- rankings:seo:end -->\s*/', '', $head);
    $head = preg_replace('/[ \t]*<(?:link\b[^>]*rel=["\']canonical["\'][^>]*|meta\b[^>]*(?:name=["\'](?:description|keywords)["\']|property=["\']og:(?:title|description|type|url)["\'])[^>]*)>\s*/i', '', $head);
    $head = preg_replace('/[ \t]*<title\b[^>]*>[\s\S]*?<\/title>\s*/i', '', $head);
    $head = preg_replace_callback('/[ \t]*<script\b[^>]*type=["\']application\/ld\+json["\'][^>]*>([\s\S]*?)<\/script>\s*/i', static function ($m) {
        $value = json_decode($m[1], true);
        return in_array($value['@type'] ?? '', ['CollegeOrUniversity','FAQPage'], true) ? '' : $m[0];
    }, $head);
    $seo = [
        '  <!-- rankings:seo:start -->',
        '  <title>' . esc($title) . '</title>',
        '  <link rel="canonical" href="' . esc($canonical) . '">',
        '  <meta name="description" content="' . esc($description) . '">',
        '  <meta property="og:title" content="' . esc($title) . '">',
        '  <meta property="og:description" content="' . esc($description) . '">',
        '  <meta property="og:type" content="website">',
        '  <meta property="og:url" content="' . esc($canonical) . '">',
        '  <script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_THROW_ON_ERROR) . '</script>',
        '  <!-- rankings:seo:end -->'
    ];
    $head = rtrim($head) . $nl . implode($nl, $seo) . $nl;

    $worldInline = '<!-- ranking:inline:world -->' . esc($rankings->fact($id, 'world')) . '<!-- /ranking:inline:world -->';
    $asiaInline = '<!-- ranking:inline:asia -->' . esc($rankings->fact($id, 'asia')) . '<!-- /ranking:inline:asia -->';
    $badge = '<!-- ranking:inline:badge -->QS World ' . $uni['world']['year'] . ': ' . esc($rankings->display($uni['world'])) . '<!-- /ranking:inline:badge -->';
    // Correct the legacy undated numerical claims at their original locations.
    if ($id === 'apu') $body = str_replace('Ranked in the top 2% globally in the QS World University Rankings (#528) and the first university in Malaysia to achieve the prestigious QS 5-Stars Plus rating, APU maintains', $worldInline . ' APU holds a QS 5-Stars Plus rating and maintains', $body);
    if ($id === 'ucsi') {
        $body = str_replace('QS Top 1% Worldwide (#269)', $badge, $body);
        $body = str_replace('Consistently ranked among the top 1% of universities globally in the QS World University Rankings (#269 globally), UCSI is recognized', $worldInline . ' UCSI is recognized', $body);
        $body = str_replace(['Institute of Music—ranked among the top 50 music schools worldwide—as well as', 'Institute of Music (Top 50 Globally)'], ['Institute of Music, as well as', 'Institute of Music'], $body);
    }
    if ($id === 'lincoln') {
        $body = str_replace('QS #638 World | 5-Star SETARA', $badge, $body);
        $body = str_replace('Globally recognized, LUC is ranked #638 in the QS World University Rankings, #185 in the QS Asia University Rankings, and #87 in THE Impact Rankings, maintaining active academic affiliations', $worldInline . ' ' . $asiaInline . ' LUC maintains active academic affiliations', $body);
    }
    if ($id === 'taylors') {
        $body = str_replace(['#1 Private Uni in SEA','Top 300 Global (QS)'], $badge, $body);
        $body = str_replace("Taylor's University is the No. 1 Private University in Southeast Asia (QS World University Rankings).", $worldInline, $body);
    }
    foreach (['world'=>$worldInline, 'asia'=>$asiaInline, 'badge'=>$badge] as $key=>$replacement) {
        $body = preg_replace_callback('/<!-- ranking:inline:' . $key . ' -->[\s\S]*?<!-- \/ranking:inline:' . $key . ' -->/', static function () use ($replacement) { return $replacement; }, $body);
    }

    $lines = ['  <!-- rankings:content:start -->',
        '  <section class="container university-rankings" id="rankings" aria-labelledby="rankings-title">',
        '    <h2 id="rankings-title">' . esc($uni['short_name']) . ' rankings: QS World, Asia &amp; Malaysia</h2>',
        '    <p class="ranking-reviewed">Verified <time datetime="' . esc($rankings->date()) . '">' . date('j F Y', strtotime($rankings->date())) . '</time>. Each figure below names its ranking edition.</p>',
        '    <dl class="ranking-grid">'];
    $sourceIds = [];
    foreach (['world','asia','malaysia'] as $scope) {
        $metric = $rankings->metric($id,$scope);
        $label = $scope === 'malaysia' ? 'Malaysia · QS World ' . $metric['year'] : ($scope === 'world' ? 'QS World ' : 'QS Asia ') . $metric['year'];
        $value = $rankings->display($metric);
        $extra = ($metric['scope'] ?? '') === 'parent' ? ' <span class="ranking-parent">Australian parent institution</span>' : '';
        $lines[] = '      <div class="ranking-stat"><dt>' . esc($label) . '</dt><dd>' . esc($value) . $extra . '</dd></div>';
        $sourceIds = array_merge($sourceIds,$metric['sources']);
    }
    $lines[] = '    </dl>';
    if (!empty($uni['note'])) $lines[] = '    <p class="ranking-scope">' . esc($uni['note']) . '</p>';
    if ($uni['world']['status'] === 'not_listed' || $uni['asia']['status'] === 'unverified') $lines[] = '    <p>“Not listed” refers to the named QS table. “Not verified” means we could not confirm a position for that edition; it does not establish that the institution is unaccredited.</p>';
    $lines[] = '    <p class="ranking-method">Malaysia positions are calculated among the ' . count($data['malaysia_basis']['institutions']) . ' institutions listed by QS under Malaysia in its World ' . $rankings->edition('world') . ' table. This is not a separate government ranking. An = sign marks a tie. Institutions in the same world-rank band share a national position range because their exact order is not published.</p>';
    $lines[] = '    <p class="ranking-method">QS World and QS Asia use different methods. Overall university positions do not establish the ranking of a particular BBA, IT, MBA or other program.</p>';
    $lines[] = '    <details class="ranking-source-list"><summary>View ranking sources</summary><p>' . sourceLinks($rankings,$sourceIds) . '</p></details>';
    $lines[] = '    <h2 id="ranking-faqs">' . esc($uni['short_name']) . ' ranking FAQs</h2>';
    foreach ($faqs as $faq) {
        $lines[] = '    <details class="ranking-faq"><summary>' . esc($faq['q']) . '</summary><p>' . esc($faq['a']) . '</p>' .
            ($faq['sources'] ? '<p class="ranking-faq-sources">Sources: ' . sourceLinks($rankings,$faq['sources']) . '</p>' : '') . '</details>';
    }
    $lines[] = '  </section>';
    $lines[] = '  <!-- rankings:content:end -->';
    $section = implode($nl,$lines);
    $pattern = strpos($body, '<!-- rankings:content:start -->') !== false ?
        '/[ \t]*<!-- rankings:content:start -->[\s\S]*?<!-- rankings:content:end -->/' :
        '/[ \t]*<div class="container popular-queries-section"[^>]*>[\s\S]*?<\/div>/';
    $body = preg_replace_callback($pattern, static function () use ($section) { return $section; }, $body, -1, $count);
    if ($count !== 1) throw new RuntimeException('Expected one content slot: ' . $file);
    saveRankingFile($file, $head . $body);
}

// Update existing FAQ answers without moving their IDs or rewriting unrelated content.
$faqFile = $root . '/myfaqs.json';
$raw = file_get_contents($faqFile);
$faqs = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
foreach ($faqs as $group=>$list) {
    $id = ['city-university'=>'cityu','iumw'=>'umw'][$group] ?? $group;
    if (!isset($rankings->records()[$id])) continue;
    foreach ($list as $faq) {
        $answer = null;
        if (preg_match('/^How does .+ rank globally or in Malaysia\?$/', $faq['q'])) {
            $answers = []; $sources = [];
            foreach (['world','asia','malaysia'] as $scope) {
                $answers[] = $rankings->fact($id,$scope);
                $sources = array_merge($sources,$rankings->metric($id,$scope)['sources']);
            }
            $answers[] = 'Verified ' . $rankings->date() . '. Malaysia positions are calculated from the QS World table, not a separate national league table.';
            if (!empty($rankings->records()[$id]['note'])) $answers[] = $rankings->records()[$id]['note'];
            foreach ($rankings->sources($sources) as $s) $answers[] = '[' . $s['title'] . '](' . $s['url'] . ')';
            $answer = implode("\n\n",$answers);
        }
        if ($id === 'taylors' && $faq['q'] === "What makes Taylor's University stand out?") $answer = $rankings->fact($id,'world') . " Its courses include Hospitality, Business and Culinary Arts. See [dated ranking sources and FAQs](Universities/taylors-details.html#rankings).";
        if ($answer !== null && $answer !== $faq['a']) {
            $needle = jsonText($faq['a']);
            if (strpos($raw,$needle) === false) throw new RuntimeException('FAQ encoding differs; refusing a broad rewrite: ' . $group);
            $raw = str_replace($needle,jsonText($answer),$raw);
        }
    }
}
saveRankingFile($faqFile,$raw);
// Only the detail pages changed by this builder receive a new sitemap modification date.
$sitemapFile = $root . '/sitemap.xml';
$sitemap = file_get_contents($sitemapFile);
foreach ($rankings->records() as $uni) {
    if (!$uni['page']) continue;
    $url = 'https://www.onestepmy.com/' . preg_replace('/\.html$/', '', $uni['page']);
    $sitemap = preg_replace_callback('/(<loc>' . preg_quote($url,'/') . '<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/', static function ($m) use ($rankings) { return $m[1] . $rankings->date() . $m[2]; }, $sitemap);
}
saveRankingFile($sitemapFile,$sitemap);
echo ($check ? 'Outdated' : 'Updated') . ' ranking files: ' . count($changed) . "\n";
foreach ($changed as $f) echo $f . "\n";
exit($check && $changed ? 1 : 0);
