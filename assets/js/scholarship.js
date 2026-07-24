// assets/js/scholarship.js
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LANGUAGE TOGGLE LOGIC ---
    const langModal = document.getElementById('language-modal');
    const btnSelectEn = document.getElementById('select-en');
    const btnSelectBn = document.getElementById('select-bn');
    const langSwitch = document.getElementById('lang-switch');

    // Function to apply the chosen language
    function applyLanguage(lang) {
        const enElements = document.querySelectorAll('.lang-en');
        const bnElements = document.querySelectorAll('.lang-bn');

        if (lang === 'bn') {
            enElements.forEach(el => el.style.display = 'none');
            bnElements.forEach(el => el.style.display = 'inline-block'); // inline-block preserves spacing
            if(langSwitch) langSwitch.checked = true;
        } else {
            enElements.forEach(el => el.style.display = 'inline-block');
            bnElements.forEach(el => el.style.display = 'none');
            if(langSwitch) langSwitch.checked = false;
        }
        
        // Save choice to local storage
        localStorage.setItem('onestep_lang', lang);
        
        // Hide Modal & Restore scrolling
        if(langModal) {
            langModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Check if user has visited before
    const savedLang = localStorage.getItem('onestep_lang');
    
    if (!savedLang) {
        // First visit -> Show modal
        if(langModal) {
            langModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent scrolling while modal is open
        }
    } else {
        // Existing user -> Apply saved language
        applyLanguage(savedLang);
    }

    // Modal Button Events
    if(btnSelectEn) btnSelectEn.addEventListener('click', () => applyLanguage('en'));
    if(btnSelectBn) btnSelectBn.addEventListener('click', () => applyLanguage('bn'));

    // Toggle Switch Event
    if(langSwitch) {
        langSwitch.addEventListener('change', (e) => {
            applyLanguage(e.target.checked ? 'bn' : 'en');
        });
    }

    // --- 2. EXISTING PROGRESS BAR ANIMATION ---
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('structure-card')) {
                    const bars = entry.target.querySelectorAll('.bar');
                    bars.forEach(bar => {
                        const targetWidth = bar.style.width;
                        bar.style.width = '0%';
                        setTimeout(() => {
                            bar.style.width = targetWidth;
                        }, 100);
                    });
                    observer.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);

    const structureCards = document.querySelectorAll('.structure-card');
    structureCards.forEach(card => observer.observe(card));
});