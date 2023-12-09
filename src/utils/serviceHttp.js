import axios from 'axios';

const axios_servma = axios.create({ baseURL: process.env.API_BACKEND });

const serviceHttp = {
    get(url) {
        return axios_servma.get(url);
    },
    post(url, data) {
        return axios_servma.post(url, data);
    },
    put(url, data) {
        return axios_servma.put(url, data);
    },
    delete(url) {
        return axios_servma.delete(url);
    }
};

export {
    serviceHttp
};