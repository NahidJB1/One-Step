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
                  <ul class="footer-links">
                    <li><a href="${root}Universities/alfa-details.html">Alfa University</a></li>
                    <li><a href="${root}Universities/bac-details.html">BAC</a></li>
                    <li><a href="${root}Universities/binary-details.html">Binary University</a></li>
                    <li><a href="${root}Universities/cityu-details.html">City University</a></li>
                    <li><a href="${root}Universities/cyberjaya-details.html">Cyberjaya Uni</a></li>
                    <li><a href="${root}Universities/cybernetics-details.html">Cybernetics</a></li>
                    <li><a href="${root}Universities/genovasi-details.html">Genovasi Uni</a></li>
                    <li><a href="${root}Universities/inti-details.html">INTI University</a></li>
                    <li><a href="${root}Universities/kings-details.html">Kings College</a></li>
                    <li><a href="${root}Universities/klust-details.html">KLUST</a></li>
                    <li><a href="${root}Universities/segi-details.html">SEGi University</a></li>
                    <li><a href="${root}Universities/taylors-details.html">Taylor's Uni</a></li>
                    <li><a href="${root}Universities/ucmi-details.html">UCMI</a></li>
                  </ul>
                </div>
                
                <div class="footer-col">
                  <h3>Tuition Fees</h3>
                  <ul class="footer-links">
                    <li><a href="${root}Fees_Chart/alfa-fees.html">Alfa Fees</a></li>
                    <li><a href="${root}Fees_Chart/bac-fees.html">BAC Fees</a></li>
                    <li><a href="${root}Fees_Chart/binary-fees.html">Binary Fees</a></li>
                    <li><a href="${root}Fees_Chart/city-university-fees.html">City U Fees</a></li>
                    <li><a href="${root}Fees_Chart/cyberjaya-fees.html">Cyberjaya Fees</a></li>
                    <li><a href="${root}Fees_Chart/cybernetics-fees.html">Cybernetics Fees</a></li>
                    <li><a href="${root}Fees_Chart/genovasi-fees.html">Genovasi Fees</a></li>
                    <li><a href="${root}Fees_Chart/inti-fees.html">INTI Fees</a></li>
                    <li><a href="${root}Fees_Chart/kings-fees.html">Kings Fees</a></li>
                    <li><a href="${root}Fees_Chart/klust-fees.html">KLUST Fees</a></li>
                    <li><a href="${root}Fees_Chart/segi-fees.html">SEGi Fees</a></li>
                    <li><a href="${root}Fees_Chart/taylors-fees.html">Taylor's Fees</a></li>
                    <li><a href="${root}Fees_Chart/ucmi-fees.html">UCMI Fees</a></li>
                  </ul>
                </div>
                
                <div class="footer-col">
                  <h3>Quick Actions</h3>
                  <ul class="footer-links" style="margin-bottom: 20px;">
                     <li><a href="${root}index.html" style="color: #FFD700; font-weight: bold;">Home</a></li>
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
                  <a href="https://nahidjahanbhuiyan.com" target="_blank" class="developer-link" data-text="Bhuiyan Mohamed Nahid Jahan">
                      Bhuiyan Mohamed Nahid Jahan
                   </a>
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
        
        <!-- Floating WhatsApp Button -->
        <a href="https://wa.me/601119359497" target="_blank" class="floating-whatsapp" aria-label="Chat with us on WhatsApp">
            <i class="fab fa-whatsapp"></i>
        </a>
        `;
    }
    /* --- NEW UPDATE END --- */
});