import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/auth.scss';

export default function Tavern() {
    const [loading, setLoading] = useState(true);
    const [charName, setCharName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [foundHero, setFoundHero] = useState<{ id: number; name: string; userId: number } | null>(null);

    const setCharacter = useAuthStore((state) => state.setCharacter);
    const userId = useAuthStore((state) => state.userId);

    const checkHero = useCallback(async () => {
        // If we don't have a userId yet, don't try to fetch a hero
        if (!userId) return;

        try {
            setLoading(true);
            const data = await apiClient('/characters/me');
            if (data && data.id) {
                setFoundHero({ id: data.id, name: data.name, userId: userId });
            }
        } catch {
            console.log("No hero found. Ready to forge a new one.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        checkHero();
    }, [checkHero]);

    const handleSelectHero = () => {
        if (foundHero) {
            setCharacter(foundHero);
        }
    };

    const handleCreateHero = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await apiClient('/characters', {
                method: 'POST',
                body: JSON.stringify({ name: charName }),
            });
            await checkHero();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || "The spirits reject this name.");
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="auth-container"><h2>Searching the mist...</h2></div>;
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                {foundHero ? (
                    <>
                        <h2>Hero Found</h2>
                        <div className="hero-card" style={{
                            border: '1px solid #4a4a4a',
                            padding: '20px',
                            textAlign: 'center',
                            background: 'rgba(0,0,0,0.4)',
                            marginBottom: '15px'
                        }}>
                            <p style={{ fontSize: '0.9rem', color: '#888' }}>Level 1 Character</p>
                            <h3 style={{ fontSize: '1.8rem', color: '#d4c4a1' }}>{foundHero.name}</h3>
                        </div>
                        <button onClick={handleSelectHero}>Enter the World</button>
                        <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.8rem', cursor: 'pointer', color: '#8a0303' }}
                            onClick={() => setFoundHero(null)}>
                            Or forge a different path...
                        </p>
                    </>
                ) : (
                    <form onSubmit={handleCreateHero}>
                        <h2>Forge Your Hero</h2>
                        {error && <div className="error-message">{error}</div>}
                        <input
                            type="text"
                            placeholder="Hero Name"
                            value={charName}
                            onChange={(e) => setCharName(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={loading}>Begin Your Journey</button>
                    </form>
                )}
            </div>
        </div>
    );
}