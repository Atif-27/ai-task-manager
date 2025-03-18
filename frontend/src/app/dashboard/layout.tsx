import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import ProtectProvider from '@/provider/ProtectProvider';
import React from 'react';

const layout = ({ children }: { children: React.ReactNode; }) => {
    return (
        <div>
            <ProtectProvider>
                <DashboardLayout>

                    {children}
                </DashboardLayout>
            </ProtectProvider>
        </div>
    );
};

export default layout;
