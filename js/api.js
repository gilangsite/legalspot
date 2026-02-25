/**
 * api.js — Legalspot Backend API Integration
 */

const LegalspotAPI = {
    /**
     * Send data to Google Apps Script
     * @param {Object} data - Payload to send
     */
    async post(data) {
        try {
            // Google Apps Script doesn't play well with CORS and JSON headers
            // We use 'no-cors' and send basic text to bypass browser pre-flight checks
            await fetch(LEGALSPOT_CONFIG.GAS_ENDPOINT, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                headers: {
                    // Do NOT use application/json with no-cors as it's a forbidden header
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(data),
            });

            // Since mode is no-cors, the response is opaque. 
            // We assume delivery if no network error occurred.
            return { status: 'success' };
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    /**
     * Centralized mapping for form fields
     */
    async registerPartner(formData) {
        return await this.post({
            action: 'registerPartner',
            ...formData
        });
    },

    async submitOrder(orderData) {
        return await this.post({
            action: 'submitOrder',
            ...orderData
        });
    },

    /**
     * Fetch dashboard data (Partners & Orders)
     * @param {string} auth - Admin password for server-side validation
     */
    async getDashboardData(auth) {
        try {
            if (!auth) throw new Error('Sesi login tidak ditemukan. Silakan login kembali.');

            const url = `${LEGALSPOT_CONFIG.GAS_ENDPOINT}?action=getDashboardData&auth=${encodeURIComponent(auth)}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch (e) {
                if (text === 'Unauthorized') {
                    throw new Error('Sesi tidak valid atau password salah. Silakan login kembali.');
                }
                console.error('Non-JSON response:', text);
                throw new Error('Format data dari server tidak valid.');
            }
        } catch (error) {
            console.error('Fetch Dashboard Error:', error);
            throw error;
        }
    },

    /**
     * Send admin action (e.g. update status)
     * @param {Object} actionConfig - { actionType, ...data, auth }
     */
    async adminAction(actionConfig) {
        return await this.post({
            action: 'adminAction',
            ...actionConfig
        });
    }
};
