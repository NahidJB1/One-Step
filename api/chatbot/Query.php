<?php
namespace OneStep\Chat;

final class Query
{
    private $kb;

    public function __construct(KnowledgeBase $kb) { $this->kb = $kb; }

    public function parse(string $message): array
    {
        $text = Text::canonical($message);
        $universities = $this->kb->entities($message);
        $excluded = [];
        if (preg_match('/\b(?:not|except|excluding|exclude|anything but)\s+(.+?)(?:[,;]|\b(?:but|instead|rather)\b|$)/i', $message, $m)) {
            $excluded = $this->kb->entities($m[1]);
            $universities = array_values(array_diff($universities, $excluded));
        }
        $levels = Text::levels($text);
        if (preg_match('/\b(?:not|except|excluding)\s+(bachelor|master|diploma|phd|foundation|certificate)\b/', $text, $m)) $levels = array_values(array_diff($levels, [$m[1]]));
        $topics = Text::topics($text);
        $subjectText = Text::canonical($this->kb->stripEntities($message));
        $subjectText = preg_replace('/\b(?:(?:in|from) )?(?:your|our|the|local) (?:data|catalog|records?)\b/', ' ', $subjectText);
        $subjectText = preg_replace('/\bfull program total\b/', 'total', $subjectText);
        $excludedSubjects = [];
        if (preg_match('/\b(?:not|except|excluding|exclude)\s+(.+?)(?:\b(?:but|instead|rather)\b|$)/', $subjectText, $m)) {
            foreach (Text::tokens($m[1], false) as $term) if (isset($this->kb->subjectVocabulary[$term])) $excludedSubjects[] = $term;
        }
        // An IT subject needs context; the pronoun "it" is not an IT course request.
        if ((preg_match('/\bIT\b/', $message) && !preg_match('/\bit (?:cost|take|last)\b/', $text)) ||
            preg_match('/\bit (?:degree|program|master|bachelor|fee)\b/', $text)) $subjectText .= ' informationtechnology';
        $subjects = [];
        $unknown = [];
        $fillers = array_fill_keys(explode(' ', 'maybe even every single kindly roughly approximately possible various range several options option detail details need wishes anywhere exactly thank thanks goodbye bye human real bot robot accept finished graduated completed national since currently four year years preferably enough money family support discount costs hows best suggest shortlist lowest across matching match matches based published recorded amount amounts breakdown overall prove proven totals total higher lower full research coursework'), true);
        foreach (Text::tokens($subjectText, false) as $term) {
            if (in_array($term, $excludedSubjects, true) || isset($fillers[$term])) continue;
            if (preg_match('/\p{Bengali}/u', $term)) { $unknown[] = $term; continue; }
            if (isset($this->kb->subjectVocabulary[$term])) $subjects[] = $term;
            elseif (strlen($term) >= 4 && ctype_alpha($term) && !in_array($term, ['hello','cheaper','cheapest','scholarship','accommodation','ielts','without','tuition','price','intake','duration','please','fees','mastres','universities','options','around','maximum','minimum','under','below','annually','yearly','monthly','entire','whole','exclude','excluding','recommend','recommendation','recommendations','suitable','find','search','studies','interested','looking','there','related','additional','different','want','wanting','not','instead','actually','campus','petaling','jaya','johor','bahru','penang','selangor','kuala','lumpur','cyberjaya','online','taught','coursework','research'], true)) $unknown[] = $term;
        }
        if (Text::contains($subjectText, 'science') && isset($this->kb->subjectVocabulary['science'])) $subjects[] = 'science';
        $subjects = array_values(array_unique($subjects));
        $groups = [];
        foreach (preg_split('/\b(?:and|or)\b/', $subjectText) as $part) {
            $group = array_values(array_intersect(Text::tokens($part, false), $subjects));
            if (Text::contains($part, 'science') && in_array('science', $subjects, true)) $group[] = 'science';
            $group = array_values(array_unique($group));
            if ($group) $groups[] = $group;
        }
        $budget = null;
        if (preg_match('/\b(?:under|below|less than|up to|maximum|max|budget(?: is| of)?|within)\s*(?:(rm|myr|usd|bdt|taka|\$)\s*)?([0-9][0-9,]*(?:\.[0-9]+)?)\s*(k|thousand|lakh)?\b(?:\s*(rm|myr|usd|bdt|taka))?/i', $message, $m)) {
            $amount = (float)str_replace(',', '', $m[2]);
            $unit = strtolower($m[3] ?? '');
            $amount *= in_array($unit, ['k','thousand'], true) ? 1000 : ($unit === 'lakh' ? 100000 : 1);
            $currency = strtoupper(($m[1] ?? '') ?: ($m[4] ?? ''));
            if ($currency === 'RM') $currency = 'MYR';
            $budget = ['amount' => $amount, 'currency' => $currency ?: null,
                'basis' => preg_match('/per year|a year|yearly|annually/i', $message) ? 'year' :
                    (preg_match('/per semester|a semester/i', $message) ? 'semester' : (preg_match('/total|whole|entire|full (?:course|program)/i', $message) ? 'total' : null))];
        }
        $audience = preg_match('/\b(international|foreign|overseas)\b/', $text) ? 'international' :
            (preg_match('/\b(?:local|domestic|malaysian) (?:students?|fees?|applicants?|tuition|master|bachelor)\b|\b(?:for|i am) (?:a )?malaysians?\b/', $text) ? 'local' : null);
        $campus = null;
        foreach (['johor bahru','petaling jaya','penang','cyberjaya','kuala lumpur'] as $place) {
            if (Text::contains($text, $place) && !($place === 'cyberjaya' && in_array('cyberjaya', $universities, true))) $campus = $place;
        }
        $mode = null;
        foreach (['fulltime', 'parttime', 'online', 'research', 'coursework'] as $value) if (Text::contains($text, $value)) $mode = $value;
        $feeIntent = in_array('fees', $topics, true);
        $faqTopics = array_values(array_intersect($topics, ['scholarship','language','accommodation','visa','payment','refund','admission','career','recognition','transfer','location']));
        $structured = !$faqTopics && ($feeIntent || $levels || $subjects || array_intersect($topics, ['programs','duration','intakes']));
        if (preg_match('/\b(?:living|food|transport|salary|wage|deposit|registration|application fee|admission fee|initial fee)\b/', $text)) $structured = false;
        $intent = $structured ? ($feeIntent || $budget ? 'fees' : (in_array('duration', $topics, true) ? 'duration' : (in_array('intakes', $topics, true) ? 'intakes' : 'programs'))) : 'faq';
        $compare = (bool)preg_match('/\b(compare|vs|versus|cheaper|cheapest|better|best)\b/', $text);
        if ($compare && count($universities) > 1 && ($levels || $subjects) && !$faqTopics) $intent = 'fees';
        if ($compare && !$structured && !$faqTopics) $intent = 'compare';
        $overview = preg_match('/^(?:tell me about|about|information about|overview of|describe)\s/', $text) ||
            ($universities && !Text::tokens($this->kb->stripEntities($message)) && !$levels && !$feeIntent);
        if ($overview && !$structured && !$faqTopics && !$compare) $intent = 'overview';
        $period = preg_match('/\b(?:first year|1st year|year 1|one year|1 year)\b/', $text) ? 'first_year' :
            (preg_match('/\b(?:per year|a year|annual|annually|yearly)\b/', $text) ? 'annual' :
                (preg_match('/\b(?:per semester|a semester)\b/', $text) ? 'semester' : (preg_match('/\b(?:total|whole program|entire program|full program)\b/', $text) ? 'total' : null)));
        foreach ([2=>'second|2nd',3=>'third|3rd',4=>'fourth|4th',5=>'fifth|5th'] as $year => $ordinal) {
            if (preg_match('/\b(?:(?:' . $ordinal . ') year|year ' . $year . ')\b/', $text)) $period = 'year_' . $year;
        }
        return ['universities' => $universities, 'excluded' => $excluded, 'levels' => $levels,
            'subjects' => array_values(array_unique($subjects)), 'excluded_subjects' => $excludedSubjects, 'subject_groups' => $groups, 'unknown' => array_values(array_unique($unknown)),
            'subject_mode' => count($groups) > 1 ? 'any' : 'all',
            'audience' => $audience, 'budget' => $budget, 'campus' => $campus, 'mode' => $mode,
            'intent' => $intent, 'topics' => $topics, 'compare' => $compare, 'text' => $text, 'fee_period'=>$period,
            'recommend'=>(bool)preg_match('/\b(?:best|recommend|suitable|shortlist|suggest)\b/', $text),
            'cheapest'=>(bool)preg_match('/\b(?:cheapest|cheaper|lowest|affordable)\b/', $text)];
    }
}
