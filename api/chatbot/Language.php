<?php
namespace OneStep\Chat;

/** Local, reviewed domain phrases. This is not machine translation of arbitrary text. */
final class Language
{
    public const PHRASES = [
        'র‍্যাঙ্কিং' => 'ranking', 'র‌্যাঙ্কিং' => 'ranking', 'র্যাঙ্কিং' => 'ranking', 'র‍্যাংকিং' => 'ranking',
        'র‍্যাঙ্ক' => 'rank', 'র্যাঙ্ক' => 'rank', 'র‍্যাংক' => 'rank', 'র‍্যাঙ্কিংয়ে' => 'ranking',
        'রেংকিং' => 'ranking', 'রেঙ্কিং' => 'ranking', 'র‍্যাঙ্কিংয়ের' => 'ranking', 'র‍্যাঙ্কিংয়ের' => 'ranking',
        'বিশ্ব র‍্যাঙ্কিং' => 'world ranking', 'বিশ্বে' => 'world', 'বিশ্ব' => 'world', 'এশিয়ায়' => 'asia', 'এশিয়ায়' => 'asia',
        'এশিয়া' => 'asia', 'এশিয়া' => 'asia', 'কিউএস' => 'qs', 'কিউ এস' => 'qs', 'মালয়েশিয়ায়' => 'in malaysia', 'মালয়েশিয়ায়' => 'in malaysia',
        'জাতীয়' => 'national', 'জাতীয়' => 'national', 'তুলনা' => 'compare', 'অবস্থান' => 'ranking',
        'র‍্যাঙ্ক কত' => 'what rank', 'র‍্যাংকিং কত' => 'what ranking', 'ranking koto' => 'what ranking', 'rank koto' => 'what rank',
        'admission fee koto hobe' => 'how much admission fee', 'admission fee koto' => 'how much admission fee',
        'registration fee koto' => 'how much registration fee', 'visa fee koto' => 'how much visa fee',
        'এক বছরের খরচ' => 'first year cost', 'ওটার' => 'that program', 'ওটা' => 'that program', 'এর' => 'of',
        'প্রথম বছর' => 'first year', 'এক বছরে' => 'for one year', 'বছরের' => 'year', 'মাসের' => 'month',
        'দ্বিতীয় বছরের' => 'second year', 'দ্বিতীয় বছরের' => 'second year', 'তৃতীয় বছরের' => 'third year', 'তৃতীয় বছরে' => 'third year', 'তৃতীয় বছরে' => 'third year',
        'বাংলা পারেন' => 'understand bangla', 'নিতে চাই' => 'want', 'করব' => 'study',
        'bochor' => 'year', 'bosor' => 'year', 'bosorer' => 'year', 'bochorer' => 'year',
        'segi er' => 'segi', 'cityu er' => 'cityu', 'apu er' => 'apu', 'shudhu' => 'only', 'bad diye' => 'except',
        'চীন' => 'china', 'ভারতীয়' => 'indian', 'ভারত' => 'india', 'ইরান' => 'iran', 'সুদান' => 'sudan',
        'পার্সোনাল বন্ড' => 'personal bond', 'পারসোনাল বন্ড' => 'personal bond', 'বন্ড' => 'personal bond',
        'ইন্স্যুরেন্স' => 'insurance', 'ইনস্যুরেন্স' => 'insurance', 'বীমা' => 'insurance', 'বিমা' => 'insurance',
        'ফেরত' => 'refund', 'ব্যাংক ব্যালেন্স' => 'bank balance', 'শুধু' => 'only', 'পাবো' => 'can get', 'পাব' => 'can get',
        'হসপিটালিটি' => 'hospitality', 'বছরের জন্য' => 'per year', 'এমবিএর' => 'mba',
        'সিটি ইউনিভার্সিটি' => 'city university', 'সিটি বিশ্ববিদ্যালয়' => 'city university', 'সিটি বিশ্ববিদ্যালয়' => 'city university',
        'সিটি ইউ' => 'cityu', 'এ পি ইউ' => 'apu', 'এপিইউ' => 'apu', 'এপিইউতে' => 'at apu', 'এপিইউ তে' => 'at apu',
        'সেগি ইউনিভার্সিটি' => 'segi university', 'সেগি' => 'segi', 'টেইলরস' => 'taylors', 'টেইলর্স' => 'taylors',
        'ইউসিএসআই' => 'ucsi', 'ইউটিএম' => 'utm', 'এমএমইউ' => 'mmu', 'বিএসি' => 'bac', 'বিএসি কলেজ' => 'bac college',
        'ইউনিকেএল' => 'unikl', 'আইআইইউএম' => 'iium', 'বাংলাদেশি' => 'bangladeshi', 'বাংলাদেশী' => 'bangladeshi', 'বাংলাদেশ' => 'bangladesh',
        'মালয়েশিয়াতে' => 'in malaysia', 'মালয়েশিয়াতে' => 'in malaysia', 'মালয়েশিয়ায়' => 'in malaysia', 'মালয়েশিয়ায়' => 'in malaysia',
        'মালয়েশিয়া' => 'malaysia', 'মালয়েশিয়া' => 'malaysia', 'মালেশিয়া' => 'malaysia',
        'কুয়ালালামপুর' => 'kuala lumpur', 'কুয়ালালামপুর' => 'kuala lumpur',
        'এক বছরের' => 'first year', 'এক বছর' => 'one year', 'প্রথম বছরের' => 'first year', 'প্রতি বছর' => 'per year', 'বছরে' => 'per year',
        'বছরের জন্য' => 'for year', 'প্রতি মাসে' => 'per month', 'মাসে' => 'per month', 'মোট খরচ' => 'total cost', 'মোট ফি' => 'total fees',
        'কেমন খরচ হবে' => 'how much cost', 'কত খরচ হবে' => 'how much cost', 'খরচ কত' => 'how much cost',
        'কত টাকা লাগবে' => 'how much cost', 'টাকা লাগবে' => 'cost', 'কত লাগবে' => 'how much', 'খরচ হবে' => 'cost',
        'পড়তে চাই' => 'want to study', 'পড়তে চাই' => 'want to study', 'পড়তে' => 'study', 'পড়তে' => 'study',
        'পড়াশোনা' => 'study', 'পড়াশোনা' => 'study', 'পড়াশুনা' => 'study', 'পড়াশুনা' => 'study',
        'মাস্টার্স' => 'master', 'মাস্টারস' => 'master', 'মাস্টার্সে' => 'master', 'স্নাতকোত্তর' => 'master', 'ব্যাচেলর' => 'bachelor',
        'স্নাতক' => 'bachelor', 'ডিপ্লোমা' => 'diploma', 'ফাউন্ডেশন' => 'foundation', 'পিএইচডি' => 'phd',
        'বিবিএ' => 'bba', 'এমবিএ' => 'mba', 'আইটি' => 'IT', 'কম্পিউটার সায়েন্স' => 'computer science', 'কম্পিউটার সায়েন্স' => 'computer science',
        'কম্পিউটার বিজ্ঞান' => 'computer science', 'হোটেল ম্যানেজমেন্ট' => 'hotel management', 'ইঞ্জিনিয়ারিং' => 'engineering',
        'ইঞ্জিনিয়ারিং' => 'engineering', 'ব্যবসায় প্রশাসন' => 'business administration', 'স্কলারশিপ' => 'scholarship', 'বৃত্তি' => 'scholarship',
        'কম খরচে' => 'affordable', 'সবচেয়ে ভালো' => 'best', 'সবচেয়ে ভালো' => 'best', 'সবচেয়ে সস্তা' => 'cheapest',
        'সেরা' => 'best', 'ভালো বিশ্ববিদ্যালয়' => 'best university', 'ভালো বিশ্ববিদ্যালয়' => 'best university',
        'কোনটা ভালো' => 'which is best', 'কোনটি ভালো' => 'which is best', 'কোনটা' => 'which', 'কোনটি' => 'which',
        'ইউনিভার্সিটিতে' => 'at university', 'ইউনিভার্সিটি' => 'university', 'বিশ্ববিদ্যালয়ে' => 'at university', 'বিশ্ববিদ্যালয়ে' => 'at university',
        'বিশ্ববিদ্যালয়' => 'university', 'বিশ্ববিদ্যালয়' => 'university', 'কলেজ' => 'college',
        'ইএমজিএস' => 'emgs', 'ই এম জি এস' => 'emgs', 'ভিসার' => 'visa', 'ভিসা' => 'visa', 'পাসপোর্টের' => 'passport', 'পাসপোর্ট' => 'passport',
        'সব পৃষ্ঠা' => 'all pages', 'সব পেজ' => 'all pages', 'মেয়াদ' => 'validity', 'মেয়াদ' => 'validity', 'নবায়ন' => 'renewal', 'নবায়ন' => 'renewal',
        'আটকে আছে' => 'stuck', 'স্ট্যাটাস' => 'status', 'ছবি' => 'photo', 'সাইজ' => 'size', 'সাদা ব্যাকগ্রাউন্ড' => 'white background',
        'ডকুমেন্ট' => 'documents', 'কাগজপত্র' => 'documents', 'গ্র্যাজুয়েট পাস' => 'graduate pass', 'গ্রাজুয়েট পাস' => 'graduate pass',
        'টাকা ফেরত' => 'refund', 'রিফান্ড' => 'refund', 'আইইএলটিএস' => 'ielts', 'আইএলটিএস' => 'ielts',
        'আইইএলটিএস ছাড়া' => 'without ielts', 'আইইএলটিএস ছাড়া' => 'without ielts', 'ছাড়া' => 'without', 'ছাড়া' => 'without',
        'পার্ট টাইম কাজ' => 'part time work', 'পার্টটাইম কাজ' => 'part time work', 'স্টাডি গ্যাপ' => 'study gap',
        'থাকার খরচ' => 'living cost', 'হোস্টেল' => 'hostel', 'বাসা ভাড়া' => 'room rent', 'ভর্তি ফি' => 'admission fee', 'ভর্তি' => 'admission',
        'বাজেট' => 'budget', 'রিঙ্গিত' => 'rm', 'টাকা' => 'taka', 'খরচ' => 'cost', 'ফিস' => 'fees', 'ফি' => 'fees',
        'কেমন আছেন' => 'hello', 'কেমন আছো' => 'hello', 'বাংলা বোঝেন' => 'do you understand bangla',
        'বাংলা বুঝেন' => 'do you understand bangla', 'ধন্যবাদ' => 'thanks', 'হ্যালো' => 'hello', 'হাই' => 'hi',
        'তাদের' => 'their', 'ওদের' => 'their', 'সেটা' => 'that', 'সেখানে' => 'there', 'আর' => 'and', 'এবং' => 'and',
        'না' => 'not', 'বাদে' => 'except', 'নয়' => 'not', 'নয়' => 'not', 'চাই না' => 'do not want',
        'আমার' => 'my', 'আমি' => 'i', 'আপনি' => 'you', 'আমাকে' => 'me', 'বলুন' => 'tell', 'বলেন' => 'tell', 'চাই' => 'want',
        'হবে' => '', 'করতে' => '', 'করে' => '', 'জন্য' => 'for', 'কত' => 'how much', 'কি' => '', 'কী' => 'what', 'তে' => 'at',
        'কেমন' => 'how', 'লাগে' => 'requirement', 'লাগবে' => 'requirement', 'আছে' => 'available', 'বছর' => 'year', 'ভাই' => '', 'ভাইয়া' => '',
        'malaysia te' => 'in malaysia', 'malayasia' => 'malaysia', 'malisia' => 'malaysia', 'malasiya' => 'malaysia', 'malesia' => 'malaysia',
        'bangladesh e' => 'in bangladesh', 'bba complete korechi' => 'completed my bba', 'complete korechi' => 'completed',
        'mba korte chai' => 'want to study mba', 'korte chai' => 'want to study', 'korechi' => 'completed', 'ekhon' => 'now',
        'city te' => 'at cityu', 'city university te' => 'at city university', 'cityu te' => 'at cityu', 'apu te' => 'at apu', 'segi te' => 'at segi',
        'kemon khoroch hobe' => 'how much cost', 'koto khoroch hobe' => 'how much cost', 'khoroch koto' => 'how much cost',
        'khoroc koto' => 'how much cost', 'koto taka lagbe' => 'how much cost', 'fee koto' => 'how much fees', 'fees koto' => 'how much fees',
        'koto hobe' => 'how much', 'porte jabo' => 'want to study', 'porte chai' => 'want to study', 'porbo' => 'study',
        'kon university valo' => 'which university is best', 'best university kunta' => 'best university which', 'konta valo' => 'which is best',
        'sobcheye valo' => 'best', 'sobcheye bhalo' => 'best', 'kom khoroche' => 'affordable', 'kom khoroch' => 'affordable',
        'ek bochor' => 'one year', 'ek bosor' => 'one year', 'proti bochor' => 'per year', 'prothom bochor' => 'first year',
        'ek bosorer' => 'first year', 'ek bochorer' => 'first year', 'mase' => 'per month',
        'taka nai' => 'need scholarship', 'taka nei' => 'need scholarship', 'kemon acho' => 'hello', 'kemon achen' => 'hello',
        'bangla bujhen' => 'understand bangla', 'bangla bojhen' => 'understand bangla', 'ielts chara' => 'without ielts',
        'weekly koto hours kaj korte pare' => 'how many hours per week can students work',
        'koto hours kaj korte pare' => 'how many hours can students work', 'student ra' => 'students', 'kaj korte pare' => 'can work',
        'part-time job kore tuition pay korte parbo' => 'can i pay tuition with part time work',
        'part time job kore tuition pay korte parbo' => 'can i pay tuition with part time work',
        'apply korte counselor er sathe kotha bolbo' => 'speak with counselor',
        'counselor er sathe kotha bolbo' => 'speak with counselor', 'sathe kotha bolbo' => 'speak with counselor',
        'ranking diye ki' => 'can ranking', 'bola jabe' => 'can be called',
        'atkaye ache' => 'stuck', 'atke ache' => 'stuck', 'kaj korte parbo' => 'can work', 'part time kaj' => 'part time work',
        'bhai' => '', 'vaiya' => '', 'bhaiya' => '', 'vai' => '', 'apni' => 'you', 'ami' => 'i', 'amar' => 'my',
        'ki korbo' => 'what can i do', 'kunta' => 'which', 'konta' => 'which', 'kothay' => 'where', 'koto' => 'how much',
        'khoroch' => 'cost', 'khoroc' => 'cost', 'valo' => 'best', 'bhalo' => 'best', 'lagbe' => 'requirement',
        'porte' => 'study', 'pora' => 'study', 'porashona' => 'study', 'ache' => 'available', 'hobe' => '', 'chara' => 'without', 'chai' => 'want',
        'korte' => '', 'kore' => '', 'parbo' => 'can i', 'pare' => 'can', 'diye' => 'with', 'jabe' => '', 'bolbo' => 'speak', 'sathe' => 'with',
        'bolen' => 'tell', 'janan' => 'tell',
        'tader' => 'their', 'oikhane' => 'there', 'sekhaney' => 'there', 'jonno' => 'for', 'te' => 'at', 'ki' => '',
    ];

    public static function prepare(string $message, string $previous = 'en'): array
    {
        $language = preg_match('/\p{Bengali}/u', $message) ? 'bn' :
            (preg_match('/\b(?:bhai|vaiya|apni|ami|amar|kunta|konta|koto|khoroch|khoroc|porte|bochor|bosor|mase|taka nai|bangla|malaysia te|ache|hobe|chara|chai|korechi|ekhon|kore|korte|parbo|pare|diye|jabe|bolbo|sathe|student ra|er)\b/i', $message) ? 'bn' : 'en');
        if ($language === 'en' && str_word_count($message) <= 5 && $previous === 'bn') $language = 'bn';
        $message = strtr($message, array_combine(preg_split('//u', '০১২৩৪৫৬৭৮৯', -1, PREG_SPLIT_NO_EMPTY), str_split('0123456789')));
        $message = str_replace('।', '?', $message);
        $map = self::PHRASES;
        uksort($map, static function ($a, $b) { return strlen($b) <=> strlen($a); });
        $pattern = '/(?<![\p{L}\p{M}\p{N}])(?:' . implode('|', array_map(static function ($s) { return preg_quote($s, '/'); }, array_keys($map))) . ')(?![\p{L}\p{M}\p{N}])/iu';
        $message = preg_replace_callback($pattern, static function ($m) use ($map) { return $map[strtolower($m[0])] ?? $m[0]; }, $message);
        return ['text' => trim(preg_replace('/[^\S\r\n]+/u', ' ', $message)), 'language' => $language];
    }

    public static function localize(string $text): string
    {
        $text = strtr($text, [
            'Hello! I can help you find programs, check published fees, compare universities, and search our student FAQs.' => 'হ্যালো! প্রোগ্রাম খোঁজা, সংরক্ষিত ফি দেখা, বিশ্ববিদ্যালয় তুলনা ও শিক্ষার্থীদের প্রশ্নের উত্তর পেতে সাহায্য করতে পারি।',
            'I could not match this part to a program or supported filter:' => 'এই অংশটি কোনো প্রোগ্রাম বা সমর্থিত শর্তের সঙ্গে মেলাতে পারিনি:',
            'Please give the program name or rephrase that condition so I do not ignore it.' => 'প্রোগ্রামের নাম দিন বা শর্তটি অন্যভাবে বলুন, যাতে সেটি বাদ না পড়ে।',
            'You can [speak with a One-Step counselor](https://wa.me/601119359497).' => '[One-Step কাউন্সেলরের সঙ্গে কথা বলতে পারেন](https://wa.me/601119359497)।',
            'These are the **published local fee entries** matching your request. Amounts keep the original labels and conditions.' => 'আপনার প্রশ্নের সঙ্গে মিলে এমন **সংরক্ষিত ফি-এর তথ্য** নিচে দেওয়া হলো। মূল খরচের নাম ও শর্ত রাখা হয়েছে।',
            'Here are matching entries from our local catalog.' => 'আমাদের সংরক্ষিত তালিকা থেকে মিলে এমন প্রোগ্রামগুলো নিচে দেওয়া হলো।',
            'Which program or study level should I check? Fees differ by program, campus, and student category.' => 'কোন প্রোগ্রাম বা শিক্ষাস্তরের ফি জানতে চান? প্রোগ্রাম, ক্যাম্পাস ও শিক্ষার্থীর ধরন অনুযায়ী ফি আলাদা।',
            'Which university and study level or program do you mean? For example, "APU master fees" or "computer science bachelor programs".' => 'কোন বিশ্ববিদ্যালয় এবং কোন প্রোগ্রাম বা শিক্ষাস্তর জানতে চান? যেমন: “APU master fees” বা “সিটি ইউনিভার্সিটি মাস্টারস ফি”।',
            'I found related FAQs, but I am not sure which answers your question. Which one did you mean?' => 'কয়েকটি সম্পর্কিত প্রশ্ন পাওয়া গেছে। আপনার প্রশ্নটি কোনটির সঙ্গে মিলে?',
            'I could not find a reliable answer in our local information. Please include the university and the specific issue, or [ask a One-Step counselor](https://wa.me/601119359497).' => 'সংরক্ষিত তথ্যে নির্ভরযোগ্য উত্তর পাওয়া যায়নি। বিশ্ববিদ্যালয় ও বিষয়টি একটু স্পষ্ট করে বলুন, অথবা [One-Step কাউন্সেলরের সঙ্গে কথা বলুন](https://wa.me/601119359497)।',
            'The local data has no verified effective date; confirm the current amount and eligibility for any discount before applying.' => 'এই ফি কোন তারিখ থেকে কার্যকর তা যাচাই করা নেই। আবেদন করার আগে বর্তমান ফি ও ছাড়ের যোগ্যতা নিশ্চিত করুন।',
            'Published conditions:' => 'প্রকাশিত শর্ত:', 'Source: fee table' => 'সূত্র: ফি তালিকা', 'Source: program details' => 'সূত্র: প্রোগ্রামের তথ্য',
            '**Duration:**' => '**মেয়াদ:**', '**Total Tuition Fees:**' => '**মোট টিউশন ফি:**', '**Total Fee (MYR):**' => '**মোট ফি (MYR):**',
            '**Year 1 (MYR):**' => '**প্রথম বছরের ফি (MYR):**', '**Year 1:**' => '**প্রথম বছর:**', '**TOTAL:**' => '**মোট:**',
            '**Published Fees:**' => '**প্রকাশিত ফি:**', '**Tuition Fees Special Scholarship:**' => '**বিশেষ স্কলারশিপসহ টিউশন ফি:**',
            'Only the recorded first-year/annual charges are shown below; no total has been divided by the course duration.' => 'নিচে শুধু তালিকায় থাকা প্রথম বছরের বা বার্ষিক খরচ দেখানো হলো। কোর্সের মোট ফি ভাগ করে বার্ষিক খরচ বানানো হয়নি।',
            'A single best university cannot be established from this catalog. Here are matching options to compare by budget, campus, and entry requirements.' => 'এই তালিকা থেকে একটিকে সবার জন্য সেরা বলা যায় না। বাজেট, ক্যাম্পাস ও ভর্তির শর্ত অনুযায়ী তুলনার জন্য কয়েকটি প্রোগ্রাম নিচে দেওয়া হলো।',
            'Which of these universities would you like to focus on? Reply with its name or option number.' => 'কোন বিশ্ববিদ্যালয়ের বিস্তারিত জানতে চান? নাম বা অপশন নম্বর লিখুন।',
            'Duration is not recorded for this entry.' => 'এই প্রোগ্রামের নির্ভরযোগ্য মেয়াদ সংরক্ষিত নেই।',
            'First-year or annual fees are not recorded for this entry. The published total is not an annual quote.' => 'এই প্রোগ্রামের প্রথম বছরের বা বার্ষিক ফি সংরক্ষিত নেই। প্রকাশিত মোট ফি বার্ষিক ফি নয়।',
        ]);
        $text = preg_replace('/Showing (\d+) of (\d+) matching entries\./', 'মোট $2টি মিলের মধ্যে $1টি দেখানো হচ্ছে।', $text);
        return $text;
    }
}
