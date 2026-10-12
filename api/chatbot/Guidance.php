<?php
namespace OneStep\Chat;

/** Reviewed topic cards with explicit applicability conditions, backed by the local EMGS snapshot. */
final class Guidance
{
    private $kb;
    private $concepts = [];
    private $countries = [];
    public function __construct(KnowledgeBase $kb)
    {
        $this->kb = $kb;
        foreach ($kb->guidance['concepts'] ?? [] as $key => $phrases) {
            $this->concepts[$key] = array_values(array_unique(array_map([Text::class, 'canonical'], $phrases)));
        }
        $names = $kb->guidance['tables']['graduate_countries'] ?? [];
        foreach ($kb->guidance['tables']['personal_bond'] ?? [] as $list) $names = array_merge($names, $list);
        $names = array_merge($names, $kb->guidance['tables']['sev_countries'] ?? [], ['Bangladesh','Pakistan','Sudan','Iran','Libya','Iraq','Somalia','Syria','Yemen']);
        foreach (array_unique($names) as $name) $this->countries[Text::normalize($name)] = $name;
        $this->countries += ['bangladeshi'=>'Bangladesh','indian'=>'India','chinese'=>'China','pakistani'=>'Pakistan','nigerian'=>'Nigeria',
            'iranian'=>'Iran','sudanese'=>'Sudan','british'=>'United Kingdom','uk'=>'United Kingdom','us'=>'USA','american'=>'USA',
            'uae'=>'United Arab Emirates','bangladesher'=>'Bangladesh'];
        uksort($this->countries, static function ($a, $b) { return strlen($b) <=> strlen($a); });
    }

    public function nationality(string $message): ?string
    {
        return $this->nationalities($message)[0] ?? null;
    }

    private function nationalities(string $message): array
    {
        $normal = Text::normalize($message);
        $found = [];
        foreach ($this->countries as $alias => $name) {
            // Ordinary pronouns do not establish nationality.
            if ($alias === 'us' && !preg_match('/\bUS\b/', $message)) continue;
            if (preg_match('/\b(?:not|except|excluding) (?:a |an )?' . preg_quote($alias, '/') . '\b/u', $normal)) continue;
            if (Text::contains($normal, $alias)) {
                $found[$name] = true;
                $normal = preg_replace('/(?<![\p{L}\p{N}])' . preg_quote($alias, '/') . '(?![\p{L}\p{N}])/u', ' ', $normal);
            }
        }
        return array_slice(array_keys($found), 0, 4);
    }

    public function validNationality($value): bool { return is_string($value) && in_array($value, $this->countries, true); }

    public function concepts(string $message): array
    {
        $normal = Text::canonical($message);
        $found = [];
        foreach ($this->concepts as $key => $phrases) foreach ($phrases as $phrase) {
            if (Text::contains($normal, $phrase)) { $found[] = $key; break; }
        }
        return $found;
    }

    public function search(string $message, array $state): array
    {
        if (!$this->kb->guidance) return [];
        $text = Text::canonical($message);
        $concepts = $this->concepts($message);
        $nationality = $this->nationality($message) ?? ($state['nationality'] ?? null);
        $nationalities = $this->nationalities($message);
        if (!empty($state['guide'])) {
            $previous = null;
            foreach ($this->kb->guidance['entries'] as $entry) if ($entry['id'] === $state['guide']) { $previous = $entry; break; }
            $elliptical = preg_match('/^(?:what (?:about|documents?)|how about|and |which documents?)|\b(?:that pass|this pass|it require|its requirements)\b/', $text);
            if ($previous && $elliptical) {
                if ($previous['family'] === 'graduate' && !array_intersect(['visa','refund','english','renewal'], $concepts) &&
                    array_intersect(['document','sponsor','passport','dependent','country','cancel','fees','work'], $concepts)) $concepts[] = 'graduate';
                if ($previous['family'] === 'dependents' && array_intersect(['document','passport','insurance'], $concepts)) $concepts[] = 'dependent';
                if (strpos($previous['family'], 'refund') === 0 && array_intersect(['medical','insurance','ikad','courier','bank','deadline'], $concepts)) $concepts[] = 'refund';
            }
        }
        $countryOnly = $this->nationality($message) && count(Text::tokens($message)) <= 2 && !array_diff($concepts, ['country']);
        if (!empty($state['guide']) && ($countryOnly ||
            ($this->kb->entities($message) && !preg_match('/^(?:tell me about|about|describe|overview)/', $text) && count(Text::tokens($this->kb->stripEntities($message))) === 0))) {
            foreach ($this->kb->guidance['entries'] as $entry) if ($entry['id'] === $state['guide']) {
                $concepts = array_unique(array_merge($concepts, $entry['all']));
                break;
            }
        }
        $matches = [];
        foreach ($this->kb->guidance['entries'] as $entry) {
            if (array_diff($entry['all'], $concepts) || array_intersect($entry['none'] ?? [], $concepts)) continue;
            if (!empty($entry['any']) && !array_intersect($entry['any'], $concepts)) continue;
            if (!empty($entry['phrases']) && !array_filter($entry['phrases'], static function ($p) use ($text) { return Text::contains($text, Text::canonical($p)); })) continue;
            $entry['score'] = count($entry['all']) + (empty($entry['phrases']) ? 0 : 1) + ($entry['priority'] ?? 0);
            $matches[] = $entry;
        }
        usort($matches, static function ($a, $b) { return $b['score'] <=> $a['score']; });
        $families = [];
        foreach ($matches as $entry) if (!isset($families[$entry['family']])) $families[$entry['family']] = $entry;
        // Component-specific refund answers supersede the generic overview.
        if (array_filter(array_keys($families), static function ($family) { return strpos($family, 'refund-') === 0; }) &&
            isset($families['refund']) && $families['refund']['id'] === 'refund-overview') unset($families['refund']);
        $cards = [];
        foreach (array_slice($families, 0, 4) as $entry) {
            $answer = ($state['language'] ?? '') === 'bn' ? ($entry['a_bn'] ?? $entry['a']) : $entry['a'];
            if (count($nationalities) > 1) {
                $notes = [];
                foreach ($nationalities as $country) $notes[] = trim($this->tableDetails($entry, '', $country, $state, $text));
                $answer = implode("\n\n", array_filter($notes)) . "\n\n" . $answer;
            } else {
                $answer = $this->tableDetails($entry, $answer, $nationality, $state, $text);
            }
            $source = $this->kb->guidance['sources'][$entry['source']];
            $cards[] = ['id'=>$entry['id'], 'q'=>$entry['q'], 'reply'=>$answer, 'status'=>$entry['status'] ?? 'answered',
                'source'=>['type'=>'guidance', 'file'=>$entry['file'] ?? 'data/emgs_knowledge.json', 'pointer'=>'/entries/' . $entry['file_index'],
                    'title'=>$source['title'], 'url'=>$source['url'], 'origin'=>$source['origin'],
                    'checked_at'=>$this->kb->guidance['checked_at']], 'nationality'=>count($nationalities) > 1 ? null : $nationality];
        }
        if (in_array('price_table', $concepts, true) && !array_intersect(['refund','medical','bond'], $concepts)) $cards[] = $this->fees($state, $text);
        return $cards;
    }

    private function tableDetails(array $entry, string $answer, ?string $nationality, array $state, string $text): string
    {
        $tables = $this->kb->guidance['tables'];
        $bn = ($state['language'] ?? '') === 'bn';
        if ($entry['id'] === 'passport-pages' && $nationality) {
            $all = in_array($nationality, ['Libya','Iran','Iraq','Somalia','Sudan','Syria','Yemen'], true);
            $note = $bn ? ($all ? ' সব পৃষ্ঠা দিতে হবে, খালি পৃষ্ঠাসহ।' : ' সাধারণ checklist অনুযায়ী biodata, visa ও observation পৃষ্ঠা দিন; সব খালি পৃষ্ঠা দেওয়ার ব্যতিক্রমী তালিকায় এই দেশ নেই।') :
                ($all ? ': submit **all pages, including blank pages**.' : ': use the normal bio-data, visa-information and observation-page checklist; this nationality is not on the supplied all-pages exception list.');
            $answer = '**' . $nationality . '**' . $note . "\n\n" . $answer;
        }
        if (!$nationality && $entry['family'] === 'graduate' && preg_match('/\b(?:nationalities|countries|nationality list)\b/', $text)) {
            $answer = "Eligible nationalities in the supplied list: **" . implode(', ', $tables['graduate_countries']) . "**. China and India have additional conditions and a stored extension end date of 31 December 2026.\n\n" . $answer;
        }
        if ($entry['id'] === 'bond' && $nationality) {
            $amount = $tables['personal_bond_default'];
            foreach ($tables['personal_bond'] as $fee => $countries) if (in_array($nationality, $countries, true)) $amount = $fee;
            $answer = '**' . $nationality . ': RM' . number_format((float)$amount) . '**' .
                ($bn ? ' personal bond জামানত (টিউশন ফি নয়)।' : ' personal bond deposit (not tuition).') . "\n\n" . $answer;
        }
        if ($entry['id'] === 'status-explanation' && preg_match('/(?<!\d)(\d{1,3})\s*%(?!\d)/', $text, $m)) {
            $answer = ($bn ? '**' . $m[1] . "%:** সরবরাহকৃত তথ্য শুধু এই শতাংশ দেখে নির্ভরযোগ্য stage নির্ধারণ করে না।\n\n" :
                '**' . $m[1] . "%:** the supplied data does not map this percentage to a reliable application stage by itself.\n\n") . $answer;
        }
        if ($entry['family'] === 'graduate' && $nationality) {
            $eligible = in_array($nationality, $tables['graduate_countries'], true);
            $note = $bn ? ($eligible ? ' সরবরাহকৃত Graduate Pass জাতীয়তার তালিকায় আছে; অন্যান্য শর্তও পূরণ করতে হবে।' : ' সরবরাহকৃত Graduate Pass যোগ্য জাতীয়তার তালিকায় নেই। এই তথ্য দিয়ে যোগ্য বলা যায় না।') :
                ($eligible ? ' is on the supplied Graduate Pass nationality list; all other conditions must also be met.' : ' is **not on the supplied Graduate Pass eligible-nationality list**. I cannot confirm eligibility for this nationality.');
            if (isset($tables['graduate_conditional_until'][$nationality])) {
                $deadline = $tables['graduate_conditional_until'][$nationality];
                $note .= $bn ? ' China/India extension ৩১ ডিসেম্বর ২০২৬ পর্যন্ত; good conduct letter লাগে এবং case by case বিবেচিত হয়।' :
                    ' The China/India extension runs through **31 December 2026**, requires a good-conduct letter and is assessed case by case.';
                if (gmdate('Y-m-d') > $deadline) $note .= $bn ? ' এই সংরক্ষিত সময়সীমা পার হয়েছে—বর্তমান extension নিশ্চিত না করে আবেদনযোগ্য ধরে নেবেন না।' : ' **That stored deadline has passed; the bot cannot verify any newer extension.**';
            }
            $answer = '**' . $nationality . '**' . $note . "\n\n" . $answer;
        }
        if ($entry['id'] === 'sev' && $nationality) {
            $listed = in_array($nationality, $tables['sev_countries'] ?? [], true);
            $answer = '**' . $nationality . '**' . ($listed ?
                ($bn ? ' সরবরাহকৃত SEV-required তালিকায় আছে।' : ' is on the supplied SEV-required list.') :
                ($bn ? ' সরবরাহকৃত SEV তালিকায় পাওয়া যায়নি; এটি visa exemption-এর নিশ্চয়তা নয়।' : ' was not found in the supplied SEV list; this does not establish a visa exemption.')) . "\n\n" . $answer;
        }
        return $answer;
    }

    private function fees(array $state, string $text): array
    {
        $bn = ($state['language'] ?? '') === 'bn';
        $table = $this->kb->guidance['tables']['institution_fees_myr'];
        $unis = $state['universities'] ?? [];
        $reply = $bn ? 'এগুলো সরবরাহকৃত বিশ্ববিদ্যালয়ভিত্তিক **EMGS fee estimate**, সর্বজনীন সরকারি ফি বা tuition নয়। বর্তমান invoice, অন্তর্ভুক্ত খরচ ও refund শর্ত বিশ্ববিদ্যালয় থেকে নিশ্চিত করুন।' :
            'These are **institution EMGS fee estimates from the supplied table**, not universal government charges or tuition. Their effective date and included components are unverified; confirm the invoice and refund conditions with the institution.';
        if (!$unis) $reply .= $bn ? "\n\nকোন বিশ্ববিদ্যালয়ের EMGS খরচ জানতে চান?" : "\n\nWhich university should I check?";
        foreach ($unis as $id) {
            $amount = $id === 'ucsi' && Text::contains($text, 'engineering') ? 3750 : ($table[$id] ?? null);
            $reply .= "\n\n**" . $this->kb->universities[$id]['name'] . ':** ' . ($amount === null ?
                ($bn ? 'সরবরাহকৃত EMGS fee table-এ নেই।' : 'No EMGS amount in the supplied table.') : 'RM' . number_format($amount) . '.');
            if (isset($this->kb->guidance['tables']['institution_fee_notes'][$id])) $reply .= ' ' . $this->kb->guidance['tables']['institution_fee_notes'][$id];
            foreach ($this->kb->records as $record) if ($record['university'] === $id &&
                preg_match('/visa fee\s*:?\s*(?:RM|MYR)\s*([\d,]+)/i', $record['remarks'], $m) && (float)str_replace(',', '', $m[1]) !== (float)$amount) {
                $reply .= $bn ? ' পুরোনো tuition table-এ ভিন্ন Visa Fee আছে; কোন খরচ অন্তর্ভুক্ত এবং বর্তমান মোট কত, invoice থেকে নিশ্চিত করুন।' :
                    ' The tuition table records a different Visa Fee; the components may differ. Confirm the current invoice before paying.';
                break;
            }
        }
        $source = $this->kb->guidance['sources']['fees'];
        return ['id'=>'institution-fees', 'q'=>'What are the institution EMGS fee estimates?', 'reply'=>$reply,
            'status'=>$unis ? 'answered' : 'clarification', 'nationality'=>null,
            'source'=>['type'=>'guidance','file'=>'data/emgs_knowledge.json','pointer'=>'/tables/institution_fees_myr',
                'title'=>$source['title'],'url'=>$source['url'],'origin'=>$source['origin']]];
    }
}
