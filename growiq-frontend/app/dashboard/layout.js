'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-950 flex">
                <Sidebar />
                <div className="flex-1 ml-64 flex flex-col min-h-screen">
                    {children}
                </div>
            </div>
        </ProtectedRoute>
    );
}
