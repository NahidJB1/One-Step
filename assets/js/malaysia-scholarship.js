// assets/js/malaysia-scholarship.js

document.addEventListener("DOMContentLoaded", function() {
    
    const form = document.getElementById("scholarshipForm");
    const qualSelect = document.getElementById("qualification");
    const resultsContainer = document.getElementById("resultsContainer");
    
    const uniSelect = document.getElementById("university");
    const programmeGroup = document.getElementById("programmeGroup");
    const programmeSelect = document.getElementById("programme");
    const subjectSelect = document.getElementById("subject");
    
    const passportInput = document.getElementById("passport");
    const passportCheck = document.getElementById("noPassport");

    const formView = document.getElementById("formView");
    const dashboardView = document.getElementById("dashboardView");
    
    // Scholarship Map
    const scholarshipMap = {
        "Alfa University": { default: 90000, condition: "Foundation/Diploma", conditionAmt: 30000 },
        "BAC": { default: 92000 },
        "Binary University": { default: 90000 },
        "City University": { default: 95000 },
        "Cyberjaya Uni": { default: 90000 },
        "Cybernetics": { default: 70000 },
        "Genovasi Uni": { default: 60000 },
        "INTI International University": { default: 100000 },
        "Kings College": { default: 50000 },
        "KLUST": { default: 80000 },
        "SEGi University": { default: 90000 },
        "Taylor's University": { default: 90000 },
        "UCMI": { default: 90000 }
    };

    // Populate University Dropdown
    if (window.UNIVERSITY_META) {
        uniSelect.innerHTML = '<option value="">-- Select University --</option>';
        Object.keys(window.UNIVERSITY_META).forEach(uniKey => {
            let option = document.createElement("option");
            option.value = window.UNIVERSITY_META[uniKey].name;
            option.text = window.UNIVERSITY_META[uniKey].name;
            option.dataset.key = uniKey; // Store original key for lookup
            uniSelect.appendChild(option);
        });
    }

    // Comprehensive Subject List
    const ALL_SUBJECTS = [
        "Accounting and Finance", "Architecture", "Artificial Intelligence", 
        "Biomedical Science", "Business Administration", "Civil Engineering", 
        "Computer Science", "Culinary Arts", "Cyber Security", "Data Science",
        "Dentistry", "Digital Marketing", "Early Childhood Education", 
        "Electrical & Electronic Engineering", "Fashion Design", "Graphic Design", 
        "Hospitality Management", "Human Resource Management", "Information Technology",
        "International Business", "Law", "Logistics & Supply Chain", 
        "Mass Communication", "Mechanical Engineering", "Medicine (MBBS)", 
        "Nursing", "Optometry", "Pharmacy", "Psychology", "Software Engineering",
        "Tourism Management", "Diploma in Business", "Diploma in IT", 
        "Foundation in Science", "Foundation in Arts"
    ].sort();

    // Fetch exact subjects from fees_data.json
    // Structure: ALL_FEES_SUBJECTS[uniId][categoryName] = [subject1, subject2]
    let ALL_FEES_SUBJECTS = {};
    fetch('data/fees_data.json')
        .then(res => res.json())
        .then(data => {
            for (let uniId in data) {
                ALL_FEES_SUBJECTS[uniId] = {};
                let uni = data[uniId];
                if (uni.categories) {
                    uni.categories.forEach(cat => {
                        let catName = cat.category_name || "General Programs";
                        let subjects = new Set();
                        if (cat.table && cat.table.rows) {
                            cat.table.rows.forEach(row => {
                                // Assuming programme name is in index 1
                                if (row[1]) {
                                    // Remove html tags if any
                                    let progName = row[1].replace(/<[^>]*>?/gm, '').trim();
                                    subjects.add(progName);
                                }
                            });
                        }
                        if (subjects.size > 0) {
                            ALL_FEES_SUBJECTS[uniId][catName] = Array.from(subjects).sort();
                        }
                    });
                }
            }
        })
        .catch(err => console.error("Could not load fee subjects:", err));

    // Store currently selected university JSON key
    let currentUniJsonKey = null;

    // Handle University Change to populate Programmes
    uniSelect.addEventListener("change", function() {
        programmeSelect.innerHTML = '<option value="">-- Select Programme --</option>';
        programmeSelect.disabled = true;
        programmeGroup.style.display = 'none';

        subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';
        subjectSelect.disabled = true;

        if (this.value) {
            let selectedOption = this.options[this.selectedIndex];
            let uniKey = selectedOption.dataset.key; // The key from window.UNIVERSITY_META
            let uniData = window.UNIVERSITY_META[uniKey];

            // Get exact data from the fees data using feesSlug or slug
            currentUniJsonKey = uniData.feesSlug || uniData.slug;
            let categories = ALL_FEES_SUBJECTS[currentUniJsonKey];

            if (categories && Object.keys(categories).length > 0) {
                // Show Programme Dropdown
                programmeGroup.style.display = 'block';
                Object.keys(categories).forEach(catName => {
                    let option = document.createElement("option");
                    option.value = catName;
                    option.text = catName;
                    programmeSelect.appendChild(option);
                });
                programmeSelect.disabled = false;
            } else {
                // Fallback: No categories found, just show generic subjects directly
                ALL_SUBJECTS.forEach(sub => {
                    let option = document.createElement("option");
                    option.value = sub;
                    option.text = sub;
                    subjectSelect.appendChild(option);
                });
                subjectSelect.disabled = false;
            }
        }
    });

    // Handle Programme Change to populate Subjects
    programmeSelect.addEventListener("change", function() {
        subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';
        subjectSelect.disabled = true;

        if (this.value && currentUniJsonKey) {
            let selectedCat = this.value;
            let subjectsToLoad = ALL_FEES_SUBJECTS[currentUniJsonKey][selectedCat];

            if (subjectsToLoad && subjectsToLoad.length > 0) {
                subjectsToLoad.forEach(sub => {
                    let option = document.createElement("option");
                    option.value = sub;
                    option.text = sub;
                    subjectSelect.appendChild(option);
                });
            } else {
                // Fallback to generic
                ALL_SUBJECTS.forEach(sub => {
                    let option = document.createElement("option");
                    option.value = sub;
                    option.text = sub;
                    subjectSelect.appendChild(option);
                });
            }
            
            subjectSelect.disabled = false;
        }
    });

    // Handle Qualification Change
    qualSelect.addEventListener("change", function() {
        resultsContainer.innerHTML = "";
        let val = this.value;

        if (val === "SSC") {
            resultsContainer.innerHTML = createGpaSelects("SSC GPA", "sscGpa", 5);
        } else if (val === "HSC") {
            resultsContainer.innerHTML = createGpaSelects("SSC GPA", "sscGpa", 5) + 
                                         createGpaSelects("HSC GPA", "hscGpa", 5);
        } else if (val === "Bachelor") {
            resultsContainer.innerHTML = createGpaSelects("HSC GPA", "hscGpa", 5) + 
                                         createGpaSelects("Bachelor CGPA", "bachelorCgpa", 4);
        } else if (val === "Master's") {
            resultsContainer.innerHTML = createGpaSelects("SSC GPA", "sscGpa", 5) + 
                                         createGpaSelects("HSC GPA", "hscGpa", 5) + 
                                         createGpaSelects("Bachelor CGPA", "bachelorCgpa", 4) +
                                         createGpaSelects("Master's CGPA", "mastersCgpa", 4);
        }
    });

    function createGpaSelects(label, id, maxWhole) {
        let wholeOptions = '';
        for (let i = maxWhole; i >= 1; i--) {
            wholeOptions += `<option value="${i}">${i}</option>`;
        }
        
        let decimalOptions = '';
        for (let i = 0; i <= 9; i++) {
            decimalOptions += `<option value="${i}">${i}</option>`;
        }

        return `
            <div class="result-input-group" style="padding: 10px; border-radius: 8px;">
                <label style="display:block; margin-bottom: 5px;">${label}</label>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <select name="${id}_whole" class="form-control" style="width: auto; padding: 10px;" required>
                        <option value="">-</option>
                        ${wholeOptions}
                    </select>
                    <span style="font-size: 1.5rem; font-weight: bold;">.</span>
                    <select name="${id}_dec1" class="form-control" style="width: auto; padding: 10px;" required>
                        <option value="">-</option>
                        ${decimalOptions}
                    </select>
                    <select name="${id}_dec2" class="form-control" style="width: auto; padding: 10px;" required>
                        <option value="">-</option>
                        ${decimalOptions}
                    </select>
                </div>
            </div>
        `;
    }

    // Force .00 if max GPA is selected
    form.addEventListener("change", function(e) {
        if (e.target.name && e.target.name.endsWith("_whole")) {
            let baseName = e.target.name.replace("_whole", "");
            let maxVal = parseInt(e.target.options[1].value); 
            
            let dec1 = form.querySelector(`select[name="${baseName}_dec1"]`);
            let dec2 = form.querySelector(`select[name="${baseName}_dec2"]`);
            
            if (parseInt(e.target.value) === maxVal) {
                dec1.value = "0";
                dec2.value = "0";
                dec1.style.pointerEvents = "none";
                dec1.style.opacity = "0.5";
                dec2.style.pointerEvents = "none";
                dec2.style.opacity = "0.5";
            } else {
                dec1.style.pointerEvents = "auto";
                dec1.style.opacity = "1";
                dec2.style.pointerEvents = "auto";
                dec2.style.opacity = "1";
            }
        }
    });

    // Handle Passport checkbox
    passportCheck.addEventListener("change", function() {
        if (this.checked) {
            passportInput.value = "I don't have";
            passportInput.disabled = true;
        } else {
            passportInput.value = "";
            passportInput.disabled = false;
        }
    });

    // Form Submit
    let submittedData = {};

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        
        // Collect Data
        let formData = new FormData(form);
        submittedData = Object.fromEntries(formData.entries());
        
        if(passportCheck.checked) {
            submittedData.passport = "I don't have";
            formData.set("passport", "I don't have");
        }

        // Reconstruct GPA values from dropdowns before sending
        const gpaKeys = ["sscGpa", "hscGpa", "bachelorCgpa", "mastersCgpa"];
        gpaKeys.forEach(key => {
            if (submittedData[`${key}_whole`]) {
                let whole = submittedData[`${key}_whole`];
                let dec1 = submittedData[`${key}_dec1`] || "0";
                let dec2 = submittedData[`${key}_dec2`] || "0";
                let combinedGpa = `${whole}.${dec1}${dec2}`;
                
                // Add to formData for PHP to read correctly
                formData.set(key, combinedGpa);
                // Also format submittedData for the "See Filled Data" popup
                submittedData[key] = combinedGpa;
                
                // Remove the individual pieces so they don't clutter the popup
                delete submittedData[`${key}_whole`];
                delete submittedData[`${key}_dec1`];
                delete submittedData[`${key}_dec2`];
                formData.delete(`${key}_whole`);
                formData.delete(`${key}_dec1`);
                formData.delete(`${key}_dec2`);
            }
        });

        let uniName = uniSelect.options[uniSelect.selectedIndex].text;
        let uniKey = uniSelect.options[uniSelect.selectedIndex].dataset.key;
        let subject = subjectSelect.value;
        let amount = 0;

        // Try exact match or fallback logic
        let mapEntry = scholarshipMap[uniName];
        if(!mapEntry) {
            // Check if name contains key (e.g. "Alfa University College" vs "Alfa University")
            for(let key in scholarshipMap) {
                if(uniName.includes(key)) {
                    mapEntry = scholarshipMap[key];
                    break;
                }
            }
        }

        if (mapEntry) {
            if (mapEntry.condition && (subject.toLowerCase().includes("foundation") || subject.toLowerCase().includes("diploma"))) {
                amount = mapEntry.conditionAmt;
            } else {
                amount = mapEntry.default;
            }
        }

        // Add calculated amount to formData
        formData.append("grantAmount", amount);

        // Submit to PHP backend
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        fetch('submit_malaysia_scholarship.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Render Dashboard
                formView.style.display = "none";
                dashboardView.style.display = "block";

                document.getElementById("dashUniName").textContent = uniName;
                document.getElementById("dashSubject").textContent = subject;
                document.getElementById("dashAmount").textContent = amount.toLocaleString();

                let uniData = window.UNIVERSITY_META[uniKey];
                if (uniData) {
                    let feesSlug = uniData.feesSlug || uniData.slug;
                    document.getElementById("dashIntakes").textContent = uniData.intakes || "Varies";
                    document.getElementById("dashDuration").textContent = "3 - 4 Years"; 
                    document.getElementById("dashFees").textContent = uniData.bachelorFee || "Contact for details";
                    
                    document.getElementById("btnUniDetail").href = `Universities/${uniData.slug}-details.html`;
                    document.getElementById("btnUniFees").href = `Fees_Chart/${feesSlug}-fees.html`;
                }

                window.scrollTo(0, 0);
            } else {
                alert('Error submitting application: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('A network error occurred. Please try again.');
        })
        .finally(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    });

    // Modal Logic
    const modalOverlay = document.getElementById("dataModal");
    const modalClose = document.querySelector(".modal-close");
    const btnSeeData = document.getElementById("btnSeeData");
    const dataList = document.getElementById("modalDataList");

    btnSeeData.addEventListener("click", function() {
        dataList.innerHTML = "";
        for (const [key, value] of Object.entries(submittedData)) {
            // Make key readable
            let readableKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
            let li = document.createElement("li");
            li.innerHTML = `<span>${readableKey}:</span> <strong>${value}</strong>`;
            dataList.appendChild(li);
        }
        modalOverlay.classList.add("active");
    });

    modalClose.addEventListener("click", () => modalOverlay.classList.remove("active"));
    modalOverlay.addEventListener("click", (e) => {
        if(e.target === modalOverlay) modalOverlay.classList.remove("active");
    });
});
