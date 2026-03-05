import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });
    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();
    const [error, setError] = React.useState('');

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const response = await api.post('/auth/login', data);
            setAuth(response.data, response.data.token);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-[var(--card)] p-8 rounded-xl shadow-lg border border-[var(--border)] relative overflow-hidden">
                {/* Subtle decorative background blob */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--color-primary-500)] opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[var(--color-primary-600)] opacity-10 rounded-full blur-3xl"></div>

                <div className="text-center relative z-10">
                    <BookOpen className="mx-auto h-12 w-12 text-[var(--color-primary-600)]" />
                    <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
                        CAT Study Tracker
                    </h2>
                    <p className="mt-2 text-sm text-[var(--foreground)] opacity-70">
                        Sign in to access your dashboard
                    </p>
                </div>
                <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)]">Username</label>
                            <input
                                {...register('username')}
                                className="mt-1 block w-full rounded-md border border-[var(--border)] px-3 py-2 bg-transparent focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)] transition-colors"
                                placeholder="Admin username"
                            />
                            {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)]">Password</label>
                            <input
                                type="password"
                                {...register('password')}
                                className="mt-1 block w-full rounded-md border border-[var(--border)] px-3 py-2 bg-transparent focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)] transition-colors"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-[var(--color-primary-600)] py-2 px-4 text-sm font-medium text-white hover:bg-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2 transition-all active:scale-95"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
