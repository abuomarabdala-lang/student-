import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MonitorUp, 
  MonitorStop, 
  PhoneOff 
} from 'lucide-react';

interface ControlBarProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  onLeave: () => void;
}

export function ControlBar({
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onLeave,
}: ControlBarProps) {
  return (
    <div className="control-bar">
      <button
        onClick={onToggleAudio}
        className={`control-btn ${!isAudioEnabled ? 'danger' : ''}`}
        title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isAudioEnabled ? <Mic size={22} /> : <MicOff size={22} />}
      </button>
      
      <button
        onClick={onToggleVideo}
        className={`control-btn ${!isVideoEnabled ? 'danger' : ''}`}
        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoEnabled ? <Video size={22} /> : <VideoOff size={22} />}
      </button>
      
      <button
        onClick={onToggleScreenShare}
        className={`control-btn ${isScreenSharing ? 'active' : ''}`}
        title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
      >
        {isScreenSharing ? <MonitorStop size={22} /> : <MonitorUp size={22} />}
      </button>
      
      <button
        onClick={onLeave}
        className="control-btn danger"
        title="Leave meeting"
      >
        <PhoneOff size={22} />
      </button>
    </div>
  );
}
