import { useState } from 'react';
import { apiClient } from '../lib/apiClient';

interface MarketModalProps {
    onClose: () => void;
}

export default function MarketModal({ onClose }: MarketModalProps) {
    const [tab, setTab] = useState<'SKINS' | 'CURRENCY' | 'BATTLEPASS'>('SKINS');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePurchase = async (itemType: string, itemId: string, isRealMoney: boolean) => {
        setError(null);
        if (!isRealMoney) {
            setError("Economy system coming soon: Spend gold in the next update!");
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient('/payments/checkout', {
                method: 'POST',
                body: JSON.stringify({ itemType, itemId }),
            });

            if (response && response.url) {
                window.location.href = response.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (err) {
            console.error('Checkout failed:', err);
            setError("The Merchant is busy. Please try again later.");
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content market-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🛒 The Black Market</h2>
                    <button onClick={onClose} className="close-btn" disabled={loading}>X</button>
                </div>

                <div className="market-tabs">
                    <button className={tab === 'SKINS' ? 'active' : ''} onClick={() => setTab('SKINS')}>Skins</button>
                    <button className={tab === 'CURRENCY' ? 'active' : ''} onClick={() => setTab('CURRENCY')}>Treasury</button>
                    <button className={tab === 'BATTLEPASS' ? 'active' : ''} onClick={() => setTab('BATTLEPASS')}>Battle Pass</button>
                </div>

                <div className="modal-body market-body">
                    {error && (
                        <div style={{ background: 'rgba(138, 3, 3, 0.2)', color: '#ff4a4a', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.85rem', border: '1px solid #8a0303', textAlign: 'center' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {tab === 'SKINS' && (
                        <div className="product-grid">
                            <div className="product-card">
                                <img src="/assets/frames/elf_m_idle_anim_f0.png" alt="Elf" className="product-image" />
                                <h3>Elf Ranger</h3>
                                <p>Swift and deadly. Has higher base movement speed.</p>
                                <button onClick={() => handlePurchase('SKIN', 'elf_m', false)} className="buy-gold">500 Gold</button>
                            </div>
                            <div className="product-card premium">
                                <img src="/assets/frames/wizzard_m_idle_anim_f0.png" alt="Wizzard" className="product-image" />
                                <h3>Arcane Wizzard</h3>
                                <p>Master of the void. Future magic skill tree unlocked.</p>
                                <button onClick={() => handlePurchase('SKIN', 'wizzard_m', true)} className="buy-stripe" disabled={loading}>$4.99</button>
                            </div>
                            <div className="product-card premium">
                                <img src="/assets/frames/lizard_m_idle_anim_f0.png" alt="Lizard" className="product-image" />
                                <h3>Lizardkin</h3>
                                <p>Thick scales. +10 Base Armor.</p>
                                <button onClick={() => handlePurchase('SKIN', 'lizard_m', true)} className="buy-stripe" disabled={loading}>$4.99</button>
                            </div>
                        </div>
                    )}

                    {tab === 'CURRENCY' && (
                        <div className="product-grid">
                            <div className="product-card premium">
                                <h3 style={{ fontSize: '2rem', margin: '10px 0' }}>💰</h3>
                                <h3>Pouch of Gold</h3>
                                <p>1,000 In-Game Gold Coins</p>
                                <button onClick={() => handlePurchase('CURRENCY', 'pouch_of_gold', true)} className="buy-stripe" disabled={loading}>$1.99</button>
                            </div>
                            <div className="product-card premium">
                                <h3 style={{ fontSize: '2rem', margin: '10px 0' }}>💎</h3>
                                <h3>Chest of Gems</h3>
                                <p>500 Premium Gems</p>
                                <button onClick={() => handlePurchase('CURRENCY', 'chest_of_gems', true)} className="buy-stripe" disabled={loading}>$9.99</button>
                            </div>
                        </div>
                    )}

                    {tab === 'BATTLEPASS' && (
                        <div className="battle-pass-card">
                            <img src="/assets/frames/necromancer_anim_f0.png" alt="Necromancer" className="bp-hero" />
                            <h3>Season 1: The Void Awakening</h3>
                            <p>Unlock 50 tiers of rewards and the exclusive Necromancer skin!</p>
                            <ul className="bp-perks">
                                <li>+20% EXP Boost</li>
                                <li>Exclusive Chat Colors</li>
                                <li>Instant unlock: 'Chort' Pet</li>
                            </ul>
                            <button onClick={() => handlePurchase('BATTLE_PASS', 'season_1', true)} className="buy-stripe massive-btn" disabled={loading}>
                                {loading ? 'Opening Portal...' : 'Unlock Premium Pass ($9.99)'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}