import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    subtitle?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subtitle, trend }) => {
    return (
        <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-[var(--foreground)] opacity-70">{title}</p>
                    <div className="mt-2 flex items-baseline">
                        <p className="text-3xl font-bold text-[var(--foreground)]">{value}</p>
                        {trend && (
                            <span className={`ml-2 text-sm font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                {trend.isPositive ? '+' : ''}{trend.value}%
                            </span>
                        )}
                    </div>
                    {subtitle && <p className="mt-1 text-sm text-[var(--foreground)] opacity-60">{subtitle}</p>}
                </div>
                <div className="p-3 bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)] rounded-lg">
                    {icon}
                </div>
            </div>
        </div>
    );
};
