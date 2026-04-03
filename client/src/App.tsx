/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useWorldStore } from './store/useWorldStore';
import { useChatStore } from './store/useChatStore';
import { apiClient } from './lib/apiClient';
import Gate from './pages/Gate';
import Tavern from './pages/Tavern';
import Dungeon from './components/Dungeon';
import WorldInspector from './components/WorldInspector';
import {
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
  LogOut, ChevronDown, Mail, Settings, User, Crown, RefreshCw
} from 'lucide-react';

export default function App() {
  const { token, character, userId, role, logout } = useAuthStore();
  const room = useWorldStore((state) => state.room);
  const {
    connect, disconnect, joinRoom, sendMessage,
    localMessages, directMessages, mailbox,
    unreadMail, markMailRead, socket, fetchConversation
  } = useChatStore();

  const [showInspector, setShowInspector] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMailbox, setShowMailbox] = useState(false);

  const [chatTab, setChatTab] = useState<'LOCAL' | 'DIRECT'>('LOCAL');
  const [playerListTab, setPlayerListTab] = useState<'ROOM' | 'CONTACTS'>('ROOM');
  const [chatInput, setChatInput] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: number, name: string } | null>(null);

  const [lastSeenWhisperCount, setLastSeenWhisperCount] = useState(0);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [roomPlayers, setRoomPlayers] = useState<any[]>([]);
  const [safeRoomId, setSafeRoomId] = useState<number | null>(null);

  const [contacts, setContacts] = useState<any[]>([]);

  const handleRoomData = (data: any) => {
    if (!data) return;
    if (Array.isArray(data.players)) setRoomPlayers(data.players);
    if (data.id !== undefined) setSafeRoomId(data.id);

    useWorldStore.getState().setRoom(data);
  };

  useEffect(() => {
    if (token && character) {
      connect();
      apiClient('/world/look').then(handleRoomData).catch(console.error);
    }
    return () => disconnect();
  }, [token, character, connect, disconnect]);

  useEffect(() => {
    if (token && character && room?.x !== undefined) {
      apiClient('/world/look').then(handleRoomData).catch(console.error);
    }
  }, [room?.x, room?.y, token, character]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      apiClient('/world/look').then(handleRoomData).catch(console.error);
    };
    socket.on('room_update', handleUpdate);
    return () => { socket.off('room_update', handleUpdate); };
  }, [socket]);

  useEffect(() => {
    const joinId = safeRoomId ?? (room as any)?.id;
    if (joinId !== undefined && joinId !== null) {
      joinRoom(joinId);
    }
  }, [safeRoomId, room, joinRoom]);

  const fetchContactsList = () => {
    apiClient('/chat/contacts')
      .then((data) => {
        if (data && Array.isArray(data.contacts)) {
          setContacts(data.contacts);
        } else if (Array.isArray(data)) {
          setContacts(data);
        }
      })
      .catch(console.error);
  };

  const hasNewWhisper = chatTab !== 'DIRECT' && directMessages.length > lastSeenWhisperCount;

  const otherPlayers = useMemo(() => {
    return roomPlayers.filter((p: any) => {
      const pId = Number(p.userId || p.id);
      const myId = Number(userId);
      return pId !== myId;
    });
  }, [roomPlayers, userId]);

  const visibleDirectMessages = useMemo(() => {
    if (!selectedPlayer) return [];
    return directMessages.filter((msg: any) => {
      const senderIsThem = Number(msg.senderId) === selectedPlayer.id;
      const senderIsMe = Number(msg.senderId) === Number(userId);
      const correctTarget = msg.receiverId ? Number(msg.receiverId) === selectedPlayer.id : true;
      return senderIsThem || (senderIsMe && correctTarget);
    });
  }, [directMessages, selectedPlayer, userId]);

  const displayMessages = chatTab === 'LOCAL' ? localMessages : visibleDirectMessages;

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [displayMessages, chatTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (chatTab === 'LOCAL') {
      const targetRoomId = safeRoomId ?? (room as any)?.id;
      if (targetRoomId !== undefined) {
        sendMessage(chatInput, targetRoomId, undefined);
      }
    } else if (chatTab === 'DIRECT' && selectedPlayer) {
      sendMessage(chatInput, undefined, selectedPlayer.id);
    }

    setChatInput('');
  };

  const manualRefresh = () => {
    apiClient('/world/look').then(handleRoomData).catch(console.error);
  };

  const openMailboxModal = () => {
    setShowMailbox(true);
    markMailRead();
    setMenuOpen(false);
  };

  if (!token) return <Gate />;
  if (!character) return <Tavern />;

  const isSendDisabled = chatTab === 'DIRECT' && !selectedPlayer;

  return (
    <div className="game-screen" style={{
      '--inspector-width': showInspector ? '300px' : '0px',
      '--sidebar-width': showSidebar ? '350px' : '0px',
    } as React.CSSProperties}>

      {/* --- REFACTORED MAILBOX MODAL --- */}
      {showMailbox && (
        <div className="modal-overlay" onClick={() => setShowMailbox(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Mail size={20} /> Mailbox</h2>
              <button onClick={() => setShowMailbox(false)} className="close-btn">X</button>
            </div>
            <div className="modal-body">
              {mailbox.length === 0 ? (
                <p className="empty-message">No messages found.</p>
              ) : (
                mailbox.map((mail) => (
                  <div key={mail.id} className="mail-item">
                    <span className="mail-time">{new Date(mail.timestamp).toLocaleTimeString()}</span>
                    <p className="mail-text"><strong className="mail-sender">System:</strong> {mail.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <header className="game-header">
        <div className="header-left">
          <div onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', position: 'relative' }}>
            <div className="avatar-circle"><User size={16} /></div>
            <h2 style={{ color: '#8a0303', margin: 0 }}>{character.name}</h2>
            <ChevronDown size={14} />
            {/* --- PULSING NOTIFICATION BADGE --- */}
            {unreadMail > 0 && (
              <div className="notification-badge">
                {unreadMail}
              </div>
            )}
          </div>
          {menuOpen && (
            <div className="header-dropdown">
              <div className="dropdown-item" onClick={openMailboxModal}>
                <Mail size={14} /> Mailbox {unreadMail > 0 && <span style={{ color: 'red' }}>({unreadMail})</span>}
              </div>
              <div className="dropdown-item"><Settings size={14} /> Settings</div>
              <hr />
              <div className="dropdown-item logout" onClick={logout}><LogOut size={14} /> Abandon Quest</div>
            </div>
          )}
        </div>

        <div className="header-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#d4c4a1', letterSpacing: '1px', textTransform: 'uppercase' }}>DungeonPI</h1>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {role === 'ADMIN' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f1c40f', background: '#2a0808', padding: '4px 10px', borderRadius: '4px', border: '1px solid #8a0303', fontSize: '0.75rem' }}>
              <Crown size={14} /> GM PANEL
            </div>
          )}
          <button onClick={manualRefresh} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}>
            <RefreshCw size={16} />
          </button>
          <span style={{ fontSize: '0.7rem', opacity: 0.3 }}>V.0.1.2</span>
        </div>
      </header>

      <button className="toggle-btn left-btn" onClick={() => setShowInspector(!showInspector)}>{showInspector ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}</button>
      <button className="toggle-btn right-btn" onClick={() => setShowSidebar(!showSidebar)}>{showSidebar ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}</button>

      <aside className="game-inspector">
        {showInspector && <WorldInspector />}
      </aside>
      <main className="game-world"><Dungeon /></main>

      <aside className="game-sidebar">
        {showSidebar && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '15px', overflow: 'hidden' }}>

            <div style={{ flex: '0 0 auto', marginBottom: '15px', display: 'flex', flexDirection: 'column', maxHeight: '35%' }}>

              <div className="chat-tabs" style={{ marginBottom: '10px' }}>
                <button
                  className={playerListTab === 'ROOM' ? 'active' : ''}
                  onClick={() => setPlayerListTab('ROOM')}>
                  Nearby
                </button>
                <button
                  className={playerListTab === 'CONTACTS' ? 'active' : ''}
                  onClick={() => { setPlayerListTab('CONTACTS'); fetchContactsList(); }}>
                  Contacts
                </button>
              </div>

              <div style={{ overflowY: 'auto', paddingRight: '5px', flex: 1 }}>

                {playerListTab === 'ROOM' && (
                  otherPlayers.length === 0 ? (
                    <div style={{ border: '1px dashed #222', padding: '10px', borderRadius: '4px' }}>
                      <p style={{ color: '#444', fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>Alone in the dark...</p>
                    </div>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {otherPlayers.map((p: any) => {
                        const pId = Number(p.userId || p.id);
                        return (
                          <li key={`room-${pId}`}
                            onClick={() => {
                              setSelectedPlayer({ id: pId, name: p.name });
                              setChatTab('DIRECT');
                              setLastSeenWhisperCount(directMessages.length);
                              fetchConversation(pId).catch(console.error);
                            }}
                            style={{ padding: '8px', borderBottom: '1px solid #222', cursor: 'pointer', background: selectedPlayer?.id === pId ? '#2a0808' : 'transparent', borderRadius: '4px' }}>
                            🛡️ {p.name}
                          </li>
                        );
                      })}
                    </ul>
                  )
                )}

                {playerListTab === 'CONTACTS' && (
                  contacts.length === 0 ? (
                    <div style={{ border: '1px dashed #222', padding: '10px', borderRadius: '4px' }}>
                      <p style={{ color: '#444', fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>No past conversations...</p>
                    </div>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {contacts.map((c: any) => {
                        const cId = typeof c === 'number' ? c : Number(c.userId || c.id);
                        const cName = typeof c === 'number' ? `Hero #${c}` : c.name;

                        return (
                          <li key={`contact-${cId}`}
                            onClick={() => {
                              setSelectedPlayer({ id: cId, name: cName });
                              setChatTab('DIRECT');
                              setLastSeenWhisperCount(directMessages.length);
                              fetchConversation(cId).catch(console.error);
                            }}
                            style={{ padding: '8px', borderBottom: '1px solid #222', cursor: 'pointer', background: selectedPlayer?.id === cId ? '#2a0808' : 'transparent', borderRadius: '4px' }}>
                            📖 {cName}
                          </li>
                        );
                      })}
                    </ul>
                  )
                )}
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderTop: '1px solid #333', paddingTop: '10px' }}>
              <div className="section-title">Chat</div>
              <div className="chat-tabs">
                <button
                  className={chatTab === 'LOCAL' ? 'active' : ''}
                  onClick={() => { setChatTab('LOCAL'); setLastSeenWhisperCount(directMessages.length); }}>
                  Room
                </button>
                <button
                  className={chatTab === 'DIRECT' ? 'active' : ''}
                  onClick={() => { setChatTab('DIRECT'); setLastSeenWhisperCount(directMessages.length); }}>
                  Whispers {hasNewWhisper && <span style={{ color: 'red' }}>●</span>}
                </button>
              </div>

              <div ref={chatScrollRef} style={{ flex: 1, overflowY: 'auto', fontSize: '0.85rem', paddingRight: '5px' }}>
                {displayMessages.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: '8px' }}>
                    <strong style={{ color: Number(msg.senderId) === Number(userId) ? '#d4c4a1' : '#8a0303' }}>
                      [{Number(msg.senderId) === Number(userId) ? 'You' : (msg.senderName || 'Soul')}]
                    </strong>: <span style={{ color: '#fff' }}>{msg.content}</span>
                  </div>
                ))}

                {chatTab === 'DIRECT' && displayMessages.length === 0 && selectedPlayer && (
                  <p style={{ color: '#666', fontStyle: 'italic', fontSize: '0.75rem', marginTop: '10px' }}>No whispers exchanged with {selectedPlayer.name} yet...</p>
                )}
              </div>

              {chatTab === 'DIRECT' && (
                <div style={{ fontSize: '0.7rem', color: '#8a0303', marginBottom: '5px' }}>
                  {selectedPlayer ? `Target: ${selectedPlayer.name}` : "Select a player to whisper"}
                </div>
              )}

              <form onSubmit={handleSendMessage} style={{ flex: '0 0 auto', marginTop: '10px', display: 'flex', gap: '5px' }}>
                <input
                  type="text"
                  placeholder={chatTab === 'LOCAL' ? "Speak to the room..." : (selectedPlayer ? `Whisper to ${selectedPlayer.name}...` : "Select someone...")}
                  disabled={isSendDisabled}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    color: '#fff',
                    borderRadius: '4px'
                  }}
                />
                <button
                  type="submit"
                  disabled={isSendDisabled}
                  style={{
                    padding: '8px 15px',
                    background: isSendDisabled ? '#2a0808' : '#8a0303',
                    color: isSendDisabled ? '#555' : '#fff',
                    border: '1px solid',
                    borderColor: isSendDisabled ? '#333' : '#a80505',
                    borderRadius: '4px',
                    cursor: isSendDisabled ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}