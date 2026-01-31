
    // Header scroll effect
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.main-header');
      if (window.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    
    // Create floating particles in CTA section
    const particlesContainer = document.getElementById('particlesContainer');
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random properties
      const size = Math.random() * 8 + 2;
      const left = Math.random() * 100;
      const duration = Math.random() * 10 + 10;
      const delay = Math.random() * 5;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${left}%`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;
      
      particlesContainer.appendChild(particle);
    }

    // Animated counter for stats
    function animateCounter(element, target, duration = 2000) {
      let current = 0;
      const increment = target / (duration / 16); // 60fps
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          element.textContent = target + '+';
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current) + '+';
        }
      }, 16);
    }

    // Start counters when in view
    const observerOptions = {
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const universityCount = document.getElementById('universityCount');
          const studentCount = document.getElementById('studentCount');
          
          animateCounter(universityCount, 15);
          animateCounter(studentCount, 150);
          
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe the hero section
    const heroSection = document.querySelector('.hero-section');
    observer.observe(heroSection);

// Mobile menu toggle with smooth animation
    document.addEventListener('DOMContentLoaded', () => {
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        const icon = mobileBtn.querySelector('i');
    
        if (mobileBtn) {
            mobileBtn.addEventListener('click', () => {
                // Toggle the menu visibility
                navLinks.classList.toggle('active');
        
                // Toggle the icon between 'bars' and 'times' (X)
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                    mobileBtn.style.transform = 'rotate(90deg)';
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                    mobileBtn.style.transform = 'rotate(0deg)';
                }
            });
        
            // Close menu when a link is clicked
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                    mobileBtn.style.transform = 'rotate(0deg)';
                });
            });
        }
    });

    // Search form submission
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    const categoryTags = document.querySelectorAll('.category-tag');

    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (searchInput.value.trim()) {
        alert(`Searching for: ${searchInput.value}`);
        // In a real implementation, this would trigger the search functionality
      }
    });

    categoryTags.forEach(tag => {
      tag.addEventListener('click', () => {
        searchInput.value = tag.textContent;
        searchForm.dispatchEvent(new Event('submit'));
      });
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      });
    });

    // Function to reveal all universities
const viewAllBtn = document.getElementById('viewAllBtn');
const hiddenCards = document.querySelectorAll('.hidden-card');

viewAllBtn.addEventListener('click', function() {
  hiddenCards.forEach(card => {
    card.classList.add('revealed');
    card.classList.remove('hidden-card');
  });
  
  // Hide the button once all are shown
  this.style.display = 'none';
});
