import os
import json

base_dir = r"C:\Users\User\Desktop\Projects\One-Step\Universities"

universities = [
    {
        "file": "cityu-details.html",
        "title": "City University Malaysia",
        "css": "cityu.css",
        "location": "Petaling Jaya, Cyberjaya",
        "stars": "QS 5-Star (Teaching)",
        "est": "Est. 1984",
        "fees_link": "../Fees_Chart/city-university-fees.html",
        "overview": "<p>City University Malaysia (CityU) is a private higher education institution with a history spanning over 40 years. It was originally established in April 1984 as the Petaling Jaya Community College (PJCC) by a group of scholars, primarily focusing on preparing students for the American degree system.</p><p>Over the years, the institution expanded its offerings and was rebranded as Unity College International (UCI) in 1998. It later upgraded to a University College before finally attaining full university status in 2016. Today, it hosts a global community with students from over 70 different nations.</p>",
        "faculties": ["Business & Management", "Engineering & Technology", "Information Technology", "Health Sciences", "Arts, Design & Architecture", "Hospitality & Tourism", "Social Sciences, Education & Humanities"],
        "location_text": "<p>City University operates multiple campuses. Its main campuses are strategically located in Petaling Jaya and Cyberjaya, with additional branch campuses situated in Johor Bahru and Kota Kinabalu.</p><ul class='faculty-list' style='margin-top:15px;'><li><i class='fas fa-map-marker-alt'></i> Main Campus (Petaling Jaya)</li><li><i class='fas fa-map-marker-alt'></i> Cyberjaya Campus</li><li><i class='fas fa-map-marker-alt'></i> Johor Bahru Campus</li><li><i class='fas fa-map-marker-alt'></i> Sabah Campus</li></ul><h3 style='margin-top: 20px; margin-bottom: 10px;'>Facilities</h3><ul class='faculty-list'><li><i class='fas fa-desktop'></i> State-of-the-art computer and science labs</li><li><i class='fas fa-camera'></i> Specialized studios for Design, Fashion, Photography, and Culinary Arts</li><li><i class='fas fa-book'></i> Comprehensive libraries</li><li><i class='fas fa-bed'></i> Dedicated student housing services</li></ul>",
        "rankings": ["Fully accredited by the Malaysian Qualifications Agency (MQA)", "Recognized by the Ministry of Higher Education (MOHE)", "Degrees acknowledged by the Chinese Ministry of Education", "5-star (Excellent) ratings in QS evaluations for teaching and employability", "'Competitive' rating in the SETARA-2022 national assessment"]
    },
    {
        "file": "alfa-details.html",
        "title": "ALFA University College",
        "css": "alfa.css",
        "location": "Subang Jaya",
        "stars": "MOHE 5-Star",
        "est": "Est. 1998",
        "fees_link": "../Fees_Chart/alfa-fees.html",
        "overview": "<p>ALFA University College (AUC) is a private higher education institution in Malaysia that originally made its mark with a strong foundation in design and the arts. The institution was founded in 1998 as the ALIF Creative Academy in Petaling Jaya.</p><p>Through rapid growth and expansion of its academic disciplines, it transitioned through names like ALFA College and ALFA International College. In 2021, it officially attained University College status. Operating under the motto 'A Leader For All,' the institution emphasizes hands-on, industry-relevant education and reports an impressive graduate employability rate of approximately 95%.</p>",
        "faculties": ["School of Visual Communication (Design, Multimedia)", "Built Environment (Architecture)", "Business, Management, Technology & Accounting", "Hospitality & Tourism Management", "Engineering", "Healthcare", "Education", "Centre for Postgraduate Studies"],
        "location_text": "<p>The institution recently moved to a modern flagship campus located in Subang Jaya (USJ 1) in 2025. The campus is purposely designed to support a 'boutique' and creative learning environment with low student-to-lecturer ratios to encourage personalized mentorship.</p><h3 style='margin-top: 20px; margin-bottom: 10px;'>Facilities</h3><ul class='faculty-list'><li><i class='fas fa-paint-brush'></i> Specialized art studios and design labs</li><li><i class='fas fa-briefcase'></i> Business simulation spaces</li><li><i class='fas fa-tools'></i> Industry-standard resources tailored to hands-on learning</li></ul>",
        "rankings": ["Widely cited among the top institutions in Malaysia for arts and design", "All programs are MQA-accredited", "5-star rating for institutional performance awarded by the Ministry of Higher Education (MOHE) Malaysia", "Achieved ISO international quality certification in 2015", "Included in the certification list of the Chinese Ministry of Education"]
    },
    {
        "file": "segi-details.html",
        "title": "SEGi University",
        "css": "segi.css",
        "location": "Kota Damansara",
        "stars": "QS 5 Stars Plus",
        "est": "Est. 1977",
        "fees_link": "../Fees_Chart/segi-fees.html",
        "overview": "<p>SEGi University is one of Malaysia's largest and most prominent private higher education providers. Its roots date back to 1977 when it was founded as Systematic College. Over the decades, it has experienced massive growth and transformation.</p><p>The university is highly regarded for its philosophy of 'bringing industry into the classroom,' ensuring that students gain practical, real-world experience. Today, SEGi hosts a vibrant and highly multicultural community of over 16,000 students coming from approximately 85 different countries.</p>",
        "faculties": ["Business, Accountancy & Law", "Dentistry", "Education, Languages, Psychology & Music", "Engineering, Built Environment & IT", "Medicine", "Optometry", "Pharmacy", "Professional & Continuing Education (PACE)"],
        "location_text": "<p>The university's flagship 10-acre main campus is located in Kota Damansara, Petaling Jaya, seamlessly connected via a nearby MRT station. SEGi also operates additional college campuses in Kuala Lumpur, Subang Jaya, Penang, and Sarawak.</p><h3 style='margin-top: 20px; margin-bottom: 10px;'>Facilities</h3><ul class='faculty-list'><li><i class='fas fa-tooth'></i> SEGi Oral Health Centre (public-facing training)</li><li><i class='fas fa-eye'></i> Rotary-SEGi EyeCare centre</li><li><i class='fas fa-microscope'></i> Modern research centers</li><li><i class='fas fa-swimming-pool'></i> Swimming pool and extensive sports courts</li><li><i class='fas fa-building'></i> On-campus hostels (SEGi Residence) and SEGi Tower</li></ul>",
        "rankings": ["QS 5 Stars Plus rating—an elite global distinction", "Ranked #701–710 in QS World University Rankings 2027 (top 1.5% globally)", "'Competitive' rating in the SETARA assessment", "All programs are fully MQA-accredited"]
    },
    {
        "file": "taylors-details.html",
        "title": "Taylor's University",
        "css": "taylors.css",
        "location": "Subang Jaya",
        "stars": "QS Top 300",
        "est": "Est. 1969",
        "fees_link": "../Fees_Chart/taylors-fees.html",
        "overview": "<p>Taylor’s University was established in 1969, initially operating as a private college focused on pre-university and tertiary education. Over the decades, it experienced significant growth, achieving full university status in 2010. It is a key member of the Taylor’s Education Group.</p><p>The university is renowned for its modern 'Lakeside Campus' and its unique learning ecosystem known as 'Taylor’sphere.' This ecosystem is designed to nurture students' intellect, creativity, and practical wisdom. Today, Taylor's University stands as a premier private institution in Malaysia.</p>",
        "faculties": ["Faculty of Innovation and Technology", "Faculty of Business and Law", "Faculty of Health and Medical Sciences", "Faculty of Social Sciences and Leisure Management"],
        "location_text": "<p>Taylor's University is primarily located at its state-of-the-art Lakeside Campus in Subang Jaya, Selangor.</p><h3 style='margin-top: 20px; margin-bottom: 10px;'>Facilities</h3><ul class='faculty-list'><li><i class='fas fa-vr-cardboard'></i> VORTEX Extended Reality (XR) lab and Taylor's ME.REKA Makerspace</li><li><i class='fas fa-utensils'></i> Hotel front office simulations, fine dining restaurants, and culinary suites</li><li><i class='fas fa-shopping-bag'></i> On-campus mall and 24-hour library</li><li><i class='fas fa-users'></i> Dynamic Student Life Centre (SLC)</li><li><i class='fas fa-bed'></i> Taylor's Residence with gym and swimming pool</li></ul>",
        "rankings": ["Ranked #272 globally in the QS World University Rankings 2027", "Consistently recognized as the #1 private university in Southeast Asia", "Hospitality & Leisure Management ranked in the Top 30 globally", "Business & Management AACSB accredited", "'Competitive' (Tier 5: Excellent) rating in SETARA"]
    },
    {
        "file": "inti-details.html",
        "title": "INTI International University",
        "css": "inti.css",
        "location": "Nilai, Negeri Sembilan",
        "stars": "QS World #406",
        "est": "Est. 1986",
        "fees_link": "../Fees_Chart/inti-fees.html",
        "overview": "<p>INTI began its journey in 1986 in Brickfields, Kuala Lumpur, with a modest cohort of just 37 students. It achieved a major milestone in 2002 when it was officially granted university status. In 2020, it was acquired by the Hope Education Group.</p><p>Over its history, INTI has graduated over 95,000 students and currently hosts a diverse, multicultural community. The university is highly regarded for its commitment to career readiness, maintaining partnerships with over 500 global companies.</p>",
        "faculties": ["American Degree Transfer Program (ADTP)", "Business & Management", "Computing & IT", "Engineering", "Health Sciences", "Mass Communication"],
        "location_text": "<p>INTI operates a network of campuses across Malaysia. The flagship INTI International University is an 82-acre residential campus located in Putra Nilai, Negeri Sembilan. Branch campuses include INTI International College Subang, Penang, and Sabah.</p><h3 style='margin-top: 20px; margin-bottom: 10px;'>Facilities</h3><ul class='faculty-list'><li><i class='fas fa-flask'></i> Specialized science and engineering laboratories</li><li><i class='fas fa-shopping-cart'></i> E-commerce labs and mass communication studios</li><li><i class='fas fa-book'></i> Comprehensive libraries (e.g., Lee Fah Onn Library)</li><li><i class='fas fa-dumbbell'></i> Sports complexes, gyms, and swimming pools</li><li><i class='fas fa-couch'></i> Dedicated student lounges (INTIMA rooms)</li></ul>",
        "rankings": ["Ranked #406 globally in the QS World University Rankings 2027", "Ranked #122 in Asia (2026)", "Fully accredited by MQA with 'Berdaya Saing' (Competitive) SETARA rating", "Extensive dual-award partnerships with top universities in US, UK, and Australia", "'Employers' Choice of University Award' for 3 consecutive years (2024-2026)"]
    },
    {
        "file": "cyberjaya-details.html",
        "title": "University of Cyberjaya",
        "css": "cyberjaya.css",
        "location": "Cyberjaya",
        "stars": "QS 5-Star",
        "est": "Est. 2005",
        "fees_link": "../Fees_Chart/cyberjaya-fees.html",
        "overview": "<p>The University of Cyberjaya (UoC) is a prominent private university in Malaysia, heavily recognized for its strong roots in health sciences and medical education. It was established in 2005 originally as the Cyberjaya University College of Medical Sciences (CUCMS).</p><p>In 2019, the institution was officially granted full university status by the Malaysian government, prompting its rebrand. Today, it has broadened its horizons to incorporate technology and business programs while maintaining its robust medical heritage.</p>",
        "faculties": ["Medicine (MBBS)", "Pharmacy & Nursing", "Physiotherapy & Psychology", "Biomedical Sciences", "Engineering & Information Technology", "3D Animation & Creative Multimedia", "Business & Management"],
        "location_text": "<p>The main, purpose-built campus is located in the smart-city of Cyberjaya, Selangor, about 30 minutes away from Kuala Lumpur.</p><h3 style='margin-top: 20px; margin-bottom: 10px;'>Facilities</h3><ul class='faculty-list'><li><i class='fas fa-bone'></i> State-of-the-art anatomy laboratories and dissection hall</li><li><i class='fas fa-hospital'></i> Specialized 'Simulation Hospital' for practical medical training</li><li><i class='fas fa-vial'></i> Comprehensive research centers</li><li><i class='fas fa-bed'></i> University-managed off-campus housing (Varsity Lodge)</li></ul>",
        "rankings": ["QS 5-Star rating for teaching, employability, and facilities", "Top 1,000 globally in QS World University Rankings", "5-Star (Excellent) rating in MOHE's SETARA assessment", "Recognized in THE Impact Rankings for SDG 3 (Good Health and Well-being)"]
    },
    {
        "file": "klust-details.html",
        "title": "KLUST (Kuala Lumpur University of Science and Technology)",
        "css": "klust.css",
        "location": "Kajang, Selangor",
        "stars": "QS 5-Star",
        "est": "Est. 1998",
        "fees_link": "../Fees_Chart/klust-fees.html",
        "overview": "<p>Kuala Lumpur University of Science and Technology (KLUST) is a private university located in Kajang, Selangor. Formerly known as Infrastructure University Kuala Lumpur (IUKL), it underwent a major rebranding in 2025.</p><p>Transitioning away from a strict focus on infrastructure, KLUST is now positioning itself as a technology-driven university. Its new strategic pillars focus on 'Digital Foundations,' 'Intelligence-Driven,' and 'AI Empowerment,' aiming to become a leading science and technology university in the ASEAN region.</p>",
        "faculties": ["Civil, Mechanical, and Electrical Engineering", "Information Technology and Artificial Intelligence", "Architecture, Quantity Surveying, and Real Estate", "Accounting and Business Administration", "Corporate Communication"],
        "location_text": "<p>The KLUST campus sits within a 100-acre education township at De Centrum City in Kajang, Selangor. Designed as a green, 'vehicle-free community,' the campus intertwines learning spaces with daily amenities.</p><h3 style='margin-top: 20px; margin-bottom: 10px;'>Facilities</h3><ul class='faculty-list'><li><i class='fas fa-microchip'></i> Specialized laboratories (Automotive, Concrete, PCB, Embedded Systems)</li><li><i class='fas fa-drafting-compass'></i> Contemporary architecture studios and heavy mechanical workshops</li><li><i class='fas fa-shopping-cart'></i> On-site De Centrum Mall with supermarkets and restaurants</li><li><i class='fas fa-bed'></i> Premium Student Residency @ Unipark Condo (pool/gym) and Ixora Hostel</li></ul>",
        "rankings": ["5-Star rating in Teaching and Facilities under QS Stars", "All programs strictly approved by MOHE and MQA", "Direct recognition from Board of Engineers Malaysia (BEM)", "Accredited by Association of Chartered Certified Accountants (ACCA)", "Accredited by Board of Architects Malaysia (LAM)"]
    }
]

template = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} | Details</title>
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/index.css">
  <link rel="stylesheet" href="../assets/css/university-details.css">
  <link rel="stylesheet" href="../assets/css/universities/{css}">
</head>
<body>

  <div class="back-nav">
    <a href="../index.html" class="btn-back">
      <i class="fas fa-arrow-left"></i> Back 
    </a>
  </div>

  <header class="uni-header">
    <div class="uni-header-overlay"></div>
    <div class="container uni-header-content">
      <div data-aos="fade-up" data-aos-duration="1000">
        <h1 class="uni-title">{title}</h1>
        <div class="uni-meta">
          <span class="meta-tag"><i class="fas fa-map-marker-alt"></i> {location}</span>
          <span class="meta-tag"><i class="fas fa-star"></i> {stars}</span>
          <span class="meta-tag"><i class="fas fa-university"></i> {est}</span>
        </div>
      </div>
    </div>
  </header>

<div class="container main-container">
    <div class="tabs-nav" data-aos="fade-up" data-aos-delay="100">
      <button class="tab-btn active" data-tab="overview">Overview</button>
      <button class="tab-btn" data-tab="faculties">Faculties & Programs</button>
      <button class="tab-btn" data-tab="location">Location & Facilities</button>
      <button class="tab-btn" data-tab="rankings">Rankings & Awards</button>
    </div>

    <div class="details-grid">
      <div class="content-area">
        <div id="overview" class="tab-content active" data-aos="fade-up" data-aos-delay="200">
          <h2 class="section-head">About the University</h2>
          {overview}
          <div class="divider"></div>
          <h2 class="section-head">Campus Gallery</h2>
          <div class="gallery-grid">
            <div class="gallery-item" data-aos="zoom-in" data-aos-delay="100">
              <img src="https://via.placeholder.com/600x400?text=Campus+Exterior" alt="Campus Exterior">
              <div class="overlay"><i class="fas fa-expand"></i></div>
              <div class="gallery-title">Campus Exterior</div>
            </div>
            <div class="gallery-item" data-aos="zoom-in" data-aos-delay="150">
              <img src="https://via.placeholder.com/600x400?text=Library" alt="Library">
              <div class="overlay"><i class="fas fa-expand"></i></div>
              <div class="gallery-title">Library</div>
            </div>
            <div class="gallery-item" data-aos="zoom-in" data-aos-delay="200">
              <img src="https://via.placeholder.com/600x400?text=Labs" alt="Labs">
              <div class="overlay"><i class="fas fa-expand"></i></div>
              <div class="gallery-title">State-of-the-art Labs</div>
            </div>
            <div class="gallery-item" data-aos="zoom-in" data-aos-delay="250">
              <img src="https://via.placeholder.com/600x400?text=Student+Lounge" alt="Student Lounge">
              <div class="overlay"><i class="fas fa-expand"></i></div>
              <div class="gallery-title">Student Lounge</div>
            </div>
            <div class="gallery-item" data-aos="zoom-in" data-aos-delay="300">
              <img src="https://via.placeholder.com/600x400?text=Auditorium" alt="Auditorium">
              <div class="overlay"><i class="fas fa-expand"></i></div>
              <div class="gallery-title">Auditorium</div>
            </div>
            <div class="gallery-item" data-aos="zoom-in" data-aos-delay="350">
              <img src="https://via.placeholder.com/600x400?text=Accommodation" alt="Accommodation">
              <div class="overlay"><i class="fas fa-expand"></i></div>
              <div class="gallery-title">Accommodation</div>
            </div>
          </div>
        </div>

        <div id="faculties" class="tab-content">
            <h2 class="section-head">Faculties & Popular Programs</h2>
            <ul class="faculty-list">
                {faculties_html}
            </ul>
        </div>

        <div id="location" class="tab-content">
          <h2 class="section-head">Our Campuses & Facilities</h2>
          {location_text}
        </div>
        
        <div id="rankings" class="tab-content">
            <h2 class="section-head">Rankings, Accreditations & Awards</h2>
            <ul class="faculty-list">
                {rankings_html}
            </ul>
        </div>
      </div>

      <div class="sidebar-info">
        <div class="info-card glass-card" data-aos="fade-left" data-aos-delay="300">
          <h3 class="card-title">At a Glance</h3>
          <div class="stat-row">
            <div class="icon-box"><i class="fas fa-calendar-alt"></i></div>
            <div class="stat-details">
              <strong>Intakes</strong>
              <span>Jan, May, Sept</span>
            </div>
          </div>
          <div class="stat-row">
            <div class="icon-box"><i class="fas fa-globe-asia"></i></div>
            <div class="stat-details">
              <strong>International</strong>
              <span>Yes, Accepted</span>
            </div>
          </div>
          <div class="stat-row">
            <div class="icon-box"><i class="fas fa-home"></i></div>
            <div class="stat-details">
              <strong>Housing</strong>
              <span>On & Off Campus</span>
            </div>
          </div>
        </div>

        <div class="info-card glass-card" data-aos="fade-left" data-aos-delay="400">
          <h3 class="card-title">Interested?</h3>
          <p class="small-text">Get more details or speak to a counselor.</p>
          <div class="action-buttons">
            <a href="{fees_link}" class="btn-action secondary">
              <i class="fas fa-file-invoice-dollar"></i> View Fees
            </a>
            <a href="https://wa.me/601119359497" class="btn-action primary">
              <i class="fab fa-whatsapp"></i> Chat Now
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="lightbox" class="lightbox">
    <span class="close-lightbox">×</span>
    <img class="lightbox-content" id="lightbox-img">
  </div>

  <div id="global-footer-placeholder"></div> 
  <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
  <script src="../assets/js/university-details.js"></script>
  <script src="../assets/js/footer.js"></script>
</body>
</html>
"""

for uni in universities:
    fac_html = "".join([f"<li><i class='fas fa-check-circle'></i> {f}</li>" for f in uni["faculties"]])
    rnk_html = "".join([f"<li><i class='fas fa-award'></i> {r}</li>" for r in uni["rankings"]])
    
    content = template.format(
        title=uni["title"],
        css=uni["css"],
        location=uni["location"],
        stars=uni["stars"],
        est=uni["est"],
        overview=uni["overview"],
        faculties_html=fac_html,
        location_text=uni["location_text"],
        rankings_html=rnk_html,
        fees_link=uni["fees_link"]
    )
    
    with open(os.path.join(base_dir, uni["file"]), "w", encoding="utf-8") as f:
        f.write(content)

print("Generated standard university pages successfully.")
