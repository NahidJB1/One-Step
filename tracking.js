// tracking.js - Client-side visitor tracking logic
(function() {
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    let sessionId = sessionStorage.getItem('os_session_id');
    if (!sessionId) {
        sessionId = generateUUID();
        sessionStorage.setItem('os_session_id', sessionId);
    }

    let currentLogId = null;
    const trackingEndpoint = '/track.php';

    // Function to send data via fetch (for async calls)
    function sendTrackingData(action, extraData = {}) {
        const payload = {
            action: action,
            session_id: sessionId,
            ...extraData
        };

        if (action === 'page_view') {
            fetch(trackingEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if (data && data.log_id) {
                    currentLogId = data.log_id;
                }
            })
            .catch(err => console.error('Tracking error:', err));
        } else if (action === 'heartbeat' && currentLogId) {
            // Heartbeat
            fetch(trackingEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, log_id: currentLogId })
            }).catch(() => {});
        } else if (action === 'page_leave' && currentLogId) {
            // Use sendBeacon for page leave for guaranteed delivery without blocking
            const blob = new Blob([JSON.stringify({ ...payload, log_id: currentLogId })], { type: 'application/json' });
            navigator.sendBeacon(trackingEndpoint, blob);
        }
    }

    // 1. Log page view on load
    window.addEventListener('DOMContentLoaded', () => {
        sendTrackingData('page_view', {
            page_url: window.location.href,
            referrer_url: document.referrer || ''
        });
    });

    // 2. Heartbeat every 15 seconds if tab is visible
    setInterval(() => {
        if (document.visibilityState === 'visible' && currentLogId) {
            sendTrackingData('heartbeat');
        }
    }, 15000);

    // 3. Log exact time before unload
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && currentLogId) {
            sendTrackingData('page_leave');
        }
    });
    
    window.addEventListener('pagehide', () => {
        if (currentLogId) {
            sendTrackingData('page_leave');
        }
    });
})();
