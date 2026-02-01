import axios from 'axios';

const instance = axios.create({
    baseURL: '/', // Updated to remove /api prefix as per backend changes
    withCredentials: true // Permite enviar cookies si el backend las usa
});

export default instance;
