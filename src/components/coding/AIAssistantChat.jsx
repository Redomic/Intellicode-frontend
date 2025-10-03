import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import AIAssistantOrb from '../ui/AIAssistantOrb';

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

  const getHintLevelStyle = (level) => {
    const styles = {
      1: {
        gradient: 'from-fuchsia-900/40 via-purple-900/20 to-zinc-900',
        accentBar: 'bg-gradient-to-b from-fuchsia-500 to-purple-600',
        border: 'border-fuchsia-500/40',
        text: 'text-fuchsia-300',
        badge: 'bg-fuchsia-500/20 border-fuchsia-400/50',
        glow: 'shadow-fuchsia-500/30',
        icon: 'text-fuchsia-400',
        orbColor: 'fuchsia'
      },
      2: {
        gradient: 'from-cyan-900/40 via-blue-900/20 to-zinc-900',
        accentBar: 'bg-gradient-to-b from-cyan-500 to-blue-600',
        border: 'border-cyan-500/40',
        text: 'text-cyan-300',
        badge: 'bg-cyan-500/20 border-cyan-400/50',
        glow: 'shadow-cyan-500/30',
        icon: 'text-cyan-400',
        orbColor: 'cyan'
      },
      3: {
        gradient: 'from-emerald-900/40 via-green-900/20 to-zinc-900',
        accentBar: 'bg-gradient-to-b from-emerald-500 to-green-600',
        border: 'border-emerald-500/40',
        text: 'text-emerald-300',
        badge: 'bg-emerald-500/20 border-emerald-400/50',
        glow: 'shadow-emerald-500/30',
        icon: 'text-emerald-400',
        orbColor: 'emerald'
      },
      4: {
        gradient: 'from-amber-900/40 via-orange-900/20 to-zinc-900',
        accentBar: 'bg-gradient-to-b from-amber-500 to-orange-600',
        border: 'border-amber-500/40',
        text: 'text-amber-300',
        badge: 'bg-amber-500/20 border-amber-400/50',
        glow: 'shadow-amber-500/30',
        icon: 'text-amber-400',
        orbColor: 'amber'
      },
      5: {
        gradient: 'from-rose-900/40 via-red-900/20 to-zinc-900',
        accentBar: 'bg-gradient-to-b from-rose-500 to-red-600',
        border: 'border-rose-500/40',
        text: 'text-rose-300',
        badge: 'bg-rose-500/20 border-rose-400/50',
        glow: 'shadow-rose-500/30',
        icon: 'text-rose-400',
        orbColor: 'rose'
      }
    };
    return styles[level] || styles[3];
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && !isLoadingHint && !isLoadingChat ? (
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
        ) : messages.length === 0 && (isLoadingHint || isLoadingChat) ? (
          <div className="flex flex-col items-center justify-center h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-sm"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-sm font-medium text-zinc-200 mb-2">
                {isLoadingHint ? 'Generating your hint...' : 'Thinking...'}
              </h4>
              <p className="text-xs text-zinc-500">
                Analyzing the problem and your approach
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Hint Message - Unique Card Design */}
                {msg.hintLevel ? (
                  <div className="my-8">
                    {/* Top Divider */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-zinc-600" />
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getHintLevelStyle(msg.hintLevel).badge} ${getHintLevelStyle(msg.hintLevel).border} backdrop-blur-sm`}>
                        <span className={`text-xs font-semibold uppercase tracking-wide ${getHintLevelStyle(msg.hintLevel).text}`}>
                          Hint #{msg.hintLevel}
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-zinc-700 to-zinc-600" />
                    </div>

                    <motion.div
                      initial={{ scale: 0.95, rotateX: -10 }}
                      animate={{ scale: 1, rotateX: 0 }}
                      className={`
                        relative rounded-xl overflow-hidden
                        border ${getHintLevelStyle(msg.hintLevel).border}
                        shadow-2xl ${getHintLevelStyle(msg.hintLevel).glow}
                        bg-gradient-to-br ${getHintLevelStyle(msg.hintLevel).gradient}
                      `}
                    >
                    {/* Decorative accent bar on left */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getHintLevelStyle(msg.hintLevel).accentBar}`} />
                    
                    {/* Corner level indicator */}
                    <div className="absolute top-3 right-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${getHintLevelStyle(msg.hintLevel).badge}
                        border-2 backdrop-blur-sm
                        font-bold text-lg
                        ${getHintLevelStyle(msg.hintLevel).text}
                      `}>
                        {msg.hintLevel}
                      </div>
                    </div>
                    
                    <div className="p-5 pl-6">
                      {/* Hint Header with Orb */}
                      <div className="flex items-start gap-3 mb-4">
                        <AIAssistantOrb 
                          size="md" 
                          isActive={true} 
                          color={getHintLevelStyle(msg.hintLevel).orbColor}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 pt-1">
                          <div className={`text-base font-bold mb-1 ${getHintLevelStyle(msg.hintLevel).text}`}>
                            {levelNames[msg.hintLevel]} Hint
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-400">
                              Level {msg.hintLevel} of 5
                            </span>
                            {msg.hintsUsed && (
                              <>
                                <span className="text-zinc-600">•</span>
                                <span className="text-xs text-zinc-500">
                                  {msg.hintsUsed} hints used
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Divider */}
                      <div className={`h-px mb-4 bg-gradient-to-r from-transparent via-zinc-700 to-transparent`} />
                      
                      {/* Hint Content */}
                      <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap mb-3">
                        {renderMessage(msg.content)}
                      </div>
                      
                      {/* Footer */}
                      {msg.timestamp && (
                        <div className="flex items-center gap-2 text-xs text-zinc-600 pt-2 border-t border-zinc-800/50">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                    
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                        backgroundSize: '24px 24px'
                      }} />
                    </div>
                  </motion.div>

                  {/* Bottom Divider */}
                  <div className="mt-6 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                </div>
                ) : (
                  /* Regular Chat Message - Simple Design */
                  <div className={`
                    p-3 rounded-lg mb-3
                    ${msg.role === 'user' 
                      ? 'bg-blue-600/10 border border-blue-600/20 ml-12' 
                      : 'bg-zinc-800/50 border border-zinc-700/50 mr-12'
                    }
                  `}>
                    <div className="text-xs text-zinc-500 mb-1">
                      {msg.role === 'user' ? 'You' : 'AI Assistant'}
                    </div>
                    <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                      {renderMessage(msg.content)}
                    </div>
                    {msg.timestamp && (
                      <div className="text-xs text-zinc-500 mt-2">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                )}
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

      {/* Input Area - Redesigned */}
      <div className="border-t border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
        {/* Hint progress indicator */}
        {messages.some(m => m.hintLevel) && (
          <div className="px-6 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Hint Progress</span>
              {messages.filter(m => m.hintLevel).length >= 5 && (
                <span className="text-xs font-medium text-orange-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Max Reached
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((level) => {
                const lastHintLevel = Math.max(...messages.filter(m => m.hintLevel).map(m => m.hintLevel), 0);
                const isUsed = level <= lastHintLevel;
                const colorMap = {
                  1: 'from-fuchsia-500 to-purple-600',
                  2: 'from-cyan-500 to-blue-600',
                  3: 'from-emerald-500 to-green-600',
                  4: 'from-amber-500 to-orange-600',
                  5: 'from-rose-500 to-red-600'
                };
                return (
                  <div
                    key={level}
                    className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                      isUsed 
                        ? `bg-gradient-to-r ${colorMap[level]} shadow-lg` 
                        : 'bg-zinc-800/80 border border-zinc-700/50'
                    }`}
                    title={`Hint ${level}`}
                  />
                );
              })}
            </div>
          </div>
        )}
        
        {/* Input Controls */}
        <div className="p-4 pt-3">
          <div className="flex gap-3">
            {/* Hint Button - Game-like design */}
            <button
              onClick={() => onRequestHint(1)}
              disabled={isLoadingHint || isLoadingChat || !questionId || messages.filter(m => m.hintLevel).length >= 5}
              className="group relative px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-zinc-700 disabled:to-zinc-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25 disabled:shadow-none"
              title={messages.filter(m => m.hintLevel).length >= 5 ? "Maximum hints reached" : "Request next hint"}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Hint</span>
              </div>
              {/* Subtle shine effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
            
            {/* Text Input - Sleek design */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about this problem..."
                disabled={isLoadingChat}
                className="w-full px-4 py-2.5 bg-zinc-800/50 text-zinc-100 text-sm rounded-lg border border-zinc-700/50 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 placeholder:text-zinc-500 transition-all duration-200"
              />
              {/* Animated focus ring */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
            </div>
            
            {/* Send Button - Minimal icon design */}
            <button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isLoadingChat}
              className="group px-4 py-2.5 bg-zinc-800/50 hover:bg-zinc-700/50 disabled:bg-zinc-800/30 disabled:cursor-not-allowed text-zinc-300 hover:text-white disabled:text-zinc-600 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-all duration-200"
              title="Send message"
            >
              <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantChat;

