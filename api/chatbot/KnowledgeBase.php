<?php
namespace OneStep\Chat;

final class KnowledgeBase
{
    public $universities = [];
    public $aliases = [];
    public $records = [];
    public $faqs = [];
    public $subjectVocabulary = [];
    public $version;
    public $guidance = [];
    public $rankings = [];
    private $root;
    private $stripCache = [];
    private $typoCache = [];

    public function __construct(string $root)
    {
        $this->root = $root;
        $catalog = $this->read('universities.json');
        $fees = $this->read('data/fees_data.json');
        $faqs = $this->read('myfaqs.json');
        $meta = is_file($root . '/university_meta.json') ? $this->read('university_meta.json') : [];
        $this->guidance = is_file($root . '/data/emgs_knowledge.json') ? $this->read('data/emgs_knowledge.json') : [];
        foreach ($this->guidance['entries'] ?? [] as $i => $entry) $this->guidance['entries'][$i]['file_index'] = $i;
        if ($this->guidance && is_file($root . '/data/counselor_knowledge.json')) {
            $advice = $this->read('data/counselor_knowledge.json');
            foreach ($advice['entries'] as $i => &$entry) { $entry['file'] = 'data/counselor_knowledge.json'; $entry['file_index'] = $i; }
            unset($entry);
            foreach (['sources', 'concepts', 'entries'] as $part) $this->guidance[$part] = array_merge($this->guidance[$part], $advice[$part]);
        }
        $this->rankings = is_file($root . '/data/university_rankings.json') ? $this->read('data/university_rankings.json') : [];
        $this->version = substr(hash('sha256', json_encode(['v3-rankings', $catalog, $fees, $faqs, $meta, $this->guidance, $this->rankings, Lexicon::REPLACEMENTS, Language::PHRASES])), 0, 16);
        foreach (Lexicon::UNIVERSITIES as $id => $aliases) {
            $this->universities[$id] = ['id' => $id, 'name' => strtoupper($id), 'programs' => [], 'supported' => false];
            foreach ($aliases as $alias) $this->aliases[Text::normalize($alias)] = $id;
        }
        foreach ($catalog as $uni) {
            if (!is_array($uni) || !is_string($uni['name'] ?? null) || !is_array($uni['programs'] ?? null)) continue;
            $ids = $this->entities($uni['name']);
            if (!$ids) continue;
            $id = $ids[0];
            $this->universities[$id] = array_merge($uni, ['id' => $id, 'supported' => true]);
            $this->aliases[Text::normalize($uni['name'])] = $id;
        }
        foreach ($fees as $key => $fee) {
            if (!is_array($fee) || !is_string($fee['title'] ?? null) || !is_array($fee['categories'] ?? null)) continue;
            $id = self::id((string)$key);
            if (!isset($this->universities[$id])) continue;
            $this->universities[$id]['name'] = $this->universities[$id]['supported'] ? $this->universities[$id]['name'] : $fee['title'];
            $this->universities[$id]['supported'] = true;
            $this->universities[$id]['fee_key'] = $key;
            $this->aliases[Text::normalize($fee['title'])] = $id;
            foreach ($fee['categories'] as $ci => $category) $this->addCategory($id, (string)$key, $ci, $category);
        }
        foreach ($meta as $value) {
            if (is_array($value) && isset($this->universities[$value['slug'] ?? ''])) {
                $this->universities[$value['slug']]['meta'] = $value;
            }
        }
        foreach ($faqs as $group => $list) {
            if (!is_array($list)) continue;
            foreach ($list as $i => $faq) {
                if (!is_array($faq) || !is_string($faq['q'] ?? null) || !is_string($faq['a'] ?? null) || !trim($faq['a'])) continue;
                $variants = [$faq['q']];
                foreach (($faq['variations'] ?? []) as $v) if (is_string($v) && trim($v)) $variants[] = $v;
                $id = $group . ':' . $i;
                $this->faqs[$id] = ['id' => $id, 'scope' => self::id((string)$group), 'q' => $faq['q'], 'a' => $faq['a'],
                    'variants' => array_values(array_unique($variants)), 'intent' => $faq['intent'] ?? 'general',
                    'source' => ['type' => 'faq', 'file' => 'myfaqs.json', 'pointer' => '/' . $group . '/' . $i,
                        'title' => $faq['q'], 'url' => 'myfaqs.json']];
            }
        }
        foreach ($this->universities as $id => $uni) {
            foreach ($uni['programs'] as $pi => $program) {
                if (!is_array($program) || !is_string($program['name'] ?? null)) continue;
                $this->addRecord($id, $program['name'], $program['level'] ?? '', [], [], '',
                    ['type' => 'program', 'file' => 'universities.json', 'title' => $uni['name'] . ' programs',
                        'url' => $this->page($id, 'details'), 'program_index' => $pi],
                    $program['duration'] ?? '', false);
            }
        }
        if (!$this->records || !$this->faqs) throw new \RuntimeException('Knowledge base has no usable records.');
    }

    private function read(string $file): array
    {
        $raw = @file_get_contents($this->root . '/' . $file);
        if ($raw === false) throw new \RuntimeException('Cannot read knowledge file: ' . $file);
        $decoded = json_decode(preg_replace('/^\xEF\xBB\xBF/', '', $raw), true, 512, JSON_THROW_ON_ERROR);
        if (!is_array($decoded) || !$decoded) throw new \RuntimeException('Invalid knowledge file: ' . $file);
        return $decoded;
    }

    public static function id(string $id): string
    {
        return ['city-university' => 'cityu', 'iumw' => 'umw'][$id] ?? $id;
    }

    /** Longest, whole-phrase matches. Short acronyms are never fuzzy matched. */
    public function entities(string $text): array
    {
        $explicitUm = (bool)preg_match('/(?<![\p{L}\p{N}])UM(?![\p{L}\p{N}])/u', $text);
        $forms = [Text::normalize(str_ireplace('a.p.u', 'apu', $text))];
        $withoutPossessives = preg_replace("/(?<=[\\p{L}\\p{N}])[’']s\\b/iu", '', $text);
        if (is_string($withoutPossessives)) $forms[] = Text::normalize(str_ireplace('a.p.u', 'apu', $withoutPossessives));
        $forms = array_values(array_unique($forms));
        $aliases = $this->aliases;
        uksort($aliases, static function ($a, $b) { return strlen($b) <=> strlen($a); });
        $found = [];
        if ($explicitUm) $found['um'] = true;
        foreach ($aliases as $alias => $id) {
            foreach ($forms as &$form) {
                if (!Text::contains($form, $alias)) continue;
                $found[$id] = true;
                $form = preg_replace('/(?<![\p{L}\p{N}])' . preg_quote($alias, '/') . '(?![\p{L}\p{N}])/u', ' ', $form);
            }
            unset($form);
        }
        // HELP is an ordinary verb; only recognize it alone or with institution syntax.
        foreach ($forms as $form) {
            if (preg_match('/^(help|um)(?:$| (?:fees?|master|bachelor|diploma|program|rank|qs|asia|world))/', trim($form), $m) || preg_match('/\b(?:at|about|compare|versus|vs) (help|um)\b/', $form, $m)) $found[$m[1]] = true;
            if (preg_match('/\b(?:rank|ranking|rankings|qs)\b/', $form) && preg_match('/\bof (help|um)(?:$| (?:in|and|vs|world|asia|20\d{2})\b)/', trim($form), $m)) $found[$m[1]] = true;
            foreach (explode(' ', $form) as $word) {
                if (strlen($word) < 6 || !ctype_alpha($word)) continue;
                $candidates = [];
                foreach ($aliases as $alias => $id) {
                    if (strpos($alias, ' ') !== false || strlen($alias) < 6 || abs(strlen($alias) - strlen($word)) > 1) continue;
                    if (Text::oneEdit($word, $alias)) $candidates[$id] = true;
                }
                if (count($candidates) === 1) $found[key($candidates)] = true;
            }
        }
        return array_keys($found);
    }

    public function stripEntities(string $text): string
    {
        if (isset($this->stripCache[$text])) return $this->stripCache[$text];
        $original = $text;
        $forms = [Text::normalize($text)];
        $withoutPossessives = preg_replace("/(?<=[\\p{L}\\p{N}])[’']s\\b/iu", '', $text);
        if (is_string($withoutPossessives)) $forms[] = Text::normalize($withoutPossessives);
        $forms = array_values(array_unique($forms));
        $aliases = array_keys($this->aliases);
        usort($aliases, static function ($a, $b) { return strlen($b) <=> strlen($a); });
        foreach ($aliases as $alias) foreach ($forms as &$form) {
            $form = preg_replace('/(?<![\p{L}\p{N}])' . preg_quote($alias, '/') . '(?![\p{L}\p{N}])/u', ' ', $form);
        }
        unset($form);
        usort($forms, static function ($a, $b) { return strlen(trim($a)) <=> strlen(trim($b)); });
        $text = $forms[0];
        foreach (explode(' ', $text) as $word) {
            if (strlen($word) < 6 || !ctype_alpha($word)) continue;
            if (!array_key_exists($word, $this->typoCache)) {
                $matches = [];
                foreach ($this->aliases as $alias => $id) if (strpos($alias, ' ') === false && strlen($alias) >= 6 && Text::oneEdit($word, $alias)) $matches[$id] = true;
                $this->typoCache[$word] = count($matches) === 1;
            }
            if ($this->typoCache[$word]) $text = preg_replace('/\b' . preg_quote($word, '/') . '\b/', ' ', $text);
        }
        if (count($this->stripCache) < 12000) $this->stripCache[$original] = $text;
        return $text;
    }

    public function page(string $id, string $kind): string
    {
        $relative = $kind === 'fees' ? 'Fees_Chart/' . $id . '-fees.html' : 'Universities/' . $id . '-details.html';
        return is_file($this->root . '/' . $relative) ? $relative : 'explore-universities.html';
    }

    private function addCategory(string $id, string $key, $ci, $cat): void
    {
        if (!is_array($cat) || !is_array($cat['table']['headers'] ?? null) || !is_array($cat['table']['rows'] ?? null)) return;
        $headers = $cat['table']['headers'];
        $rows = $cat['table']['rows'];
        $name = (string)($cat['category_name'] ?? 'Published fees');
        $remarks = is_string($cat['remarks'] ?? null) ? $cat['remarks'] : '';
        $programColumn = null;
        foreach ($headers as $i => $header) {
            if (preg_match('/program|course name|cluster of fields|^cluster$/i', $header)) { $programColumn = $i; break; }
        }
        $source = ['type' => 'fees', 'file' => 'data/fees_data.json', 'pointer' => '/' . $key . '/categories/' . $ci,
            'title' => $this->universities[$id]['name'] . ': ' . $name, 'url' => $this->page($id, 'fees')];
        if ($programColumn === null) {
            // Vertical charge tables stay intact; a registration charge is never a program price.
            $this->addRecord($id, $name, $name, $headers, $rows, $remarks, $source, '', true);
            return;
        }
        foreach ($rows as $ri => $row) {
            if (!is_array($row) || !is_scalar($row[$programColumn] ?? null)) continue;
            $program = trim((string)$row[$programColumn]);
            if (!$program || preg_match('/^(total|grand total|sub total)$/i', $program)) continue;
            $fields = [];
            $duration = '';
            $level = '';
            foreach ($headers as $i => $header) {
                if (!is_string($header) || $i === $programColumn || preg_match('/^(no\.?|code|reg no)$/i', $header)) continue;
                $value = is_scalar($row[$i] ?? null) ? trim((string)$row[$i]) : '';
                if ($value !== '' && $value !== '-') $fields[$header] = $value;
                if (preg_match('/duration|^year$/i', $header)) $duration = $value;
                if (strtolower($header) === 'level') $level = $value;
            }
            $rowSource = $source;
            $rowSource['pointer'] .= '/table/rows/' . $ri;
            $this->addRecord($id, $program, $level ?: $name, $fields, [], $remarks, $rowSource, $duration, false, $name);
        }
    }

    private function addRecord(string $id, string $name, string $category, array $fields, array $rows, string $remarks, array $source, string $duration, bool $section, string $categoryLabel = ''): void
    {
        $indexName = preg_replace('/\([^)]*(?:\b(?:MQA|MQR|MBA)\/|\/(?:FA|PA)\d|\d{2,}\/\d{2,})[^)]*\)/iu', '', $name);
        $canonical = Text::canonical($indexName);
        $levels = Text::levels($canonical);
        if (!$section && preg_match('/^(?:odl )?(foundation|certificate|diploma|bachelor|master|phd)\b/', $canonical, $m)) $levels = [$m[1]];
        if (!$levels) $levels = Text::levels(Text::canonical($category));
        if (!$levels && $source['type'] === 'program') {
            $knownLevels = [];
            foreach ($this->records as $record) if ($record['university'] === $id && Text::canonical($record['name']) === $canonical) $knownLevels = array_merge($knownLevels, $record['levels']);
            $knownLevels = array_values(array_unique($knownLevels));
            if (count($knownLevels) === 1) $levels = $knownLevels;
        }
        $terms = Text::tokens($indexName);
        if (preg_match('/\bIT\b/', $indexName)) $terms[] = 'informationtechnology';
        if (preg_match('/\bscience\b/i', $name)) $terms[] = 'science';
        $terms = array_values(array_unique($terms));
        // Labels accidentally stored in the duration column are not durations.
        if (!preg_match('/\d\s*(?:[-–]\s*\d+\s*)?(?:years?|months?|semesters?|weeks?)/iu', $duration)) $duration = '';
        foreach ($terms as $term) if (!is_numeric($term) && strlen($term) > 2) $this->subjectVocabulary[$term] = true;
        $this->records[] = ['university' => $id, 'name' => $name, 'category' => $categoryLabel ?: $category,
            'levels' => $levels, 'terms' => $terms, 'fields' => $fields, 'rows' => $rows, 'remarks' => $remarks,
            'source' => $source, 'duration' => $duration, 'section' => $section,
            'audience' => preg_match('/international/i', $categoryLabel ?: $category) ? 'international' :
                (preg_match('/\blocal\b/i', $categoryLabel ?: $category) ? 'local' : null)];
    }
}
