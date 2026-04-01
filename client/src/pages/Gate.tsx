import React, { useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/auth.scss';

const decodeJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

export default function Gate() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';

            const response = await apiClient(endpoint, {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            const token = response.accessToken;
            const payload = decodeJwt(token);

            if (payload) {
                setAuth(token, payload.role, payload.sub);
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || 'The gates remain closed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-box" onSubmit={handleSubmit}>
                <h2>{isLogin ? 'Enter the Dungeon' : 'Forge a Soul'}</h2>

                {error && <div className="error-message">{error}</div>}

                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Secret Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Channeling...' : (isLogin ? 'Enter' : 'Register')}
                </button>

                <div className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "No soul yet? Register here." : "Already have a soul? Enter here."}
                </div>
            </form>
        </div>
    );
}