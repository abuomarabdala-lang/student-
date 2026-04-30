import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isOwn: boolean;
}

interface ChatPanelProps {
  isOpen: boolean;
  messages: Message[];
  onSendMessage: (text: string) => void;
  userName: string;
}

export function ChatPanel({ isOpen, messages, onSendMessage, userName }: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h3 className="font-semibold">Chat</h3>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center text-sm">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${msg.isOwn ? 'own' : ''}`}
            >
              <div className="text-xs font-medium mb-1 opacity-80">
                {msg.isOwn ? 'You' : msg.sender} · {formatTime(msg.timestamp)}
              </div>
              <div className="text-sm">{msg.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="chat-input-container">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
          maxLength={500}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="control-btn active disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
