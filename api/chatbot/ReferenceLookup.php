<?php
namespace OneStep\Chat;

/** Narrow, extractive lookups over our references. Never invent missing property or campus facts. */
final class ReferenceLookup
{
    private $kb;
    public function __construct(KnowledgeBase $kb) { $this->kb = $kb; }

    public function housing(string $message, array $state): ?array
    {
        $text = Text::canonical($message);
        $ids = $this->kb->entities($message) ?: ($state['universities'] ?? []);
        if (count($ids) !== 1) return null;
        $id = $ids[0];
        $data = $this->kb->accommodation[$id] ?? null;
        if (!$data) return null;
        $property = null;
        foreach ($data['properties'] as $i => $item) {
            $name = Text::canonical($item['name']);
            $short = Text::canonical(preg_split('/\s*@\s*/', $item['name'])[0]);
            if (Text::contains($text, $name) || (strlen($short) > 8 && Text::contains($text, $short))) $property = $i;
        }
        $housing = $property !== null || preg_match('/\b(?:accommodation|housing|rooms?|rent)\b/', $text) || (($state['intent'] ?? '') === 'accommodation' && preg_match('/\b(?:that|there|it|electricity|utilities|pool|gym|sharing)\b/', $text));
        if (!$housing) return null;
        if ($property === null && isset($state['property']) && !empty($state['universities']) && $state['universities'] === [$id]) $property = $state['property'];
        if (($state['universities'] ?? []) !== [$id]) unset($state['property']);
        $state['universities'] = [$id]; $state['intent'] = 'accommodation';
        if ($property !== null) $state['property'] = $property;
        $items = $property !== null ? [$data['properties'][$property]] : $data['properties'];
        $source = ['type'=>'accommodation','file'=>'data/university_accommodation.json','pointer'=>'/' . $id . ($property !== null ? '/properties/' . $property : ''),'title'=>'Accommodation for ' . $this->kb->universities[$id]['name'],'url'=>$this->kb->page($id, 'details') . '#accommodation'];
        $reply = null; $status = 'answered';
        if (preg_match('/\b(?:share|sharing|occupancy|electricity|utilities|wifi|internet|deposit|bills|inclusive)\b/', $text)) {
            $detail = preg_match('/\b(?:share|sharing|occupancy)\b/', $text) ? 'whether two students may share a room' : (preg_match('/\bdeposit\b/', $text) ? 'the deposit amount' : 'whether rent includes electricity, utilities or internet');
            $reply = 'Our listing does not confirm ' . $detail . ($property !== null ? ' for **' . Text::markdown($items[0]['name']) . '**' : ' for these properties') . '. Please confirm it with the property or [ask a counselor](https://wa.me/601119359497).';
            $status = 'partial';
        } elseif (preg_match('/\b(?:pool|gym|security|amenities)\b/', $text)) {
            $wanted = preg_match('/\bpool\b/', $text) ? 'Swimming Pool' : (preg_match('/\bgym\b/', $text) ? 'Gymnasium' : (preg_match('/\bsecurity\b/', $text) ? 'Security' : null));
            $rows = [];
            foreach ($items as $item) {
                $matches = array_filter($item['amenities'], static function ($amenity) use ($wanted) { return !$wanted || stripos($amenity, $wanted) !== false; });
                if ($matches) $rows[] = '**' . Text::markdown($item['name']) . '**: ' . implode(', ', array_map([Text::class,'markdown'], $matches));
            }
            $reply = $rows ? 'Our listings record the following amenities:' . "\n\n" . implode("\n", $rows) . "\n\nConfirm current access and any extra charges before booking." : 'The requested amenity is not recorded for these listings. That does not establish that it is unavailable; confirm with the property.';
            if (!$rows) $status = 'partial';
        } elseif (preg_match('/\b(?:how far|travel|walk|drive|distance|minutes)\b/', $text)) {
            if ($property === null) return ['reply'=>'Which property do you mean? Please give its name, and confirm your teaching campus.','status'=>'clarification','sources'=>[$source],'context'=>$state];
            $travel = [];
            foreach ($items[0]['travel'] as $value) {
                if (preg_match('/:\s*(\d+)\s*min/i', $value, $m) && (int)$m[1] > 0 && (int)$m[1] <= 240) $travel[] = Text::markdown($value);
            }
            $reply = '**' . Text::markdown($items[0]['name']) . '**' . "\n" . ($travel ? "Recorded travel estimates:\n- " . implode("\n- ", $travel) : 'A reliable travel estimate is not recorded.') . "\nConfirm your teaching campus and route; these estimates are not live traffic or a distance measurement.";
            if (!$travel) $status = 'partial';
        } elseif (preg_match('/\b(?:cheapest|lowest|affordable|under|below|budget)\b/', $text)) {
            if (($data['rentPeriod'] ?? '') !== 'month') {
                $reply = 'The rental periods are unspecified, so I cannot reliably compare these rents as monthly prices. Please confirm each rental period first.'; $status = 'partial';
            } else {
                $rents = [];
                foreach ($items as $item) foreach ($item['rent'] as $rent) if (preg_match('/(?:MYR|RM)\s*([\d,]+(?:\.\d+)?)/i', $rent, $m)) $rents[] = ['price'=>(float)str_replace(',', '', $m[1]),'name'=>$item['name'],'rent'=>$rent];
                usort($rents, static function ($a,$b) { return $a['price'] <=> $b['price']; });
                $cap = preg_match('/\b(?:under|below|budget(?: of)?)\s*(?:RM|MYR)?\s*([\d,]+)/i', $message, $m) ? (float)str_replace(',', '', $m[1]) : null;
                if ($cap !== null) $rents = array_values(array_filter($rents, static function ($r) use ($cap) { return $r['price'] <= $cap; }));
                $reply = $rents ? 'Lowest listed monthly rent in our matching properties: **' . Text::markdown($rents[0]['name']) . '** — ' . Text::markdown($rents[0]['rent']) . '. This is an approximate listed rate, not a confirmed available room or the cheapest rent across the area.' : 'No recorded monthly room rent matches that budget. Availability and unlisted properties are not covered.';
                if (!$rents) $status = 'partial';
                elseif ($rents) foreach ($data['properties'] as $i => $item) if ($item['name'] === $rents[0]['name']) $state['property'] = $i;
            }
        }
        if ($reply === null) return null;
        $reply .= "\n\n[View property references](" . $source['url'] . ')';
        return ['reply'=>$reply,'status'=>$status,'sources'=>[$source],'context'=>$state];
    }

    public function campus(string $message, array $state): ?array
    {
        $text = Text::canonical($message);
        if (!preg_match('/\b(?:campus|campuses|facilities|library|sports|nilai|subang)\b/', $text) || preg_match('/\b(?:fees?|rank|ranking|visa|emgs|admission|apply|application|eligible|maintenance engineering)\b/', $text)) return null;
        $ids = $this->kb->entities($message) ?: ($state['universities'] ?? []);
        if (count($ids) !== 1) return null;
        $id = $ids[0];
        if (preg_match('/\bwhich\b.*\b(?:teaches|offers|campus|campuses)\b/', $text)) {
            $query = (new Query($this->kb))->parse($message);
            $subjects = array_values(array_diff($query['subjects'], ['campus','facilities']));
            $rows = []; $sources = []; $groups = [];
            if ($subjects) foreach ($this->kb->universities[$id]['programs'] ?? [] as $i => $program) {
                if (empty($program['campus'])) continue;
                $name = Text::canonical($program['name']);
                $match = true;
                foreach ($subjects as $subject) if (!Text::contains($name, $subject) && !($subject === 'business' && strpos($name, 'business') !== false)) $match = false;
                if (!$match || ($query['levels'] && !array_intersect($query['levels'], Text::levels(Text::canonical($program['level'] ?? ''))))) continue;
                $row = '**' . Text::markdown($program['campus']) . '** — ' . Text::markdown($program['name']);
                $groups[$program['campus']][] = ['row'=>$row,'source'=>['type'=>'program','file'=>'universities.json','university'=>$id,'program_index'=>$i,'title'=>$program['campus'] . ': ' . $program['name'],'url'=>$this->kb->page($id,'details') . '#courses']];
            }
            while (array_filter($groups) && count($rows) < 6) foreach ($groups as &$group) {
                if (!$group || count($rows) >= 6) continue;
                $entry = array_shift($group); $rows[$entry['row']] = true; $sources[] = $entry['source'];
            }
            unset($group);
            if ($rows) {
                $state['universities'] = [$id]; $state['intent'] = 'programs';
                return ['reply'=>"Our catalog records these course-campus associations:\n\n" . implode("\n", array_keys($rows)) . "\n\nThese are selected stored matches, not confirmation of current intake availability. Confirm the exact institution and award before applying.",'status'=>'partial','sources'=>$sources,'context'=>$state];
            }
        }
        $query = Text::tokens($this->kb->stripEntities($message));
        $generic = ['what','different','between','does','have','which','teaches','campus','campuses','facilities','life'];
        $specific = array_values(array_diff($query, $generic));
        $ranked = [];
        foreach ($this->kb->referenceSections[$id] ?? [] as $section) {
            $normal = Text::canonical($section['text']);
            $hits = 0; foreach ($specific as $term) if (Text::contains($normal, $term)) $hits++;
            $general = preg_match('/\b(?:campus|campuses|library|sports|facilities|laborator|teaching)\b/', $normal);
            if (($specific && !$hits) || (!$specific && !$general)) continue;
            $section['score'] = $hits * 2 + ($general ? 1 : 0); $ranked[] = $section;
        }
        if (!$ranked) return null;
        usort($ranked, static function ($a,$b) { return $b['score'] <=> $a['score']; });
        $chosen = array_slice($ranked,0,2);
        $reply = 'Our references describe **' . Text::markdown($this->kb->universities[$id]['name']) . '** as follows:' . "\n\n" . implode("\n\n", array_map(static function ($r) { return Text::markdown($r['text']); }, $chosen));
        $specificRequest = preg_match('/\b(?:which.*(?:teaches|offers)|does.*have|how many|exact)\b/', $text);
        if ($specificRequest) $reply .= "\n\nThis provides background only; it does not confirm that exact course-campus allocation or facility. Please confirm the specific detail with the university.";
        $state['universities'] = [$id]; $state['intent'] = 'overview';
        return ['reply'=>$reply,'status'=>$specificRequest ? 'partial' : 'answered','sources'=>array_column($chosen,'source'),'context'=>$state];
    }
}
