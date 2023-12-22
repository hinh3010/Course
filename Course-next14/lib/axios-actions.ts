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
                return Promise.reject(error);
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
