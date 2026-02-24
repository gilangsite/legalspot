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
            const response = await fetch(LEGALSPOT_CONFIG.GAS_ENDPOINT, {
                method: 'POST',
                mode: 'no-cors', // Apps Script handles POST via redirect which causes CORS issues in browsers, no-cors is a common workaround if return data isn't critical
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            // Since we use no-cors, we can't read the response body. 
            // We assume success if no error is thrown by fetch.
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
    }
};
