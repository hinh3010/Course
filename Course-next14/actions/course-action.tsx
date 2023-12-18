'use server'
import { fetchActions } from "@/lib/fetch-actions";

export const getCourses = async () => {
    return await fetchActions.get('courses')
};

export const getCourseBySlug = async (slug: string) => {
    return await fetchActions.get(`courses/slug/${slug}`)
};
