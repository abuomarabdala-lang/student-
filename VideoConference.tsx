import { useState, useRef, useEffect } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { VideoPlayer } from './VideoPlayer';
import { ControlBar } from './ControlBar';
import { ChatPanel } from './ChatPanel';
import { MessageSquare, Users } from 'lucide-react';

interface VideoConferenceProps {
  roomId: string;
  userName: string;
  onLeave: () => void;
}

export function VideoConference({ roomId, userName, onLeave }: VideoConferenceProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  
  const {
    localStream,
    remoteStreams,
    participants,
    messages,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    sendMessage,
    leaveRoom,
    userId,
  } = useWebRTC(roomId, userName);

  const handleLeave = () => {
    leaveRoom();
    onLeave();
  };

  const totalParticipants = 1 + remoteStreams.size;
  const gridClass = `video-grid video-grid-${Math.min(totalParticipants, 6)}`;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="flex justify-between items-center p-4 border-b border-slate-700">
        <div>
          <h2 className="text-xl font-semibold">Room: {roomId}</h2>
          <p className="text-sm text-gray-400">{participants.length + 1} participants</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`control-btn ${showParticipants ? 'active' : ''}`}
            title="Participants"
          >
            <Users size={20} />
          </button>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`control-btn ${isChatOpen ? 'active' : ''}`}
            title="Chat"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </div>

      <div className={`${isChatOpen ? 'mr-80' : ''} transition-all duration-300`}>
        <div className={gridClass}>
          {localStream && (
            <VideoPlayer
              stream={localStream}
              userName={`${userName} (You)`}
              isLocal={true}
              isVideoEnabled={isVideoEnabled}
              isScreenShare={isScreenSharing}
            />
          )}
          
          {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
            <VideoPlayer
              key={peerId}
              stream={stream}
              userName={`Participant ${peerId.slice(0, 6)}`}
              isLocal={false}
              isVideoEnabled={true}
            />
          ))}
        </div>
      </div>

      {showParticipants && (
        <div className="fixed left-4 top-20 bg-slate-800 rounded-xl p-4 min-w-48 shadow-lg">
          <h3 className="font-semibold mb-3">Participants</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-blue-400">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {userName} (You)
            </li>
            {participants.map((id) => (
              <li key={id} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Participant {id.slice(0, 6)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ChatPanel
        isOpen={isChatOpen}
        messages={messages}
        onSendMessage={sendMessage}
        userName={userName}
      />

      <ControlBar
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        isScreenSharing={isScreenSharing}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onToggleScreenShare={isScreenSharing ? stopScreenShare : startScreenShare}
        onLeave={handleLeave}
      />
    </div>
  );
}
