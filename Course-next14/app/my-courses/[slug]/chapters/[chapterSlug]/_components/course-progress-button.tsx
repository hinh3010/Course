'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { useConfettiStore } from '@/hooks/use-confetti-store';

interface CourseProgressButtonProps {
    isCompleted?: boolean;
}

export const CourseProgressButton = ({ isCompleted }: CourseProgressButtonProps) => {
    const confetti = useConfettiStore();
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);

            if (!isCompleted) {
                confetti.onOpen();
            }

            toast.success('Progress updated');
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const Icon = isCompleted ? XCircle : CheckCircle;

    return (
        <Button onClick={onClick} disabled={isLoading} type="button" variant={isCompleted ? 'outline' : 'success'} className="w-full md:w-auto">
            {isCompleted ? 'Not completed' : 'Mark as complete'}
            <Icon className="h-4 w-4 ml-2" />
        </Button>
    );
};
