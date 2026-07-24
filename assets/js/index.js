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
// Mobile menu logic has been centralized in navbar.js to avoid duplicate events.

   

/* =========================================
   IMPROVED SEARCH ENGINE WITH RESPONSIVE DISPLAY
   ========================================= */

// 1. We no longer use Fees_Chart paths here, we link directly to Universities detail pages.
// Links are generated dynamically based on UNIVERSITY_META.slug.

// Global Variables
let ALL_PROGRAMS_DATA = [];
let rawSearchResults = [];
let filteredResults = [];
let visibleResultsCount = 0;

// Function to get results per page based on screen width
function getResultsPerPage() {
  const width = window.innerWidth;
  if (width >= 1024) return 16; // 3 columns × 5 rows (PC)
  if (width >= 768) return 10;  // 2 columns × 5 rows (Tablet)
  return 5;                     // 1 column × 5 rows (Mobile)
}

// 2. Load Data on Startup
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('universities.json');
        if (!response.ok) throw new Error("JSON not found");
        ALL_PROGRAMS_DATA = await response.json();
        console.log("Enhanced Search Engine: Ready with responsive display");
        
        renderFeaturedUniversities();
    } catch (error) {
        console.error("Search Engine Error:", error);
    }
});

function renderFeaturedUniversities() {
    const grid = document.getElementById('universityGrid');
    if (!grid) return;

    let html = '';
    let count = 0;

    ALL_PROGRAMS_DATA.forEach(uni => {
        // Skip universities that are commented out or not in UNIVERSITY_META
        if (!window.UNIVERSITY_META || !window.UNIVERSITY_META[uni.name]) return;
        
        const meta = window.UNIVERSITY_META[uni.name];
        
        const isHidden = count >= 6 ? ' hidden-card' : '';
        const detailsLink = `Universities/${meta.slug}-details.html`;
        const feesLink = `Fees_Chart/${meta.slug}-fees.html`;

        html += `
          <div class="university-card${isHidden}">
            <div class="university-badge">${meta.badge}</div>
            <img src="assets/images/universities/${meta.img}" alt="${uni.name}" class="university-img" onerror="this.src='https://via.placeholder.com/400x250?text=University'">
            <div class="university-content">
              <h3 class="university-name">${uni.name}</h3>
              <div class="university-location"><i class="fas fa-map-marker-alt"></i><span>${meta.loc}</span></div>
              <div class="university-card-buttons">
                <a href="${feesLink}" class="card-btn programs">
                  <i class="fas fa-list-ul"></i> Programs
                </a>
                <a href="${detailsLink}" class="card-btn details">
                  Details <i class="fas fa-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        `;
        count++;
    });

    grid.innerHTML = html;
}

/* =========================================
   SEARCH FUNCTIONS (UPDATED)
   ========================================= */

function triggerSearch() {
    const input = document.getElementById("programSearchInput").value.toLowerCase().trim();
    const resultBox = document.getElementById("searchResults");
    const seeMoreBox = document.getElementById("seeMoreContainer");
    const filterBox = document.getElementById("filterContainer");

    // Reset UI
    resultBox.innerHTML = "";
    seeMoreBox.style.display = "none";
    filterBox.style.display = "none";
    filterBox.innerHTML = "";
    
    rawSearchResults = [];
    filteredResults = [];
    visibleResultsCount = 0;

    if (input.length < 2) return;

    const searchTerms = input.split(' ').filter(term => term.length > 0);

    // 1. Find All Matches
    ALL_PROGRAMS_DATA.forEach(uni => {
        const uniName = uni.name;
        if (!window.UNIVERSITY_META || !window.UNIVERSITY_META[uniName]) return;
        const meta = window.UNIVERSITY_META[uniName];
        const uniLink = `Fees_Chart/${meta.slug}-fees.html`;

        uni.programs.forEach(program => {
            const progName = program.name;
            const fullTextToCheck = (uniName + " " + progName).toLowerCase();
            const isMatch = searchTerms.every(term => fullTextToCheck.includes(term));

            if (isMatch) {
                rawSearchResults.push({
                    uniName: uniName,
                    progName: progName,
                    level: program.level || "Other",
                    duration: program.duration || "N/A",
                    link: uniLink
                });
            }
        });
    });

    // 2. Handle Filters - Only show if more than initial results
    const initialResultsCount = getResultsPerPage();
    if (rawSearchResults.length > initialResultsCount) {
        generateFilters(rawSearchResults);
    }

    // 3. Initial Render (Show All)
    filteredResults = [...rawSearchResults];
    
    if (filteredResults.length > 0) {
        renderResultsBatch();
    } else {
        resultBox.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: white;">
                <i class="fas fa-search" style="font-size: 40px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>No programs found. Try different keywords.</p>
            </div>
        `;
    }
}

// GENERATE FILTER BUTTONS (Updated logic)
function generateFilters(results) {
    const filterBox = document.getElementById("filterContainer");
    const initialResultsCount = getResultsPerPage();
    
    // Only show filters if we have more than initial results
    if (results.length <= initialResultsCount) {
        filterBox.style.display = "none";
        return;
    }
    
    const levels = new Set();
    
    // Extract unique levels
    results.forEach(item => {
        if(item.level) levels.add(item.level);
    });

    // Only show filter bar if we have different levels
    if (levels.size > 1) {
        filterBox.style.display = "flex";
        
        // "All" Button
        let html = `<button class="filter-btn active" onclick="applyFilter('All', this)">All (${results.length})</button>`;
        
        // Dynamic Buttons
        levels.forEach(level => {
            const count = results.filter(r => r.level === level).length;
            html += `<button class="filter-btn" onclick="applyFilter('${level}', this)">${level} (${count})</button>`;
        });

        filterBox.innerHTML = html;
    }
}

// APPLY FILTER LOGIC (Updated)
function applyFilter(category, btn) {
    // 1. Visual Update
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 2. Data Filter
    if (category === 'All') {
        filteredResults = [...rawSearchResults];
    } else {
        filteredResults = rawSearchResults.filter(item => item.level === category);
    }

    // 3. Reset and Re-render
    document.getElementById("searchResults").innerHTML = "";
    document.getElementById("seeMoreContainer").style.display = "none";
    visibleResultsCount = 0;
    renderResultsBatch();
}

// RENDER FUNCTION (Updated with responsive batch size)
function renderResultsBatch() {
    const resultBox = document.getElementById("searchResults");
    const seeMoreBox = document.getElementById("seeMoreContainer");
    
    const resultsPerPage = getResultsPerPage();
    const nextBatch = filteredResults.slice(visibleResultsCount, visibleResultsCount + resultsPerPage);

    nextBatch.forEach((item, index) => {
        const delay = index * 0.05; 
        const encodedProg = encodeURIComponent(item.progName);
        const finalUrl = `${item.link}?q=${encodedProg}`;

        const cardHTML = `
            <div class="result-card" style="animation-delay: ${delay}s">
                <div>
                    <div class="result-uni"><i class="fas fa-university"></i> ${item.uniName}</div>
                    <h4 class="result-program">${item.progName}</h4>
                    <div class="result-meta">
                        <span class="meta-tag"><i class="fas fa-layer-group"></i> ${item.level}</span>
                        <span class="meta-tag"><i class="fas fa-clock"></i> ${item.duration}</span>
                    </div>
                </div>
                <a href="${finalUrl}" class="view-fees-btn">
                    View Details <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
        resultBox.insertAdjacentHTML('beforeend', cardHTML);
    });

    visibleResultsCount += nextBatch.length;

    // Update "See More" Button - Only show if there are more results
    if (visibleResultsCount < filteredResults.length) {
        seeMoreBox.style.display = "block";
        const btn = document.getElementById("seeMoreBtn");
        const remaining = filteredResults.length - visibleResultsCount;
        const resultsPerLoad = getResultsPerPage();
        const nextLoad = Math.min(remaining, resultsPerLoad);
        
        btn.innerText = `Load ${nextLoad} More (${remaining} total remaining)`;
        btn.onclick = renderResultsBatch;
    } else {
        seeMoreBox.style.display = "none";
    }
}

// Add event listener for Enter key on search input
document.getElementById('programSearchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        triggerSearch();
    }
});  


/* =========================================
   DREAM COUNTRY CAROUSEL LOGIC
   ========================================= */

// 1. Data Source (Based on your image)
// Note: Replace 'flag_url' with actual paths to your flag images. 
// I'm using CDN links for demonstration.
const countriesData = [
  {
    name: "Finland",
    color: "#003580", // Blue
    flag: "https://flagcdn.com/w160/fi.png", 
    intakes: "January, September",
    programs: "Bachelor, Master",
    fee: "Under 15,000€",
    visa: "90-100%",
    link: "countries/finland.html"
  },
  {
    name: "Italy",
    color: "#009246", // Green
    flag: "https://flagcdn.com/w160/it.png",
    intakes: "September",
    programs: "Bachelor, Master",
    fee: "Under 5,000€",
    visa: "40-50%",
    link: "countries/italy.html"
  },
  {
    name: "Hungary",
    color: "#477050", // Greenish
    flag: "https://flagcdn.com/w160/hu.png",
    intakes: "February, September",
    programs: "Bachelor, Master",
    fee: "Under 10,000€",
    visa: "60-70%",
    link: "countries/hungary.html"
  },
  {
    name: "Spain",
    color: "#AA151B", // Red
    flag: "https://flagcdn.com/w160/es.png",
    intakes: "February, September",
    programs: "Vocational, Language",
    fee: "Under 13,000€",
    visa: "90-100%",
    link: "countries/spain.html"
  },
  {
    name: "Cyprus",
    color: "#D57800", // Orange/Copper
    flag: "https://flagcdn.com/w160/cy.png",
    intakes: "January, September",
    programs: "Bachelor, Master",
    fee: "Under 10,000€",
    visa: "60-70%",
    link: "countries/cyprus.html"
  },
  {
    name: "Uzbekistan",
    color: "#0099B5", // Light Blue
    flag: "https://flagcdn.com/w160/uz.png",
    intakes: "January, September",
    programs: "Bachelor, Master",
    fee: "Under 5,000$",
    visa: "98%",
    link: "countries/uzbekistan.html"
  },
  {
    name: "China",
    color: "#DE2910", // Red
    flag: "https://flagcdn.com/w160/cn.png",
    intakes: "March, September",
    programs: "Bachelor, Master",
    fee: "Under 5,000$",
    visa: "90-100%",
    link: "countries/china.html"
  },
  {
    name: "Norway",
    color: "#BA0C2F", // Red
    flag: "https://flagcdn.com/w160/no.png",
    intakes: "November",
    programs: "Bachelor, Master",
    fee: "Under 15,000€",
    visa: "90-100%",
    link: "countries/norway.html"
  },
  {
    name: "Sweden",
    color: "#006AA7", // Blue
    flag: "https://flagcdn.com/w160/se.png",
    intakes: "December",
    programs: "Bachelor, Master",
    fee: "Under 15,000€",
    visa: "90-100%",
    link: "countries/sweden.html"
  },
  {
    name: "Denmark",
    color: "#C60C30", // Red
    flag: "https://flagcdn.com/w160/dk.png",
    intakes: "January, September",
    programs: "Bachelor, Master, PhD",
    fee: "Under 15,000€",
    visa: "90-100%",
    link: "countries/denmark.html"
  }
];

let currentCountryIndex = 0;

// Initialize Carousel
document.addEventListener('DOMContentLoaded', () => {
  renderFlags();
  updateCountryDisplay();
});

function renderFlags() {
  const container = document.getElementById('flagCarousel');
  container.innerHTML = ''; // Clear existing

  countriesData.forEach((country, index) => {
    const el = document.createElement('div');
    el.className = 'flag-item';
    el.style.backgroundImage = `url('${country.flag}')`;
    el.dataset.index = index;
    el.dataset.name = country.name;
    
    // Add click event to rotate to this specific flag
    el.onclick = () => {
        const diff = index - currentCountryIndex;
        rotateCountry(diff);
    };

    container.appendChild(el);
  });
  
  updateFlagPositions();
}

function rotateCountry(direction) {
  // Update index
  const count = countriesData.length;
  currentCountryIndex = (currentCountryIndex + direction + count) % count;
  
  updateFlagPositions();
  updateCountryDisplay();
}

function updateFlagPositions() {
  const flags = document.querySelectorAll('.flag-item');
  const count = flags.length;
  const center = currentCountryIndex;

  flags.forEach((flag, i) => {
    // Reset classes
    flag.className = 'flag-item';
    
    // Calculate distance from center (wrapping around array)
    // We need shortest distance logic for the circular array
    let dist = (i - center);
    
    // Adjust for wrapping (e.g. if length is 10, dist -9 is actually +1)
    if (dist > count / 2) dist -= count;
    if (dist < -count / 2) dist += count;

    // Assign position class based on distance
    if (dist === 0) flag.classList.add('pos-0');
    else if (dist === 1) flag.classList.add('pos-1');
    else if (dist === -1) flag.classList.add('pos-minus-1');
    else if (dist === 2) flag.classList.add('pos-2');
    else if (dist === -2) flag.classList.add('pos-minus-2');
    else flag.classList.add('hidden');
  });
}

function updateCountryDisplay() {
  const data = countriesData[currentCountryIndex];
  
  // 1. Update Text Content with fade effect
  const card = document.getElementById('countryInfoCard');
  
  // Subtle fade out/in for text
  card.style.opacity = '0.8';
  setTimeout(() => {
      document.getElementById('cName').textContent = data.name;
      document.getElementById('cIntakes').textContent = data.intakes;
      document.getElementById('cPrograms').textContent = data.programs;
      document.getElementById('cFee').textContent = data.fee;
      document.getElementById('cVisa').textContent = data.visa;
      document.getElementById('cReadMore').href = data.link;
      card.style.opacity = '1';
  }, 200);

  // 2. Change Background Color Gradient
  const section = document.querySelector('.dream-country-section');
  const overlay = document.querySelector('.country-bg-overlay');
  
  // We mix the country's primary color with a dark overlay for readability
  // Using hex to rgba conversion for the gradient
  overlay.style.background = `linear-gradient(135deg, ${hexToRgba(data.color, 0.9)}, rgba(10, 25, 47, 0.95))`;
}

// Helper to convert hex to rgba for gradient transparency
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* =========================================
   VIEW ALL UNIVERSITIES LOGIC
   ========================================= */
const viewAllBtn = document.getElementById('viewAllBtn');

if (viewAllBtn) {
    viewAllBtn.addEventListener('click', function() {
        // 1. Select all hidden cards
        const hiddenCards = document.querySelectorAll('.university-card.hidden-card');
        
        // 2. Reveal them with a smooth staggered animation
        hiddenCards.forEach((card, index) => {
            // Remove display:none
            card.classList.remove('hidden-card');
            
            // Add a class to trigger CSS animation (fade in)
            card.classList.add('revealed');
            
            // Optional: Add inline delay for a cascading effect
            card.style.animationDelay = `${index * 0.1}s`;
        });

        // 3. Hide the button itself after expanding
        this.style.display = 'none';
        
        // Optional: If you want to change text to "Show Less" instead of hiding:
        // this.textContent = "Show Less";
        // (But usually hiding is cleaner for this layout)
    });
}
