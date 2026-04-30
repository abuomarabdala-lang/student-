import { useState } from 'react';
import { RoomJoin } from './components/RoomJoin';
import { VideoConference } from './components/VideoConference';

function App() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  const handleJoinRoom = (room: string, name: string) => {
    setRoomId(room);
    setUserName(name);
  };

  const handleLeaveRoom = () => {
    setRoomId(null);
    setUserName('');
  };

  return (
    <div className="App">
      {!roomId ? (
        <RoomJoin onJoin={handleJoinRoom} />
      ) : (
        <VideoConference 
          roomId={roomId} 
          userName={userName}
          onLeave={handleLeaveRoom}
        />
      )}
    </div>
  );
}

export default App;
