import { useWorldStore } from '../store/useWorldStore';

export default function WorldInspector() {
    const room = useWorldStore((state) => state.currentRoom);

    if (!room) {
        return (
            <div className="room-details">
                <h3>The Void...</h3>
                <p>Waiting for the world to manifest.</p>
            </div>
        );
    }

    const monsters = room.monsters || [];

    return (
        <div className="room-details">
            <div className="section-title">Current Chamber</div>
            <h3>{room.name}</h3>
            <p>"{room.description}"</p>

            <div className="section-title">Denizens</div>
            <ul className="monster-list">
                {monsters.length > 0 ? (
                    monsters.map((m) => (
                        <li key={m.id}>
                            A {m.type} (HP: {m.health})
                        </li>
                    ))
                ) : (
                    <li style={{ color: '#444', fontStyle: 'italic' }}>
                        No immediate threats detected.
                    </li>
                )}
            </ul>
        </div>
    );
}