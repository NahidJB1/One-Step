/* assets/js/fees.js */

// 1. Accordion Logic
document.addEventListener("DOMContentLoaded", function() {
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
});

// 3. Search Filter Function
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

// 4. PDF Download Logic
function downloadPDF(filename) {
  // You can customize the path logic here if needed, 
  // or pass the full path from the HTML onclick="downloadPDF('assets/docs/city.pdf')"
  const link = document.createElement("a");
  
  // Check if the user passed a full path or just a key
  if(filename.includes('/')) {
      link.href = filename;
  } else {
      // Default fallback if you stick to old naming convention
      link.href = `../assets/documents/fees/${filename}.pdf`;
  }
  
  link.download = filename.split('/').pop(); // Extracts filename from path
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
