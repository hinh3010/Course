'use client';
import toast from 'react-hot-toast';

class LocalStorage {
    private prefix = 'course';

    private formatKey(key: string): string {
        return `${this.prefix}-${key}`;
    }

    public get(key: string): any {
        try {
            const formattedKey = this.formatKey(key);
            const serializedData = localStorage?.getItem(formattedKey);
            if (serializedData === null) {
                return null;
            }
            return JSON.parse(serializedData);
        } catch (error: any) {
            toast.error(error.message, { position: 'top-right' });
            return null;
        }
    }

    public set(key: string, data: any) {
        try {
            const serializedData = JSON.stringify(data);
            const formattedKey = this.formatKey(key);
            localStorage?.setItem(formattedKey, serializedData);
        } catch (error: any) {
            toast.error(error.message, { position: 'top-right' });
        }
    }

    public remove(key: string) {
        try {
            const formattedKey = this.formatKey(key);
            localStorage?.removeItem(formattedKey);
        } catch (error: any) {
            toast.error(error.message, { position: 'top-right' });
        }
    }
}

export const storage = new LocalStorage();
