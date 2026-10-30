/* assets/js/footer.js */
document.addEventListener("DOMContentLoaded", function() {
    const footerContainer = document.getElementById("global-footer-placeholder");

    // Shared navigation and assets always start at the site root.
    const root = "/";

    if (footerContainer) {
        footerContainer.innerHTML = `
        <footer class="main-footer onestep-footer">
          <div class="os-footer-wrap">
            <div class="os-footer-top">
              <a class="os-footer-brand" href="/" aria-label="One-Step home"><span class="os-footer-brand-name">ONE STEP<span class="os-footer-brand-dot">.</span></span><span>To touch Dream</span></a>
              <p>Your next chapter starts with a clear plan.<br>Explore universities in Malaysia with One-Step.</p>
              <a class="os-footer-cta" href="/apply">Start your application <span aria-hidden="true">↗</span></a>
            </div>
            <div class="os-footer-grid">
              <div class="os-footer-contact">
                <h3>Let's talk</h3>
                <a class="os-footer-phone" href="https://wa.me/601119359497" target="_blank" rel="noopener noreferrer">+60 11 1935 9497 <span>Chat on WhatsApp ↗</span></a>
                <address>Office 02, Level 05, Fortune Shopping Mall,<br>Mouchak, Dhaka–1217.</address>
                <a class="os-footer-email" href="mailto:info@onestepmy.com">info@onestepmy.com</a>
                <a class="os-footer-facebook" href="https://www.facebook.com/profile.php?id=61587016386840" target="_blank" rel="noopener noreferrer">Find us on Facebook <span aria-hidden="true">↗</span></a>
              </div>
              <nav aria-label="Footer explore">
                <h3>Explore</h3>
                <ul>
                  <li><a href="/explore-universities">Explore universities</a></li>
                  <li><a href="/search">Search courses & universities</a></li>
                  <li><a href="/student-support-malaysia">Student support</a></li>
                  <li><a href="/apply">Apply now</a></li>
                  <li><a href="/contact">Contact us</a></li>
                  <li><a href="/about">About One-Step</a></li>
                  <li><a href="/terms">Terms of use</a></li>
                </ul>
              </nav>
              <nav aria-label="Footer student guides">
                <h3>Plan your studies</h3>
                <ul>
                  <li><a href="/Articles/cheapest-universities">Affordable universities</a></li>
                  <li><a href="/Articles/malaysia-student-visa-requirements">Malaysia student visa requirements</a></li>
                  <li><a href="/Articles/top-10-universities-in-malaysia">Top universities in Malaysia</a></li>
                </ul>
              </nav>
              <nav aria-label="Footer featured universities">
                <h3>Featured universities</h3>
                <ul>
                  <li><a href="/Universities/alfa-university">ALFA University College</a></li>
                  <li><a href="/Universities/taylors-university">Taylor's University</a></li>
                  <li><a href="/Universities/segi-university">SEGi University</a></li>
                  <li><a href="/Universities/cityu-university">City University Malaysia</a></li>
                  <li><a href="/Universities/apu-university">Asia Pacific University (APU)</a></li>
                </ul>
              </nav>
            </div>
            <div class="os-footer-bottom"><p>&copy; ${new Date().getFullYear()} One-Step. All rights reserved.</p><p>Developed by <a href="https://nahidjahanbhuiyan.com" target="_blank" rel="noopener noreferrer">Bhuiyan Mohamed Nahid Jahan <span aria-hidden="true">↗</span></a></p></div>
          </div>
          <style>
            .onestep-footer { background:#0a192f; color:#fff; padding:0; margin-top:60px; }
            .os-footer-wrap { max-width:1240px; margin:auto; padding:0 32px; }
            .os-footer-top { display:grid; grid-template-columns:1fr 1.4fr auto; gap:32px; align-items:center; padding:48px 0; border-bottom:1px solid #ffffff24; }
            .os-footer-brand { display:flex; flex-direction:column; color:#b7c5d8; text-decoration:none; font-size:.85rem; line-height:1.5; }
            .os-footer-brand-name { font-size:2rem; font-weight:800; letter-spacing:-.04em; line-height:1.2; color:#fff; }
            .os-footer-brand-dot { color:#2196ff; }
            .os-footer-top>p { color:#b7c5d8; font-size:1rem; line-height:1.65; margin:0; }
            .os-footer-cta { display:inline-flex; align-items:center; justify-content:space-between; gap:24px; min-height:52px; padding:13px 20px; border-radius:10px; background:#0066cc; color:#fff; font-weight:600; text-decoration:none; }
            .os-footer-cta:hover { background:#0054a8; }
            .os-footer-grid { display:grid; grid-template-columns:1.3fr 1fr 1.1fr 1.1fr; gap:40px; padding:48px 0; }
            .os-footer-grid h3 { font-size:.8rem; font-weight:600; text-transform:uppercase; letter-spacing:.1em; color:#fff; margin:0 0 20px; }
            .os-footer-grid ul { list-style:none; padding:0; margin:0; }
            .os-footer-grid li { margin:0 0 7px; }
            .os-footer-grid nav a,.os-footer-facebook { display:inline-flex; align-items:center; min-height:36px; color:#b7c5d8; text-decoration:none; font-size:.92rem; line-height:1.5; }
            .os-footer-grid a:hover,.os-footer-bottom a:hover { color:#fff; text-decoration:underline; text-underline-offset:4px; }
            .os-footer-phone { display:flex; flex-direction:column; gap:5px; color:#fff; text-decoration:none; font-size:1.2rem; font-weight:600; }
            .os-footer-phone span { color:#73baff; font-size:.8rem; font-weight:400; }
            .os-footer-contact address { font-style:normal; color:#b7c5d8; font-size:.9rem; line-height:1.75; margin:22px 0 14px; }
            .os-footer-facebook { gap:12px; }
            .os-footer-email { display:block; color:#b7c5d8; text-decoration:none; font-size:.92rem; padding:8px 0; overflow-wrap:anywhere; }
            .os-footer-bottom { display:flex; justify-content:space-between; align-items:center; gap:20px; padding:24px 0 30px; border-top:1px solid #ffffff24; color:#91a4bd; font-size:.78rem; }
            .os-footer-bottom p { margin:0; color:#a6b6ca; }
            .os-footer-bottom a { color:#c9d5e5; text-decoration:none; }
            .onestep-footer a:focus-visible { outline:2px solid #73baff; outline-offset:5px; border-radius:3px; }
            @media(max-width:1000px) { .os-footer-top { grid-template-columns:1fr auto; } .os-footer-top>p { grid-column:1 / -1; grid-row:2; } .os-footer-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
            @media(max-width:600px) { .onestep-footer { padding-bottom:80px; } .os-footer-wrap { padding:0 22px; } .os-footer-top { grid-template-columns:1fr; gap:20px; padding:32px 0; } .os-footer-top>p { grid-column:auto; grid-row:auto; font-size:.95rem; } .os-footer-cta { width:100%; } .os-footer-grid { grid-template-columns:1fr; gap:30px; padding:32px 0; } .os-footer-grid h3 { margin-bottom:10px; } .os-footer-grid nav a,.os-footer-facebook { min-height:44px; } .os-footer-grid li { margin:0; } .os-footer-bottom { flex-direction:column; align-items:flex-start; gap:12px; line-height:1.8; padding:22px 0; } }
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
