document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LANGUAGE TRANSLATION LOGIC ---
    function applyLanguage(lang) {
        // Toggle Standard HTML Text
        const enElements = document.querySelectorAll('.lang-en');
        const bnElements = document.querySelectorAll('.lang-bn');

        if (lang === 'bn') {
            enElements.forEach(el => el.style.display = 'none');
            bnElements.forEach(el => el.style.display = 'inline-block');
        } else {
            enElements.forEach(el => el.style.display = 'inline-block');
            bnElements.forEach(el => el.style.display = 'none');
        }

        // Translate Form Placeholders safely
        document.querySelectorAll('input[data-en-ph]').forEach(input => {
            input.placeholder = lang === 'bn' ? input.getAttribute('data-bn-ph') : input.getAttribute('data-en-ph');
        });

        // Translate Select Options safely
        document.querySelectorAll('option[data-en]').forEach(option => {
            option.text = lang === 'bn' ? option.getAttribute('data-bn') : option.getAttribute('data-en');
        });
    }

    // Auto-detect previously saved language (from Scholarship Page)
    // Defaults to 'en' if they bypass the scholarship page somehow
    const savedLang = localStorage.getItem('onestep_lang') || 'en';
    applyLanguage(savedLang);


    // --- 2. PAYMENT METHOD TOGGLE LOGIC ---
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const digitalDetails = document.getElementById('digitalPaymentDetails');
    const cashDetails = document.getElementById('cashPaymentDetails');

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'digital') {
                digitalDetails.style.display = 'block';
                cashDetails.style.display = 'none';
            } else {
                digitalDetails.style.display = 'none';
                cashDetails.style.display = 'block';
            }
        });
    });

    // --- 3. FORM SUBMISSION LOGIC ---
    const form = document.getElementById('registrationForm');
    const successModal = document.getElementById('successModal');

    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            // Show Modal
            successModal.style.display = 'flex';
            
            // Redirect simulation
            setTimeout(() => {
                window.location.href = 'index.html'; 
            }, 3000);
        });
    }
});