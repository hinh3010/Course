'use client';

export const LoadingProvider = ({ children, isLoading }: { children: React.ReactNode; isLoading: boolean }) => {
    return isLoading ? <div>Loading...</div> : <>{children}</>;
};
