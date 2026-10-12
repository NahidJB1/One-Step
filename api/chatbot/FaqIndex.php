<?php
namespace OneStep\Chat;

/** Inverted BM25 question index. Answers never participate in query matching. */
final class FaqIndex
{
    private $kb;
    private $docs = [];
    private $postings = [];
    private $exact = [];
    private $averageLength = 1;

    public function __construct(KnowledgeBase $kb)
    {
        $this->kb = $kb;
        $total = 0;
        foreach ($kb->faqs as $id => $faq) {
            foreach ($faq['variants'] as $question) {
                $normal = Text::normalize($question);
                $this->exact[$normal][$id] = true;
                $terms = $this->tokens($question);
                if (!$terms) continue;
                $di = count($this->docs);
                $this->docs[$di] = ['faq' => $id, 'terms' => $terms, 'text' => Text::canonical($question)];
                $total += count($terms);
                foreach ($terms as $term) $this->postings[$term][$di] = true;
            }
        }
        $this->averageLength = $total / max(1, count($this->docs));
    }

    private function tokens(string $text): array
    {
        $stripped = $this->kb->stripEntities($text);
        $normal = Text::canonical($stripped);
        // FAQ language keeps domain words, degree levels, numbers, and negation.
        static $stop;
        if ($stop === null) $stop = array_fill_keys(explode(' ', 'a an the i my me you your we our us they their them it its this that these those is are was were be been am do does did have has had how what which who when where why can could would should will may might to of for at in on from by with as and or but so if then than about into through please tell show give explain know want get any some there here also just really very much more university college malaysia student students international details help'), true);
        preg_match_all('/[\p{L}\p{N}]+(?:\.[0-9]+)?%?/u', $normal, $m);
        return array_values(array_unique(array_filter($m[0], static function ($term) use ($stop) { return !isset($stop[$term]); })));
    }

    private function allowed(array $faq, array $universities): bool
    {
        return $faq['scope'] === 'global' || in_array($faq['scope'], $universities, true);
    }

    private function conditionsMatch(array $faq, string $question): bool
    {
        $source = Text::canonical($faq['q']);
        $query = Text::canonical($question);
        foreach (Lexicon::FAQ_QUALIFIERS as $condition) {
            if (Text::contains($source, $condition) && !Text::contains($query, $condition)) return false;
        }
        preg_match_all('/\b\d+(?:\.\d+)?%?/', $source, $sourceNumbers);
        preg_match_all('/\b\d+(?:\.\d+)?%?/', $query, $queryNumbers);
        return !array_diff($sourceNumbers[0], $queryNumbers[0]);
    }

    public function search(string $question, array $universities): array
    {
        $exact = [];
        foreach (array_keys($this->exact[Text::normalize($question)] ?? []) as $id) {
            if ($this->allowed($this->kb->faqs[$id], $universities) && $this->conditionsMatch($this->kb->faqs[$id], $question)) $exact[] = ['id' => $id, 'score' => 1.0, 'coverage' => 1.0, 'exact' => true];
        }
        if ($exact) return $this->deduplicate($exact);
        $terms = $this->tokens($question);
        // Correct only unrecognized, long query tokens with a unique distance-one match.
        foreach ($terms as &$term) {
            if (isset($this->postings[$term]) || strlen($term) < 5 || !ctype_alpha($term)) continue;
            $matches = [];
            foreach ($this->postings as $word => $_) {
                if (strlen($word) >= 5 && Text::oneEdit($term, $word)) $matches[] = $word;
                if (count($matches) > 1) break;
            }
            if (count($matches) === 1) $term = $matches[0];
        }
        unset($term);
        $terms = array_values(array_unique($terms));
        if (!$terms) return [];
        $n = count($this->docs);
        $weights = [];
        $candidates = [];
        foreach ($terms as $term) {
            $df = count($this->postings[$term] ?? []);
            $weights[$term] = log(1 + ($n - $df + 0.5) / ($df + 0.5));
            foreach ($this->postings[$term] ?? [] as $di => $_) $candidates[$di] = true;
        }
        $queryWeight = array_sum($weights);
        $ranked = [];
        preg_match_all('/\b\d+(?:\.\d+)?%?/', Text::canonical($question), $queryNumbers);
        foreach ($candidates as $di => $_) {
            $doc = $this->docs[$di];
            $faq = $this->kb->faqs[$doc['faq']];
            if (!$this->allowed($faq, $universities) || !$this->conditionsMatch($faq, $question)) continue;
            // Different EMGS percentages or IELTS scores cannot substitute for one another.
            preg_match_all('/\b\d+(?:\.\d+)?%?/', $doc['text'], $docNumbers);
            if ($docNumbers[0] && array_diff($docNumbers[0], $queryNumbers[0])) continue;
            $hitWeight = 0;
            $hits = 0;
            foreach ($terms as $term) if (in_array($term, $doc['terms'], true)) { $hitWeight += $weights[$term]; $hits++; }
            $coverage = $hitWeight / max(0.001, $queryWeight);
            $precision = $hits / count($doc['terms']);
            $bm25 = $hitWeight * 2.2 / (1 + 1.2 * (0.25 + 0.75 * count($doc['terms']) / $this->averageLength));
            $score = 0.65 * $coverage + 0.2 * $precision + 0.15 * ($bm25 / ($bm25 + 5));
            if ($faq['scope'] !== 'global') $score += 0.025;
            elseif ($universities) $score -= 0.06;
            $entry = ['id' => $doc['faq'], 'score' => min(0.99, $score), 'coverage' => $coverage, 'precision' => $precision, 'exact' => false, 'hits' => $hits];
            if (!isset($ranked[$doc['faq']]) || $entry['score'] > $ranked[$doc['faq']]['score']) $ranked[$doc['faq']] = $entry;
        }
        usort($ranked, static function ($a, $b) { return $b['score'] <=> $a['score'] ?: strcmp($a['id'], $b['id']); });
        return array_slice($this->deduplicate($ranked), 0, 4);
    }

    private function deduplicate(array $ranked): array
    {
        $seen = [];
        return array_values(array_filter($ranked, function ($entry) use (&$seen) {
            $answer = Text::normalize($this->kb->faqs[$entry['id']]['a']);
            if (isset($seen[$answer])) return false;
            $seen[$answer] = true;
            return true;
        }));
    }
}
