/* assets/js/footer.js */
document.addEventListener("DOMContentLoaded", function() {
    const footerContainer = document.getElementById("global-footer-placeholder");

    // Shared navigation and assets always start at the site root.
    const root = "/";

    if (footerContainer) {
        footerContainer.innerHTML = `
        <footer class="main-footer">
            <div class="container">
              
              <div class="footer-grid">
                <div class="footer-col">
                  <h3>One Step</h3>
                  <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 20px;">
                    Your trusted partner for education in Malaysia and abroad since 2015.
                  </p>
                  
                  <h4 style="color: #00C2FF; font-size: 1rem; margin-top: 20px; margin-bottom: 10px;">Study Destinations</h4>
                  <ul class="footer-links two-col-list">
                    <li><a href="${root}countries/china">China</a></li>
                    <li><a href="${root}countries/cyprus">Cyprus</a></li>
                    <li><a href="${root}countries/denmark">Denmark</a></li>
                    <li><a href="${root}countries/finland">Finland</a></li>
                    <li><a href="${root}countries/hungary">Hungary</a></li>
                    <li><a href="${root}countries/italy">Italy</a></li>
                    <li><a href="${root}countries/norway">Norway</a></li>
                    <li><a href="${root}countries/spain">Spain</a></li>
                    <li><a href="${root}countries/sweden">Sweden</a></li>
                    <li><a href="${root}countries/uzbekistan">Uzbekistan</a></li>
                  </ul>
                </div>
                
                <div class="footer-col">
                  <h3>University Details</h3>
                  <ul class="footer-links two-col-list">
                    <li><a href="${root}Universities/alfa-details">Alfa University</a></li>
                    <li><a href="${root}Universities/amu-details">AMU</a></li>
                    <li><a href="${root}Universities/apu-details">APU</a></li>
                    <li><a href="${root}Universities/bac-details">BAC</a></li>
                    <li><a href="${root}Universities/cityu-details">City University</a></li>
                    <li><a href="${root}Universities/cyberjaya-details">Cyberjaya Uni</a></li>
                    <li><a href="${root}Universities/help-details">HELP</a></li>
                    <li><a href="${root}Universities/icms-details">ICMS</a></li>
                    <li><a href="${root}Universities/inti-details">INTI University</a></li>
                    <li><a href="${root}Universities/kings-details">Kings College</a></li>
                    <li><a href="${root}Universities/klust-details">KLUST</a></li>
                    <li><a href="${root}Universities/limkokwing-details">Limkokwing</a></li>
                    <li><a href="${root}Universities/lincoln-details">Lincoln</a></li>
                    <li><a href="${root}Universities/mmu-details">MMU</a></li>
                    <li><a href="${root}Universities/segi-details">SEGi University</a></li>
                    <li><a href="${root}Universities/taylors-details">Taylor's Uni</a></li>
                    <li><a href="${root}Universities/ucsi-details">UCSI</a></li>
                    <li><a href="${root}Universities/umw-details">UMW</a></li>
                    <li><a href="${root}Universities/unikl-details">UniKL</a></li>
                    <li><a href="${root}Universities/unirazak-details">UNIRAZAK</a></li>
                    <li><a href="${root}Universities/iium-details">IIUM</a></li>
                    <li><a href="${root}Universities/uow-details">UOW</a></li>
                    <li><a href="${root}Universities/upm-details">UPM</a></li>
                    <li><a href="${root}Universities/utem-details">UTeM</a></li>
                    <li><a href="${root}Universities/utm-details">UTM</a></li>
                  </ul>
                </div>
                
                <div class="footer-col">
                  <h3>Tuition Fees</h3>
                  <ul class="footer-links two-col-list">
                    <li><a href="${root}Fees_Chart/alfa-fees">Alfa Fees</a></li>
                    <li><a href="${root}Fees_Chart/amu-fees">AMU Fees</a></li>
                    <li><a href="${root}Fees_Chart/apu-fees">APU Fees</a></li>
                    <li><a href="${root}Fees_Chart/bac-fees">BAC Fees</a></li>
                    <li><a href="${root}Fees_Chart/cityu-fees">City U Fees</a></li>
                    <li><a href="${root}Fees_Chart/cyberjaya-fees">Cyberjaya Fees</a></li>
                    <li><a href="${root}Fees_Chart/help-fees">HELP Fees</a></li>
                    <li><a href="${root}Fees_Chart/icms-fees">ICMS Fees</a></li>
                    <li><a href="${root}Fees_Chart/inti-fees">INTI Fees</a></li>
                    <li><a href="${root}Fees_Chart/kings-fees">Kings Fees</a></li>
                    <li><a href="${root}Fees_Chart/klust-fees">KLUST Fees</a></li>
                    <li><a href="${root}Fees_Chart/limkokwing-fees">Limkokwing Fees</a></li>
                    <li><a href="${root}Fees_Chart/lincoln-fees">Lincoln Fees</a></li>
                    <li><a href="${root}Fees_Chart/mmu-fees">MMU Fees</a></li>
                    <li><a href="${root}Fees_Chart/segi-fees">SEGi Fees</a></li>
                    <li><a href="${root}Fees_Chart/taylors-fees">Taylor's Fees</a></li>
                    <li><a href="${root}Fees_Chart/ucsi-fees">UCSI Fees</a></li>
                    <li><a href="${root}Fees_Chart/umw-fees">UMW Fees</a></li>
                    <li><a href="${root}Fees_Chart/unikl-fees">UniKL Fees</a></li>
                    <li><a href="${root}Fees_Chart/unirazak-fees">UNIRAZAK Fees</a></li>
                    <li><a href="${root}Fees_Chart/iium-fees">IIUM Fees</a></li>
                    <li><a href="${root}Fees_Chart/uow-fees">UOW Fees</a></li>
                    <li><a href="${root}Fees_Chart/upm-fees">UPM Fees</a></li>
                    <li><a href="${root}Fees_Chart/utem-fees">UTeM Fees</a></li>
                    <li><a href="${root}Fees_Chart/utm-fees">UTM Fees</a></li>
                  </ul>
                </div>
                
                <div class="footer-col">
                  <h3>Quick Actions</h3>
                  <ul class="footer-links" style="margin-bottom: 20px;">
                     <li><a href="${root}student-support-malaysia">Student Support in Malaysia</a></li>
                     <li><a href="${root}" style="color: #FFD700; font-weight: bold;">Home</a></li>
                     <li><a href="${root}Articles/top-10-universities-in-malaysia" style="color: #00C2FF; font-weight: bold;">Top Universities</a></li>
                     <li><a href="${root}scholarship" style="color: #FFD700; font-weight: bold;">Scholarships</a></li>
                     <li><a href="${root}register" style="color: #FFD700; font-weight: bold;">Register for Exam</a></li>
                     <li><a href="${root}application" style="color: #FFD700; font-weight: bold;">Apply Now</a></li>
                     <li><a href="${root}compare" style="color: #FFD700; font-weight: bold;">Compare Universities</a></li>
                     <li><a href="${root}quiz" style="color: #FFD700; font-weight: bold;">Career Quiz</a></li>
                     <li><a href="https://ieltsmock.onestepmy.com/" target="_blank" style="color: #FFD700; font-weight: bold;">Free IELTS Mock Test</a></li>
                     <li><a href="${root}verify" style="color: #FFD700; font-weight: bold;">Verify Certificate</a></li>
                  </ul>

                  <h3>Contact Us</h3>
                  <div class="footer-contact">
                    <p><i class="fas fa-map-marker-alt"></i> <span>Office 02, Level 05, Fortune Shopping Mall , Mouchak, Dhaka- 1217</span></p>
                    <p><i class="fas fa-phone"></i> <span>+601119359497</span></p>
                  </div>

                  <div class="social-links">
                    <a href="https://" target="_blank" class="social-link"><i class="fab fa-facebook-f"></i></a>
                    <a href="https://wa.me/601119359497" target="_blank" class="social-link"><i class="fab fa-whatsapp"></i></a>
                    <a href="#" target="_blank" class="social-link"><i class="fab fa-youtube"></i></a>
                    <a href="#" target="_blank" class="social-link"><i class="fab fa-tiktok"></i></a>
                  </div>
                </div>

              </div>
              
              <div class="footer-bottom">
                <p>&copy; 2026 One Step. All rights reserved. | Developed by 
                  <a href="https://nahidjahanbhuiyan.com" target="_blank" class="developer-link" data-text="Bhuiyan Mohamed Nahid Jahan" style="padding: 0 10px;">
Bhuiyan Mohamed Nahid Jahan</a>
                </p>
              </div>
            </div>
            
            <style>
              /* Existing Styles */
              .two-col-list {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 5px 15px;
              }

              /* NEW TRENDY ANIMATION FOR DEVELOPER LINK */
              .developer-link {
                position: relative;
                color: #ffffff;
                text-decoration: none;
                font-weight: 600;
                transition: all 0.3s ease;
                display: inline-block;
                background: linear-gradient(90deg, #00C2FF, #FFD700, #00C2FF);
                background-size: 200% auto;
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: shine 3s linear infinite;
              }

              .developer-link:hover {
                transform: scale(1.05);
                text-shadow: 0 0 10px rgba(0, 194, 255, 0.5);
              }

              .developer-link::after {
                content: '';
                position: absolute;
                width: 0;
                height: 2px;
                bottom: -2px;
                left: 50%;
                background: #FFD700;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              }

              .developer-link:hover::after {
                width: 100%;
                left: 0;
              }

              @keyframes shine {
                to {
                  background-position: 200% center;
                }
              }

              /* FORCE MOBILE LAYOUT TO BE LEFT ALIGNED & 1 COLUMN */
              @media (max-width: 768px) {
                 .footer-grid {
                    display: grid !important;
                    grid-template-columns: 1fr !important;
                    text-align: left !important;
                    gap: 40px !important;
                 }
                 .footer-col {
                    width: 100% !important;
                    text-align: left !important;
                    margin: 0 !important;
                 }
                 .footer-col h3::after {
                    left: 0 !important;
                    transform: none !important;
                 }
                 .footer-contact p {
                    justify-content: flex-start !important;
                 }
                 .social-links {
                    justify-content: flex-start !important;
                 }
              }
            </style>
        </footer>
        `;
    }
    
    // Inject Custom Chatbot CSS and JS with cache-buster to force browser update
    const cacheBuster = '?v=' + new Date().getTime();
    
    const chatbotCss = document.createElement('link');
    chatbotCss.rel = 'stylesheet';
    chatbotCss.href = root + 'assets/css/chatbot.css' + cacheBuster;
    document.head.appendChild(chatbotCss);

    const chatbotJs = document.createElement('script');
    chatbotJs.src = root + 'assets/js/chatbot.js' + cacheBuster;
    document.body.appendChild(chatbotJs);

    /* --- NEW UPDATE END --- */
});
// --- Image Lightbox Logic ---
document.addEventListener("DOMContentLoaded", function() {
    if (document.querySelectorAll('.gallery-item').length > 0) {
        const lightboxHtml = `
            <div class="lightbox-overlay" id="gallery-lightbox">
                <div class="lightbox-close" id="lightbox-close"><i class="fas fa-times"></i></div>
                <div class="lightbox-content">
                    <img src="" alt="Gallery Image" class="lightbox-img" id="lightbox-img">
                </div>
                <div class="lightbox-caption" id="lightbox-caption"></div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', lightboxHtml);

        const overlay = document.getElementById('gallery-lightbox');
        const imgEl = document.getElementById('lightbox-img');
        const captionEl = document.getElementById('lightbox-caption');
        const closeBtn = document.getElementById('lightbox-close');

        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', function() {
                const img = this.querySelector('img');
                if (img) {
                    imgEl.src = img.src;
                    captionEl.textContent = img.getAttribute('data-caption') || img.alt;
                    overlay.classList.add('active');
                }
            });
        });

        closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay || e.target.classList.contains('lightbox-content')) {
                overlay.classList.remove('active');
            }
        });
    }
});





// Inject Visitor Tracking script asynchronously to prevent blocking SEO/Core Web Vitals
(function() {
    var trackingScript = document.createElement('script');
    trackingScript.src = '/tracking.js';
    trackingScript.defer = true; // Non-blocking
    document.body.appendChild(trackingScript);
})();
