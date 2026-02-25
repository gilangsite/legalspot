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
            const url = `${LEGALSPOT_CONFIG.GAS_ENDPOINT}?action=getDashboardData&auth=${encodeURIComponent(auth)}`;
            const response = await fetch(url);
            return await response.json();
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
