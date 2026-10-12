<?php
namespace OneStep\Chat;

final class Counselor
{
    private $kb;
    private $index;
    private $parser;
    private $guidance;
    private $rankings;
    private $language = 'en';
    private const LIMIT = 6;
    private const DEFAULT_SUGGESTIONS = ['APU master fees', 'Compare APU and MMU', 'Can I study without IELTS?'];

    public function __construct(KnowledgeBase $kb)
    {
        $this->kb = $kb;
        $this->index = new FaqIndex($kb);
        $this->parser = new Query($kb);
        $this->guidance = new Guidance($kb);
        $this->rankings = new Rankings($kb->rankings, $kb);
    }

    public function answer(string $message, array $context = [], array $history = []): array
    {
        $prepared = Language::prepare($message, ($context['language'] ?? '') === 'bn' ? 'bn' : 'en');
        $this->language = $prepared['language'];
        if (strlen(json_encode($context, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE)) > 4096) {
            return $this->response('The saved conversation filters are too large. I have reset them; please send the university and program again.', [], 'clarification');
        }
        return $this->answerPrepared($prepared['text'], $context, $history);
    }

    private function answerPrepared(string $message, array $context, array $history): array
    {
        $state = $this->state($context);
        if (!$state && $history) {
            foreach (array_reverse(array_slice($history, -6)) as $turn) {
                if (($turn['role'] ?? '') !== 'user' || !is_string($turn['text'] ?? null) || $turn['text'] === $message) continue;
                $state = $this->state($this->parser->parse(substr($turn['text'], 0, 2000)));
                break;
            }
        }
        $normal = Text::normalize($message);
        if (preg_match('/\b(?:understand|speak|answer|know) bangla\b|\bbangla (?:understand|speak)\b/', $normal)) {
            $this->language = 'bn';
            return $this->response('হ্যাঁ, বাংলা ও Banglish-এ বিশ্ববিদ্যালয়, ফি, প্রোগ্রাম ও EMGS নিয়ে প্রশ্ন করতে পারেন। অস্পষ্ট হলে নির্দিষ্ট তথ্য জানতে চাইব।', $state);
        }
        if (preg_match('/\b(?:are you|you are)\b.*\b(?:human|bot|robot|ai)\b/', $normal)) {
            return $this->response($this->language === 'bn' ? 'আমি One-Step-এর নিজস্ব স্বয়ংক্রিয় সহকারী। সংরক্ষিত তথ্য থেকে উত্তর দিই। প্রয়োজনে কাউন্সেলরের সঙ্গে কথা বলতে পারেন।' : 'I am One-Step’s custom automated assistant. I answer from our stored information and can connect you with a counselor for individual advice.', $state);
        }
        if (preg_match('/^(reset|start over|new conversation|clear chat|forget everything|new topic)[.!?]*$/', $normal)) {
            return $this->response('Let\'s start again. Which university, program, or study question can I help with?', [], 'answered', [], self::DEFAULT_SUGGESTIONS);
        }
        if (preg_match('/^(?:goodbye|bye|thanks|thank you|thx)(?:[ ,.]*| for (?:the |your )?help|thanks|thank you|goodbye)*[.!?]*$/', $normal)) {
            return $this->response($this->language === 'bn' ? 'স্বাগতম। পরে কোনো প্রশ্ন থাকলে আবার লিখুন।' : 'You’re welcome. Come back whenever you have another study question.', $state);
        }
        if (preg_match('/^(hi|hello|hey|good morning|good afternoon|good evening|thanks|thank you|thx|bye|goodbye)[.!?]*$/', $normal)) {
            return $this->response(preg_match('/thank|thx/', $normal) ? 'You\'re welcome. Let me know what else you need.' : 'Hello! I can help you find programs, check published fees, compare universities, and search our student FAQs.', $state, 'answered', [], self::DEFAULT_SUGGESTIONS);
        }
        if (preg_match('/^(?:(?:can|could|may) i |i (?:want|need|would like) to )?(?:speak|talk|chat|connect)(?: with| to)? (?:a |an |the )?(?:real |human )?(?:counselor|counsellor|person|agent|human)|^(?:contact|whatsapp|human|counselor)$/', $normal)) {
            return $this->response('You can [speak with a One-Step counselor](https://wa.me/601119359497).', $state);
        }
        if (preg_match('/\b(?:ielts|cgpa|gpa)\s*(?:score (?:is |of )?|of |is |only )?\d(?:\.\d+)?/', $normal) && preg_match('/\b(?:i|my|with)\b/', $normal) && preg_match('/\b(?:admission|eligible|qualify|meet|direct|apply|application|entry|accept|accepted|guarantee|guaranteed)\b/', $normal)) {
            $profileState = $this->state($this->parser->parse($message));
            return $this->response('I cannot confirm admission or an English exemption from a score alone. Please include the university, exact program, study level, and your academic qualification. A counselor needs to confirm the program-specific entry requirements and your full profile.', $profileState, 'clarification');
        }
        if (!$this->kb->guidance && preg_match('/\b(?:emgs|visa)\b/', $normal) && preg_match('/\b(?:check|track|update)\s+(?:my|me)\b/', $normal)) {
            return $this->response('I cannot access your application or check live EMGS status. Use the [official EMGS application tracker](https://visa.educationmalaysia.gov.my/emgs/application/searchForm/?___SID=S). If you share the status wording or percentage, I can search our FAQs to help explain it.', $state, 'partial');
        }
        if (preg_match('/^(?:option )?([1-4]|first|second|third|fourth)$/', $normal, $m) && !empty($state['candidates'])) {
            $number = ['first'=>1,'second'=>2,'third'=>3,'fourth'=>4][$m[1]] ?? (int)$m[1];
            $id = $state['candidates'][$number - 1] ?? null;
            if ($id) {
                $state['universities'] = [$id];
                unset($state['candidates']);
                return $this->single('What about ' . $this->kb->universities[$id]['name'] . '?', $state);
            }
        }
        if (preg_match('/^(?:option )?([1-3]|first|second|third)$/', $normal, $m) && !empty($state['choices'])) {
            $number = ['first' => 1, 'second' => 2, 'third' => 3][$m[1]] ?? (int)$m[1];
            $id = $state['choices'][$number - 1] ?? '';
            if (isset($this->kb->faqs[$id])) {
                unset($state['choices']);
                return $this->faqAnswer(['id' => $id, 'score' => 1.0], $state);
            }
        }
        // Curated applicability rules take priority over superseded legacy FAQ wording.
        $rankingQuestion = $this->rankings->matches($message, $state);
        $compoundRecommendation = preg_match('/\b(?:best|recommend|suggest|shortlist)\b/', Text::canonical($message)) &&
            preg_match('/(?:[?!;]|(?<!\d)\.)\s+\S/u', $message);
        if (!$rankingQuestion && !$compoundRecommendation && $this->guidance->search($message, $state + ['language'=>$this->language])) return $this->single($message, $state);
        $wholeMatch = $this->index->search($message, $this->kb->entities($message) ?: ($state['universities'] ?? []));
        if (!$rankingQuestion && !empty($wholeMatch[0]['exact']) && (count($wholeMatch) === 1 || !$wholeMatch[1]['exact'])) {
            $parsed = $this->state($this->parser->parse($message));
            return $this->faqAnswer($wholeMatch[0], $parsed);
        }
        // Respect decimal scores and dotted university acronyms while separating questions.
        $splitText = str_ireplace(['a.p.u', 'ph.d'], ['APU', 'PhD'], $message);
        // Keep a ranking/fee request's distinct topics instead of dropping the fee clause.
        // Do not split institution lists or "world and Asia rankings".
        if ($rankingQuestion) $splitText = preg_replace('/(?:\s*,\s*|\s+(?:and|also|&)\s+)(?=(?:(?:its|their|the|bba|mba|it|bohm|master|bachelor)\s+)*(?:fees?\b|cost\b|intakes?\b|scholarships?\b|(?:qs\s+)?(?:world\s+|asia\s+)?rank(?:ing)?s?\b))/i', '; ', $splitText);
        $parts = preg_split('/[?!;\n]+|(?<!\d)\.(?:\s+|$)|\s+(?:and|also)\s+(?=(?:how|what|can|does|do|is|are|when|where)\b)/i', $splitText, -1, PREG_SPLIT_NO_EMPTY);
        $parts = array_values(array_filter(array_map('trim', $parts)));
        if (count($parts) > 4) return $this->response('Please send up to four questions at a time so I can address each one.', $state, 'clarification');
        if (!$rankingQuestion && count($parts) === 2 &&
            preg_match('/^i (?:want|would like)(?: to study)? (?:a |an )?(?:research |coursework )?(?:bachelor|master|mba|bba|diploma|phd)\b|^i am looking for\b/', Text::canonical($parts[0])) &&
            preg_match('/^(?:does|do|is|are|can|could|which|what|how)\b/', Text::canonical($parts[1]))) {
            return $this->single(implode(' ', $parts), $state);
        }
        if (count($parts) > 1) {
            $responses = [];
            $sources = [];
            $unresolved = false;
            $sharedUniversities = $rankingQuestion ? $this->kb->entities($message) : [];
            foreach ($parts as $part) {
                $partMessage = $part;
                if ($rankingQuestion && !$this->kb->entities($part)) {
                    $focus = $state['universities'] ?? $sharedUniversities;
                    if (!$focus) $focus = $sharedUniversities;
                    if (count($focus) === 1) $partMessage = $this->kb->universities[$focus[0]]['name'] . ' ' . $part;
                }
                $r = $this->answerPrepared($partMessage, $state, []);
                $state = $r['context'];
                $responses[] = '**' . Text::markdown($part) . '**' . "\n" . $r['reply'];
                $sources = array_merge($sources, $r['sources']);
                $unresolved = $unresolved || $r['status'] !== 'answered';
            }
            return $this->response(implode("\n\n", $responses), $state, $unresolved ? 'partial' : 'answered', $sources, $r['suggestions']);
        }
        return $this->single($message, $state);
    }

    /** Client state contains only validated search slots, never facts or answer text. */
    private function state(array $context): array
    {
        if (isset($context['knowledge_version']) && $context['knowledge_version'] !== $this->kb->version) return [];
        $state = [];
        foreach (['universities', 'excluded', 'levels', 'subjects', 'excluded_subjects', 'choices', 'candidates'] as $key) {
            $valid = $key === 'levels' ? array_fill_keys(Lexicon::LEVELS, true) :
                (in_array($key, ['subjects','excluded_subjects'], true) ? $this->kb->subjectVocabulary : ($key === 'choices' ? $this->kb->faqs : $this->kb->universities));
            $state[$key] = [];
            foreach (array_slice(is_array($context[$key] ?? null) ? $context[$key] : [], 0, $key === 'choices' ? 3 : ($key === 'candidates' ? 4 : 8)) as $value) {
                if (is_string($value) && isset($valid[$value])) $state[$key][] = $value;
            }
            $state[$key] = array_values(array_unique($state[$key]));
        }
        $state['subject_groups'] = [];
        foreach (array_slice(is_array($context['subject_groups'] ?? null) ? $context['subject_groups'] : [], 0, 8) as $group) {
            if (!is_array($group)) continue;
            $terms = array_values(array_intersect(array_filter($group, 'is_string'), $state['subjects']));
            if ($terms) $state['subject_groups'][] = $terms;
        }
        if (is_string($context['last_faq'] ?? null) && isset($this->kb->faqs[$context['last_faq']])) $state['last_faq'] = $context['last_faq'];
        $state['unknown'] = array_values(array_filter(array_slice(is_array($context['unknown'] ?? null) ? $context['unknown'] : [], 0, 4), static function ($word) {
            return is_string($word) && strlen($word) <= 120 && preg_match('/^[\p{L}\p{M}]+$/u', $word);
        }));
        if (!$state['universities'] && is_string($context['last_university'] ?? null)) $state['universities'] = $this->kb->entities($context['last_university']);
        foreach (['intent' => ['fees','programs','duration','intakes','overview','compare','faq','rankings'], 'audience' => ['local','international'],
            'ranking_scope' => ['all','world','asia','malaysia'],
            'subject_mode' => ['all','any'], 'mode' => ['fulltime','parttime','online','research','coursework'],
            'campus' => ['johor bahru','petaling jaya','penang','cyberjaya','kuala lumpur']] as $key => $values) {
            if (in_array($context[$key] ?? null, $values, true)) $state[$key] = $context[$key];
        }
        if (is_array($context['budget'] ?? null) && is_numeric($context['budget']['amount'] ?? null) && $context['budget']['amount'] > 0 && $context['budget']['amount'] <= 100000000) {
            $state['budget'] = ['amount' => (float)$context['budget']['amount'],
                'currency' => in_array($context['budget']['currency'] ?? null, ['MYR','USD','BDT','TAKA','$'], true) ? $context['budget']['currency'] : null,
                'basis' => in_array($context['budget']['basis'] ?? null, ['year','semester','total'], true) ? $context['budget']['basis'] : null];
        }
        if (is_int($context['offset'] ?? null) && $context['offset'] >= 0 && $context['offset'] <= 5000) $state['offset'] = $context['offset'];
        if (in_array($context['pending'] ?? null, ['university','level','subject','budget'], true)) $state['pending'] = $context['pending'];
        if (in_array($context['language'] ?? null, ['en','bn'], true)) $state['language'] = $context['language'];
        if (in_array($context['fee_period'] ?? null, ['first_year','annual','total','semester','year_2','year_3','year_4','year_5'], true)) $state['fee_period'] = $context['fee_period'];
        if (($context['recommend'] ?? false) === true) $state['recommend'] = true;
        if (is_int($context['ranking_year'] ?? null) && $context['ranking_year'] >= 2000 && $context['ranking_year'] <= 2099) $state['ranking_year'] = $context['ranking_year'];
        if ($this->guidance->validNationality($context['nationality'] ?? null)) $state['nationality'] = $context['nationality'];
        if (is_string($context['guide'] ?? null)) foreach ($this->kb->guidance['entries'] ?? [] as $entry) {
            if ($entry['id'] === $context['guide']) { $state['guide'] = $entry['id']; break; }
        }
        if (!array_filter($state)) return [];
        return $state;
    }

    private function single(string $message, array $old): array
    {
        if ($this->rankings->matches($message, $old)) {
            $ranked = $this->rankings->answer($message, $old, $this->language === 'bn');
            $links = [];
            foreach ($ranked['sources'] as $source) $links[] = '[' . $source['title'] . '](' . $source['url'] . ')';
            if ($links) $ranked['reply'] .= "\n\n" . ($this->language === 'bn' ? 'সূত্র: ' : 'Sources: ') . implode(' · ', $links);
            return $this->response($ranked['reply'], $ranked['context'], $ranked['status'], $ranked['sources'], $ranked['suggestions']);
        }
        $query = $this->parser->parse($message);
        $text = $query['text'];
        $explicit = $query;
        $allUniversities = (bool)preg_match('/\b(?:(?:across|among) all|all|any) universit(?:y|ies)\b/', $text);
        $more = (bool)preg_match('/^(show |list )?(more|next|next page)( results| programs)?[.!?]*$/', $text);
        $bareSlots = !$query['unknown'] && ($query['universities'] || $query['levels'] || $query['subjects'] || $query['budget'] ||
            preg_match('/^(?:myr|rm|total|per year|per semester)(?: total| per year| per semester)?$/', $text));
        $fillsPending = isset($old['pending']) && $bareSlots;
        $follow = $more || $fillsPending || (bool)preg_match('/^(and |also |what about |how about |instead|actually|no |not |only |same |how much|how long|what are (?:the )?fee|what is (?:the )?(?:total )?fee|which (?:one|of (?:those|these)|is|has)\b|(?:is|are|does|do|was|were) (?:that|this|those|these)\b|(?:do|does) (?:you|it|that|this|they) (?:have|include|show)\b)/', $text) ||
            (bool)preg_match('/\b(there|that program|this program|those|these|their|they|it cost|it take|(?:that|this|those|these) (?:amount|amounts|fee|fees|cost|total|price|figure|figures))\b/', $text) ||
            ($bareSlots && count(explode(' ', $text)) <= 5) ||
            ($query['intent'] === 'fees' && in_array($old['intent'] ?? '', ['fees','programs','overview','rankings'], true));
        if (preg_match('/^(?:tell me about|about|information about|overview of|describe)\s/', $text) ||
            array_intersect($query['topics'], ['visa','refund','career','recognition','admission','language','location'])) {
            $follow = (bool)preg_match('/\b(?:their|they|there|that university|this university)\b/', $text);
        }
        if ($more && empty($old['intent'])) return $this->response('Which university or program would you like to see?', [], 'clarification');
        if ($follow && $old) {
            foreach (['universities','levels','subjects','excluded','excluded_subjects','audience','campus','mode','budget','fee_period'] as $slot) {
                if ($slot === 'universities' && $allUniversities) continue;
                if (empty($query[$slot]) && !empty($old[$slot])) $query[$slot] = $old[$slot];
            }
            if (!empty($old['recommend'])) $query['recommend'] = true;
            if (($explicit['universities'] && $explicit['levels']) || ($explicit['levels'] && $explicit['levels'] !== ($old['levels'] ?? []))) {
                if (!$explicit['subjects']) {
                    $query['subjects'] = [];
                    $query['subject_groups'] = [];
                }
            }
            if (($explicit['universities'] || $explicit['levels'] || $explicit['subjects']) && !preg_match('/^(?:what about|how about|and |also )/', $text)) {
                if (!$explicit['fee_period']) $query['fee_period'] = null;
            }
            $query['excluded'] = array_values(array_diff($query['excluded'], $explicit['universities']));
            $query['excluded_subjects'] = array_values(array_diff($query['excluded_subjects'], $explicit['subjects']));
            // Campus, mode and budget qualify a selection; an explicit new institution starts those filters afresh.
            if ($explicit['universities'] && $explicit['universities'] !== ($old['universities'] ?? []) && !preg_match('/^(?:what about|how about|and |also )/', $text)) {
                foreach (['campus','mode','budget'] as $slot) if (!$explicit[$slot]) $query[$slot] = null;
            }
            if ($query['excluded']) $query['universities'] = array_values(array_diff($query['universities'], $query['excluded']));
            if ((in_array($query['intent'], ['faq','overview'], true) && !$query['topics']) || $more || ($query['intent'] === 'programs' && empty($query['topics']) && isset($old['pending']))) $query['intent'] = $old['intent'] ?? $query['intent'];
            if (($old['intent'] ?? '') === 'fees' && !$explicit['universities'] && !$explicit['levels'] && !$explicit['subjects'] &&
                ($query['fee_period'] || preg_match('/\b(?:amount|amounts|fee|fees|cost|price|total|breakdown)\b/', $text))) $query['intent'] = 'fees';
            if (!$explicit['subjects'] && $query['subjects']) {
                $query['subject_mode'] = $old['subject_mode'] ?? 'all';
                $query['subject_groups'] = $old['subject_groups'] ?? [];
                if (($old['pending'] ?? null) === 'subject' && !$query['unknown']) $query['unknown'] = $old['unknown'] ?? [];
            }
            if ($query['budget']) {
                if (preg_match('/\b(?:rm|myr)\b/', $text)) $query['budget']['currency'] = 'MYR';
                if (preg_match('/\b(?:total|whole program|entire program)\b/', $text)) $query['budget']['basis'] = 'total';
                if (preg_match('/\b(?:per year|yearly|annually)\b/', $text)) $query['budget']['basis'] = 'year';
                if (preg_match('/\bper semester\b/', $text)) $query['budget']['basis'] = 'semester';
            }
            $query['subjects'] = array_values(array_diff($query['subjects'], $query['excluded_subjects']));
            if (($old['pending'] ?? '') === 'subject' && !$explicit['subjects'] && !$query['unknown'] && $bareSlots) $query['unknown'] = $old['unknown'] ?? [];
        }
        $state = $this->state($query);
        $state['language'] = $this->language;
        if ($this->guidance->validNationality($old['nationality'] ?? null)) $state['nationality'] = $old['nationality'];
        if (!$explicit['universities'] && $follow && !empty($old['candidates'])) $state['candidates'] = $old['candidates'];
        $guideState = $state;
        if (isset($old['guide'])) $guideState['guide'] = $old['guide'];
        $cards = $this->guidance->search($message, $guideState);
        if ($cards) return $this->guidanceAnswer($cards, $query, $state, $message);
        $state['offset'] = $more ? ($old['offset'] ?? 0) + self::LIMIT : 0;
        $state['knowledge_version'] = $this->kb->version;
        if ($query['recommend'] && !$query['universities'] && !$query['levels'] && !$query['subjects']) {
            $state['pending'] = 'subject'; $state['intent'] = 'programs'; $state['recommend'] = true;
            return $this->response($this->language === 'bn' ? 'কোন বিষয় ও শিক্ষাস্তরে পড়তে চান—যেমন BBA, IT bachelor বা MBA? সবার জন্য এক বিশ্ববিদ্যালয় সেরা নয়; আপনার বাজেট ও পছন্দ অনুযায়ী সংরক্ষিত প্রোগ্রাম তুলনা করতে পারি।' : 'Which subject and study level do you want, such as BBA, IT bachelor or MBA? There is no universal best university; I can shortlist recorded programs using your budget and preferences.', $state, 'clarification', [], ['BBA','IT bachelor','MBA']);
        }
        if (count($query['universities']) > 4) return $this->response('Please compare up to four universities at a time so each can be represented clearly.', $state, 'clarification');
        $countries = [];
        foreach (['china','cyprus','denmark','finland','hungary','italy','norway','spain','sweden','uzbekistan'] as $country) if (Text::contains($text, $country)) $countries[] = $country;
        if ($countries && !$query['universities']) {
            $links = [];
            $sources = [];
            foreach ($countries as $country) {
                $links[] = '[' . ucfirst($country) . ' study guide](countries/' . $country . '.html)';
                $sources[] = ['type' => 'guide','file' => 'countries/' . $country . '.html','title' => ucfirst($country) . ' study guide','url' => 'countries/' . $country . '.html'];
            }
            return $this->response('Our local guides cover these destinations: ' . implode(', ', $links) . '. I do not have a structured answer to this question for those destinations.', [], 'partial', $sources);
        }
        $unsupported = array_values(array_filter($query['universities'], function ($id) { return !$this->kb->universities[$id]['supported']; }));
        if ($unsupported && count($unsupported) === count($query['universities'])) {
            return $this->response('I recognized **' . implode(', ', array_map(function ($id) { return $this->kb->universities[$id]['name']; }, $unsupported)) . '**, but no program or fee catalog for it is available in our local data. A counselor can help confirm the details.', $state, 'not_found');
        }
        $faqQuestion = $message;
        if ($follow && !$query['topics'] && isset($old['last_faq']) && $query['universities']) $faqQuestion = $this->kb->stripEntities($this->kb->faqs[$old['last_faq']]['q']);
        $ranked = $this->index->search($faqQuestion, $query['universities']);
        if ($ranked && $ranked[0]['exact'] && (count($ranked) === 1 || !$ranked[1]['exact'])) return $this->faqAnswer($ranked[0], $state);
        // Two independent topic requests joined without a question word.
        if (in_array('fees', $query['topics'], true) && in_array('scholarship', $query['topics'], true) && preg_match('/\b(?:and|also)\b/', $text)) {
            $feeQuery = $query;
            $feeQuery['intent'] = 'fees';
            $feeQuery['unknown'] = array_values(array_diff($feeQuery['unknown'], ['scholarship']));
            $feeResponse = $this->programs($feeQuery, $state);
            $scholarships = $this->faq('Does ' . implode(' and ', array_map(function ($id) { return $this->kb->universities[$id]['name']; }, $query['universities'])) . ' offer scholarships?', $state);
            return $this->response("**Fees**\n" . $feeResponse['reply'] . "\n\n**Scholarships**\n" . $scholarships['reply'], $feeResponse['context'],
                $feeResponse['status'] === 'answered' && $scholarships['status'] === 'answered' ? 'answered' : 'partial', array_merge($feeResponse['sources'], $scholarships['sources']), $feeResponse['suggestions']);
        }
        if (in_array($query['intent'], ['fees','programs','duration','intakes'], true)) return $this->programs($query, $state);
        if (in_array($query['intent'], ['compare','overview'], true) && $query['universities']) return $this->overview($query, $state);
        if (count($query['universities']) > 1 && empty($query['cheapest'])) {
            $replies = []; $sources = []; $unresolved = false;
            foreach ($query['universities'] as $id) {
                $uniState = $state;
                $uniState['universities'] = [$id];
                $r = $this->faq($this->kb->stripEntities($faqQuestion), $uniState);
                $replies[] = '**' . $this->kb->universities[$id]['name'] . "**\n" . $r['reply'];
                $sources = array_merge($sources, $r['sources']);
                $unresolved = $unresolved || $r['status'] !== 'answered';
            }
            return $this->response(implode("\n\n", $replies), $state, $unresolved ? 'partial' : 'answered', $sources);
        }
        return $this->faq($faqQuestion, $state, $ranked);
    }

    private function guidanceAnswer(array $cards, array $query, array $state, string $message): array
    {
        $replies = []; $sources = []; $status = 'answered'; $suggestions = [];
        // A stated course request can coexist with funding/visa/work questions in a narrative.
        $course = null;
        if (preg_match('/\b(?:want(?: to)? (?:study|do)|looking for|offers? a|fees? (?:for|of)|cost (?:for|of))\s+((?:a |an )?(?:bachelor|master|diploma|phd|mba|bba)\b[^.?!;]*?)(?=\b(?:preferably|with a scholarship|or some kind|because|and i|also|thank|scholarship)\b|[.?!;]|$)/i', $message, $m)) $course = $m[1];
        if (!$course && preg_match('/^(.+?\bfees?)\s*(?:[.?!;]|and scholarships?)/i', $message, $m) && !array_intersect($query['topics'], ['visa','refund'])) $course = $m[1];
        $profileTarget = null;
        if ($course && array_intersect(array_column($cards, 'id'), ['profile','admission-check'])) {
            $targetQuery = $this->parser->parse($course);
            if ($targetQuery['levels'] || $targetQuery['subjects']) {
                $targetQuery['universities'] = $query['universities'];
                $targetState = $this->state($targetQuery);
                $targetState['language'] = $this->language;
                if ($this->guidance->validNationality($state['nationality'] ?? null)) $targetState['nationality'] = $state['nationality'];
                $state = $targetState;
                $profileTarget = strtoupper(trim($course)) === 'MBA' ? 'MBA' : Text::markdown($course);
            }
        }
        if ($course && !array_intersect(array_column($cards, 'id'), ['profile','admission-check','english-admission','english-val','graduate'])) {
            $courseQuery = $this->parser->parse($course);
            if ($courseQuery['levels'] || $courseQuery['subjects']) {
                $courseQuery['universities'] = $query['universities'];
                $courseQuery['budget'] = $query['budget'];
                $courseQuery['intent'] = preg_match('/\b(?:fee|fees|cost|cheap|budget)\b/i', $message) ? 'fees' : 'programs';
                $courseQuery['cheapest'] = $query['cheapest'];
                $courseState = $this->state($courseQuery);
                $r = $this->programs($courseQuery, $courseState);
                $replies[] = ($courseQuery['intent'] === 'fees' ? "**Fees**\n" : "**Programs**\n") . $r['reply'];
                $sources = $r['sources']; $state = $r['context']; $suggestions = $r['suggestions'];
                if ($r['status'] !== 'answered') $status = 'partial';
            }
        }
        foreach ($cards as $card) {
            $reply = $card['reply'];
            if ($card['id'] === 'profile' && $profileTarget) {
                $reply = $this->language === 'bn' ?
                    'আমি বুঝেছি আপনার পরবর্তী লক্ষ্য **' . $profileTarget . '**। ভর্তি আপনার আগের ডিগ্রি, ফল/CGPA, প্রাসঙ্গিক বিষয়, English evidence এবং নির্দিষ্ট বিশ্ববিদ্যালয়ের entry rule-এর ওপর নির্ভর করবে। আপনার budget ও পছন্দের বিশ্ববিদ্যালয় জানালে সংরক্ষিত program ও fee তুলনা করতে পারি; চূড়ান্ত eligibility প্রতিষ্ঠান নিশ্চিত করবে।' :
                    'I understood your intended next program as **' . $profileTarget . '**. Admission depends on your previous qualification, grades/CGPA, relevant subjects, English evidence and the selected university\'s entry rules. Share your budget and preferred universities to compare recorded programs and fees; the institution must confirm final eligibility.';
            }
            if ($card['id'] === 'scholarship-advice' && $query['universities']) {
                $reply = '**' . implode(', ', array_map(function ($id) { return $this->kb->universities[$id]['name']; }, $query['universities'])) . "**\n" . $reply;
            }
            $replies[] = (count($cards) > 1 || $replies ? '**' . ($card['id'] === 'scholarship-advice' ? 'Scholarships' : $card['q']) . "**\n" : '') . $reply;
            $sources[] = $card['source'];
            if ($card['status'] !== 'answered') $status = count($cards) === 1 && count($replies) === 1 ? $card['status'] : 'partial';
            $state['guide'] = $card['id'];
            if ($card['nationality']) $state['nationality'] = $card['nationality'];
        }
        unset($state['pending'], $state['choices'], $state['unknown'], $state['offset']);
        if (!$course) {
            $state['intent'] = 'faq';
            unset($state['subjects'], $state['subject_groups'], $state['excluded_subjects'], $state['mode'], $state['campus'], $state['budget'], $state['fee_period'], $state['audience']);
            if (array_intersect(array_column($cards, 'id'), ['profile','admission-check'])) unset($state['levels']);
        }
        return $this->response(implode("\n\n", $replies), $state, $status, $sources, $suggestions, count($cards) === 1 && !$course ? $cards[0]['q'] : null);
    }

    private function faq(string $message, array $state, ?array $ranked = null): array
    {
        $ranked = $ranked ?? $this->index->search($message, $state['universities'] ?? []);
        $best = $ranked[0] ?? null;
        if (!empty($best['exact']) && !empty($ranked[1]['exact'])) {
            unset($state['choices']);
            $sources = array_map(function ($r) { return $this->kb->faqs[$r['id']]['source']; }, $ranked);
            return $this->response('Our local FAQs contain different answers to this wording. A counselor needs to confirm which applies before I can give you a reliable answer.', $state, 'clarification', $sources);
        }
        $margin = $best ? $best['score'] - ($ranked[1]['score'] ?? 0) : 0;
        if ($best && $best['coverage'] >= 0.72 && $best['score'] >= 0.77 && $margin >= 0.045 && ($best['exact'] || (($best['hits'] ?? 0) >= 2 && ($best['precision'] ?? 0) >= 0.55))) return $this->faqAnswer($best, $state);
        if ($best && $best['score'] >= 0.48 && $best['coverage'] >= 0.38) {
            $choices = array_slice(array_filter($ranked, static function ($r) use ($best) { return $r['score'] >= max(0.48, $best['score'] - 0.18); }), 0, 3);
            $state['choices'] = array_column($choices, 'id');
            $suggestions = array_map(function ($r) { return $this->kb->faqs[$r['id']]['q']; }, $choices);
            $reply = "I found related FAQs, but I am not sure which answers your question. Which one did you mean?\n\n";
            foreach ($suggestions as $i => $suggestion) $reply .= ($i + 1) . '. ' . $suggestion . "\n";
            return $this->response(trim($reply), $state, 'clarification', [], $suggestions, null, $best['score']);
        }
        unset($state['choices']);
        return $this->response('I could not find a reliable answer in our local information. Please include the university and the specific issue, or [ask a One-Step counselor](https://wa.me/601119359497).', $state, 'not_found');
    }

    private function faqAnswer(array $match, array $state): array
    {
        $faq = $this->kb->faqs[$match['id']];
        unset($state['choices'], $state['pending']);
        if ($faq['scope'] !== 'global') $state['universities'] = [$faq['scope']];
        $state['intent'] = 'faq';
        $state['last_faq'] = $faq['id'];
        return $this->response($faq['a'], $state, 'answered', [$faq['source']], [], $faq['q'], $match['score']);
    }

    private function programs(array $query, array $state): array
    {
        $state['intent'] = $query['intent'];
        $fees = $query['intent'] === 'fees';
        if ($fees && !$query['universities'] && !empty($state['candidates'])) {
            $names = array_map(function ($id) { return $this->kb->universities[$id]['name']; }, $state['candidates']);
            return $this->response('Which shortlisted university do you mean: **' . implode(', ', $names) . '**? Reply with its name or option number.', $state, 'clarification', [], $names);
        }
        if (!$query['universities'] && !$query['levels'] && !$query['subjects']) {
            $state['pending'] = 'university';
            return $this->response('Which university and study level or program do you mean? For example, "APU master fees" or "computer science bachelor programs".', $state, 'clarification', [], ['APU master fees','City University MBA fees','Computer science bachelor programs']);
        }
        if ($fees && !$query['levels'] && !$query['subjects'] && !$query['unknown']) {
            $state['pending'] = 'level';
            return $this->response('Which program or study level should I check? Fees differ by program, campus, and student category.', $state, 'clarification', [], ['Foundation','Diploma','Bachelor','Master','PhD']);
        }
        if ($query['budget'] && (!$query['budget']['currency'] || !$query['budget']['basis'])) {
            $state['pending'] = 'budget';
            return $this->response('Is your budget in Malaysian ringgit (MYR), and is it for the whole program, per year, or per semester? Please state it together, for example "under RM 50,000 total".', $state, 'clarification');
        }
        if ($query['budget'] && $query['budget']['currency'] !== 'MYR') return $this->response('Please give your budget in MYR (RM). The local fee comparison does not have exchange rates to convert this currency reliably.', $state, 'clarification');
        if ($query['unknown']) {
            $state['pending'] = 'subject';
            return $this->response('I could not match this part to a program or supported filter: **' . Text::markdown(implode(', ', array_slice($query['unknown'], 0, 4))) . '**. Please give the program name or rephrase that condition so I do not ignore it.', $state, 'clarification');
        }
        $matches = [];
        $unpriced = [];
        $modeUnverified = [];
        $modeUnverifiedOnly = false;
        $seen = [];
        foreach ($this->kb->records as $record) {
            if ($query['universities'] && !in_array($record['university'], $query['universities'], true)) continue;
            if (in_array($record['university'], $query['excluded'], true)) continue;
            if ($fees && $record['source']['type'] !== 'fees') continue;
            if ($query['levels'] && !array_intersect($query['levels'], $record['levels'])) continue;
            if (array_intersect($query['excluded_subjects'], $record['terms'])) continue;
            $recordTerms = $record['terms'];
            // A generic "Computing" group can contain IT, while an exact named program remains visible in its own wording.
            if (in_array('computing', $recordTerms, true)) $recordTerms[] = 'informationtechnology';
            $recordTerms = array_values(array_unique($recordTerms));
            $subjectMatch = !$query['subjects'];
            foreach ($query['subject_groups'] ?: [$query['subjects']] as $group) {
                if (count(array_intersect($group, $recordTerms)) === count($group)) $subjectMatch = true;
            }
            if (!$subjectMatch) continue;
            if ($query['audience'] && $record['audience'] && $query['audience'] !== $record['audience']) continue;
            $recordText = Text::canonical($record['name'] . ' ' . $record['category'] . ' ' . json_encode($record['fields']));
            if ($query['campus'] && !Text::contains($recordText, $query['campus'])) continue;
            if ($query['mode'] && !Text::contains($recordText, $query['mode'])) { $modeUnverified[] = $record; continue; }
            if ($fees && !$this->hasMoney($record)) { $unpriced[] = $record; continue; }
            $price = $query['budget'] ? $this->price($record, $query['budget']['basis']) : null;
            if ($query['budget'] && ($price === null || $price > $query['budget']['amount'])) continue;
            $key = $record['university'] . '|' . $record['name'] . '|' . $record['category'] . '|' . json_encode($record['fields']);
            if (isset($seen[$key])) continue;
            $seen[$key] = true;
            $record['budget_price'] = $price;
            $matches[] = $record;
        }
        // Prefer the program catalog for availability/duration; fee groups are secondary.
        if (!$fees) usort($matches, static function ($a, $b) {
            $order = ['bachelor'=>0,'diploma'=>1,'foundation'=>2,'certificate'=>3,'master'=>4,'phd'=>5];
            return ($order[$a['levels'][0] ?? ''] ?? 6) <=> ($order[$b['levels'][0] ?? ''] ?? 6) ?:
                ($b['source']['type'] === 'program' ? 1 : 0) <=> ($a['source']['type'] === 'program' ? 1 : 0);
        });
        if ($query['budget']) usort($matches, static function ($a, $b) { return $a['budget_price'] <=> $b['budget_price']; });
        if (!empty($query['cheapest']) && !$query['budget']) usort($matches, function ($a, $b) {
            return ($this->price($a, 'total') ?? INF) <=> ($this->price($b, 'total') ?? INF);
        });
        $scopeNames = array_map(function ($id) { return $this->kb->universities[$id]['name']; }, $query['universities']);
        $scopeLabel = $scopeNames ? ' for **' . implode(', ', $scopeNames) . '**' : '';
        if (!$matches && $modeUnverified) {
            $modeSeen = [];
            $modeUnverified = array_values(array_filter($modeUnverified, static function ($record) use (&$modeSeen) {
                $key = $record['university'] . '|' . $record['name'] . '|' . $record['source']['type'];
                if (isset($modeSeen[$key])) return false;
                $modeSeen[$key] = true;
                return true;
            }));
            if ($fees) {
                return $this->response('Matching fee rows' . $scopeLabel . ' exist, but the local data does **not record them as ' . Text::markdown($query['mode']) . ' mode**. I cannot present those amounts as fees for that study mode. Ask the institution for the exact mode and current fee schedule.', $state, 'partial', array_column(array_slice($modeUnverified, 0, 3), 'source'));
            }
            $matches = $modeUnverified;
            $modeUnverifiedOnly = true;
        }
        if (!$matches && $unpriced && !$query['budget']) {
            $unpricedReply = $this->language === 'bn' ?
                ($scopeNames ? '**' . implode(', ', $scopeNames) . "**-এর " : '') . 'matching program আছে, কিন্তু স্থানীয় fee row-তে **কোনো টাকার অঙ্ক সংরক্ষিত নেই**। Study mode বা duration থেকে খরচ বানিয়ে বলা যাবে না। বর্তমান fee schedule বিশ্ববিদ্যালয় বা counselor-এর কাছে নিশ্চিত করুন।' :
                'Matching program entries' . $scopeLabel . ' exist, but their local fee rows contain **no monetary fee amount**. I cannot quote a cost from study-mode or duration labels. Please ask the university or a counselor for the current fee schedule.';
            return $this->response($unpricedReply, $state, 'partial', array_column(array_slice($unpriced, 0, 3), 'source'));
        }
        if (!$matches && $query['subjects'] === ['businessadministration'] && $query['universities'] && !$query['budget']) {
            $related = [];
            foreach ($this->kb->records as $record) {
                if (in_array($record['university'], $query['universities'], true) && in_array('bachelor', $record['levels'], true) &&
                    !array_diff(['business','management'], $record['terms'])) $related[$record['name']] = $record;
            }
            if ($related) {
                $state['pending'] = 'subject';
                $names = array_slice(array_keys($related), 0, 3);
                return $this->response('No exact BBA / Business Administration entry matched these filters. A related recorded title is **' . implode(', ', $names) . '**. It is a different program title. Would you like to check that program?', $state, 'clarification', array_column(array_slice(array_values($related), 0, 3), 'source'), $names);
            }
        }
        if (!$matches) {
            $notFoundReply = $this->language === 'bn' ?
                'এই filter অনুযায়ী স্থানীয় catalog-এ ' . ($scopeNames ? '**' . implode(', ', $scopeNames) . '**-এর জন্য ' : '') .
                    'matching ' . ($fees ? 'fee entry' : 'program') . ' পাওয়া যায়নি। তাই প্রোগ্রামটি নেই—এমন সিদ্ধান্ত নেওয়া যাবে না।' .
                    ($query['budget'] ? ' নির্দিষ্ট MYR অঙ্ক ও সময়কাল ছাড়া কোনো entry budget search-এ রাখা হয়নি।' : '') . ' অন্য program বা level দিয়ে দেখুন, অথবা counselor-এর কাছে নিশ্চিত করুন।' :
                'No matching ' . ($fees ? 'fee entries' : 'programs') . ' were found' . $scopeLabel . ' in the local catalog for these filters. This does not establish that the program is unavailable.' . ($query['budget'] ? ' Entries without an explicit comparable MYR amount and period cannot be included in this budget search.' : '') . ' Try a different program or study level, or confirm with a counselor.';
            return $this->response($notFoundReply, $state, 'not_found');
        }
        unset($state['pending']);
        if (!$query['universities'] && !empty($query['recommend'])) {
            $shortlist = [];
            foreach ($matches as $record) if (!isset($shortlist[$record['university']])) $shortlist[$record['university']] = $record;
            $shortlist = array_slice($shortlist, 0, 3, true);
            $state['candidates'] = array_keys($shortlist);
            $reply = "A single best university cannot be established from this catalog. Here are matching options to compare by budget, campus, and entry requirements.\n\n";
            $sources = [];
            foreach (array_values($shortlist) as $i => $record) {
                $reply .= ($i + 1) . '. **' . $this->kb->universities[$record['university']]['name'] . '** — ' . Text::markdown($record['name']) . "\n";
                $sources[] = $record['source'];
            }
            $reply .= "\nWhich of these universities would you like to focus on? Reply with its name or option number.";
            return $this->response($reply, $state, 'answered', $sources, array_map(function ($id) { return $this->kb->universities[$id]['name']; }, $state['candidates']));
        }
        // Interleave institution results before pagination, so comparisons never hide a side.
        if (count($query['universities']) > 1) {
            $groups = [];
            foreach ($query['universities'] as $id) {
                $groups[$id] = array_values(array_filter($matches, static function ($r) use ($id) { return $r['university'] === $id; }));
            }
            $matches = [];
            while (array_filter($groups)) foreach ($groups as &$group) if ($group) $matches[] = array_shift($group);
            unset($group);
        }
        $offset = $state['offset'] ?? 0;
        if ($offset >= count($matches)) return $this->response('You have reached the end of the matching local entries. Change a filter or start over to search again.', $state);
        $selected = array_slice($matches, $offset, self::LIMIT);
        $reply = $fees ? "These are the **published local fee entries** matching your request. Amounts keep the original labels and conditions.\n\n" : "Here are matching entries from our local catalog.\n\n";
        if ($modeUnverifiedOnly) $reply .= 'These rows match the university, level and subject, but the local data does **not confirm ' . Text::markdown($query['mode']) . " mode** for them. Treat them as related programs pending confirmation of the study mode.\n\n";
        if ($query['subjects'] && $selected && !array_filter($selected, static function ($record) { return substr_count($record['name'], ',') < 3; })) {
            $reply .= "These matches are broad program-group rows, not separately named course confirmations. Confirm the exact course title and whether the displayed duration or fee applies to it.\n\n";
        }
        if ($fees && $query['audience']) {
            $reply .= 'You asked about **' . $query['audience'] . " students**. Rows without a student-category label are shown as published and do not verify a separate international/local rate.\n\n";
        }
        if ($fees && !empty($query['cheapest'])) {
            $basis = $query['budget']['basis'] ?? 'total';
            $lowest = $this->price($selected[0], $basis);
            if ($lowest !== null) {
                $basisLabel = $basis === 'year' ? 'annual' : ($basis === 'semester' ? 'per-semester' : 'total');
                $reply .= '**Lowest comparable published ' . $basisLabel . ' amount in these matches:** ' .
                    Text::markdown($this->kb->universities[$selected[0]['university']]['name']) . ' — ' .
                    Text::markdown($selected[0]['name']) . ': **RM' . number_format($lowest) . "**.\n\n";
            }
        }
        $sources = [];
        $missingPeriod = false;
        $missingGroups = [];
        if (count($query['subject_groups']) > 1) foreach ($query['subject_groups'] as $group) {
            if (!array_filter($matches, static function ($record) use ($group) { return !array_diff($group, $record['terms']); })) $missingGroups[] = implode(' ', $group);
        }
        $period = $query['fee_period'] ?? null;
        if ($fees && in_array($period, ['first_year','annual'], true)) $reply .= "Only the recorded first-year/annual charges are shown below; no total has been divided by the course duration.\n\n";
        foreach ($selected as $record) {
            $reply .= '**' . Text::markdown($this->kb->universities[$record['university']]['name']) . ' — ' . Text::markdown($record['name']) . "**\n";
            if ($fees) $reply .= Text::markdown($record['category']) . "\n";
            if ($record['section']) {
                if ($fees && $period && $period !== 'total') {
                    $missingPeriod = true;
                    $reply .= "This charge table does not provide a separate fee quote for the requested year or semester. Please confirm the payment schedule with the institution.\n";
                } else {
                    $reply .= $this->table($record['fields'], array_slice($record['rows'], 0, 10));
                    if (count($record['rows']) > 10) $reply .= "More charges appear in the full fee table.\n";
                }
            } else {
                $fields = $record['fields'];
                if ($fees && in_array($period, ['first_year','annual','semester','year_2','year_3','year_4','year_5'], true)) {
                    $fields = array_filter($fields, static function ($value, $label) use ($period) {
                        if (strpos($period, 'year_') === 0) return (bool)preg_match('/\b(?:year|yr)\s*' . substr($period, -1) . '\b/i', $label);
                        return $period === 'semester' ? (bool)preg_match('/per sem(?:ester)?/i', $label) :
                            (bool)preg_match('/per year|annual|yearly|fees? 1 year|(?:year|yr)\s*1\b|first year|1st year/i', $label);
                    }, ARRAY_FILTER_USE_BOTH);
                    if (!$fields) {
                        $missingPeriod = true;
                        $reply .= strpos($period, 'year_') === 0 ? 'Year ' . substr($period, -1) . " fees are not recorded for this entry; a blank/dash is not a zero fee.\n" :
                            ($period === 'semester' ? "Semester fees are not recorded for this entry.\n" :
                            "First-year or annual fees are not recorded for this entry. The published total is not an annual quote.\n");
                    }
                }
                if (!$fees) {
                    $fields = [];
                    if ($record['levels']) $fields['Level'] = implode(' / ', array_map('ucfirst', $record['levels']));
                    if ($record['duration']) $fields['Duration'] = $record['duration'];
                    if ($query['intent'] === 'intakes') foreach ($record['fields'] as $label => $value) if (stripos($label, 'intake') !== false) $fields[$label] = $value;
                }
                if (!$fields && $query['intent'] === 'duration') $reply .= "Duration is not recorded for this entry.\n";
                if ($query['intent'] === 'intakes' && !array_filter(array_keys($fields), static function ($k) { return stripos($k, 'intake') !== false; })) $reply .= "Intake dates are not recorded for this entry.\n";
                foreach ($fields as $label => $value) {
                    $displayValue = $value;
                    if ($fees && preg_match('/\b(?:MYR|RM)\b/i', $label) && preg_match('/^\s*[\d,]+(?:\.\d+)?\s*$/', $value)) $displayValue = 'RM' . trim($value);
                    $reply .= '- **' . Text::markdown($label) . ':** ' . Text::markdown($displayValue) . "\n";
                }
            }
            if ($fees && $record['remarks']) $reply .= "\n> **Published conditions:** " . str_replace("\n", "\n> ", $record['remarks']) . "\n";
            $sources[] = $record['source'];
            $reply .= "\n[Source: " . ($fees ? 'fee table' : 'program details') . '](' . $record['source']['url'] . ")\n\n";
        }
        foreach ($query['universities'] as $id) {
            if (!array_filter($matches, static function ($r) use ($id) { return $r['university'] === $id; })) $reply .= 'No matching local entry was found for **' . $this->kb->universities[$id]['name'] . "**.\n\n";
        }
        if ($query['compare'] && $fees) $reply .= "Fee labels, included charges, and study periods may differ. These entries do not establish an overall cheapest university.\n\n";
        if (!empty($query['cheapest'])) $reply .= "Entries with an explicit comparable total are shown in ascending order; unpriced or differently labelled entries cannot establish the cheapest overall cost. Tuition, living costs and visa charges must be checked separately.\n\n";
        foreach ($missingGroups as $group) $reply .= 'No specific local match was found for **' . Text::markdown($group) . "** with these filters.\n\n";
        $reply .= 'Showing ' . count($selected) . ' of ' . count($matches) . ' matching entries.';
        if ($fees) $reply .= ' The local data has no verified effective date; confirm the current amount and eligibility for any discount before applying.';
        $suggestions = count($matches) > $offset + self::LIMIT ? ['Show more'] : [];
        if (!$fees) $suggestions[] = 'What are the fees?';
        $result = $this->response(trim($reply), $state, $missingPeriod || $missingGroups || $modeUnverifiedOnly ? 'partial' : 'answered', $sources, $suggestions);
        $result['result_count'] = count($matches);
        return $result;
    }

    /** No implicit currency conversions, summing, or annual-to-total extrapolation. */
    private function hasMoney(array $record): bool
    {
        if ($record['section']) {
            foreach ($record['rows'] as $row) foreach ($row as $cell) if (is_scalar($cell) && preg_match('/(?:RM|MYR)\s*[\d,]+/i', (string)$cell)) return true;
            return false;
        }
        foreach ($record['fields'] as $label => $value) if (preg_match('/(?:fee|tuition|total|price|MYR|RM|year [1-9]|per year|per semester)/i', $label) && preg_match('/\d/', $value)) return true;
        return false;
    }

    private function price(array $record, string $basis): ?float
    {
        if ($record['section']) return null;
        $candidates = [];
        foreach ($record['fields'] as $label => $value) {
            $labelLower = strtolower($label);
            $isPeriod = preg_match('/year|semester|sem\b|month|credit|trimester|1st|first/i', $label);
            if ($basis === 'total' && (!preg_match('/total/', $labelLower) || $isPeriod)) continue;
            if ($basis === 'year' && !preg_match('/per year|annual|yearly|fees? 1 year|(?:year|yr)\s*1\b|first year|1st year/', $labelLower)) continue;
            if ($basis === 'semester' && !preg_match('/per sem(?:ester)?/', $labelLower)) continue;
            if (preg_match('/\b(?:usd|gbp|bdt)\b/i', $label)) continue;
            $priority = preg_match('/grand|final|with misc/i', $label) ? 3 : (stripos($label, 'tuition') === false ? 2 : 1);
            $price = null;
            if ((preg_match('/\b(?:rm|myr)\b/i', $label) || preg_match('/\b(?:rm|myr)\s*\d/i', $value)) &&
                preg_match('/^\s*(?:(?:RM|MYR)\s*)?([\d,]+(?:\.\d+)?)\s*$/i', $value, $m)) $price = (float)str_replace(',', '', $m[1]);
            $candidates[] = ['priority' => $priority, 'price' => $price];
        }
        if (!$candidates) return null;
        usort($candidates, static function ($a, $b) { return $b['priority'] <=> $a['priority']; });
        // The broader total wins; an ambiguous broader total cannot be replaced by cheaper tuition.
        return $candidates[0]['price'];
    }

    private function table(array $headers, array $rows): string
    {
        $out = '| ' . implode(' | ', array_map([Text::class, 'markdown'], $headers)) . " |\n|" . str_repeat('---|', count($headers)) . "\n";
        foreach ($rows as $row) {
            $cells = [];
            foreach ($headers as $i => $_) $cells[] = Text::markdown(is_scalar($row[$i] ?? null) ? (string)$row[$i] : '');
            $out .= '| ' . implode(' | ', $cells) . " |\n";
        }
        return $out;
    }

    private function overview(array $query, array $state): array
    {
        if ($query['intent'] === 'compare' && count($query['universities']) < 2) return $this->response('Which two or more universities would you like to compare?', $state, 'clarification');
        $rows = [];
        $sources = [];
        foreach ($query['universities'] as $id) {
            $uni = $this->kb->universities[$id];
            if (!$uni['supported']) continue;
            $rows[] = [$uni['name'], $uni['meta']['location'] ?? 'Not recorded', $uni['meta']['type'] ?? 'Not recorded', implode(', ', $uni['campuses'] ?? []) ?: 'Not recorded', (string)count($uni['programs'])];
            $sources[] = ['type' => 'university','file' => 'university_meta.json / universities.json','title' => $uni['name'],'url' => $this->kb->page($id, 'details')];
        }
        $missing = [];
        foreach ($query['universities'] as $id) if (!$this->kb->universities[$id]['supported']) $missing[] = $this->kb->universities[$id]['name'];
        $notice = $missing ? "\nNo program or fee catalog is available for **" . implode(', ', $missing) . "** in our local data.\n" : '';
        return $this->response($this->table(['University','Location','Type','Campuses','Catalog programs'], $rows) . $notice . "\nTell me the program, study level, and budget to narrow the comparison. The catalog does not establish a universal best university or guarantee visa approval.", $state, $missing ? 'partial' : 'answered', $sources, ['Master fees','Bachelor computer science programs']);
    }

    private function response(string $reply, array $state = [], string $status = 'answered', array $sources = [], array $suggestions = [], ?string $matched = null, ?float $confidence = null): array
    {
        $state = array_filter($this->state($state), static function ($value) { return $value !== [] && $value !== null && $value !== ''; });
        if (($state['subject_mode'] ?? '') === 'all') unset($state['subject_mode']);
        if (($state['offset'] ?? null) === 0) unset($state['offset']);
        if (($state['subject_groups'] ?? []) === [($state['subjects'] ?? [])]) unset($state['subject_groups']);
        if (($state['pending'] ?? '') !== 'subject') unset($state['unknown']);
        if (strlen(json_encode($state, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE)) > 3900) {
            $state = [];
            $reply .= "\n\nThis search had too many filters to retain. Include the university and program again in your next question.";
        }
        $state['version'] = 3;
        $state['knowledge_version'] = $this->kb->version;
        $state['language'] = $this->language;
        if ($this->language === 'bn') $reply = Language::localize($reply);
        $buttons = [['label' => 'Speak with a counselor','url' => 'https://wa.me/601119359497','class' => 'os-wa-btn','icon' => 'fab fa-whatsapp']];
        foreach (array_slice($state['universities'] ?? [], 0, 3) as $id) if ($this->kb->universities[$id]['supported']) $buttons[] = ['label' => strtoupper($id) . ' fees','url' => $this->kb->page($id, 'fees'),'class' => 'os-fee-btn','icon' => 'fas fa-coins'];
        $unique = [];
        foreach ($sources as $source) $unique[$source['file'] . ($source['pointer'] ?? $source['title'])] = $source;
        return ['reply' => $reply, 'context' => $state, 'status' => $status, 'isFallback' => $status !== 'answered',
            'matched_q' => $matched, 'confidence' => $confidence === null ? null : round($confidence, 3),
            'sources' => array_values($unique), 'buttons' => $buttons, 'suggestions' => array_values(array_slice($suggestions, 0, 5)), 'engine' => 'local-retrieval-v3'];
    }
}
