import { useState, useEffect } from 'react';
import { Video, Shield, Plus, LogIn, Users, Copy, Check, ArrowLeft } from 'lucide-react';
import { Rain } from './Rain';
import { Slideshow } from './Slideshow';

interface RoomJoinProps {
  onJoin: (roomId: string, userName: string) => void;
}

type Step = 'landing' | 'create-name' | 'lobby' | 'join-name';

export function RoomJoin({ onJoin }: RoomJoinProps) {
  const [step, setStep] = useState<Step>('landing');
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (step === 'create-name') {
      const id = Math.random().toString(36).substring(2, 10).toUpperCase();
      setRoomId(id);
      setError('');
    }
  }, [step]);

  const handleCreateRoom = () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }
    setStep('lobby');
  };

  const handleJoinRoom = () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!joinRoomId.trim()) {
      setError('Please enter a room ID');
      return;
    }
    onJoin(joinRoomId.trim().toUpperCase(), userName.trim());
  };

  const handleEnterLobby = () => {
    onJoin(roomId, userName.trim());
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderLanding = () => (
    <div className="pro-card">
      <div className="pro-logo">
        <div className="pro-logo-icon">
          <Video size={40} className="text-white" />
        </div>
        <div>
          <h1 className="pro-title">Secure Vault</h1>
          <p className="pro-subtitle">Professional Video Conferencing</p>
        </div>
      </div>

      <div className="pro-options">
        <button onClick={() => setStep('create-name')} className="pro-option-btn primary">
          <div className="pro-option-icon">
            <Plus size={28} />
          </div>
          <div className="pro-option-text">
            <h3>Create New Room</h3>
            <p>Start a new meeting instantly</p>
          </div>
        </button>

        <button onClick={() => setStep('join-name')} className="pro-option-btn secondary">
          <div className="pro-option-icon secondary">
            <LogIn size={28} />
          </div>
          <div className="pro-option-text">
            <h3>Join Room</h3>
            <p>Enter an existing room ID</p>
          </div>
        </button>
      </div>

      <div className="pro-footer">
        <Shield size={16} />
        <span>End-to-end encrypted • No installation required</span>
      </div>
    </div>
  );

  const renderCreateName = () => (
    <div className="pro-card">
      <button onClick={() => setStep('landing')} className="pro-back">
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="pro-header">
        <h2 className="pro-heading">Create Your Room</h2>
        <p className="pro-desc">Enter your name to continue</p>
      </div>

      <div className="pro-form">
        <div className="pro-input-group">
          <label>Your Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={userName}
            onChange={(e) => { setUserName(e.target.value); setError(''); }}
            className="pro-input"
            maxLength={20}
            autoFocus
          />
        </div>

        {error && <p className="pro-error">{error}</p>}

        <button onClick={handleCreateRoom} className="pro-btn primary">
          Continue
        </button>
      </div>
    </div>
  );

  const renderLobby = () => (
    <div className="pro-card">
      <button onClick={() => setStep('landing')} className="pro-back">
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="pro-header">
        <div className="pro-success-icon">
          <Check size={32} className="text-green-500" />
        </div>
        <h2 className="pro-heading">Room Created!</h2>
        <p className="pro-desc">Your meeting room is ready</p>
      </div>

      <div className="pro-room-info">
        <div className="pro-room-label">Room ID</div>
        <div className="pro-room-id-container">
          <span className="pro-room-id">{roomId}</span>
          <button onClick={copyRoomId} className="pro-copy-btn">
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="pro-invite-section">
        <div className="pro-invite-header">
          <Users size={18} />
          <span>Invite Others</span>
        </div>
        <p className="pro-invite-text">
          Share this Room ID with participants you want to invite
        </p>
      </div>

      <button onClick={handleEnterLobby} className="pro-btn primary large">
        Enter Room Now
      </button>

      <div className="pro-waiting">
        <div className="pro-avatar-stack">
          <div className="pro-avatar">{userName.charAt(0).toUpperCase()}</div>
          <div className="pro-avatar empty">?</div>
          <div className="pro-avatar empty">?</div>
        </div>
        <p>Waiting for others to join...</p>
      </div>
    </div>
  );

  const renderJoinName = () => (
    <div className="pro-card">
      <button onClick={() => setStep('landing')} className="pro-back">
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="pro-header">
        <h2 className="pro-heading">Join Meeting</h2>
        <p className="pro-desc">Enter your details to join</p>
      </div>

      <div className="pro-form">
        <div className="pro-input-group">
          <label>Your Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={userName}
            onChange={(e) => { setUserName(e.target.value); setError(''); }}
            className="pro-input"
            maxLength={20}
            autoFocus
          />
        </div>

        <div className="pro-input-group">
          <label>Room ID</label>
          <input
            type="text"
            placeholder="Enter room code"
            value={joinRoomId}
            onChange={(e) => { setJoinRoomId(e.target.value.toUpperCase()); setError(''); }}
            className="pro-input"
            maxLength={10}
          />
        </div>

        {error && <p className="pro-error">{error}</p>}

        <button onClick={handleJoinRoom} className="pro-btn primary">
          Join Meeting
        </button>
      </div>
    </div>
  );

  return (
    <div className="pro-container">
      <Slideshow />
      <Rain />
      {step === 'landing' && renderLanding()}
      {step === 'create-name' && renderCreateName()}
      {step === 'lobby' && renderLobby()}
      {step === 'join-name' && renderJoinName()}
    </div>
  );
}

