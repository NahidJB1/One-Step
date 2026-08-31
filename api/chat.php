<?php
// Start output buffering immediately to catch rogue warnings
ob_start();


  header('Content-Type: application/json');

header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Get user input
$input = file_get_contents('php://input');
$data = json_decode($input, true);
$message = $data['message'] ?? '';
$context = $data['context'] ?? []; // Phase 4: Context Object
$history = $data['history'] ?? [];

if (empty($message)) {
    echo json_encode(['error' => 'Message is empty']);
    exit();
}

// 2. Load Local Knowledge Base
$universitiesFile = __DIR__ . '/../universities.json';
$faqsFile = __DIR__ . '/../myfaqs.json';
$feesDataFile = __DIR__ . '/../data/fees_data.json';

ini_set('display_errors', 0);

$universities = file_exists($universitiesFile) ? json_decode(file_get_contents($universitiesFile), true) : [];
$faqs = file_exists($faqsFile) ? json_decode(file_get_contents($faqsFile), true) : [];
$feesData = file_exists($feesDataFile) ? json_decode(file_get_contents($feesDataFile), true) : [];

$msg = strtolower(trim($message));
$reply = "";
$isFallback = false;

// PHASE 3: Explicit Meta Intents
$wordCount = str_word_count($msg);

if ($wordCount <= 8 && preg_match('/\b(hi|hello|hey|greetings|good morning|good afternoon)\b/i', $msg)) {
    $reply = "Hello there! I'm the One-Step assistant. You can ask me about **specific university fees** (e.g., 'City University masters fees'), **destinations** (e.g., 'Study in Finland'), or general FAQs!";
    ob_clean();
    echo json_encode(['reply' => $reply]);
    exit();
}
if ($wordCount <= 8 && preg_match('/\b(thank you|thanks|thx|tq|appreciate)\b/i', $msg)) {
    $reply = "You're very welcome! Let me know if you need help with anything else.";
    ob_clean();
    echo json_encode(['reply' => $reply]);
    exit();
}
if ($wordCount <= 8 && preg_match('/\b(bye|goodbye|see ya|cya)\b/i', $msg)) {
    $reply = "Goodbye! Have a great day ahead.";
    ob_clean();
    echo json_encode(['reply' => $reply]);
    exit();
}
if ($wordCount <= 12 && preg_match('/\b(human|person|counselor|agent|real|whatsapp|contact)\b/i', $msg)) {
    $reply = "Would you like to speak to a real counselor? [Click here to chat with us on WhatsApp](https://wa.me/601119359497)!";
    ob_clean();
    echo json_encode(['reply' => $reply]);
    exit();
}

// Handle "cheapest", "best", "compare"
// Alias Maps (Phase 1 & Phase 2 Setup)
$aliasMap = [
    'city university' => ['city university malaysia', 'city u', 'city uni', 'city university'],
    'cybernetics' => ['cybernetics international college of technology', 'cybernetics', 'cict'],
    'alfa' => ['alfa university college', 'alfa', 'alfa college'],
    'geomatika' => ['geomatika university college', 'geomatika', 'guc'],
    'kuala lumpur university' => ['kuala lumpur university of science and technology', 'kuala lumpur university', 'klust'],
    'mahsa' => ['mahsa university', 'mahsa'],
    'ucmi' => ['university college maiwp international', 'ucmi', 'maiwp'],
    'unimy' => ['unimy', 'university malaysia of computer science'],
    'amu' => ['asia metropolitan university', 'amu'],
    'segi' => ['segi university', 'segi'],
    'taylors' => ['taylor', 'taylors', 'taylors university', 'taylors u', 'taylor university'],
    'apu' => ['apu', 'asia pacific university', 'a.p.u', 'a p u', 'asia pacific'],
    'ucsi' => ['ucsi', 'ucsi university', 'university of cheras', 'ucsiu'],
    'utm' => ['utm', 'universiti teknologi malaysia', 'universiti teknology malaysia'],
    'um' => ['um', 'universiti malaya', 'university of malaya'],
    'unikl' => ['unikl', 'universiti kuala lumpur', 'uni kl'],
    'bac' => ['bac', 'bac education', 'bac education group'],
    'unirazak' => ['unirazak', 'universiti tun abdul razak']
];

// Phase 2 Helper: Fuzzy String Matching (Levenshtein)
function isFuzzyMatch($text, $wordArray, $maxDistance = 2) {
    $textWords = explode(' ', strtolower(preg_replace('/[^a-z0-9\s]/', '', $text)));
    foreach ($textWords as $tw) {
        foreach ($wordArray as $target) {
            if (strlen($tw) > 3 && levenshtein($tw, strtolower($target)) <= $maxDistance) {
                return true;
            }
        }
    }
    foreach ($wordArray as $target) {
        if (strpos($text, strtolower($target)) !== false) return true;
    }
    return false;
}

// Helper function to extract universities
function findUniversitiesInText($text, $universities, $feesData, $aliasMap) {
    $foundUnis = [];
    $foundFees = [];
    $matchedKey = null;
    
    foreach ($aliasMap as $key => $aliases) {
        if (isFuzzyMatch($text, $aliases, 1)) {
            $matchedKey = $key;
            break;
        }
    }
    
    if (is_array($universities)) {
        foreach ($universities as $uni) {
            if (!is_array($uni) || !isset($uni['name'])) continue;
            $uniName = strtolower($uni['name']);
            $cleanTitle = trim(str_replace(['university', 'college', 'malaysia', 'international', 'institute', 'of', 'technology', 'science'], '', $uniName));
            if (strpos($text, $uniName) !== false || (strlen($cleanTitle) > 3 && strpos($text, $cleanTitle) !== false) || ($matchedKey && strpos(strtolower($uniName), $matchedKey) !== false)) {
                $foundUnis[] = $uni;
            }
        }
    }
    
    if (is_array($feesData)) {
        foreach ($feesData as $key => $feeInfo) {
            if (!is_array($feeInfo)) continue;
            $feeTitle = strtolower($feeInfo['title'] ?? (is_string($key) ? $key : ''));
            if (empty($feeTitle)) continue;
            $cleanKey = str_replace('-', ' ', strtolower($key));
            $cleanTitle = trim(str_replace(['university', 'college', 'malaysia', 'international', 'institute', 'of', 'technology', 'science'], '', $feeTitle));
            
            if (strpos($text, $feeTitle) !== false || strpos($text, $cleanKey) !== false || (strlen($cleanTitle) > 3 && strpos($text, $cleanTitle) !== false) || ($matchedKey && strpos(strtolower($feeTitle), $matchedKey) !== false)) {
                $foundFees[] = $feeInfo;
            }
        }
    }
    return [$foundUnis, $foundFees];
}

list($relevantUnis, $relevantFees) = findUniversitiesInText($msg, $universities, $feesData, $aliasMap);

if (empty($relevantUnis) && empty($relevantFees)) {
    if (!empty($context['last_university'])) {
        // Only carry context forward if this looks like a follow-up about fees/programs
        $followupKeywords = ['fee', 'cost', 'price', 'master', 'bachelor', 'phd', 'diploma', 'program', 'course', 'engineering', 'science', 'business', 'how much', 'tuition'];
        $isFollowup = false;
        foreach ($followupKeywords as $fk) {
            if (strpos($msg, $fk) !== false) { $isFollowup = true; break; }
        }
        if ($isFollowup) {
            list($relevantUnis, $relevantFees) = findUniversitiesInText($context['last_university'], $universities, $feesData, $aliasMap);
        }
    }
}

if (!empty($relevantFees)) {
    $context['last_university'] = $relevantFees[0]['title'];
} elseif (!empty($relevantUnis)) {
    $context['last_university'] = $relevantUnis[0]['name'];
}

$wantsFees = preg_match('/fee|cost|price|tuition|how much|pay/i', $msg);
$wantsPrograms = preg_match('/\b(subject|subjects|course|courses|program|programs|available|offer|ache|ki ki)\b/i', $msg);
$wantsMasters = preg_match('/master|postgrad|mba|msc|ma\b/i', $msg);
$wantsBachelors = preg_match('/bachelor|undergrad|degree|bsc|ba\b/i', $msg);
$wantsDiploma = preg_match('/diploma/i', $msg);
$wantsPhd = preg_match('/phd|doctorate/i', $msg);

$stopwords = ['how','much','will','it','cost','me','to','study','in','at','for','the','fees','fee','university','college','master','masters','bachelor','bachelors','phd','diploma','degree','programs','program','course','courses','malaysia','international','institute','of','and','about','what','is','are','can','you','tell','show','me','i','want','know','subject','subjects','available','offer','ache','ki'];
$userWords = array_diff(str_word_count(strtolower($msg), 1), $stopwords);
$subjectKeywords = array_filter($userWords, function($w) { return strlen($w) > 3; });

// 3. Search for Countries
$countriesList = ['china', 'cyprus', 'denmark', 'finland', 'hungary', 'italy', 'norway', 'spain', 'sweden', 'uzbekistan'];
$matchedCountry = false;
foreach ($countriesList as $country) {
    if (strpos($msg, $country) !== false || isFuzzyMatch($msg, [$country], 1)) {
        $matchedCountry = ucfirst($country);
        $countryFile = __DIR__ . "/../countries/$country.html";
        if (file_exists($countryFile)) {
            $html = file_get_contents($countryFile);
            // BUGFIX: Remove CSS and Scripts before stripping tags!
            $html = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', '', $html);
            $html = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $html);
            
            $text = strip_tags($html);
            $text = preg_replace('/\s+/', ' ', $text);
            $reply .= "**Study in " . $matchedCountry . ":**\n" . trim(substr($text, 0, 400)) . "...\n\n[Click here to read more about " . $matchedCountry . "](../countries/$country.html)\n\n";
        }
    }
}

// 4. Search for University Fees
if (!empty($relevantFees) && ($wantsFees || $wantsPrograms || $wantsMasters || $wantsBachelors || $wantsDiploma || $wantsPhd || !empty($subjectKeywords))) {
    foreach ($relevantFees as $feeInfo) {
        $title = $feeInfo['title'] ?? 'University';
        
        $foundCategory = false;
        $uniReply = "";
          $globalProgramLimit = 0;
          
          if (isset($feeInfo['categories'])) {
            foreach ($feeInfo['categories'] as $cat) {
                $catName = strtolower($cat['category_name'] ?? '');
                
                if ($wantsMasters && strpos($catName, 'master') === false && strpos($catName, 'postgrad') === false) continue;
                if ($wantsBachelors && strpos($catName, 'bachelor') === false && strpos($catName, 'degree') === false && strpos($catName, 'undergrad') === false) continue;
                if ($wantsDiploma && strpos($catName, 'diploma') === false) continue;
                if ($wantsPhd && strpos($catName, 'phd') === false && strpos($catName, 'doctor') === false) continue;
                
                if (isset($cat['table']['headers']) && isset($cat['table']['rows'])) {
                    $headers = $cat['table']['headers'];
                    $rows = $cat['table']['rows'];
                    
                    $pIdx = 1; $dIdx = 2; $fIdx = count($headers) - 1;
                    foreach ($headers as $i => $h) {
                        $lh = strtolower($h);
                        if (strpos($lh, 'program') !== false || strpos($lh, 'course') !== false) $pIdx = $i;
                        if (strpos($lh, 'duration') !== false) $dIdx = $i;
                        if (strpos($lh, 'total') !== false && strpos($lh, 'semester') === false && strpos($lh, 'duration') === false) $fIdx = $i;
                    }

                    $filteredRows = [];
                    foreach ($rows as $row) {
                        $pName = $row[$pIdx] ?? 'Unknown Program';
                        $pNameLower = strtolower($pName);
                        
                        $isMasterProg = preg_match('/master|msc|mba|ma\b/i', $pNameLower);
                        $isBachelorProg = preg_match('/bachelor|bsc|ba\b|degree/i', $pNameLower);
                        $isDiplomaProg = preg_match('/diploma/i', $pNameLower);
                        $isPhdProg = preg_match('/phd|doctor|philosophy/i', $pNameLower);
                        
                        $matchesDegree = true;
                        if ($wantsMasters && !$wantsPhd && $isPhdProg) $matchesDegree = false;
                        if ($wantsMasters && !$wantsBachelors && $isBachelorProg) $matchesDegree = false;
                        if ($wantsMasters && !$wantsDiploma && $isDiplomaProg) $matchesDegree = false;
                        
                        if ($wantsBachelors && !$wantsMasters && $isMasterProg) $matchesDegree = false;
                        if ($wantsBachelors && !$wantsPhd && $isPhdProg) $matchesDegree = false;
                        if ($wantsPhd && !$wantsMasters && $isMasterProg) $matchesDegree = false;
                        
                        if (!$matchesDegree) continue;

                        $matchesSubject = false;
                        if (!empty($subjectKeywords)) {
                            foreach ($subjectKeywords as $kw) {
                                if (preg_match('/\\b' . preg_quote($kw, '/') . '\\b/i', $pNameLower) || (strlen($kw) > 4 && levenshtein($kw, $pNameLower) < 3)) {
                                    $matchesSubject = true;
                                    break;
                                }
                            }
                        }
                        
                        if (empty($subjectKeywords) || $matchesSubject) {
                            $filteredRows[] = $row;
                        }
                    }

                    if (!empty($filteredRows)) {
                        $foundCategory = true;
                        $uniReply .= "\n*" . ($cat['category_name'] ?? 'Programs') . "*\n";
                        
                        foreach ($filteredRows as $row) {
                            if ($globalProgramLimit >= ($wantsPrograms ? 15 : 7)) {
                                $uniReply .= "- *...and more. Contact us for the full list.*\n";
                                break 2;
                            }
                            
                            $pName = $row[$pIdx] ?? 'Unknown Program';
                            $details = [];
                            foreach ($headers as $idx => $headerName) {
                                if (strtolower($headerName) === 'no' || $idx === $pIdx) continue;
                                $val = $row[$idx] ?? '';
                                if (!empty(trim($val))) {
                                    if (strtolower($headerName) === 'total') {
                                        $details[] = "**Total: $val**";
                                    } else {
                                        $details[] = "*$headerName:* $val";
                                    }
                                }
                            }
                            $detailStr = implode(' | ', $details);
                            $uniReply .= "- **$pName**\n  ? " . $detailStr . "\n\n";
                            $globalProgramLimit++;
                        }
                        
                        if (!empty($cat['remarks'])) {
                            $remarksFormatted = str_replace("\n", "\n  > ", trim($cat['remarks']));
                            $uniReply .= "  > **Additional Information / Initial Fees:**\n  > " . $remarksFormatted . "\n\n";
                        }
                    }
                }
            }
        }
        
        // BUGFIX: Only append to $reply if a category was actually found!
        if ($foundCategory) {
            $reply .= "**" . strtoupper($title) . " FEES:**\n" . $uniReply . "\n";
        }
        // Silently skip if no matching category found — do NOT output a confusing fallback message
    }
}


  // 4.5 Compare Universities
  if (preg_match('/\b(compare|vs)\b/i', $msg) && count($relevantUnis) >= 2) {
      $metaFile = __DIR__ . '/../university_meta.json';
      if (file_exists($metaFile)) {
          $meta = json_decode(file_get_contents($metaFile), true);
          
          $uni1 = $relevantUnis[0]['name'];
          $uni2 = $relevantUnis[1]['name'];
          
          $meta1 = $meta[$uni1] ?? null;
          $meta2 = $meta[$uni2] ?? null;
          
          if ($meta1 && $meta2) {
              $reply = "**Comparison: " . $meta1['name'] . " vs " . $meta2['name'] . "**\n\n";
              
              $reply .= "| Features | " . $meta1['name'] . " | " . $meta2['name'] . " |\n";
              $reply .= "|---|---|---|\n";
              $reply .= "| **Location** | " . ($meta1['location'] ?? 'N/A') . " | " . ($meta2['location'] ?? 'N/A') . " |\n";
              $reply .= "| **Type** | " . ($meta1['type'] ?? 'N/A') . " | " . ($meta2['type'] ?? 'N/A') . " |\n";
              $reply .= "| **Rank** | " . ($meta1['rank'] ?? 'N/A') . " | " . ($meta2['rank'] ?? 'N/A') . " |\n";
              $reply .= "| **Popular** | " . ($meta1['popular'] ?? 'N/A') . " | " . ($meta2['popular'] ?? 'N/A') . " |\n";
              $reply .= "| **Fees** | " . ($meta1['bachelorFee'] ?? 'N/A') . " | " . ($meta2['bachelorFee'] ?? 'N/A') . " |\n";
              $reply .= "| **Visa** | " . ($meta1['visa'] ?? 'N/A') . " | " . ($meta2['visa'] ?? 'N/A') . " |\n\n";
              
              $reply .= "*Would you like to know the specific fees for any of their programs? Just ask!*";
          }
      }
  }


        $reply .= "\n*To see tuition fees, ask: 'How much are the fees at $name?'*\n\n";
    }
}


  // 4.6 Visa Success Rate
  if (empty($reply) && preg_match('/\b(visa ratio|visa success|success rate|visa approval rate|visa percentage)\b/i', $msg) && !empty($relevantUnis)) {
      $metaFile = __DIR__ . '/../university_meta.json';
      if (file_exists($metaFile)) {
          $meta = json_decode(file_get_contents($metaFile), true);
          $uniName = $relevantUnis[0]['name'];
          if (isset($meta[$uniName]['visa'])) {
              $reply = "The visa success rate (ratio) for **" . $uniName . "** is extremely high at **" . $meta[$uniName]['visa'] . "**. \n\n*Apply through One-Step to ensure a smooth and successful visa process!*";
          }
      }
  }

// 5. Search FAQs (Enhanced with Scoring & Variations Support)
if (empty($reply) && is_array($faqs)) {
    $bestScore = 0;
    $bestReply = "";
    
    foreach ($faqs as $uniSlug => $faqList) {
        if (!is_array($faqList)) continue;
        foreach ($faqList as $faq) {
            $q = strtolower($faq['q'] ?? '');
            $a = $faq['a'] ?? '';
            
            $questionsToTest = [$q];
            if (!empty($faq['variations']) && is_array($faq['variations'])) {
                foreach ($faq['variations'] as $v) {
                    $questionsToTest[] = strtolower($v);
                }
            }
            
            foreach ($questionsToTest as $testQ) {
                $msgWords = $userWords;
                $matches = 0;
                foreach ($msgWords as $word) {
                    if (strlen($word) > 3 && (strpos($testQ, $word) !== false || levenshtein($word, $testQ) < 3)) {
                        $matches++;
                    }
                }
                
                $requiredMatches = count($msgWords) > 6 ? 3 : 2;
                
                if (strlen($msg) > 10 && strpos($testQ, $msg) !== false) {
                    $matches += 100;
                }
                
                if (strlen($testQ) > 5 && strpos($msg, $testQ) !== false) {
                    $matches += 50;
                }
                
                if ($uniSlug === 'global') { $matches += 10; }
                
                if ($matches >= $requiredMatches && $matches > $bestScore) {
                    $bestScore = $matches;
                    $bestReply = $a;
                }
            }
        }
    }
    
    if ($bestScore > 0) {
        $reply = $bestReply;
    }
}

// 6. Search for General University Info (Fallback if fees not requested OR if fee filtering left it empty)
if (empty($reply) && !empty($relevantUnis)) {
    foreach ($relevantUnis as $uni) {
        $name = $uni['name'] ?? 'University';
        $location = $uni['location'] ?? 'Malaysia';
        $rank = $uni['ranking'] ?? 'N/A';
        $reply .= "**" . strtoupper($name) . "**\nLocation: $location | Ranking: $rank\n";
        if (isset($uni['programs']) && is_array($uni['programs'])) {
            $reply .= "Popular Programs:\n";
            $limit = 0;
            foreach ($uni['programs'] as $prog) {
                if ($limit >= 5) break;
                $reply .= "- " . ($prog['name'] ?? '') . "\n";
                $limit++;
            }
        }

// 7. Ultimate Fallback
if (empty(trim($reply))) {
    $isFallback = true;
    
    $logFile = __DIR__ . '/unmatched_queries.log';
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] User Query: " . $message . "\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND);
    
    $reply = "I'm not quite sure how to answer that yet.\n\nHere are some things you can ask me:\n- *'How much are City University masters fees?'*\n- *'Tell me about studying in Finland'*\n- *'What are the visa requirements?'*";
}

// Append EMGS Tracking Link if applicable
if (!$isFallback && preg_match('/\\bemgs\\b/i', $msg) && preg_match('/\\b(track|check|progress|stuck|status|update)\\b/i', $msg)) {
    if (stripos($reply, 'visa.educationmalaysia.gov.my/emgs/application') === false) {
        $reply .= "\n\n**Check your EMGS status here:** [EMGS Application Tracker](https://visa.educationmalaysia.gov.my/emgs/application/searchForm/?___SID=S)";
    }
}


  $buttons = [];
  if (!empty($relevantFees)) {
      $key = $relevantFees[0]['key'] ?? ''; 
      foreach ($aliasMap as $k => $aliases) {
          if (in_array(strtolower($relevantFees[0]['title']), $aliases)) {
              $key = $k; break;
          }
      }
      if (empty($key)) { 
         $key = strtolower(explode(' ', $relevantFees[0]['title'])[0]);
      }
      if ($key == 'asia') $key = 'apu';
      if ($key == 'city') $key = 'cityu';
      if ($key == 'kuala') $key = 'klust';
      if ($key == 'alfa') $key = 'alfa';
      
      $buttons[] = ['label' => 'Chat with official', 'url' => 'https://wa.me/601119359497', 'class' => 'os-wa-btn', 'icon' => 'fab fa-whatsapp'];
      $buttons[] = ['label' => 'View Full Fees', 'url' => '../Fees_Chart/' . $key . '-fees.html', 'class' => 'os-fee-btn', 'icon' => 'fas fa-coins'];
      $buttons[] = ['label' => 'View Details', 'url' => '../Universities/' . $key . '-details.html', 'class' => 'os-details-btn', 'icon' => 'fas fa-university'];
  } elseif (!empty($relevantUnis)) {
      $key = strtolower(explode(' ', $relevantUnis[0]['name'])[0]);
      if ($key == 'asia') $key = 'apu';
      if ($key == 'city') $key = 'cityu';
      if ($key == 'alfa') $key = 'alfa';
      
      $buttons[] = ['label' => 'Chat with official', 'url' => 'https://wa.me/601119359497', 'class' => 'os-wa-btn', 'icon' => 'fab fa-whatsapp'];
      $buttons[] = ['label' => 'View Full Fees', 'url' => '../Fees_Chart/' . $key . '-fees.html', 'class' => 'os-fee-btn', 'icon' => 'fas fa-coins'];
      $buttons[] = ['label' => 'View Details', 'url' => '../Universities/' . $key . '-details.html', 'class' => 'os-details-btn', 'icon' => 'fas fa-university'];
  }


  if (empty($buttons) && !$isFallback) {
      $buttons[] = ['label' => 'Chat with official', 'url' => 'https://wa.me/601119359497', 'class' => 'os-wa-btn', 'icon' => 'fab fa-whatsapp'];
  }
  
  $suggestions = [
      "Tell me about studying in Finland",
      "How much are City University masters fees?",
      "What are the visa requirements?",
      "Does SEGi have on-campus accommodation?",
      "Can I transfer to another country later?",
      "How safe is the campus?",
      "Is IELTS required?",
      "What is the EMGS process?"
  ];
  shuffle($suggestions);
  $suggestions = array_slice($suggestions, 0, 3);

ob_clean();
header('Content-Type: application/json');
echo json_encode([
    'reply' => trim($reply),
    'context' => $context,
    'isFallback' => $isFallback,
      'buttons' => $buttons,
      'suggestions' => $suggestions
]);
exit();