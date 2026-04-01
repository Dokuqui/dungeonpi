import { useAuthStore } from './store/useAuthStore';
import Gate from './pages/Gate';

export default function App() {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  if (!token) {
    return <Gate />;
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: '#8a0303', fontSize: '3rem' }}>The Darkest Depths</h1>
      <p style={{ marginTop: '20px' }}>You have breached the gates.</p>

      <button
        onClick={logout}
        style={{
          marginTop: '30px',
          background: 'none',
          border: '1px solid #4a4a4a',
          color: '#d4c4a1',
          padding: '10px 20px',
          cursor: 'pointer',
          fontFamily: 'MedievalSharp'
        }}
      >
        Flee the Dungeon (Logout)
      </button>
    </div>
  );
}