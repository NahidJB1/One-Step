document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Initialize AOS (Animation On Scroll)
    AOS.init({
        offset: 80,
        duration: 800,
        easing: 'ease-out-cubic',
        once: true
    });

    // 2. Tab System Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Show corresponding content
            const targetId = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);
            targetContent.classList.add('active');
            
            // Refresh AOS inside the new tab so animations trigger correctly
            setTimeout(() => {
                AOS.refresh();
            }, 100);
        });
    });

    // 3. Lightbox Functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const galleryItems = document.querySelectorAll('.gallery-item img');
    const closeBtn = document.querySelector('.close-lightbox');

    if(lightbox) {
        // Open Lightbox
        galleryItems.forEach(img => {
            img.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent bubbling
                lightbox.style.display = 'flex';
                lightboxImg.src = img.src;
            });
        });

        // Close Lightbox
        closeBtn.addEventListener('click', () => {
            lightbox.style.display = 'none';
        });

        // Close on clicking outside image
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        });
    }
});
