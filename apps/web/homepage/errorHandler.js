// errorHandler.js
// Injects a beautiful, animated error apology modal gracefully across the application

(function initGlobalErrorHandler() {
    // Prevent duplicate injections
    if (window._cosmosErrorHandlerInitialized) return;
    window._cosmosErrorHandlerInitialized = true;

    // 1. Inject CSS
    const style = document.createElement('style');
    style.innerHTML = `
        #cosmos-error-modal {
            position: fixed;
            inset: 0;
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
            background: rgba(3, 0, 20, 0.85);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.4s ease, visibility 0.4s ease;
        }

        #cosmos-error-modal.visible {
            opacity: 1;
            visibility: visible;
        }

        .cosmos-error-card {
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8));
            border: 1px solid rgba(244, 114, 182, 0.3);
            border-top: 1px solid rgba(244, 114, 182, 0.6);
            border-radius: 24px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(244, 114, 182, 0.15);
            transform: translateY(30px) scale(0.95);
            transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        #cosmos-error-modal.visible .cosmos-error-card {
            transform: translateY(0) scale(1);
        }

        .cosmos-error-icon {
            font-size: 60px;
            color: #f472b6;
            margin-bottom: 20px;
            animation: cosmosFloatError 3s ease-in-out infinite;
            filter: drop-shadow(0 0 15px rgba(244, 114, 182, 0.5));
        }

        @keyframes cosmosFloatError {
            0%, 100% { transform: translateY(0) rotate(0); }
            50% { transform: translateY(-10px) rotate(5deg); }
        }

        .cosmos-error-card h2 {
            font-family: 'Space Grotesk', sans-serif;
            color: #fff;
            margin-bottom: 15px;
            font-size: 28px;
            background: linear-gradient(135deg, #f472b6, #a855f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .cosmos-error-card p {
            font-family: 'Inter', sans-serif;
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.6;
            margin-bottom: 25px;
            font-size: 15px;
        }

        .cosmos-error-details {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 15px;
            color: #f87171;
            font-family: monospace;
            font-size: 13px;
            text-align: left;
            overflow-x: auto;
            margin-bottom: 30px;
            border: 1px solid rgba(248, 113, 113, 0.2);
            display: none;
            max-height: 150px;
            overflow-y: auto;
        }

        .cosmos-error-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }

        .btn-cosmos-error-primary, .btn-cosmos-error-secondary {
            padding: 12px 24px;
            border-radius: 30px;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            border: none;
            outline: none;
        }

        .btn-cosmos-error-primary {
            background: linear-gradient(135deg, #f472b6, #e11d48);
            color: white;
            box-shadow: 0 5px 15px rgba(225, 29, 72, 0.3);
        }

        .btn-cosmos-error-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(225, 29, 72, 0.5);
        }

        .btn-cosmos-error-secondary {
            background: rgba(255, 255, 255, 0.05);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-cosmos-error-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    `;
    document.head.appendChild(style);

    // 2. Inject HTML when body is ready
    function injectModal() {
        if (document.getElementById('cosmos-error-modal')) return;
        if (!document.body) return;

        const modal = document.createElement('div');
        modal.id = 'cosmos-error-modal';
        modal.innerHTML = `
            <div class="cosmos-error-card">
                <div class="cosmos-error-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <h2>Cosmic Anomaly Detected</h2>
                <p>We apologize, but it seems our navigation systems have encountered an unexpected anomaly. Our engineers are receiving the telemetry now.</p>
                <div id="cosmos-error-details" class="cosmos-error-details"></div>
                <div class="cosmos-error-actions">
                    <button class="btn-cosmos-error-secondary" id="cosmos-btn-details">View Telemetry</button>
                    <button class="btn-cosmos-error-primary" id="cosmos-btn-reload">Reload System</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('cosmos-btn-reload').addEventListener('click', () => {
            window.location.reload();
        });

        const detailsBtn = document.getElementById('cosmos-btn-details');
        const detailsDiv = document.getElementById('cosmos-error-details');
        detailsBtn.addEventListener('click', () => {
            if (detailsDiv.style.display === 'block') {
                detailsDiv.style.display = 'none';
                detailsBtn.textContent = 'View Telemetry';
            } else {
                detailsDiv.style.display = 'block';
                detailsBtn.textContent = 'Hide Telemetry';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectModal);
    } else {
        injectModal();
    }

    // 3. Error handling hooks
    function showErrorModal(message, source, lineno, colno, error) {
        // Ensure modal exists in case error fires before DOMLoaded
        if (document.readyState !== 'loading') {
            injectModal();
        }

        const modal = document.getElementById('cosmos-error-modal');
        if (!modal) {
            // Wait slightly if body doesn't exist yet
            setTimeout(() => showErrorModal(message, source, lineno, colno, error), 100);
            return false;
        }

        const detailsDiv = document.getElementById('cosmos-error-details');
        const errDetails = error ? error.stack : 'N/A';
        detailsDiv.innerText = `Error: ${message}\nSource: ${source}:${lineno}:${colno}\nTrace: ${errDetails}`;
        
        modal.classList.add('visible');
        return false; // Still log to console
    }

    window.addEventListener('error', function(event) {
        showErrorModal(event.message, event.filename, event.lineno, event.colno, event.error);
    });

    window.addEventListener('unhandledrejection', function(event) {
        showErrorModal(event.reason, 'Promise Rejection', 0, 0, event.reason);
    });

    // Option to test the error manually in console: window.triggerCosmosError()
    window.triggerCosmosError = function() {
        throw new Error("Simulated Cosmic Anomaly for testing purposes.");
    };

})();
