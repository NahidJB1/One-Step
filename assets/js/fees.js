/* assets/js/fees.js */

document.addEventListener("DOMContentLoaded", function() {
  
  // 1. Accordion Logic
  const acc = document.querySelectorAll(".accordion");
  acc.forEach(btn => {
    btn.addEventListener("click", function() {
      this.classList.toggle("active");
      const panel = this.nextElementSibling;
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  });

  // 2. Search Logic (URL Parameter)
  const searchTerm = new URLSearchParams(window.location.search).get('q');
  if (searchTerm) {
    const input = document.getElementById('searchInput');
    if(input) {
      input.value = decodeURIComponent(searchTerm);
      filterPrograms(); 
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // 3. AUTO-GENERATE MOBILE LABELS (Essential for fees.css Card View)
  // This grabs the header text (e.g. "Year 1") and attaches it to the data
  // so the CSS can display "Year 1: RM 20,000" on mobile.
  const tables = document.querySelectorAll("table");
  tables.forEach(table => {
    const headers = Array.from(table.querySelectorAll("th")).map(th => th.textContent.trim());
    const rows = table.querySelectorAll("tr");
    
    rows.forEach(row => {
      const cells = row.querySelectorAll("td");
      cells.forEach((cell, index) => {
        if (headers[index]) {
          cell.setAttribute("data-label", headers[index]);
        }
      });
    });
  });

});

// 4. Search Filter Function
function filterPrograms() {
  const input = document.getElementById("searchInput").value.toLowerCase().trim();
  const tables = document.querySelectorAll("table");

  tables.forEach(table => {
    const rows = table.querySelectorAll("tr");
    let foundInTable = false;

    // Start loop from 1 to skip Header Row (th)
    for (let i = 1; i < rows.length; i++) {
      const rowText = rows[i].textContent.toLowerCase();
      if (input !== "" && rowText.includes(input)) {
        rows[i].style.display = "";
        rows[i].classList.add("highlight"); 
        foundInTable = true;
      } else if (input === "") {
        rows[i].style.display = "";
        rows[i].classList.remove("highlight");
      } else {
        rows[i].style.display = "none";
        rows[i].classList.remove("highlight");
      }
    }

    const panel = table.closest(".panel");
    const accordion = panel.previousElementSibling;
    
    if (foundInTable && input !== "") {
      panel.style.display = "block";
      accordion.classList.add("active");
    } else if (input === "") {
      panel.style.display = "none";
      accordion.classList.remove("active");
    }
  });
}

// 5. PDF Download Logic
function downloadPDF(filename) {
  const link = document.createElement("a");
  // Check if filename is a full path or just a name
  if(filename.includes('/')) {
      link.href = filename;
  } else {
      // Points to the correct parent folder structure
      link.href = `../assets/documents/fees/${filename}.pdf`;
  }
  
  link.download = filename.split('/').pop(); 
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
