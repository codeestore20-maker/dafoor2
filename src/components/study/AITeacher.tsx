import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, GraduationCap, Plus, History, MessageSquare, X, ChevronRight } from 'lucide-react';
import Markdown from 'react-markdown';
import { useParams } from 'react-router-dom';
import { resourceService } from '../../lib/api';
import { ViewMode } from './StudySidebar';
import { useTranslation } from 'react-i18next';

interface AITeacherProps {
  currentView?: ViewMode;
}

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  date: Date;
  messages: Message[];
}

// Custom Owl Mascot Component
const WiseOwl = ({ isThinking }: { isThinking: boolean }) => (
  <svg width="60" height="60" viewBox="0 0 100 100" className="drop-shadow-md">
    <circle cx="50" cy="50" r="45" fill="#fdfbf7" stroke="#292524" strokeWidth="3" />
    {/* Ears */}
    <path d="M25 25 L15 10 L35 20 Z" fill="#292524" />
    <path d="M75 25 L85 10 L65 20 Z" fill="#292524" />
    {/* Body/Face */}
    <path d="M20 50 Q20 20 50 20 Q80 20 80 50 Q80 85 50 85 Q20 85 20 50" fill="#e7e5e4" stroke="#292524" strokeWidth="2" />
    {/* Eyes */}
    <g className={isThinking ? "animate-pulse" : ""}>
      <circle cx="35" cy="45" r="12" fill="white" stroke="#292524" strokeWidth="2" />
      <circle cx="65" cy="45" r="12" fill="white" stroke="#292524" strokeWidth="2" />
      <circle cx="35" cy="45" r="4" fill="#292524">
        {isThinking && <animate attributeName="cy" values="45;42;45" dur="1s" repeatCount="indefinite" />}
      </circle>
      <circle cx="65" cy="45" r="4" fill="#292524">
        {isThinking && <animate attributeName="cy" values="45;42;45" dur="1s" repeatCount="indefinite" />}
      </circle>
    </g>
    {/* Glasses */}
    <path d="M23 45 A12 12 0 0 1 47 45" fill="none" stroke="#d97706" strokeWidth="2" />
    <path d="M53 45 A12 12 0 0 1 77 45" fill="none" stroke="#d97706" strokeWidth="2" />
    <line x1="47" y1="45" x2="53" y2="45" stroke="#d97706" strokeWidth="2" />
    {/* Beak */}
    <path d="M50 55 L45 60 L55 60 Z" fill="#d97706" />
    {/* Graduation Cap (Mini) */}
    <path d="M30 15 L50 5 L70 15 L50 25 Z" fill="#292524" />
    <path d="M70 15 L70 25" stroke="#f59e0b" strokeWidth="2" />
  </svg>
);

export function AITeacher({
  currentView = 'notes'
}: AITeacherProps) {
  const { fileId } = useParams();
  const { t, i18n } = useTranslation();
  
  // State for Chat History
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Current Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll Logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Only auto-scroll on new message added (length change), not every character update
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isTyping]); // Changed dependency from 'messages' to 'messages.length'

  // Load session or start new one
  useEffect(() => {
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) {
        setMessages(session.messages);
      }
    } else {
      // New Session
      setMessages([{
        id: 'init',
        text: t('welcome_message'),
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  }, [currentSessionId, t]);


  const handleSend = async () => {
    if (!inputValue.trim() || !fileId) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
        id: aiMessageId,
        text: '', 
        sender: 'ai',
        timestamp: new Date()
    };
    setMessages(prev => [...prev, aiMessage]);

    try {
        const history = messages.map(m => ({
            role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: m.text
        }));

        await resourceService.chatStream(fileId, newMessage.text, history, (chunk) => {
            setMessages(prev => prev.map(msg => {
                if (msg.id === aiMessageId) {
                    return { ...msg, text: msg.text + chunk };
                }
                return msg;
            }));
        });
        
        setMessages(prev => {
            if (currentSessionId) {
              setSessions(prevSessions => prevSessions.map(s => 
                s.id === currentSessionId 
                  ? { ...s, messages: prev }
                  : s
              ));
            } else {
              const newSessionId = Date.now().toString();
              const newSession: ChatSession = {
                id: newSessionId,
                title: newMessage.text.slice(0, 30) + "...",
                date: new Date(),
                messages: prev
              };
              setSessions(prevSessions => [newSession, ...prevSessions]);
              setCurrentSessionId(newSessionId);
            }
            return prev;
        });

    } catch (error) {
        console.error("Chat Error:", error);
        setMessages(prev => prev.map(msg => {
            if (msg.id === aiMessageId) {
                return { ...msg, text: t('ai_connection_error') };
            }
            return msg;
        }));
    } finally {
        setIsTyping(false);
    }
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setShowHistory(false);
  };

  return <div className="flex flex-col h-full bg-[#fdfbf7] border-l-2 border-stone-300 font-serif relative overflow-hidden">
      {/* Paper Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-50 z-0" style={{
        backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`
      }}></div>

      {/* Decorative Stamp/Postmark */}
      <div className="absolute top-10 right-10 opacity-10 pointer-events-none rotate-12">
        <div className="w-32 h-32 border-4 border-stone-800 rounded-full flex items-center justify-center">
            <span className="font-hand font-bold text-xl text-stone-800">{t('approved')}</span>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 border-b-2 border-dashed border-stone-300 bg-[#fdfbf7]/90 backdrop-blur-sm flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="absolute inset-0 bg-yellow-200 rounded-full blur-md opacity-50"></div>
             <WiseOwl isThinking={isTyping} />
          </div>
          <div>
            <h3 className={`font-hand font-bold text-stone-800 leading-none ${i18n.language === 'ar' ? 'text-lg' : 'text-2xl'}`}>{t('prof_owl')}</h3>
            <p className="text-xs text-stone-500 font-sans uppercase tracking-wider font-bold mt-1">{t('academic_guide')}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg border-2 transition-all ${showHistory ? 'bg-stone-200 border-stone-400' : 'bg-white border-stone-300 hover:border-school-board text-stone-600'}`}
            title={t('chat_history')}
           >
             <History size={18} />
           </button>
           <button 
            onClick={startNewChat}
            className="p-2 bg-school-board text-white border-2 border-school-board rounded-lg hover:bg-school-board/90 transition-all shadow-sm"
            title={t('new_chat')}
           >
             <Plus size={18} />
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative z-10 flex">
        
        {/* History Sidebar (Overlay) */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 bg-[#fdfbf7] z-20 overflow-y-auto p-4 border-l-2 border-stone-200 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4 border-b-2 border-stone-200 pb-2">
                 <h4 className="font-hand text-xl font-bold text-stone-800">{t('past_sessions')}</h4>
                 <button onClick={() => setShowHistory(false)} className="text-stone-400 hover:text-stone-600">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="space-y-3">
                {sessions.map(session => (
                  <button 
                    key={session.id}
                    onClick={() => {
                      setCurrentSessionId(session.id);
                      setShowHistory(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all group relative overflow-hidden ${currentSessionId === session.id ? 'bg-white border-school-board shadow-md' : 'bg-white border-stone-200 hover:border-stone-400'}`}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-school-board opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-start gap-3 pl-2">
                      <MessageSquare size={16} className={`mt-1 ${currentSessionId === session.id ? 'text-school-board' : 'text-stone-400'}`} />
                      <div>
                        <p className="font-sans font-bold text-sm text-stone-800 line-clamp-2">{session.title}</p>
                        <p className="font-mono text-xs text-stone-500 mt-1">{session.date.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
          {messages.map((message, idx) => (
            <motion.div 
              key={message.id} 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[85%] min-w-0 relative shadow-sm
                ${message.sender === 'user' ? 'mr-2' : 'ml-2'}
              `}>
                {/* Visual "Pin" or "Tape" */}
                <div className={`absolute -top-3 ${message.sender === 'user' ? 'right-4 bg-blue-200/50' : 'left-4 bg-yellow-200/50'} w-8 h-4 rotate-3 backdrop-blur-sm z-10`}></div>

                <div className={`
                   p-4 text-sm leading-relaxed relative break-words whitespace-pre-wrap
                   ${message.sender === 'user' 
                     ? 'bg-white border border-stone-300 text-stone-800 rotate-1 rounded-sm shadow-[2px_2px_0px_rgba(0,0,0,0.1)]' 
                     : 'bg-[#fff9c4] border border-yellow-300 text-stone-900 -rotate-1 rounded-sm shadow-[2px_2px_0px_rgba(234,179,8,0.2)]'}
                `}>
                  <div className="font-hand text-lg">
                     <Markdown
                        components={{
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                            li: ({node, ...props}) => <li className="ml-2" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-stone-900" {...props} />,
                            em: ({node, ...props}) => <em className="italic" {...props} />,
                        }}
                     >
                        {message.text}
                     </Markdown>
                     {!message.text && message.sender === 'ai' && isTyping && (
                        <div className="flex gap-1 items-center h-6 px-1">
                            <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce delay-150"></span>
                        </div>
                     )}
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 block text-right mt-2">
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 p-4 bg-[#fdfbf7] border-t-2 border-dashed border-stone-300">
        <div className="flex items-end gap-2 bg-white p-2 rounded-xl border-2 border-stone-300 focus-within:border-stone-800 focus-within:shadow-[4px_4px_0px_rgba(41,37,36,1)] transition-all">
          <textarea 
            value={inputValue} 
            onChange={e => setInputValue(e.target.value)} 
            onKeyPress={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t('ask_prof_placeholder')} 
            className="flex-1 bg-transparent border-none focus:outline-none text-lg font-hand text-stone-800 placeholder:text-stone-400 resize-none max-h-32 py-2 pl-2"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          <button 
            onClick={handleSend} 
            disabled={!inputValue.trim()} 
            className="p-3 bg-school-board text-white rounded-lg hover:bg-school-board/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:translate-y-1 active:shadow-none"
          >
            <Send size={20} className="flip-rtl" />
          </button>
        </div>
      </div>
    </div>;
}
