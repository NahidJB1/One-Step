/* assets/js/footer.js */
document.addEventListener("DOMContentLoaded", function() {
    const footerContainer = document.getElementById("global-footer-placeholder");
    
    if (footerContainer) {
        footerContainer.innerHTML = `
        <footer class="main-footer">
            <div class="container">
              <div class="footer-grid">
                <div class="footer-col">
                  <h3>One Step</h3>
                  <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 20px;">Your trusted partner for Malaysian education since 2015.</p>
                  <div class="social-links">
                    <a href="https://web.facebook.com/people/YS-Study-Focus/61571694410231/?_rdc=1&_rdr" target="_blank" class="social-link">
                      <i class="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://wa.me/601119359497" target="_blank" class="social-link">
                      <i class="fab fa-whatsapp"></i>
                    </a>
                    <a href="https://youtube.com" target="_blank" class="social-link">
                      <i class="fab fa-youtube"></i>
                    </a>
                    <a href="https://www.tiktok.com" target="_blank" class="social-link">
                      <i class="fab fa-tiktok"></i>
                    </a>
                  </div>
                </div>
                
                <div class="footer-col">
                  <h3>Quick Links</h3>
                  <ul class="footer-links">
                    <li><a href="../index.html">Home</a></li>
                    <li><a href="../index.html#universities">Universities</a></li>
                    <li><a href="../index.html#process">Our Process</a></li>
                    <li><a href="../index.html#contact">Contact Us</a></li>
                  </ul>
                </div>
                
                <div class="footer-col">
                  <h3>Universities</h3>
                  <ul class="footer-links">
                    <li><a href="city-university-fees.html">City University</a></li>
                    <li><a href="KLUST-fees.html">KLUST</a></li>
                    <li><a href="Cyberjaya-fees.html">Cyberjaya University</a></li>
                    <li><a href="inti-university-fees.html">INTI University</a></li>
                    <li><a href="segi-university-fees.html">SEGi University</a></li>
                  </ul>
                </div>
                
                <div class="footer-col">
                  <h3>Contact Info</h3>
                  <div class="footer-contact">
                    <p><i class="fas fa-map-marker-alt"></i> <span>De Tropicana, 52, Jalan Kuchai Maju 13, Kuchai Entrepreneurs Park, 58200 Kuala Lumpur, Malaysia</span></p>
                    <p><i class="fas fa-phone"></i> <span>+601119359497</span></p>
                  </div>
                </div>
              </div>
              
              <div class="footer-bottom">
                <p>&copy; 2026 One Step. All rights reserved. | Developed and Designed by <a href="#" class="developer-link" style="color: #00C2FF; text-decoration: none; font-weight: 600;">Bhuiyan Mohamed Nahid Jahan</a></p>
              </div>
            </div>
        </footer>
        `;
    }
});
