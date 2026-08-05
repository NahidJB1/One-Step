document.addEventListener('DOMContentLoaded', () => {
    const navbarPlaceholder = document.getElementById('global-nav-placeholder');
    
    // Get current path to set active class
    const path = window.location.pathname;
    const page = path.split("/").pop();
    
    // Fix for logo link in subdirectories - use relative path to root
    const isInSubdirectory = path.includes('/countries/') || path.includes('/universities/') || path.includes('/scholarship/') || path.includes('/Fees_Chart/') || path.includes('/Articles/');
    const logoHref = isInSubdirectory ? '../index.html' : 'index.html';
    
    // Fix navigation links for subdirectories
    const getNavLink = (pageName) => {
        if (isInSubdirectory) {
            return `../${pageName}`;
        }
        
        // If we are on the homepage and trying to link to a section on the same page
        if ((page === 'index.html' || page === '') && pageName.startsWith('index.html#')) {
            return pageName.replace('index.html', '');
        }
        
        return pageName;
    };

    const navbarHTML = `
    <header class="main-header">
      <div class="container nav-container">
        <a href="${logoHref}" class="logo">
          <svg width="50" height="50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-img">
            <circle cx="50" cy="50" r="48" stroke="#0066CC" stroke-width="4"/>
            <path d="M30 70L50 50L70 30" stroke="#FFD700" stroke-width="8" stroke-linecap="round"/>
            <path d="M30 40L50 20L70 40" stroke="#00C2FF" stroke-width="6" stroke-linecap="round"/>
            <rect x="40" y="60" width="20" height="10" rx="2" fill="#0066CC"/>
          </svg>
          <div class="logo-text">
            <span style="font-weight: 800; letter-spacing: 1px; color: var(--primary);">ONE STEP</span>
            <span style="color: var(--gray); font-size: 0.85rem;">To touch Dream</span>
          </div>
        </a>
        
        <nav class="nav-links" id="navLinks">
          <a href="${getNavLink('index.html')}" class="nav-link ${page === 'index.html' || page === '' || page.includes('index.html') ? 'active' : ''}">Home</a>
          <a href="${getNavLink('scholarship.html')}" class="nav-link ${page === 'scholarship.html' || page.includes('scholarship') ? 'active' : ''}">Scholarships</a>
          <a href="${getNavLink('index.html#contact')}" class="nav-link">Contact</a>
          <a href="${getNavLink('application.html')}" class="nav-link" style="background-color: #0066CC; color: white; padding: 8px 20px; border-radius: 25px; font-weight: 600; margin-left: 10px; white-space: nowrap; transition: transform 0.3s ease, box-shadow 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 10px rgba(0, 102, 204, 0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">Apply Now</a>
        </nav>
        
        <div class="nav-actions">
          <a href="https://wa.me/601119359497" target="_blank" class="nav-icon" title="WhatsApp">
            <i class="fab fa-whatsapp"></i>
          </a>
          <a href="${getNavLink('login.php')}" class="nav-icon student-portal-icon" title="Student Portal">
            <i class="fas fa-user-circle"></i>
          </a>
          <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu">
            <span class="menu-icon">
              <span class="menu-line"></span>
              <span class="menu-line"></span>
              <span class="menu-line"></span>
            </span>
          </button>
        </div>
      </div>
    </header>`;

    if (navbarPlaceholder) {
        navbarPlaceholder.innerHTML = navbarHTML;
        initNavbarLogic();
    }
});

function initNavbarLogic() {
    const header = document.querySelector('.main-header');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-link');
    
    // Check if mobile menu button exists
    if (!mobileMenuBtn) {
        console.error('Mobile menu button not found!');
        return;
    }

    // 1. Mobile Menu Toggle
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
        
        // Toggle aria-expanded for accessibility
        const isExpanded = navLinks.classList.contains('active');
        mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
    });

    // 2. Close Mobile Menu when a link is clicked
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        });
    });

    // 3. Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // 4. Scroll Effect (Background appears on scroll)
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // 5. Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            // Reset mobile menu state on larger screens
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    });
}
