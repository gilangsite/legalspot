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
        if (!auth) throw new Error('Sesi login tidak ditemukan. Silakan login kembali.');

        try {
            // Coba GET dulu (paling cepat)
            const url = `${LEGALSPOT_CONFIG.GAS_ENDPOINT}?action=getDashboardData&auth=${encodeURIComponent(auth)}`;
            const response = await fetch(url);

            if (response.ok) {
                const text = await response.text();
                // Google Apps Script sering mengembalikan HTML atau text jika ada eror
                if (text === 'Unauthorized') throw new Error('Password salah atau sesi tidak valid.');
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error('Bukan JSON (GET):', text);
                    throw new Error('Format data tidak valid.');
                }
            }
            throw new Error('Gagal memanggil server (GET).');
        } catch (getErr) {
            console.warn('GET gagal, mencoba POST fallback...', getErr);

            // Fallback ke POST — biasanya jauh lebih stabil melewati CORS di Apps Script
            try {
                const postResponse = await fetch(LEGALSPOT_CONFIG.GAS_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ action: 'getDashboardData', auth: auth })
                });

                const postText = await postResponse.text();
                return JSON.parse(postText);
            } catch (postErr) {
                console.error('Semua metode gagal:', postErr);
                throw new Error('Terjadi kesalahan koneksi ke backend. Mohon pastikan AppScript sudah dideploy sebagai "Anyone".');
            }
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
