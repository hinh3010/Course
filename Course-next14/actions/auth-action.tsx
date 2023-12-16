import { axiosActions } from "@/lib/axios-actions";
import * as z from "zod";

const signInSchema = z.object({
    email: z.string().email({ message: 'Invalid email format' }).min(1, { message: 'Email is required' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

type UserData = {
    accountId: string;
    accountType: string;
    createdAt: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    refreshToken: string;
    roles: string[];
    status: string;
    token: string;
    updatedAt: string;
    _id: string;
};

export const signInAction = async (formData: z.infer<typeof signInSchema>): Promise<UserData> => {
    const requestBody = signInSchema.parse(formData);
    return axiosActions.post('auth/login', requestBody)
};

const signUpSchema = z.object({
    displayName: z.string().min(8, { message: 'Display name must be at least 8 characters long' }),
    email: z.string().email({ message: 'Invalid email format' }).min(1, { message: 'Email is required' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export const signUpAction = async (formData: z.infer<typeof signUpSchema>): Promise<UserData> => {
    const requestBody = signUpSchema.parse(formData);
    return axiosActions.post('auth/register', requestBody)
};