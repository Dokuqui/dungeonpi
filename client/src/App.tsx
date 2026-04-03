import { useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import Gate from './pages/Gate';
import Tavern from './pages/Tavern';
import Dungeon from './components/Dungeon';
import WorldInspector from './components/WorldInspector';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, LogOut, ChevronDown, Mail, MessageSquare, Settings, User, Bell, Crown } from 'lucide-react';
import { useWorldStore } from './store/useWorldStore';

export default function App() {
  const { token, character, role, logout } = useAuthStore();
  const [showInspector, setShowInspector] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const room = useWorldStore((state) => state.room);

  if (!token) return <Gate />;
  if (!character) return <Tavern />;

  const gridStyle = {
    '--inspector-width': showInspector ? '300px' : '0px',
    '--sidebar-width': showSidebar ? '250px' : '0px',
  } as React.CSSProperties;

  return (
    <div className="game-screen" style={gridStyle}>
      <header className="game-header">
        <div className="header-left"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ cursor: 'pointer', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="avatar-circle"><User size={16} /></div>
            <h2 style={{ color: '#8a0303' }}>{character.name}</h2>
            <ChevronDown size={14} color={menuOpen ? "#8a0303" : "#666"} />
          </div>

          {menuOpen && (
            <div className="header-dropdown">
              <div className="dropdown-item"><Mail size={14} /> Mailbox <span className="badge">2</span></div>
              <div className="dropdown-item"><MessageSquare size={14} /> Messages</div>
              <div className="dropdown-item"><Settings size={14} /> Settings</div>
              <hr />
              <div className="dropdown-item logout" onClick={logout}><LogOut size={14} /> Abandon Quest</div>
            </div>
          )}
        </div>

        <div className="header-center">
          Room X: {room?.x ?? 0} | Room Y: {room?.y ?? 0}
        </div>
        <div className="header-right" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {role === 'ADMIN' && (
            <div style={{ color: '#d4c4a1', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: '#2a0808', padding: '4px 10px', borderRadius: '4px', border: '1px solid #8a0303' }}>
              <Crown size={14} color="#f1c40f" /> GM Panel
            </div>
          )}
          <span>V.0.1.2 ALPHA</span>
        </div>
      </header>

      <button className="toggle-btn left-btn" onClick={() => setShowInspector(!showInspector)}>
        {showInspector ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
      </button>

      <button className="toggle-btn right-btn" onClick={() => setShowSidebar(!showSidebar)}>
        {showSidebar ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
      </button>

      <aside className="game-inspector">
        {showInspector && <WorldInspector />}
      </aside>

      <main className="game-world">
        <Dungeon />
      </main>

      <aside className="game-sidebar">
        {showSidebar && (
          <>
            <div className="section-title">Party Members</div>
            <p style={{ color: '#444', fontSize: '0.9rem' }}>You are alone in the dark...</p>
          </>
        )}
      </aside>

      <footer className="game-chat">
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={14} /> Notifications
        </div>
        <div style={{ flex: 1, overflowY: 'auto', fontSize: '0.85rem', color: '#666' }}>
          <p style={{ color: '#d4c4a1' }}>[System] {character.name} has entered the room.</p>
          <p>[System] Connection established to the void.</p>
        </div>
      </footer>
    </div>
  );
}