import { axiosActions } from '@/lib/axios-actions';
import { Chapter, Course } from '@/types';

export const getCourses = async (): Promise<Course[]> => {
    return await axiosActions.get('courses');
};

export const getCourseBySlug = async (slug: string) => {
    return await axiosActions.get(`courses/slug/${slug}`);
};

//
export const getMyCourses = async (): Promise<Course[]> => {
    return await axiosActions.get('my-courses');
};

export const getMyCourseBySlug = async (slug: string): Promise<Course> => {
    return await axiosActions.get(`my-courses/${slug}`);
};

// mentor
export const createChapterByMentor = async (courseId: string, data: any): Promise<Chapter> => {
    return await axiosActions.post(`mentor/courses/${courseId}/chapters`, data);
};

export const getChapterByMentor = async (courseSlug: string, chapterId: string): Promise<Chapter> => {
    return await axiosActions.get(`mentor/courses/${courseSlug}/chapters/${chapterId}`);
};

export const updateChapterByMentor = async ({ chapterId, courseId }: { courseId: string; chapterId: string }, values: any): Promise<Chapter> => {
    return await axiosActions.patch(`mentor/courses/${courseId}/chapters/${chapterId}`, values);
};
