'use server'
import { fetchActions } from "@/lib/fetch-actions";

export const getCategories = async () => {
    return await fetchActions.get('categories');
};
