import { useEffect, useRef } from 'react';
import { User, Monitor } from 'lucide-react';

interface VideoPlayerProps {
  stream: MediaStream | null;
  userName: string;
  isLocal: boolean;
  isVideoEnabled: boolean;
  isScreenShare?: boolean;
}

export function VideoPlayer({ 
  stream, 
  userName, 
  isLocal, 
  isVideoEnabled,
  isScreenShare 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = stream?.getVideoTracks().some(track => track.enabled) ?? false;
  const showVideo = hasVideo && isVideoEnabled;

  return (
    <div className="video-container">
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={isScreenShare ? 'object-contain' : 'object-cover'}
        />
      ) : (
        <div className="video-placeholder">
          <div className="w-24 h-24 bg-slate-600 rounded-full flex items-center justify-center">
            <User size={48} className="text-slate-400" />
          </div>
        </div>
      )}
      
      <div className="participant-name flex items-center gap-2">
        {isScreenShare && <Monitor size={14} />}
        <span>{userName}</span>
        {isLocal && <span className="text-xs bg-blue-500 px-2 py-0.5 rounded">You</span>}
      </div>
      
      {isScreenShare && (
        <div className="absolute top-3 left-3 bg-blue-500 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Monitor size={12} />
          Sharing Screen
        </div>
      )}
    </div>
  );
}
