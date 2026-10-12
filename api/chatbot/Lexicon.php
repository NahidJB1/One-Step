<?php
namespace OneStep\Chat;

/** Reviewed language mappings, separate from routing and the factual JSON data. */
final class Lexicon
{
    public const UNIVERSITIES = [
        'cityu' => ['cityu', 'city university', 'city university malaysia', 'city u', 'city uni'],
        'apu' => ['asia pacific', 'asia pacific university', 'a p u', 'apu'],
        'ucmi' => ['ucmi', 'maiwp', 'university college maiwp international'],
        'cybernetics' => ['cybernetics', 'cyber netics', 'ktac', 'cict'],
        'genovasi' => ['genovasi'], 'bac' => ['bac', 'brickfields asia college'],
        'alfa' => ['alfa'], 'inti' => ['inti'],
        'klust' => ['klust', 'iukl', 'kuala lumpur university of science and technology'],
        'cyberjaya' => ['university of cyberjaya', 'cyberjaya university', 'uoc'],
        'segi' => ['segi', 'segi university'], 'kings' => ['kings university', 'kings college', 'kings'],
        'binary' => ['binary university', 'binary'], 'taylors' => ['taylors', 'taylor', 'taylors u'],
        'unirazak' => ['unirazak', 'universiti tun abdul razak'], 'vision' => ['vision university college'],
        'amu' => ['amu', 'asia metropolitan'], 'help' => ['help university', 'help college'],
        'icms' => ['icms'], 'limkokwing' => ['limkokwing'], 'lincoln' => ['lincoln'],
        'mmu' => ['mmu', 'multimedia university'], 'ucsi' => ['ucsi', 'ucsiu'],
        'unikl' => ['unikl', 'uni kl', 'universiti kuala lumpur'],
        'umw' => ['iumw', 'umw', 'university malaya wales', 'international university of malaya wales'],
        'iium' => ['iium', 'uia', 'international islamic university malaysia'],
        'uow' => ['uow', 'university of wollongong'], 'upm' => ['upm', 'universiti putra malaysia'],
        'utem' => ['utem', 'universiti teknikal malaysia melaka'],
        'utm' => ['utm', 'universiti teknologi malaysia'],
        // Recognize these explicitly even though no catalog is currently supplied.
        'um' => ['universiti malaya', 'university of malaya', 'um university'],
        'mahsa' => ['mahsa'], 'unimy' => ['unimy'], 'tarc' => ['tarc', 'tar umt', 'utar'],
    ];

    public const REPLACEMENTS = [
        'a.p.u' => 'apu', 'ph.d' => 'phd', "can't" => 'cannot', "don't" => 'do not',
        "doesn't" => 'does not', "isn't" => 'is not', "haven't" => 'have not',
        'undergraduate' => 'bachelor', 'undergrad' => 'bachelor', 'bachelors' => 'bachelor',
        'masters' => 'master', 'mastres' => 'master', 'masteres' => 'master', 'degrees' => 'degree',
        'doctoral' => 'phd', 'doctorate' => 'phd', 'doctor of philosophy' => 'phd',
        'programme' => 'program', 'programmes' => 'program', 'programs' => 'program',
        'courses' => 'program', 'course' => 'program', 'universiti' => 'university',
        'fees' => 'fee', 'fes' => 'fee', 'tuition' => 'fee', 'costs' => 'cost',
        'scholarships' => 'scholarship', 'financial aid' => 'scholarship', 'funding' => 'scholarship',
        'dormitory' => 'accommodation', 'dorm' => 'accommodation', 'hostel' => 'accommodation',
        'housing' => 'accommodation', 'accomodation' => 'accommodation',
        'installments' => 'installment', 'instalments' => 'installment', 'instalment' => 'installment',
        'requirements' => 'requirement', 'required' => 'requirement', 'requires' => 'requirement', 'require' => 'requirement', 'documents' => 'document', 'rejected' => 'reject',
        'rejection' => 'reject', 'refunded' => 'refund', 'refunds' => 'refund',
        'cancelled' => 'cancel', 'canceled' => 'cancel', 'cancellation' => 'cancel',
        'approved' => 'approval', 'tracking' => 'track', 'progress' => 'status',
        'delayed' => 'delay', 'stuck' => 'delay', 'apply' => 'application', 'applying' => 'application',
        'admissions' => 'admission', 'intakes' => 'intake', 'duration' => 'duration',
        'mgt' => 'management', 'eng' => 'engineering', 'comms' => 'communication',
        'accountancy' => 'accounting', 'bsc' => 'bachelor', 'msc' => 'master',
        'mba' => 'master business administration', 'bba' => 'bachelor business administration', 'bohm' => 'bachelor hotel management',
        'bhm' => 'bachelor hotel management', 'bit' => 'bachelor information technology', 'mbbs' => 'medicine', 'dba' => 'phd business administration',
        'beng' => 'bachelor engineering', 'ba' => 'bachelor', 'bscs' => 'bachelor computer science',
        'b.b.a' => 'bba', 'm.b.a' => 'mba', 'b.o.h.m' => 'bohm', 'i.t' => 'information technology',
        'hotels management' => 'hotel management', 'hospitality management' => 'hotel management', 'hotel management' => 'hospitality',
        'busines' => 'business', 'engneering' => 'engineering', 'enginering' => 'engineering', 'computr' => 'computer',
        'computer sciences' => 'computer science', 'fee structure' => 'fee', 'fee structur' => 'fee',
        'malisia' => 'malaysia', 'malayasia' => 'malaysia', 'malasiya' => 'malaysia',
        'mandatory' => 'requirement', 'post study work visa' => 'graduate pass', 'post study work visas' => 'graduate pass',
        'cs' => 'computer science', 'software eng' => 'software engineering', 'universities' => 'university',
        'cyber security' => 'cybersecurity', 'artificial intelligence' => 'artificialintelligence',
        'ai' => 'artificialintelligence', 'computer science' => 'computing',
        'information technology' => 'informationtechnology', 'business administration' => 'businessadministration',
        'human resources' => 'humanresource', 'human resource' => 'humanresource',
        'full time' => 'fulltime', 'part time' => 'parttime',
        'pls' => 'please', 'plz' => 'please', 'wanna' => 'want', 'uni' => 'university',
    ];

    public const LEVELS = ['foundation', 'certificate', 'diploma', 'bachelor', 'master', 'phd'];

    // A short saved variation cannot erase these conditions from its source question.
    public const FAQ_QUALIFIERS = [
        'sarawak', 'sabah', 'bangladesh', 'bangladeshi', 'pakistan', 'pakistani', 'india', 'indian',
        'china', 'chinese', 'nigeria', 'nigerian', 'tourist', 'graduate pass', 'refund', 'cancel',
        'pregnant', 'tuberculosis', 'hepatitis', 'hiv', 'drug', 'lung scar', 'adhd', 'cannabis',
        'appeal', 'reject', 'expired', 'expire', 'renew', 'renewal', 'sarawak', 'spouse', 'dependent',
    ];

    public const TOPICS = [
        'fees' => ['fee', 'cost', 'price', 'how much', 'expensive', 'cheap', 'cheaper', 'cheapest', 'budget', 'affordable'],
        'programs' => ['program', 'major', 'study', 'studying', 'offer', 'available', 'list', 'degree'],
        'duration' => ['how long', 'duration', 'years to complete', 'length'],
        'intakes' => ['intake', 'start date', 'when can i start', 'semester start'],
        'scholarship' => ['scholarship', 'waiver', 'grant'],
        'language' => ['ielts', 'toefl', 'pte', 'english test', 'english requirement', 'without english'],
        'accommodation' => ['accommodation', 'room', 'rent', 'on campus', 'off campus'],
        'visa' => ['visa', 'emgs', 'eval', 'val', 'sev', 'passport', 'immigration', 'student pass'],
        'payment' => ['installment', 'pay monthly', 'payment', 'bank transfer', 'pay per semester'],
        'refund' => ['refund', 'money back'],
        'admission' => ['admission', 'eligible', 'eligibility', 'requirement', 'qualify', 'gpa', 'cgpa', 'grades', 'acceptance', 'application'],
        'career' => ['career', 'job', 'employment', 'employability', 'work'],
        'recognition' => ['ranking', 'rank', 'accredited', 'accreditation', 'recognized', 'recognition', 'mqa'],
        'location' => ['location', 'where is', 'located', 'city center', 'environment'],
        'transfer' => ['transfer', 'release letter', 'change university'],
    ];

    public const STOP = 'a an the i my me you your we our us he she they their them it its this that these those is are was were be been being am do does did have has had how what which who when where why can could would should will shall may might must to of for at in on from by with as and or but so if then than about into through after before during please tell show give explain know want looking interested need get any some all there here also only just really very more much many long one two both either each studying study university college malaysia international student students program degree fee cost price total per year years month months semester semesters bachelor master phd diploma foundation certificate hons honours honors incl specialism specialisms science bachelor general say details information let hello hi hey thanks thank undergraduate postgraduate list compare vs versus cheaper cheapest affordable budget under below less between maximum most over up rm myr usd taka bdt dollar ringgit local foreign domestic fulltime parttime not no without except exclude excluding dont cannot instead actually yes okay ok them those that their duration intake scholarship admission application requirement english test score percent status option first second third same another now today too still entry direct directly meet available offers offer offering offers offered does doing make possible help whether take studying studied taking hows whats whats';
}
