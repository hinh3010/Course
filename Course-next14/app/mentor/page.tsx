'use client';

import { useMounted } from '@/hooks/use-mounted';
import { storage } from '@/lib/storage-actions';
import { IAccount } from '@/types';
import { redirect, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const CourseSlugPage = () => {
    const isMounted = useMounted();
    const router = useRouter();

    useEffect(() => {
        if (isMounted) {
            const userInfo: IAccount = storage.get('user-info');

            if (!userInfo || !userInfo.roles?.includes('mentor')) {
                return router.push('/404');
            }

            redirect(`mentor/courses`);
        }
    }, [isMounted, router]);

    return null;
};

export default CourseSlugPage;
