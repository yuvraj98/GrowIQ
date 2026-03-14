'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '@/store/authStore';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=${pathname}`);
        } else if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
            router.push('/dashboard'); // or an unauthorized page
        } else {
            setIsChecking(false);
        }
    }, [isAuthenticated, user, allowedRoles, router, pathname]);

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
