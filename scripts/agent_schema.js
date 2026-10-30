'use strict';
const origin = 'https://www.onestepmy.com';
module.exports = function(description) {
    return [
        {'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'One-Step',alternateName:'One Step MY',description,publisher:{'@id':origin+'/#organization'}},
        {'@type':'Organization','@id':origin+'/#organization',name:'One-Step',url:origin+'/',description:'Student guidance for comparing Malaysian universities, tuition fees, scholarships and application options.',email:'info@onestepmy.com',telephone:'+601119359497',sameAs:['https://www.facebook.com/profile.php?id=61587016386840'],contactPoint:{'@type':'ContactPoint',contactType:'Student enquiries',email:'info@onestepmy.com',telephone:'+601119359497'}},
        {'@type':'WebPage','@id':origin+'/#webpage',url:origin+'/',name:'Study in Malaysia: University Fees, Rankings & Guides | One-Step',isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#organization'}},
        {'@type':'Service',name:'Malaysia university study guidance',serviceType:'University comparison and application guidance',provider:{'@id':origin+'/#organization'},url:origin+'/contact',description:'Guidance on Malaysian university courses, tuition fee schedules, application options and scholarship conditions.'}
    ];
};
