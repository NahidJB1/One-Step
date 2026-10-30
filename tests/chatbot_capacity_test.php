<?php
require __DIR__ . '/../api/chatbot/bootstrap.php';
use OneStep\Chat\{KnowledgeBase,Counselor,FaqIndex};
set_error_handler(static function ($severity,$message,$file,$line) { if (error_reporting() & $severity) throw new ErrorException($message,0,$severity,$file,$line); return false; });
$root = dirname(__DIR__); $checks = 0;
function verify($ok,$label) { global $checks; if (!$ok) throw new RuntimeException($label); $checks++; }
$kb = new KnowledgeBase($root); $bot = new Counselor($kb);
function ask($q,$context=[]) { global $bot; return $bot->answer($q,$context); }
function has($r,$text) { return strpos($r['reply'],$text) !== false; }
$r=ask('Does MMU accommodation have a swimming pool?');
verify($r['status']==='answered' && has($r,'Swimming Pool') && has($r,'Eclipse'), 'Amenities answered directly');
$r=ask('What is the cheapest room near MMU?');
verify(has($r,'Aspire') && has($r,'360') && has($r,'not a confirmed'), 'Lowest comparable listed rent');
$r=ask('How far is Eclipse Residence from MMU?');
verify(has($r,'Drive: 3 min') && has($r,'teaching campus'), 'Property-specific travel source');
$r=ask('Does that include electricity?', $r['context']);
verify($r['status']==='partial' && has($r,'does not confirm') && has($r,'Eclipse'), 'Property retained and utilities not invented');
$r=ask('What about INTI?', $r['context']);
verify(!isset($r['context']['property']) && !has($r,'Eclipse'), 'Property does not leak across universities');
$r=ask('Can two students share a room near MMU?');
verify($r['status']==='partial' && has($r,'whether two students may share'), 'Missing occupancy explicitly unresolved');
foreach($kb->accommodation as $id=>$data) if(empty($data['rentPeriod'])) {
    $r=ask($kb->universities[$id]['name'].' cheapest room');
    verify($r['status']==='partial' && has($r,'periods are unspecified'), 'No comparison of unspecified rental periods');
}
$r=ask('INTI accommodation and how do I apply?');
verify(has($r,'Bayu') && has($r,'apply?university=inti'), 'Both housing and application answered');
$r=ask('What is different between INTI Nilai and Subang?');
verify(has($r,'Nilai') && has($r,'Subang') && !empty($r['sources']), 'Campus references retrieved');
$r=ask('What facilities does INTI Nilai campus have?');
verify(!has($r,'supported filter') && !empty($r['sources']), 'Facilities uses references, not subject filter');
$r=ask('Which INTI campus teaches business?');
verify(has($r,'course-campus associations') && has($r,'PENANG') && $r['sources'][0]['file']==='universities.json', 'Course-campus catalog lookup');
$r=ask('Tell me about INTI campus life');
verify(has($r,'paragraphs')===false && has($r,'Nilai') && strlen($r['reply'])>500, 'Article paragraphs used');
$r=ask('Does ALFA offer online business administration?');
verify($r['status']==='partial' && has($r,'does **not confirm online mode**') && has($r,'ODL'), 'ODL related matches do not confirm online mode');
$r=ask('ALFA ODL bachelor business administration courses');
verify(has($r,'ODL') && !has($r,'No matching'), 'Explicit ODL lookup');
$r=ask('APU computer science bachelor fees for January 2027 intake');
verify($r['status']==='partial' && has($r,'January 2027') && !has($r,'supported filter') && has($r,'not confirmation'), 'Intake recognized without inventing availability');
verify(($r['context']['intake']['year']??null)===2027, 'Intake persists as validated context');
$r=ask('May I know APU master fees?');
verify(!isset($r['context']['intake']), 'Polite May is not an intake month');
$r=ask('MMU bachelor computer science first year fees');
$r=ask('How much altogether including registration?', $r['context']);
verify($r['status']==='partial' && has($r,'not added them together') && has($r,'Registration Fee'), 'All-inclusive follow-up preserves separate charges');
$r=ask('Which university has the cheapest MBA including visa and living costs?');
verify($r['status']==='partial' && has($r,'**Tuition references**') && has($r,'**Living-cost reference**') && has($r,'**Visa charges**'), 'All package-cost topics acknowledged without invented total');
// Compiled and direct-source paths must have identical data and replies.
verify(!empty($kb->cachedIndex), 'Compiled index loaded');
$direct = new KnowledgeBase($root,false);
foreach(KnowledgeBase::snapshotFields() as $field) verify($kb->$field===$direct->$field, 'Cached data equals sources: '.$field);
verify((new FaqIndex($kb))->snapshot()===(new FaqIndex($direct))->snapshot(), 'Cached search index equals freshly built index');
$directBot=new Counselor($direct);
foreach([['APU master fees','What about SEGi?'],['INTI accommodation','What about MMU?'],['MMU computer science first year fees','Bachelor'],['How do I apply to APU?'],['What is different between INTI Nilai and Subang?'],['My EMGS is stuck at 32%']] as $turns){
    $a=[];$b=[];
    foreach($turns as $q){$ra=$bot->answer($q,$a);$rb=$directBot->answer($q,$b);verify($ra===$rb,'Cache preserves reply: '.$q);$a=$ra['context'];$b=$rb['context'];}
}
// Conflicting aliases cannot overrule an exact primary question; real primary conflicts remain visible.
$sample=clone $direct; $sample->cachedIndex=[];
$sample->faqs=[
 'a'=>['id'=>'a','scope'=>'apu','q'=>'What are the popular majors at APU?','a'=>'Answer A','variants'=>['What is APU known for?']],
 'b'=>['id'=>'b','scope'=>'apu','q'=>'What is APU known for?','a'=>'Answer B','variants'=>['What is APU known for?']]
];
$index=new FaqIndex($sample); $matches=$index->search('What is APU known for?',['apu']);
verify(count($matches)===1 && $matches[0]['id']==='b','Exact primary beats an ambiguous alias');
$sample->faqs['a']['q']='What is APU known for?';
verify(count((new FaqIndex($sample))->search('What is APU known for?',['apu']))===2,'Different answers to same primary question still conflict');
// A changed source or damaged compiled payload must use the original loader, never stale answers.
$temp = sys_get_temp_dir() . '/onestep-chat-cache-' . bin2hex(random_bytes(6));
$copied = [];
mkdir($temp); mkdir($temp . '/data'); mkdir($temp . '/Universities');
try {
    $files = ['universities.json','university_meta.json','myfaqs.json'];
    foreach (['fees_data','university_rankings','emgs_knowledge','counselor_knowledge','university_accommodation','university_articles'] as $name) $files[]='data/'.$name.'.json';
    foreach (glob($root.'/Universities/*-university.html') as $file) $files[]='Universities/'.basename($file);
    foreach ($files as $file) { copy($root.'/'.$file,$temp.'/'.$file); $copied[]=$temp.'/'.$file; }
    $snapshot=json_decode(file_get_contents($root.'/data/chatbot_index.json'),true);
    $snapshot['fingerprint']=KnowledgeBase::fingerprint($temp);
    $cache=$temp.'/data/chatbot_index.json'; $copied[]=$cache;
    file_put_contents($cache,json_encode($snapshot));
    verify((bool)(new KnowledgeBase($temp))->cachedIndex,'Fixture cache initially valid');
    file_put_contents($temp.'/myfaqs.json',"\n",FILE_APPEND);
    $changed=new KnowledgeBase($temp);
    verify(!$changed->cachedIndex && $changed->faqs===$direct->faqs,'Source change bypasses stale index');
    $snapshot['fingerprint']=KnowledgeBase::fingerprint($temp); unset($snapshot['index']['postings']);
    file_put_contents($cache,json_encode($snapshot));
    verify(!(new KnowledgeBase($temp))->cachedIndex,'Incomplete index falls back safely');
} finally {
    foreach($copied as $file) if(is_file($file)) unlink($file);
    rmdir($temp.'/Universities'); rmdir($temp.'/data'); rmdir($temp);
}
echo "$checks chatbot capacity checks passed.\n";
