/* assets/js/application.js */
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Dynamic "Other" Education Field ---
    const eduSelect = document.getElementById('eduQualification');
    const otherEduGroup = document.getElementById('otherEduGroup');
    const otherEduInput = document.getElementById('otherEdu');

    eduSelect.addEventListener('change', function() {
        if (this.value === 'Other') {
            otherEduGroup.classList.add('show');
            otherEduInput.setAttribute('required', 'required');
            otherEduInput.focus();
        } else {
            otherEduGroup.classList.remove('show');
            otherEduInput.removeAttribute('required');
            otherEduInput.value = ''; // Clear value if hidden
        }
    });

    // --- 2. Form Submission ---
    const form = document.getElementById('applicationForm');
    const submitBtn = document.querySelector('.submit-btn');
    const modal = document.getElementById('successModal');
    const closeModalBtn = document.querySelector('.close-modal-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Visual Feedback (Loading)
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Gather Data
        const formData = new FormData(form);

        // Send Data (Using same logic as registration)
        // Send Data (Using same logic as registration)
        try {
            const response = await fetch('submit_application.php', {
                method: 'POST',
                body: formData
            });

            // Check if server actually responded nicely
            if (!response.ok) {
                 throw new Error('Server encountered an issue (Error ' + response.status + ')');
            }

            // ✅ REAL LOGIC: Read the actual response from PHP
            const text = await response.text(); 
            // We parse JSON safely in case PHP outputs extra HTML errors by accident
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error("Server returned non-JSON:", text);
                throw new Error("Invalid server response.");
            }

            if (result.status === 'success') {
                form.reset();
                // Reset "Other" field visibility
                otherEduGroup.classList.remove('show');
                
                // Show Success Modal
                modal.classList.add('active');
            } else {
                // Using console.error instead of alert since you prefer no popups
                console.error('Submission Error:', result.message);
                // Optional: You could show a small text error message in the UI here instead
            }

        } catch (error) {
            console.error('Network Error:', error);
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // Close Modal Logic
    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Close modal if clicking outside content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});
