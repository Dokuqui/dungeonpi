import { useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import Gate from './pages/Gate';
import Tavern from './pages/Tavern';
import Dungeon from './components/Dungeon';
import WorldInspector from './components/WorldInspector';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  LogOut,
  Map as MapIcon
} from 'lucide-react';

export default function App() {
  const { token, character, logout } = useAuthStore();
  const [showInspector, setShowInspector] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  if (!token) return <Gate />;
  if (!character) return <Tavern />;

  const gridStyle = {
    '--inspector-width': showInspector ? '300px' : '0px',
    '--inspector-padding': showInspector ? '20px' : '0px',
    '--inspector-border': showInspector ? '1px' : '0px',
    '--inspector-opacity': showInspector ? '1' : '0',

    '--sidebar-width': showSidebar ? '250px' : '0px',
    '--sidebar-padding': showSidebar ? '20px' : '0px',
    '--sidebar-border': showSidebar ? '1px' : '0px',
    '--sidebar-opacity': showSidebar ? '1' : '0',
  } as React.CSSProperties;

  return (
    <div className="game-screen" style={gridStyle}>
      <header className="game-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MapIcon size={20} color="#8a0303" />
          <h2 style={{ color: '#8a0303' }}>{character.name}</h2>
        </div>

        <div style={{ color: '#666', fontSize: '0.9rem', letterSpacing: '2px' }}>X: 0 | Y: 0</div>

        <button className="logout-btn" onClick={logout}>
          <LogOut size={16} style={{ marginRight: '8px' }} />
          Abandon Quest
        </button>
      </header>

      <button
        className="toggle-btn left-btn"
        onClick={() => setShowInspector(!showInspector)}
      >
        {showInspector ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
      </button>

      <button
        className="toggle-btn right-btn"
        onClick={() => setShowSidebar(!showSidebar)}
      >
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
        <div className="section-title">System Log</div>
        <div style={{ flex: 1, overflowY: 'auto', fontSize: '0.85rem', color: '#aaa' }}>
          <p style={{ color: '#d4c4a1' }}>[System] Connection established to the void.</p>
          <p>[System] Use arrows to explore...</p>
        </div>
      </footer>
    </div>
  );
}