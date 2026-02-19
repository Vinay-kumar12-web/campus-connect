import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Messages.css';

const socket = io('http://localhost:5000');

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  // Load conversation list
  useEffect(() => {
    axios.get('/api/messages').then(r => setConversations(r.data));
  }, []);

  // Load messages when userId param changes
  useEffect(() => {
    if (userId) {
      loadChat(userId);
    }
  }, [userId]);

  const loadChat = async (uid) => {
    try {
      const { data } = await axios.get(`/api/messages/${uid}`);
      setMessages(data);
      // Get user info from conversations or fetch
      const conv = conversations.find(c => {
        const other = c.sender._id === user._id ? c.receiver : c.sender;
        return other._id === uid;
      });
      if (conv) {
        const other = conv.sender._id === user._id ? conv.receiver : conv.sender;
        setActiveUser(other);
      }

      // Join socket room
      const roomId = [user._id, uid].sort().join('_');
      socket.emit('join_room', roomId);

      navigate(`/messages/${uid}`, { replace: true });
    } catch { toast.error('Failed to load messages.'); }
  };

  // Receive messages via socket
  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, { ...data, sender: { _id: data.senderId } }]);
    });
    return () => socket.off('receive_message');
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !userId) return;

    const roomId = [user._id, userId].sort().join('_');
    const msgData = {
      roomId,
      senderId: user._id,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    // Optimistic update
    setMessages(prev => [...prev, { ...msgData, sender: { _id: user._id, name: user.name } }]);
    setText('');

    // Emit to socket
    socket.emit('send_message', msgData);

    // Save to DB
    try {
      await axios.post('/api/messages', { receiverId: userId, text: msgData.text });
    } catch { toast.error('Message failed to save.'); }
  };

  return (
    <div className="page page-with-nav messages-page">
      <div className="messages-layout">

        {/* Sidebar */}
        <div className="messages-sidebar">
          <h2 style={{ fontFamily: 'Syne', fontSize: '1.1rem', padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
            Messages
          </h2>
          {conversations.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <div className="emoji">💬</div>
              <p style={{ fontSize: '0.8rem' }}>No conversations yet</p>
            </div>
          ) : (
            conversations.map(c => {
              const other = c.sender._id === user._id ? c.receiver : c.sender;
              return (
                <button key={c._id} className={`conv-item ${userId === other._id ? 'conv-active' : ''}`}
                  onClick={() => loadChat(other._id)}>
                  <div className="avatar avatar-md">{other.name?.[0]}</div>
                  <div className="conv-info">
                    <div className="conv-name">{other.name}</div>
                    <div className="conv-preview">{c.text?.slice(0, 35)}...</div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Chat area */}
        <div className="messages-chat">
          {!userId ? (
            <div className="chat-placeholder">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>💬</div>
              <h3 style={{ fontFamily: 'Syne' }}>Select a conversation</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>or start one from a listing page</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="chat-header">
                {activeUser && (
                  <>
                    <div className="avatar avatar-md">{activeUser.name?.[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{activeUser.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>College Mate</div>
                    </div>
                  </>
                )}
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {messages.map((m, i) => {
                  const isMine = (m.sender?._id || m.senderId) === user._id;
                  return (
                    <div key={i} className={`msg-wrap ${isMine ? 'msg-mine' : 'msg-theirs'}`}>
                      <div className={`msg-bubble ${isMine ? 'msg-bubble-mine' : 'msg-bubble-theirs'}`}>
                        {m.text}
                        <span className="msg-time">
                          {new Date(m.createdAt || m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form className="chat-input-form" onSubmit={sendMessage}>
                <input
                  className="chat-input"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit" className="btn btn-primary" disabled={!text.trim()}>Send →</button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
