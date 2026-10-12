<?php
namespace OneStep\Chat;

final class Text
{
    public static function normalize(string $text): string
    {
        $text = str_ireplace(['a.p.u', 'ph.d'], ['apu', 'phd'], $text);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = strtr($text, ['’' => "'", '‘' => "'", '–' => '-', '—' => '-', '&' => ' and ']);
        $text = function_exists('mb_strtolower') ? mb_strtolower($text, 'UTF-8') : strtolower($text);
        $text = preg_replace('/[\p{L}]\K[\x{200B}-\x{200D}\x{FEFF}]/u', '', $text);
        $text = preg_replace("/'s\b/u", 's', $text);
        $text = preg_replace('/(?<=\p{L})-(?=\p{L})/u', ' ', $text);
        $text = str_replace(["'", '"'], '', $text);
        $text = preg_replace('/[^\p{L}\p{M}\p{N}%.]+/u', ' ', $text);
        return trim(preg_replace('/\s+/u', ' ', $text));
    }

    public static function canonical(string $text): string
    {
        static $cache = [];
        if (isset($cache[$text])) return $cache[$text];
        $original = $text;
        $text = self::normalize($text);
        static $map, $pattern;
        if ($map === null) {
            $map = [];
            foreach (Lexicon::REPLACEMENTS as $from => $to) $map[self::normalize($from)] = $to;
            uksort($map, static function ($a, $b) { return strlen($b) <=> strlen($a); });
            $pattern = '/(?<![\p{L}\p{N}])(?:' . implode('|', array_map(static function ($v) { return preg_quote($v, '/'); }, array_keys($map))) . ')(?![\p{L}\p{N}])/u';
        }
        // Three bounded passes expand abbreviations and then normalize their subject phrases.
        for ($pass = 0; $pass < 3; $pass++) {
            $next = preg_replace_callback($pattern, static function ($m) use ($map) { return $map[$m[0]]; }, $text);
            if ($next === $text) break;
            $text = $next;
        }
        $result = trim(preg_replace('/\s+/', ' ', $text));
        if (count($cache) < 20000) $cache[$original] = $result;
        return $result;
    }

    public static function tokens(string $text, bool $canonical = true): array
    {
        static $stop;
        if ($stop === null) $stop = array_fill_keys(explode(' ', Lexicon::STOP), true);
        $text = $canonical ? self::canonical($text) : $text;
        preg_match_all('/[\p{L}\p{M}\p{N}]+(?:\.[0-9]+)?%?/u', $text, $m);
        return array_values(array_unique(array_filter($m[0], static function ($t) use ($stop) {
            return !isset($stop[$t]) && strlen($t) > 1;
        })));
    }

    public static function contains(string $text, string $phrase): bool
    {
        return (bool)preg_match('/(?<![\p{L}\p{N}])' . preg_quote($phrase, '/') . '(?![\p{L}\p{N}])/u', $text);
    }

    public static function oneEdit(string $word, string $candidate): bool
    {
        if (abs(strlen($word) - strlen($candidate)) > 1) return false;
        if (levenshtein($word, $candidate) === 1) return true;
        if (strlen($word) !== strlen($candidate)) return false;
        for ($i = 0; $i < strlen($word) - 1; $i++) {
            if ($word[$i] === $candidate[$i]) continue;
            return substr($word, 0, $i) . $word[$i + 1] . $word[$i] . substr($word, $i + 2) === $candidate;
        }
        return false;
    }

    public static function topics(string $text): array
    {
        $found = [];
        foreach (Lexicon::TOPICS as $topic => $phrases) {
            foreach ($phrases as $phrase) {
                if (self::contains($text, $phrase)) { $found[] = $topic; break; }
            }
        }
        return $found;
    }

    public static function levels(string $text): array
    {
        $found = [];
        foreach (Lexicon::LEVELS as $level) if (self::contains($text, $level)) $found[] = $level;
        if (!$found && self::contains($text, 'degree')) $found[] = 'bachelor';
        return $found;
    }

    public static function markdown(string $value): string
    {
        return trim(str_replace(['|', "\r", "\n", '[', ']', '*', '<', '>'], ['/', '', ' ', '(', ')', '', '', ''], strip_tags($value)));
    }
}
