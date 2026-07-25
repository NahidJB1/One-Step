# One-Step 🎓

> **To Reach Dream** – A comprehensive portal for local and international students to discover university programs, explore campuses, and view detailed tuition fee structures across Malaysia's top universities.

## 🌟 Features

- **Global Program Search Engine**: Instantly search across dozens of universities to find the perfect Diploma, Bachelor's, Master's, or PhD program.
- **Dynamic Smart Filters**: Filter search results dynamically by study level (e.g., Foundation, Degree, Doctorate).
- **Comprehensive University Profiles**: View detailed campuses, badges (Public, Research, Technology), rankings, and location information.
- **Tuition Fee Breakdowns**: Fully tabulated and organized fee structures separated by program categories (Undergraduate, Postgraduate, International, Local).
- **Downloadable Resources**: Download official university fee structures and brochures directly as PDFs or ZIP archives.

## 🏫 Supported Universities
One-Step currently features integrated data for top Malaysian universities including:
- Universiti Malaya (UM)
- Universiti Putra Malaysia (UPM)
- Universiti Teknologi Malaysia (UTM)
- Universiti Teknikal Malaysia Melaka (UTeM)
- International Islamic University Malaysia (IIUM)
- University of Wollongong (UOW) Malaysia
- Multimedia University (MMU)
- UCSI University
- Universiti Kuala Lumpur (UniKL)
- Lincoln University College
- *...and many more.*

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Data Architecture**: Lightweight JSON-based static APIs
  - `universities.json`: Highly optimized array for rapid global search indexing.
  - `fees_data.json`: Deeply nested relational data for rendering complex financial tables and program specifics.
- **Deployment**: GitHub Pages (Static Hosting)



## 📁 Project Structure

```
One-Step/
├── index.html                  # Homepage & Search Engine
├── assets/                     # CSS, JS, and global images
│   ├── css/                    # Stylesheets
│   ├── js/                     # Application logic (search, fees, rendering)
│   └── images/universities/    # High-quality university campus and logo assets
├── data/                       # JSON databases
│   └── fees_data.json          # Detailed tuition fee structures
├── Universities/               # Detailed university profile pages
├── Fees_Chart/                 # Dynamic tuition fee tables
└── universities.json           # Search engine index data
```

## 📝 License
This project is proprietary. All university logos, brochures, and data belong to their respective institutions.
