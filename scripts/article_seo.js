'use strict';
// Search intent is editorial, not a claim about measured keyword volume.
module.exports = {
  titles: {
    top:'Top Universities in Malaysia: Rankings & Fees | One-Step',
    programs:'Courses to Study in Malaysia: Programs & Fees | One-Step',
    costs:'Cost of Living in Malaysia for Students | One-Step',
    visas:'Malaysia Student Visa Process: Steps & Costs | One-Step',
    checklist:'Malaysia Student Visa Requirements & Documents | One-Step',
    scholarships:'Malaysia Scholarships for International Students | One-Step',
    affordable:'Affordable Universities in Malaysia: Fees | One-Step',
    fast:'Malaysia University Application & Processing Times | One-Step',
    countries:'Affordable Countries to Study Abroad: 10 Options | One-Step',
    comparison:"MMU vs Taylor’s: Courses & International Fees | One-Step",
    medicine:'Study MBBS & Medicine in Malaysia: Entry & Fees | One-Step',
    engineering:'Engineering Universities in Malaysia: Fees & Courses | One-Step'
  },
  related: {
    top:['affordable','comparison','engineering','medicine','programs'],
    programs:['engineering','medicine','comparison','scholarships','top'],
    costs:['affordable','scholarships','countries','visas'],
    visas:['checklist','fast','costs','scholarships'],
    checklist:['visas','fast','costs','programs'],
    scholarships:['affordable','costs','top','programs']
  },
  groups:[
    {title:'Choose a university or course',keys:['top','programs','comparison','engineering','medicine']},
    {title:'Plan tuition, living costs and funding',keys:['affordable','costs','scholarships','countries']},
    {title:'Prepare your application and student visa',keys:['fast','visas','checklist']}
  ]
};
