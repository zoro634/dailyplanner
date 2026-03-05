import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
    LayoutDashboard,
    CheckSquare,
    BarChart2,
    Timer,
    BookOpen,
    LogOut,
    Moon,
    Sun
} from 'lucide-react';

export const Layout = () => {
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const [isDark, setIsDark] = React.useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });

    const toggleTheme = () => {
        const root = document.documentElement;
        if (root.classList.contains('dark')) {
            root.classList.remove('dark');
            setIsDark(false);
        } else {
            root.classList.add('dark');
            setIsDark(true);
        }
    };

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'Daily Notes', path: '/notes', icon: BookOpen },
        { name: 'Analytics', path: '/analytics', icon: BarChart2 },
        { name: 'Pomodoro', path: '/pomodoro', icon: Timer },
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[var(--card)] border-r border-[var(--border)] hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
                    <BookOpen className="h-6 w-6 text-[var(--color-primary-600)] mr-2" />
                    <span className="text-xl font-bold text-[var(--foreground)]">CAT Tracker</span>
                </div>
                <nav className="flex-1 py-4 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${isActive
                                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-100)]'
                                    : 'text-[var(--foreground)] hover:bg-[var(--border)]'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-[var(--color-primary-600)] dark:text-[var(--color-primary-100)]' : 'text-gray-400 dark:text-gray-500'}`} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-[var(--border)]">
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-3 py-2.5 text-[var(--foreground)] hover:bg-[var(--border)] rounded-md transition-colors"
                    >
                        <LogOut className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Navbar for mobile and theme toggle */}
                <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0 md:justify-end">
                    <div className="md:hidden flex items-center">
                        <BookOpen className="h-6 w-6 text-[var(--color-primary-600)] mr-2" />
                        <span className="text-lg font-bold">CAT Tracker</span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-[var(--border)] transition-colors"
                        title="Toggle theme"
                    >
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--card)] border-t border-[var(--border)] flex justify-around p-2 z-20 pb-safe">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-[var(--color-primary-600)]' : 'text-[var(--foreground)] opacity-70'
                                }`}
                        >
                            <item.icon className="h-5 w-5 mb-1" />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
