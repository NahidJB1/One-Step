// assets/js/register.js
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Toggle Payment Logic ---
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const digitalDetails = document.getElementById('digitalPaymentDetails');
    const cashDetails = document.getElementById('cashPaymentDetails');
    const trxInput = document.getElementById('trxId');

    function togglePaymentDetails() {
        const selectedValue = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        if (selectedValue === 'digital') {
            digitalDetails.classList.add('active');
            cashDetails.classList.remove('active');
            // Make TRX optional if they upload file, but generally encourage it
            // For now, let's logic validation on submit
        } else {
            digitalDetails.classList.remove('active');
            cashDetails.classList.add('active');
        }
    }

    // Listen for changes
    paymentMethods.forEach(method => {
        method.addEventListener('change', togglePaymentDetails);
    });


    // --- 2. Form Submission ---
    const form = document.getElementById('registrationForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic Validation
        const fullName = document.getElementById('fullName').value;
        const school = document.getElementById('schoolSelect').value;
        const paymentType = document.querySelector('input[name="paymentMethod"]:checked').value;

        // Validation for Digital Payment
        if (paymentType === 'digital') {
            const trx = document.getElementById('trxId').value.trim();
            const file = document.getElementById('receiptUpload').files.length;

            if (!trx && file === 0) {
                alert('Please enter the TRX ID or upload a payment receipt.');
                return;
            }
        }

        // Simulate Success
        const confirmMsg = paymentType === 'digital' 
            ? `Thanks ${fullName}! Your registration for ${school} is received. We will verify your payment (TRX: ${document.getElementById('trxId').value || 'Receipt Uploaded'}) shortly.`
            : `Thanks ${fullName}! Your registration is Pre-Submitted. Please pay 10TK to your teacher at ${school} to complete the process.`;

        alert(confirmMsg);
        
        // Reset form or redirect
        // form.reset();
        // window.location.href = 'scholarship.html';
    });

});
