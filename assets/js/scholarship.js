// assets/js/scholarship.js
document.addEventListener('DOMContentLoaded', () => {
    
    // Animate Progress Bars on Scroll
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate bars
                if (entry.target.classList.contains('structure-card')) {
                    const bars = entry.target.querySelectorAll('.bar');
                    bars.forEach(bar => {
                        // Temporarily set width to 0 in CSS or inline to animate to actual width
                        // Ideally, we keep the width in style attribute and animate it
                        const targetWidth = bar.style.width;
                        bar.style.width = '0%';
                        setTimeout(() => {
                            bar.style.width = targetWidth;
                        }, 100);
                    });
                    observer.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);

    const structureCards = document.querySelectorAll('.structure-card');
    structureCards.forEach(card => observer.observe(card));
});
