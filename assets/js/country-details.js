/* assets/js/country-details.js */

// 1. COUNTRY DATA
const countries = [
    { name: "Finland", flag: "https://flagcdn.com/w160/fi.png", link: "finland.html" },
    { name: "Italy", flag: "https://flagcdn.com/w160/it.png", link: "italy.html" },
    { name: "Hungary", flag: "https://flagcdn.com/w160/hu.png", link: "hungary.html" },
    { name: "Spain", flag: "https://flagcdn.com/w160/es.png", link: "spain.html" },
    { name: "China", flag: "https://flagcdn.com/w160/cn.png", link: "china.html" },
    { name: "Sweden", flag: "https://flagcdn.com/w160/se.png", link: "sweden.html" },
    { name: "Norway", flag: "https://flagcdn.com/w160/no.png", link: "norway.html" }
];

document.addEventListener('DOMContentLoaded', () => {
    
    // A. INIT SCROLL ANIMATIONS (Fade In elements)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));


    // B. POPULATE BOTTOM SCROLLER
    const scroller = document.getElementById('countryScroller');
    if (scroller) {
        countries.forEach(country => {
            const item = document.createElement('a');
            item.href = country.link;
            item.className = 'mini-flag-card';
            item.innerHTML = `
                <div class="mini-flag-img" style="background-image: url('${country.flag}')"></div>
                <div class="mini-flag-name">${country.name}</div>
            `;
            scroller.appendChild(item);
        });
    }
});

// C. INFINITE LOOP LOGIC (AMAZING ANIMATION)
let isAnimating = false;

function scrollCountries(direction) {
    if (isAnimating) return; // Prevent spam clicking
    
    const container = document.getElementById('countryScroller');
    const firstCard = container.firstElementChild;
    
    // Calculate exact width of one item + gap
    // (120px min-width + 20px gap defined in CSS)
    const cardWidth = firstCard.offsetWidth + 20; 

    if (direction === 1) { // NEXT Arrow
        isAnimating = true;

        // 1. Smoothly Slide Left
        container.style.transition = 'transform 0.4s ease-in-out';
        container.style.transform = `translateX(-${cardWidth}px)`;

        // 2. After slide finishes: Move first item to end & Snap back
        setTimeout(() => {
            container.appendChild(container.firstElementChild); // Move DOM element
            container.style.transition = 'none'; // Disable animation for the snap
            container.style.transform = 'translateX(0)'; // Snap back to 0 (invisible to user)
            isAnimating = false;
        }, 400); // Matches transition duration

    } else { // PREV Arrow
        isAnimating = true;

        // 1. Instantly move Last Item to Start (but offset it visually so it looks like it didn't move yet)
        container.style.transition = 'none';
        container.insertBefore(container.lastElementChild, container.firstElementChild);
        container.style.transform = `translateX(-${cardWidth}px)`;

        // 2. Force Browser Reflow (Necessary for CSS transition to catch the change)
        void container.offsetWidth; 

        // 3. Smoothly Slide to 0
        container.style.transition = 'transform 0.4s ease-in-out';
        container.style.transform = 'translateX(0)';

        setTimeout(() => {
            isAnimating = false;
        }, 400);
    }
}
