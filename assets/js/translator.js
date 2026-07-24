let translations = { en: {}, bn: {} };
let currentLang = localStorage.getItem('onestep_lang') || 'en';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('translations.json');
        if (response.ok) {
            translations = await response.json();
            applyTranslations(); 
        }
    } catch (e) {
        console.error("Could not load translations:", e);
    }
    
    const langSwitch = document.getElementById('lang-switch');
    if (langSwitch) {
        langSwitch.checked = (currentLang === 'bn');
        langSwitch.addEventListener('change', (e) => {
            currentLang = e.target.checked ? 'bn' : 'en';
            localStorage.setItem('onestep_lang', currentLang);
            applyTranslations();
        });
    }
});

function applyTranslations() {
    const dict = translations[currentLang];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerHTML = dict[key];
        }
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (dict[key]) {
            el.placeholder = dict[key];
        }
    });
}
