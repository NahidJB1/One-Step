<?php
namespace OneStep\Chat;

/** Dated local facts shared by the chatbot and the static university-page builder. */
final class Rankings
{
    private $data;
    private $kb;

    public function __construct(array $data, ?KnowledgeBase $kb = null)
    {
        $this->data = $data;
        $this->kb = $kb;
    }

    public function records(): array { return $this->data['universities'] ?? []; }
    public function date(): string { return $this->data['verified_at'] ?? ''; }
    public function edition(string $scope): int { return (int)($this->data['editions'][$scope] ?? 0); }

    public static function bounds(string $rank): array
    {
        if (!preg_match('/^=?(\d+)(?:-(\d+)|(\+))?$/', $rank, $m)) return [PHP_INT_MAX, PHP_INT_MAX];
        return [(int)$m[1], !empty($m[3]) ? PHP_INT_MAX : (isset($m[2]) && $m[2] !== '' ? (int)$m[2] : (int)$m[1])];
    }

    public function metric(string $id, string $scope, ?int $year = null): array
    {
        $year = $year ?? $this->edition($scope);
        $record = $this->records()[$id] ?? [];
        if ($scope !== 'malaysia') {
            $metric = $record[$scope] ?? [];
            return ($metric['year'] ?? null) === $year ? $metric : ['year'=>$year, 'status'=>'unverified', 'sources'=>[]];
        }
        $result = ['year'=>$year, 'status'=>'unverified', 'sources'=>[]];
        if ($year !== ($this->data['malaysia_basis']['edition'] ?? null)) return $result;
        $result['sources'] = $this->data['malaysia_basis']['sources'];
        $members = $this->data['malaysia_basis']['institutions'];
        $match = null;
        foreach ($members as $member) if ($member['name'] === ($record['qs_name'] ?? '')) $match = $member;
        if (!$match) { $result['status'] = 'not_listed'; return $result; }
        [$low, $high] = self::bounds($match['rank']);
        $ahead = 0; $overlap = 0;
        foreach ($members as $member) {
            [$a, $b] = self::bounds($member['rank']);
            if ($b < $low) $ahead++;
            elseif ($a <= $high && $b >= $low) $overlap++;
        }
        $result['status'] = 'ranked';
        $result['rank'] = $low !== $high && $overlap > 1 ? ($ahead + 1) . '-' . ($ahead + $overlap) :
            ($overlap > 1 ? '=' : '') . ($ahead + 1);
        $result['band'] = $low !== $high;
        return $result;
    }

    public function label(string $scope, int $year): string
    {
        return ['world'=>'QS World University Rankings', 'asia'=>'QS Asia University Rankings',
            'malaysia'=>'Malaysia position in QS World University Rankings'][$scope] . ' ' . $year;
    }

    public function display(array $metric): string
    {
        if (($metric['status'] ?? '') === 'ranked') return '#' . str_replace('-', '–', $metric['rank']);
        return ['not_listed'=>'Not listed', 'contributor'=>'QS Contributor (no rank)', 'unverified'=>'Not verified'][$metric['status'] ?? 'unverified'];
    }

    public function fact(string $id, string $scope, ?int $year = null, bool $bn = false): string
    {
        $record = $this->records()[$id];
        $m = $this->metric($id, $scope, $year);
        $name = $record['short_name'];
        $label = $this->label($scope, $m['year']);
        if ($m['status'] === 'unverified') return $bn ? "$name-এর $label-এর যাচাইকৃত তথ্য সংরক্ষিত নেই।" :
            "A $label position for $name has not been verified in our sources.";
        if ($m['status'] === 'contributor') return $bn ? "$label-এ $name একটি QS Contributor; এটি সংখ্যাগত র‍্যাঙ্ক নয়।" :
            "$name is a QS Contributor for $label, with no numerical rank awarded.";
        if ($m['status'] === 'not_listed') {
            if ($scope === 'malaysia') return $bn ? "$label-এ $name-এর আলাদা অবস্থান নেই; QS-এর Malaysia তালিকায় প্রতিষ্ঠানটির নিজস্ব এন্ট্রি নেই।" :
                "$name has no separate Malaysia position in the QS World {$m['year']} table because it has no institution entry listed under Malaysia.";
            return $bn ? "$label-এর প্রকাশিত তালিকায় $name-এর নিজস্ব এন্ট্রি নেই।" :
                "$name has no institution entry in the published $label table.";
        }
        $value = $this->display($m);
        if (($m['scope'] ?? '') === 'parent') return $bn ? "University of Wollongong (Australia) $label-এ $value। এটি মূল অস্ট্রেলীয় প্রতিষ্ঠানের র‍্যাঙ্ক; UOW Malaysia-এর আলাদা র‍্যাঙ্ক নয়।" :
            "University of Wollongong (Australia) is $value in $label. This is the parent institution's rank, not a separate rank for UOW Malaysia.";
        if ($scope === 'malaysia') {
            $count = count($this->data['malaysia_basis']['institutions']);
            $sentence = $bn ? "$name-এর $label-এ অবস্থান $value; QS-এর Malaysia-তে তালিকাভুক্ত $count প্রতিষ্ঠান থেকে এটি গণনা করা হয়েছে।" :
                "$name has Malaysia position $value among the $count institutions listed under Malaysia in QS World {$m['year']}, calculated from the published table.";
            if (!empty($m['band'])) $sentence .= $bn ? ' একই বিশ্ব র‍্যাঙ্কের ব্যান্ড থেকে এর চেয়ে নির্দিষ্ট জাতীয় ক্রম নির্ধারণ করা যায় না।' :
                ' The world-rank band does not establish a more precise national order.';
            return $sentence;
        }
        return $bn ? "$name $label-এ $value অবস্থানে আছে।" : "$name is ranked $value in $label.";
    }

    public function sources(array $ids): array
    {
        $out = [];
        foreach (array_unique($ids) as $id) if (isset($this->data['sources'][$id])) {
            $s = $this->data['sources'][$id];
            $out[] = ['type'=>'ranking', 'file'=>'data/university_rankings.json', 'pointer'=>'/sources/' . $id,
                'title'=>$s['title'], 'url'=>$s['url']];
        }
        return $out;
    }

    public function faqs(string $id): array
    {
        $name = $this->records()[$id]['name'];
        $out = [];
        foreach (['world','asia','malaysia'] as $scope) {
            $m = $this->metric($id, $scope);
            $question = ['world'=>"What is the QS World ranking of $name in {$m['year']}?",
                'asia'=>"What is the QS Asia ranking of $name in {$m['year']}?",
                'malaysia'=>"What is the ranking of $name in Malaysia?"][$scope];
            $answer = $this->fact($id, $scope);
            if ($scope === 'malaysia') $answer .= ' This is a position within the QS World table, not a separate government ranking or a QS Asia position.';
            $out[] = ['q'=>$question, 'a'=>$answer, 'sources'=>$m['sources']];
        }
        $out[] = ['q'=>"Do QS Stars, SETARA or partner rankings give $name an overall QS rank?",
            'a'=>'QS Stars and SETARA are ratings, not numerical positions in a QS league table. A subject ranking applies to that subject, and a partner university rank belongs to the named partner. Check the institution, ranking system and edition before comparing.', 'sources'=>['stars']];
        return $out;
    }

    private function topicText(string $message): string
    {
        $text = Text::normalize($this->kb->stripEntities($message));
        // These acronyms are context-sensitive in the shared entity recognizer.
        foreach (array_intersect($this->kb->entities($message), ['help','um']) as $id) {
            $text = preg_replace('/\b' . $id . '\b/', '', $text);
        }
        return trim($text);
    }

    public function matches(string $message, array $state): bool
    {
        if (!$this->kb || !$this->records()) return false;
        $text = $this->topicText($message);
        if (preg_match('/\b(?:rank|ranks|ranking|rankings|ranked|rnk|rnking|raking|rankng|rankin|rangking|qswur)\b/', $text)) return true;
        if (preg_match('/\bqs\b/', $text) && !preg_match('/\b(?:fee|cost|quantity surveying|program|bachelor|diploma)\b/', $text)) return true;
        if (($state['intent'] ?? '') !== 'rankings') return false;
        if (preg_match('/^(?:tell me about|about|information about|overview of|describe)\s/', Text::normalize($message))) return false;
        // Only an entity selection, ranking scope, edition or comparison can inherit this intent.
        $remaining = preg_replace('/\b(?:what|how|about|and|also|do|does|in|the|its|their|that|this|these|those|university|is|are|it|which|one|of|them|has|have|compare|compared|comparison|versus|vs|higher|lower|better|best|than|please|tell|me|world|global|globally|asia|asian|malaysia|malaysian|national|overall|now|latest|current|rank|ranks|ranking|rankings|ranked|20\d{2})\b/', '', $text);
        return trim(preg_replace('/[^\p{L}\p{N}]+/u', '', $remaining)) === '';
    }

    /** Returns a bounded answer plan; the Counselor owns the public response contract. */
    public function answer(string $message, array $old, bool $bn = false): array
    {
        $text = $this->topicText($message);
        $explicitIds = $this->kb->entities($message);
        // A new, unknown institution must never receive the previous institution's rank.
        $reference = preg_replace('/\b(?:what|whats|how|much|about|and|also|do|does|in|the|its|their|that|this|these|those|university|universities|is|are|it|either|which|one|of|them|has|have|compare|compared|comparison|with|versus|vs|higher|lower|better|best|than|please|tell|me|i|want|to|know|can|could|you|give|show|according|position|number|world|global|globally|asia|asian|malaysia|malaysian|national|overall|now|latest|current|qs|qswur|rank|ranks|ranking|rankings|ranked|rnk|rnking|raking|rankng|rankin|rangking|20\d{2})\b/', '', $text);
        $referential = trim(preg_replace('/[^\p{L}\p{N}]+/u', '', $reference)) === '';
        $oldIds = array_values(array_filter($old['universities'] ?? [], static function ($id) { return is_string($id); }));
        $comparisonFollow = !$explicitIds && count($oldIds) >= 2 && preg_match('/\b(?:which|higher|lower|better|compare|compared|comparison)\b/', $text);
        $listRequest = preg_match('/\b(?:malaysia|malaysian)\b/', $text) &&
            (preg_match('/\b(?:top|best|highest|list)\b/', $text) || (preg_match('/\bwhich\b/', $text) && !$comparisonFollow));
        $ids = $explicitIds ?: ($referential && !$listRequest ? ($old['universities'] ?? []) : []);
        $state = $old;
        if ($explicitIds && $explicitIds !== ($old['universities'] ?? [])) {
            foreach (['levels','subjects','subject_groups','excluded','excluded_subjects','budget','fee_period','campus','mode','recommend','candidates'] as $key) unset($state[$key]);
        }
        unset($state['guide'], $state['last_faq'], $state['choices'], $state['pending']);
        $state['universities'] = $ids;
        $state['intent'] = 'rankings';
        $scopes = [];
        if (preg_match('/\b(?:world|global|globally|qswur)\b/', $text)) $scopes[] = 'world';
        if (preg_match('/\b(?:asia|asian)\b/', $text)) $scopes[] = 'asia';
        if (preg_match('/\b(?:in malaysia|malaysian|national|malaysia rank|malaysia ranking|malaysia position)\b|^malaysia$/', $text)) $scopes[] = 'malaysia';
        $explicitScopes = $scopes;
        if (!$scopes && ($old['intent'] ?? '') === 'rankings' && ($old['ranking_scope'] ?? 'all') !== 'all') $scopes[] = $old['ranking_scope'];
        if (!$scopes) $scopes = ['world','asia','malaysia'];
        $state['ranking_scope'] = count($scopes) === 1 ? $scopes[0] : 'all';
        $year = null;
        if (preg_match('/\b(20\d{2})\b/', $text, $m)) $year = (int)$m[1];
        elseif (!$explicitScopes && !preg_match('/\b(?:current|latest|now)\b/', $text)) $year = $old['ranking_year'] ?? null;
        unset($state['ranking_year']);
        if ($year !== null) $state['ranking_year'] = $year;
        $result = ['context'=>$state, 'status'=>'answered', 'sources'=>[], 'suggestions'=>['APU QS ranking','SEGi Asia ranking','Compare APU and SEGi rankings']];

        if (preg_match('/\b(?:hong kong|macau|macao|new zealand|ritsumeikan|lincoln uk|lincoln england|kings college london|king s college london)\b/i', Text::normalize($message))) {
            $result['context']['universities'] = [];
            $result['status'] = 'clarification';
            $result['reply'] = $bn ? 'আমার রেকর্ডে মালয়েশিয়ার প্রতিষ্ঠানগুলো আছে। একই বা কাছাকাছি নামের বিদেশি বিশ্ববিদ্যালয়ের র‍্যাঙ্ক এখানে সংরক্ষিত নেই। প্রতিষ্ঠানের পুরো নাম ও দেশ নিশ্চিত করুন।' :
                'These records cover the Malaysian institutions. I do not have a verified ranking record for that similarly named overseas institution. Please confirm the full institution name and country.';
            return $result;
        }

        if (preg_match('/\b(?:times higher|edurank|webometrics|arwu|shanghai|appliedhe|us news)\b/', $text) ||
            preg_match('/\bTHE\s+(?i:(?:(?:world|asia|impact|university|young)\s+)*rank(?:ing)?s?)\b/', $message)) {
            $result['status'] = 'partial';
            $result['reply'] = $bn ? 'এই র‍্যাঙ্কিং সিস্টেমের যাচাইকৃত ফল সংরক্ষিত নেই। আমার কাছে QS World ও QS Asia-এর তথ্য আছে; কোনটি দেখতে চান?' :
                'I do not have verified results for that ranking system. I have dated QS World and QS Asia results; which would you like?';
            return $result;
        }
        if (preg_match('/\b(?:subject|major|business|businessadministration|businessmanagement|bba|mba|bohm|engineering|computing|computer|computerscience|medicine|hospitality|hotel|law|music|art|psychology|informationtechnology)\b/', Text::canonical($text)) ||
            preg_match('/\bIT\b/', $message) ||
            preg_match('/\b(?:it|ict|cs)\s+(?:qs\s+)?(?:(?:world|asia)\s+)?rank(?:ing)?s?\b/', $text)) {
            $result['status'] = 'partial';
            $result['reply'] = $bn ? 'এই বিষয় বা প্রোগ্রামের যাচাইকৃত QS subject ranking সংরক্ষিত নেই। বিশ্ববিদ্যালয়ের সামগ্রিক র‍্যাঙ্ককে BBA, IT বা অন্য প্রোগ্রামের র‍্যাঙ্ক বলা যায় না। বিশ্ববিদ্যালয়ের সামগ্রিক QS ranking জানতে চাইতে পারেন।' :
                'I do not have a verified QS subject or program ranking for this request. An overall university rank is not a BBA, IT, MBA or other course rank. Ask for the university\'s overall QS ranking to see the available figures.';
            return $result;
        }
        if (preg_match('/\b(?:stars?|setara|rating|ratings)\b/', $text)) {
            $result['reply'] = $bn ? 'QS Stars ও SETARA রেটিং; এগুলো সংখ্যাগত বিশ্ববিদ্যালয় র‍্যাঙ্ক নয়। 5 Stars মানে ৫ম অবস্থান নয়। QS World ও QS Asia-এর সিস্টেম এবং সংস্করণ আলাদা করে তুলনা করতে হবে।' :
                'QS Stars and SETARA are ratings, not numerical university ranks. Five stars does not mean fifth place. Compare QS World and QS Asia results by their named system and edition.';
            if ($ids) $result['reply'] .= $bn ? "\nনির্দিষ্ট প্রতিষ্ঠানের বর্তমান star rating এই র‍্যাঙ্কিং ডেটায় সংরক্ষিত নেই।" : "\nThis ranking dataset does not store a current star-rating award for the selected institution.";
            $result['sources'] = $this->sources(['stars']);
            $result['status'] = $ids ? 'partial' : 'answered';
            return $result;
        }
        if (!$ids) {
            if ($listRequest && !in_array('asia',$explicitScopes,true) && ($year === null || $year === $this->edition('world'))) {
                $rows = $this->data['malaysia_basis']['institutions'];
                $sector = preg_match('/\b(private|public)\b/', $text, $m) ? ucfirst($m[1]) : null;
                if ($sector) $rows = array_values(array_filter($rows, static function ($row) use ($sector) { return strpos($row['sector'] ?? '', $sector) === 0; }));
                usort($rows, static function ($a, $b) { return self::bounds($a['rank'])[0] <=> self::bounds($b['rank'])[0]; });
                $edition = $this->edition('world');
                $sectorLabel = $sector ? strtolower($sector) . ' ' : '';
                $result['reply'] = $bn ? "**QS World $edition অনুযায়ী Malaysia-তে তালিকাভুক্ত প্রথম ১০ {$sectorLabel}প্রতিষ্ঠান:**" : "**Top 10 {$sectorLabel}Malaysia-listed institutions by QS World $edition:**";
                foreach (array_slice($rows,0,10) as $row) {
                    [$low,$high] = self::bounds($row['rank']); $ahead = 0; $overlap = 0;
                    foreach ($rows as $other) {
                        [$a,$b] = self::bounds($other['rank']);
                        if ($b < $low) $ahead++;
                        elseif ($a <= $high && $b >= $low) $overlap++;
                    }
                    $position = $overlap > 1 ? ($low === $high ? '=' . ($ahead+1) : ($ahead+1) . '–' . ($ahead+$overlap)) : (string)($ahead+1);
                    $result['reply'] .= "\n- " . $position . '. ' . $row['name'] . ' — world #' . str_replace('-','–',$row['rank']);
                }
                $result['reply'] .= $bn ? "\n\nএই তালিকা কোর্সের মান বা আপনার জন্য সেরা পছন্দ নির্ধারণ করে না।" : "\n\nThis is the QS World table filtered to Malaysia, not a subject ranking or a personalized recommendation.";
                $result['sources'] = $this->sources($this->data['malaysia_basis']['sources']);
            } else {
                $result['status'] = 'clarification';
                $result['reply'] = $bn ? 'কোন বিশ্ববিদ্যালয়ের র‍্যাঙ্কিং জানতে চান? নাম লিখুন, যেমন APU, SEGi, CityU বা UM। QS World, QS Asia ও Malaysia-তে অবস্থান আলাদা করে জানাতে পারি।' :
                    'Which university ranking would you like? Name an institution such as APU, SEGi, CityU or UM. I can distinguish QS World, QS Asia and the Malaysia position.';
            }
            return $result;
        }
        if (count($ids) > 4) {
            $result['status'] = 'clarification';
            $result['reply'] = 'Please compare up to four universities at a time.';
            return $result;
        }
        $parts = []; $sourceIds = [];
        foreach ($ids as $id) {
            if (!isset($this->records()[$id])) {
                $parts[] = ($this->kb->universities[$id]['name'] ?? strtoupper($id)) . ': ' . ($bn ? 'যাচাইকৃত র‍্যাঙ্কিং সংরক্ষিত নেই।' : 'No verified ranking record is available.');
                $result['status'] = 'partial'; continue;
            }
            $u = $this->records()[$id];
            $lines = ['**' . $u['name'] . '**'];
            foreach ($scopes as $scope) {
                $m = $this->metric($id, $scope, $year);
                $lines[] = '- ' . $this->fact($id, $scope, $year, $bn);
                $sourceIds = array_merge($sourceIds, $m['sources']);
                if ($m['status'] === 'unverified') $result['status'] = 'partial';
            }
            if (!empty($u['note'])) $lines[] = $u['note'];
            if ($u['page']) $lines[] = '[' . ($bn ? 'র‍্যাঙ্কিং ও FAQ' : 'Rankings and FAQs') . '](' . $u['page'] . '#rankings)';
            $parts[] = implode("\n", $lines);
        }
        if (count($ids) === 2 && preg_match('/\b(?:compare|compared|comparison|higher|lower|better|best|versus|vs)\b/', $text)) {
            $scope = count($scopes) === 1 ? $scopes[0] : 'world';
            $a = $this->metric($ids[0], $scope, $year); $b = $this->metric($ids[1], $scope, $year);
            if ($a['status'] === 'ranked' && $b['status'] === 'ranked' && ($a['scope'] ?? '') !== 'parent' && ($b['scope'] ?? '') !== 'parent') {
                // Parent figures and institution figures are not comparable as Malaysian entities.
                $aBounds = self::bounds($a['rank']); $bBounds = self::bounds($b['rank']);
                $winner = $aBounds[1] < $bBounds[0] ? $ids[0] : ($bBounds[1] < $aBounds[0] ? $ids[1] : null);
                $parts[] = $winner ? $this->records()[$winner]['short_name'] . ' has the higher position in ' . $this->label($scope,$a['year']) . ' (a smaller rank number).' :
                    'The published ranks tie or overlap in the same band; they do not establish an exact order between these institutions.';
            }
        }
        $parts[] = $bn ? 'যাচাইয়ের তারিখ: ' . $this->date() . '। = চিহ্ন যৌথ অবস্থান বোঝায়; একটি range একটি band, নির্দিষ্ট একক র‍্যাঙ্ক নয়।' :
            'Verified ' . $this->date() . '. An = sign means a tied rank; a range is a band, not an exact position.';
        $result['reply'] = implode("\n\n", $parts);
        $result['sources'] = $this->sources($sourceIds);
        return $result;
    }
}
