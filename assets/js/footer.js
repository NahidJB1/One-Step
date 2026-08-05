/* assets/js/footer.js */
document.addEventListener("DOMContentLoaded", function() {
    const footerContainer = document.getElementById("global-footer-placeholder");

    // 1. PATH LOGIC: Auto-detect if we are in a subfolder
    const path = window.location.pathname;
    const hostname = window.location.hostname;
    let root = ""; 

    if (path.includes("/Universities/") || path.includes("/Fees_Chart/") || path.includes("/countries/") || path.includes("/Articles/")) {
        root = "../";
    }

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
                    <li><a href="${root}countries/china.html">China</a></li>
                    <li><a href="${root}countries/cyprus.html">Cyprus</a></li>
                    <li><a href="${root}countries/denmark.html">Denmark</a></li>
                    <li><a href="${root}countries/finland.html">Finland</a></li>
                    <li><a href="${root}countries/hungary.html">Hungary</a></li>
                    <li><a href="${root}countries/italy.html">Italy</a></li>
                    <li><a href="${root}countries/norway.html">Norway</a></li>
                    <li><a href="${root}countries/spain.html">Spain</a></li>
                    <li><a href="${root}countries/sweden.html">Sweden</a></li>
                    <li><a href="${root}countries/uzbekistan.html">Uzbekistan</a></li>
                  </ul>
                </div>
                
                <div class="footer-col">
                  <h3>University Details</h3>
                  <ul class="footer-links two-col-list">
                    <li><a href="${root}Universities/alfa-details.html">Alfa University</a></li>
                    <li><a href="${root}Universities/amu-details.html">AMU</a></li>
                    <li><a href="${root}Universities/apu-details.html">APU</a></li>
                    <li><a href="${root}Universities/bac-details.html">BAC</a></li>
                    <li><a href="${root}Universities/cityu-details.html">City University</a></li>
                    <li><a href="${root}Universities/cyberjaya-details.html">Cyberjaya Uni</a></li>
                    <li><a href="${root}Universities/help-details.html">HELP</a></li>
                    <li><a href="${root}Universities/icms-details.html">ICMS</a></li>
                    <li><a href="${root}Universities/inti-details.html">INTI University</a></li>
                    <li><a href="${root}Universities/kings-details.html">Kings College</a></li>
                    <li><a href="${root}Universities/klust-details.html">KLUST</a></li>
                    <li><a href="${root}Universities/limkokwing-details.html">Limkokwing</a></li>
                    <li><a href="${root}Universities/lincoln-details.html">Lincoln</a></li>
                    <li><a href="${root}Universities/mmu-details.html">MMU</a></li>
                    <li><a href="${root}Universities/segi-details.html">SEGi University</a></li>
                    <li><a href="${root}Universities/taylors-details.html">Taylor's Uni</a></li>
                    <li><a href="${root}Universities/ucsi-details.html">UCSI</a></li>
                    <li><a href="${root}Universities/umw-details.html">UMW</a></li>
                    <li><a href="${root}Universities/unikl-details.html">UniKL</a></li>
                    <li><a href="${root}Universities/unirazak-details.html">UNIRAZAK</a></li>
                    <li><a href="${root}Universities/iium-details.html">IIUM</a></li>
                    <li><a href="${root}Universities/uow-details.html">UOW</a></li>
                    <li><a href="${root}Universities/upm-details.html">UPM</a></li>
                    <li><a href="${root}Universities/utem-details.html">UTeM</a></li>
                    <li><a href="${root}Universities/utm-details.html">UTM</a></li>
                  </ul>
                </div>
                
                <div class="footer-col">
                  <h3>Tuition Fees</h3>
                  <ul class="footer-links two-col-list">
                    <li><a href="${root}Fees_Chart/alfa-fees.html">Alfa Fees</a></li>
                    <li><a href="${root}Fees_Chart/amu-fees.html">AMU Fees</a></li>
                    <li><a href="${root}Fees_Chart/apu-fees.html">APU Fees</a></li>
                    <li><a href="${root}Fees_Chart/bac-fees.html">BAC Fees</a></li>
                    <li><a href="${root}Fees_Chart/cityu-fees.html">City U Fees</a></li>
                    <li><a href="${root}Fees_Chart/cyberjaya-fees.html">Cyberjaya Fees</a></li>
                    <li><a href="${root}Fees_Chart/help-fees.html">HELP Fees</a></li>
                    <li><a href="${root}Fees_Chart/icms-fees.html">ICMS Fees</a></li>
                    <li><a href="${root}Fees_Chart/inti-fees.html">INTI Fees</a></li>
                    <li><a href="${root}Fees_Chart/kings-fees.html">Kings Fees</a></li>
                    <li><a href="${root}Fees_Chart/klust-fees.html">KLUST Fees</a></li>
                    <li><a href="${root}Fees_Chart/limkokwing-fees.html">Limkokwing Fees</a></li>
                    <li><a href="${root}Fees_Chart/lincoln-fees.html">Lincoln Fees</a></li>
                    <li><a href="${root}Fees_Chart/mmu-fees.html">MMU Fees</a></li>
                    <li><a href="${root}Fees_Chart/segi-fees.html">SEGi Fees</a></li>
                    <li><a href="${root}Fees_Chart/taylors-fees.html">Taylor's Fees</a></li>
                    <li><a href="${root}Fees_Chart/ucsi-fees.html">UCSI Fees</a></li>
                    <li><a href="${root}Fees_Chart/umw-fees.html">UMW Fees</a></li>
                    <li><a href="${root}Fees_Chart/unikl-fees.html">UniKL Fees</a></li>
                    <li><a href="${root}Fees_Chart/unirazak-fees.html">UNIRAZAK Fees</a></li>
                    <li><a href="${root}Fees_Chart/iium-fees.html">IIUM Fees</a></li>
                    <li><a href="${root}Fees_Chart/uow-fees.html">UOW Fees</a></li>
                    <li><a href="${root}Fees_Chart/upm-fees.html">UPM Fees</a></li>
                    <li><a href="${root}Fees_Chart/utem-fees.html">UTeM Fees</a></li>
                    <li><a href="${root}Fees_Chart/utm-fees.html">UTM Fees</a></li>
                  </ul>
                </div>
                
                <div class="footer-col">
                  <h3>Quick Actions</h3>
                  <ul class="footer-links" style="margin-bottom: 20px;">
                     <li><a href="${root}index.html" style="color: #FFD700; font-weight: bold;">Home</a></li>
                     <li><a href="${root}Articles/top-10-universities-in-malaysia.html" style="color: #00C2FF; font-weight: bold;">Top 10 Universities</a></li>
                     <li><a href="${root}scholarship.html" style="color: #FFD700; font-weight: bold;">Scholarships</a></li>
                     <li><a href="${root}register.html" style="color: #FFD700; font-weight: bold;">Register for Exam</a></li>
                     <li><a href="${root}application.html" style="color: #FFD700; font-weight: bold;">Apply Now</a></li>
                     <li><a href="${root}compare.html" style="color: #FFD700; font-weight: bold;">Compare Universities</a></li>
                     <li><a href="${root}quiz.html" style="color: #FFD700; font-weight: bold;">Career Quiz</a></li>
                     <li><a href="https://ieltsmock.onestepmy.com/" target="_blank" style="color: #FFD700; font-weight: bold;">Free IELTS Mock Test</a></li>
                     <li><a href="${root}verify.html" style="color: #FFD700; font-weight: bold;">Verify Certificate</a></li>
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

            <!-- Floating WhatsApp Button -->
            <a href="https://wa.me/601119359497" target="_blank" class="floating-whatsapp" aria-label="Chat with us on WhatsApp">
              <i class="fab fa-whatsapp"></i>
            </a>
            
            <style>
                            /* WHATSAPP FLOATING BUTTON */
              .floating-whatsapp {
                  position: fixed;
                  bottom: 30px;
                  right: 30px;
                  width: 60px;
                  height: 60px;
                  background-color: #25D366;
                  color: white;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 32px;
                  box-shadow: 0 10px 20px rgba(37, 211, 102, 0.3);
                  z-index: 9999;
                  text-decoration: none;
                  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                  animation: pulse-whatsapp 2s infinite;
              }
              .floating-whatsapp:hover {
                  transform: scale(1.1) translateY(-5px);
                  color: white;
                  box-shadow: 0 15px 25px rgba(37, 211, 102, 0.4);
              }
              @keyframes pulse-whatsapp {
                  0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
                  70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
                  100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
              }
              @media (max-width: 768px) {
                  .floating-whatsapp {
                      bottom: 20px;
                      right: 20px;
                      width: 50px;
                      height: 50px;
                      font-size: 28px;
                  }
              }
              
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
        
        <!-- Floating WhatsApp Button -->
        <a href="https://wa.me/601119359497" target="_blank" class="floating-whatsapp" aria-label="Chat with us on WhatsApp">
            <i class="fab fa-whatsapp"></i>
        </a>
        `;
    }
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


