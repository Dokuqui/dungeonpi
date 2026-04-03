import { useWorldStore } from '../store/useWorldStore';

export default function WorldInspector() {
    const room = useWorldStore((state) => state.room || state.currentRoom);

    if (!room) {
        return (
            <div className="room-details" style={{ padding: '15px' }}>
                <h3>The Void...</h3>
                <p>Waiting for the world to manifest.</p>
            </div>
        );
    }

    const monsters = room.monsters || [];

    const x = room.x !== undefined ? room.x : '-';
    const y = room.y !== undefined ? room.y : '-';

    return (
        <div className="room-details" style={{ padding: '15px' }}>
            <div className="section-title">Current Chamber</div>

            <h3 style={{ marginBottom: '2px', color: '#d4c4a1' }}>
                {room.name || 'Unknown Chamber'}
            </h3>

            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '10px', fontStyle: 'italic' }}>
                [X: {x} | Y: {y}]
            </div>

            <p style={{ color: '#aaa', lineHeight: '1.4' }}>
                "{room.description || 'A mysterious room forged from the void...'}"
            </p>

            <div className="section-title" style={{ marginTop: '20px' }}>Denizens</div>
            <ul className="monster-list" style={{ listStyle: 'none', padding: 0 }}>
                {monsters.length > 0 ? (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    monsters.map((m: any) => (
                        <li key={m.id} style={{ padding: '5px 0', borderBottom: '1px solid #333' }}>
                            💀 A {m.type} <span style={{ color: '#8a0303', fontSize: '0.8rem' }}>(HP: {m.health})</span>
                        </li>
                    ))
                ) : (
                    <li style={{ color: '#444', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        No immediate threats detected.
                    </li>
                )}
            </ul>
        </div>
    );
}