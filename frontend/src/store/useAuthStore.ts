import { create } from 'zustand';

interface User {
    _id: string;
    username: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

const getStoredAuth = () => {
    try {
        const auth = localStorage.getItem('auth');
        if (auth) {
            return JSON.parse(auth);
        }
    } catch { }
    return { user: null, token: null };
};

const initialAuth = getStoredAuth();

export const useAuthStore = create<AuthState>((set) => ({
    user: initialAuth.user,
    token: initialAuth.token,
    setAuth: (user, token) => {
        localStorage.setItem('auth', JSON.stringify({ user, token }));
        set({ user, token });
    },
    logout: () => {
        localStorage.removeItem('auth');
        set({ user: null, token: null });
    },
}));
