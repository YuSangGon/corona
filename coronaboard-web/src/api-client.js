const axios = require('axios');

class ApiClient {
    constructor() {
        const client = axios.create({
            baseURL : process.env.CB_API_BASE_URL || 'http://localhost:8080',
        });

        client.interceptors.response.use((resp) => {
            return resp.data;
        });

        this.client = client;
    }

    async getAllGlobalStats() {
        const response = await this.client.get('global-stats');
        return response.result;
    }

    async getByAgeAndBySex() {
        const response = await this.client.get(`key-value/byAgeAndSex`);
        return JSON.parse(response.result.value);
    }
}

module.exports = ApiClient;