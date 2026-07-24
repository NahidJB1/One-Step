// assets/js/verify.js

document.addEventListener('DOMContentLoaded', () => {
    const lang = localStorage.getItem('onestep_lang') || 'en';
    
    function applyLanguage(currentLang) {
        document.querySelectorAll('.lang-en').forEach(el => el.style.display = currentLang === 'en' ? 'inline-block' : 'none');
        document.querySelectorAll('.lang-bn').forEach(el => el.style.display = currentLang === 'bn' ? 'inline-block' : 'none');
        
        const input = document.getElementById('cert-input');
        if(input) {
            input.placeholder = currentLang === 'en' ? input.getAttribute('data-en-ph') : input.getAttribute('data-bn-ph');
        }
    }
    
    applyLanguage(lang);

 

    const verifyBtn = document.getElementById('verify-btn');
    const inputField = document.getElementById('cert-input');
    const resultArea = document.getElementById('verify-result-area');
    const btnText = verifyBtn.querySelector('.btn-text');
    const btnLoader = verifyBtn.querySelector('.btn-loader');

    verifyBtn.addEventListener('click', () => {
        const certId = inputField.value.trim().toUpperCase();
        
        if(certId === "") {
            inputField.focus();
            return;
        }

        // 1. Set Loading State
        resultArea.classList.add('hidden');
        verifyBtn.disabled = true;
        inputField.disabled = true;
        btnText.style.display = 'none';
        btnLoader.classList.remove('hidden');

        // 2. Fetch from Database
        fetch(`verify_api.php?cert_id=${encodeURIComponent(certId)}`)
            .then(response => response.json())
            .then(data => {
                // Add a small artificial delay just for smooth UI transition
                setTimeout(() => {
                    verifyBtn.disabled = false;
                    inputField.disabled = false;
                    btnText.style.display = 'flex';
                    btnLoader.classList.add('hidden');
                    
                    resultArea.classList.remove('hidden');
                    const currentLang = localStorage.getItem('onestep_lang') || 'en';
                    const isEn = currentLang === 'en';

                    if(data.status === 'success') {
                        const record = data.data;
                        
                        // Default fallbacks in case admin added ID but no details yet
                        const studentName = record.student_name || 'Pending Details';
                        const school = record.institution || 'Pending Details';
                        const category = record.category || 'N/A';
                        const position = record.position || 'Participant';
                        const issueDate = record.formatted_date || 'N/A';

                        resultArea.className = 'result-area result-success';
                        resultArea.innerHTML = `
                            <h3><i class="fas fa-check-circle"></i> ${isEn ? "Certificate Verified" : "সার্টিফিকেট যাচাই করা হয়েছে"}</h3>
                            <p>${isEn ? "This is an official One Step Scholarship record." : "এটি একটি অফিসিয়াল ওয়ান স্টেপ স্কলারশিপ রেকর্ড।"}</p>
                            <div class="cert-details">
                                <div class="detail-row">
                                    <span class="detail-label">${isEn ? "Student Name:" : "শিক্ষার্থীর নাম:"}</span>
                                    <span class="detail-value">${studentName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">${isEn ? "Institution:" : "প্রতিষ্ঠান:"}</span>
                                    <span class="detail-value">${school}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">${isEn ? "Category:" : "বিভাগ:"}</span>
                                    <span class="detail-value">${category}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">${isEn ? "Issue Date:" : "ইস্যুর তারিখ:"}</span>
                                    <span class="detail-value">${issueDate}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">${isEn ? "Status:" : "অবস্থা:"}</span>
                                    <span class="detail-value" style="color: #15803D;">Valid - ${position}</span>
                                </div>
                            </div>
                        `;
                    } else {
                        resultArea.className = 'result-area result-error';
                        resultArea.innerHTML = `
                            <h3><i class="fas fa-times-circle"></i> ${isEn ? "Record Not Found" : "রেকর্ড পাওয়া যায়নি"}</h3>
                            <p>${isEn ? "We could not find a matching certificate for ID:" : "আমরা এই আইডির জন্য কোন সার্টিফিকেট খুঁজে পাইনি:"} <b style="color:var(--dark);">${certId}</b></p>
                            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #FECACA; margin-top: 15px;">
                                <span style="color: #B91C1C; font-size: 0.9rem;">
                                    <i class="fas fa-info-circle"></i> 
                                    ${isEn ? "Please ensure you have typed the exact ID (e.g., OS-2026-XXXX)." : "অনুগ্রহ করে নিশ্চিত করুন যে আপনি সঠিক আইডি টাইপ করেছেন (যেমন, OS-2026-XXXX)।"}
                                </span>
                            </div>
                        `;
                    }
                }, 500); // 0.5 sec delay
            })
            .catch(error => {
                console.error('Error fetching verification:', error);
                verifyBtn.disabled = false;
                inputField.disabled = false;
                btnText.style.display = 'flex';
                btnLoader.classList.add('hidden');
                alert("A network error occurred. Please try again.");
            });
    });

    // Allow pressing "Enter" in the input field to trigger search
    inputField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            verifyBtn.click();
        }
    });
});