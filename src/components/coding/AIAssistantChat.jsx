import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * AIAssistantChat - Minimalistic AI assistant interface
 * Clean design matching the app's aesthetic
 */
const AIAssistantChat = ({ 
  messages = [], 
  onSendMessage,
  onRequestHint,
  isLoadingHint = false,
  isLoadingChat = false,
  currentCode = '',
  questionId = null
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedHintLevel, setSelectedHintLevel] = useState(3);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim() && onSendMessage) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const levelNames = {
    1: 'Metacognitive',
    2: 'Conceptual', 
    3: 'Strategic',
    4: 'Structural',
    5: 'Targeted'
  };

  const renderMessage = (content) => {
    if (!content) return '';
    const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim();
        return (
          <pre key={i} className="bg-zinc-900/50 rounded p-3 my-2 overflow-x-auto border border-zinc-700/50">
            <code className="text-xs text-zinc-300 font-mono">{code}</code>
          </pre>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-zinc-700/50 text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part.split(/(\*\*.*?\*\*)/g).map((seg, j) => (
        seg.startsWith('**') && seg.endsWith('**') 
          ? <strong key={j} className="text-zinc-100">{seg.slice(2, -2)}</strong>
          : seg
      ));
    });
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h4 className="text-sm font-medium text-zinc-300 mb-2">AI Teaching Assistant</h4>
              <p className="text-xs text-zinc-500 mb-4">
                Request hints or ask questions about the problem
              </p>
              <button
                onClick={() => onRequestHint(selectedHintLevel)}
                disabled={isLoadingHint || !questionId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
              >
                Request Hint
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                {msg.hintLevel && (
                  <div className="text-xs text-zinc-500">
                    Level {msg.hintLevel} • {levelNames[msg.hintLevel]}
                    {msg.hintsUsed && ` • ${msg.hintsUsed} hints used`}
                  </div>
                )}
                <div className={`
                  p-4 rounded-lg border
                  ${msg.role === 'user' 
                    ? 'bg-blue-600/10 border-blue-600/20 ml-12' 
                    : 'bg-zinc-800/50 border-zinc-700/50 mr-12'
                  }
                `}>
                  <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {renderMessage(msg.content)}
                  </div>
                  {msg.timestamp && (
                    <div className="text-xs text-zinc-500 mt-2">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {(isLoadingHint || isLoadingChat) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-lg border bg-zinc-800/50 border-zinc-700/50 mr-12"
              >
                <div className="flex items-center space-x-2 text-sm text-zinc-400">
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  <span className="ml-2">{isLoadingHint ? 'Generating hint...' : 'Thinking...'}</span>
                </div>
              </motion.div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-700 p-4 space-y-3">
        {/* Hint progress indicator */}
        {messages.some(m => m.hintLevel) && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">Hints used:</span>
            {[1, 2, 3, 4, 5].map((level) => {
              const lastHintLevel = Math.max(...messages.filter(m => m.hintLevel).map(m => m.hintLevel), 0);
              const isUsed = level <= lastHintLevel;
              return (
                <div
                  key={level}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                    isUsed 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}
                >
                  {level}
                </div>
              );
            })}
            {messages.filter(m => m.hintLevel).length >= 5 && (
              <span className="text-xs text-orange-400 ml-2">Max hints reached</span>
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={() => onRequestHint(1)} // Level doesn't matter - backend auto-increments
            disabled={isLoadingHint || isLoadingChat || !questionId || messages.filter(m => m.hintLevel).length >= 5}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
            title={messages.filter(m => m.hintLevel).length >= 5 ? "Maximum hints reached" : "Request next hint"}
          >
            Hint
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            disabled={isLoadingChat}
            className="flex-1 px-3 py-2 bg-zinc-800 text-zinc-100 text-sm rounded-lg border border-zinc-700 focus:outline-none focus:border-blue-600 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoadingChat}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 text-sm rounded-lg border border-zinc-700 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantChat;

