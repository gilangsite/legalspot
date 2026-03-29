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
    },

    // -------------------------------------------------------
    // SUPABASE EVENT MANAGEMENT
    // -------------------------------------------------------
    _supabaseHeaders() {
        return {
            'apikey': LEGALSPOT_CONFIG.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${LEGALSPOT_CONFIG.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    },

    async _supabaseFetch(path, options = {}) {
        const url = `${LEGALSPOT_CONFIG.SUPABASE_URL}/rest/v1/${path}`;
        const res = await fetch(url, { ...options, headers: { ...this._supabaseHeaders(), ...(options.headers || {}) } });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Supabase error: ${err}`);
        }
        const text = await res.text();
        return text ? JSON.parse(text) : null;
    },

    /** Ambil semua event yang published (untuk homepage & event page) */
    async fetchPublishedEvents() {
        return await this._supabaseFetch('events?is_published=eq.true&order=created_at.desc&select=*');
    },

    /** Ambil 1 event by slug (untuk event page) */
    async fetchEventBySlug(slug) {
        const arr = await this._supabaseFetch(`events?slug=eq.${encodeURIComponent(slug)}&select=*`);
        return arr && arr.length > 0 ? arr[0] : null;
    },

    /** Ambil semua event (untuk admin — termasuk draft) */
    async fetchAllEvents() {
        return await this._supabaseFetch('events?order=created_at.desc&select=*');
    },

    /** Simpan / update event dari admin dashboard */
    async saveEvent(eventData) {
        if (eventData.id) {
            // Update existing
            const { id, ...rest } = eventData;
            return await this._supabaseFetch(`events?id=eq.${id}`, {
                method: 'PATCH',
                body: JSON.stringify(rest)
            });
        } else {
            // Insert new
            return await this._supabaseFetch('events', {
                method: 'POST',
                body: JSON.stringify(eventData)
            });
        }
    },

    /** Hapus event */
    async deleteEvent(id) {
        return await this._supabaseFetch(`events?id=eq.${id}`, { method: 'DELETE' });
    },

    /** Toggle published status */
    async togglePublish(id, isPublished) {
        return await this._supabaseFetch(`events?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_published: isPublished })
        });
    },

    /** Submit form pendaftaran event → kirim ke Apps Script URL event tsb */
    async submitEventRegistration(gasEndpoint, formData) {
        try {
            await fetch(gasEndpoint, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(formData)
            });
            return { status: 'OK' };
        } catch (err) { throw err; }
    },

    async uploadFile(gasEndpoint, file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result.split(',')[1];
                try {
                    // REMOVE application/json header to avoid CORS preflight (OPTIONS)
                    // Google Apps Script doesn't support OPTIONS for custom headers.
                    const res = await fetch(gasEndpoint, {
                        method: 'POST',
                        mode: 'cors', 
                        redirect: 'follow',
                        body: JSON.stringify({
                            action: 'uploadPoster',
                            fileBase64: base64,
                            fileName: file.name,
                            mimeType: file.type
                        })
                    });
                    
                    const text = await res.text();
                    const data = JSON.parse(text);
                    
                    if (data.status === 'OK') resolve(data.fileId);
                    else reject(new Error(data.message || 'Gagal upload ke Drive'));
                } catch (err) { 
                    console.error('Upload Error:', err);
                    reject(new Error('Koneksi ke Apps Script gagal atau diblokir CORS.'));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
};
