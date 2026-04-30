import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isOwn: boolean;
}

export function useWebRTC(roomId: string | null, userName: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<string, RTCPeerConnection>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [participants, setParticipants] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const userIdRef = useRef<string>('');

  useEffect(() => {
    if (!roomId) return;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });
        
        localStreamRef.current = stream;
        setLocalStream(stream);

        const SERVER_URL = import.meta.env.DEV ? 'http://localhost:5000' : `http://${window.location.hostname}:5000`;
        const socket = io(SERVER_URL);
        socketRef.current = socket;
        userIdRef.current = socket.id;

        socket.emit('join-room', roomId, socket.id);

        socket.on('participants', (existingParticipants: string[]) => {
          setParticipants(existingParticipants);
          existingParticipants.forEach(userId => {
            createPeerConnection(userId, true);
          });
        });

        socket.on('user-connected', (userId: string) => {
          setParticipants(prev => [...prev, userId]);
          createPeerConnection(userId, false);
        });

        socket.on('user-disconnected', (userId: string) => {
          setParticipants(prev => prev.filter(id => id !== userId));
          setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.delete(userId);
            return newMap;
          });
          setPeers(prev => {
            const newMap = new Map(prev);
            const pc = newMap.get(userId);
            if (pc) {
              pc.close();
            }
            newMap.delete(userId);
            return newMap;
          });
        });

        socket.on('offer', async ({ sdp, caller }: { sdp: RTCSessionDescriptionInit; caller: string }) => {
          await handleOffer(caller, sdp);
        });

        socket.on('answer', async ({ sdp, caller }: { sdp: RTCSessionDescriptionInit; caller: string }) => {
          await handleAnswer(caller, sdp);
        });

        socket.on('ice-candidate', async ({ candidate, caller }: { candidate: RTCIceCandidateInit; caller: string }) => {
          await handleIceCandidate(caller, candidate);
        });

        socket.on('receive-message', (message: Omit<Message, 'isOwn'>) => {
          setMessages(prev => [...prev, { ...message, isOwn: false }]);
        });

      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    };

    init();

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
      peers.forEach(pc => pc.close());
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  const createPeerConnection = async (targetUserId: string, isInitiator: boolean) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', {
          target: targetUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(targetUserId, event.streams[0]);
        return newMap;
      });
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${targetUserId}:`, pc.connectionState);
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    setPeers(prev => new Map(prev).set(targetUserId, pc));

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit('offer', {
        target: targetUserId,
        sdp: offer,
      });
    }

    return pc;
  };

  const handleOffer = async (caller: string, sdp: RTCSessionDescriptionInit) => {
    const pc = await createPeerConnection(caller, false);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socketRef.current?.emit('answer', {
      target: caller,
      sdp: answer,
    });
  };

  const handleAnswer = async (caller: string, sdp: RTCSessionDescriptionInit) => {
    const pc = peers.get(caller);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    }
  };

  const handleIceCandidate = async (caller: string, candidate: RTCIceCandidateInit) => {
    const pc = peers.get(caller);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
        socketRef.current?.emit('toggle-video', roomId, userIdRef.current, !isVideoEnabled);
      }
    }
  }, [isVideoEnabled, roomId]);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
        socketRef.current?.emit('toggle-audio', roomId, userIdRef.current, !isAudioEnabled);
      }
    }
  }, [isAudioEnabled, roomId]);

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: true,
      });
      
      screenStreamRef.current = stream;
      setScreenStream(stream);
      setIsScreenSharing(true);

      peers.forEach(pc => {
        const sender = pc.getSenders().find(s => 
          s.track?.kind === 'video'
        );
        if (sender) {
          const screenTrack = stream.getVideoTracks()[0];
          sender.replaceTrack(screenTrack);
        }
      });

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      socketRef.current?.emit('screen-share', roomId, userIdRef.current, true);
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  }, [peers, roomId]);

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
      setScreenStream(null);
      setIsScreenSharing(false);

      if (localStreamRef.current) {
        peers.forEach(pc => {
          const sender = pc.getSenders().find(s => 
            s.track?.kind === 'video'
          );
          if (sender) {
            const videoTrack = localStreamRef.current!.getVideoTracks()[0];
            sender.replaceTrack(videoTrack);
          }
        });
      }

      socketRef.current?.emit('screen-share', roomId, userIdRef.current, false);
    }
  }, [peers, roomId]);

  const sendMessage = useCallback((text: string) => {
    const message = {
      id: Date.now().toString(),
      sender: userName,
      text,
      timestamp: Date.now(),
      isOwn: true,
    };
    
    setMessages(prev => [...prev, message]);
    socketRef.current?.emit('send-message', roomId, message);
  }, [roomId, userName]);

  const leaveRoom = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
    peers.forEach(pc => pc.close());
    socketRef.current?.disconnect();
    window.location.reload();
  }, [peers]);

  return {
    localStream,
    screenStream,
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
    userId: userIdRef.current,
  };
}
