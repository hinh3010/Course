import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { storage } from './storage-actions';

class AxiosActions {
    private instance: AxiosInstance;

    constructor(baseURL: string) {
        this.instance = axios.create({
            baseURL,
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                Pragma: 'no-cache',
                Expires: 0,
            },
        });

        this.instance.interceptors.request.use(
            (config) => {
                const token = storage.get('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            },
        );

        this.instance.interceptors.response.use(
            (response: AxiosResponse) => {
                return response && response.data ? response.data : response;
            },
            (error: AxiosError) => {
                // console.log({ error: error });
                // return Promise.reject(error);
                if (error.response) {
                    // Server responded with a status code other than 2xx
                    console.log('Server Error:', error.response.data);
                    return Promise.reject(error.response.data); // Customize error message here
                } else if (error.request) {
                    // The request was made but no response was received
                    console.log('No response received:', error.request);
                    return Promise.reject('No response received from the server.');
                } else {
                    // Something happened in setting up the request that triggered an error
                    console.log('Request error:', error.message);
                    return Promise.reject('Request error occurred.');
                }
            },
        );
    }

    public getInstance(): AxiosInstance {
        return this.instance;
    }
}

// Example usage:
const baseURL = process.env.BASE_URL || 'http://localhost:3000/api';
export const axiosActions = new AxiosActions(baseURL).getInstance();
