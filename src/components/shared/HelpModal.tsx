
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Paperclip, Loader2, HelpCircle, MessageSquare } from 'lucide-react';
import { ticketService } from '../../lib/api';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- UI Primitives (Compact Version) ---
const BrandButton = ({ children, onClick, disabled, icon: Icon, className = '', variant = 'primary', size = 'normal', type = 'button', ...props }: any) => {
    const baseStyle = "rounded-lg font-hand font-bold flex items-center justify-center gap-1.5 transition-all active:translate-y-[1px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed";
    
    const sizeStyles = {
        small: "px-3 py-1.5 text-sm",
        normal: "px-4 py-2 text-base", // Reduced padding & text size
        large: "px-6 py-3 text-lg"
    };

    const variants = {
        primary: "bg-school-board text-white border-2 border-stone-800 shadow-[3px_3px_0px_rgba(41,37,36,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(41,37,36,1)]",
        secondary: "bg-white text-stone-800 border-2 border-stone-800 shadow-[2px_2px_0px_rgba(41,37,36,1)] hover:bg-stone-50 hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(41,37,36,1)]",
        ghost: "bg-transparent text-stone-600 hover:bg-stone-100 border border-transparent hover:border-stone-200 shadow-none px-3"
    };

    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${sizeStyles[size as keyof typeof sizeStyles]} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
            {Icon && <Icon size={size === 'small' ? 14 : 16} />}
            {children}
        </button>
    );
};

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    setError(null);
    try {
      await ticketService.create({ message, subject });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setMessage('');
        setSubject('');
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to send ticket', err);
      setError(err.response?.data?.message || 'Failed to send ticket. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 p-4 flex items-center justify-center"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-lg pointer-events-auto flex flex-col max-h-[90vh]">
              
              {/* Main Card - Compact CourseMap Identity */}
              <div className="bg-[#fcfbf9] rounded-xl border-[3px] border-stone-800 shadow-[6px_6px_0px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col h-auto">
                
                {/* Header - Compact */}
                <div className="flex items-center justify-between px-4 py-3 border-b-2 border-stone-200 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-school-board/10 flex items-center justify-center text-school-board border border-school-board/20 shrink-0">
                            <HelpCircle size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold font-hand text-stone-800 leading-none mb-0.5">
                                {t('help_ticket_title', 'Support Ticket')}
                            </h2>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                                {t('we_are_here_to_help', 'We are here to help')}
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Body - Scrollable */}
                <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar bg-[#fcfbf9] flex-1 min-h-0">
                    {isSuccess ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 h-full min-h-[200px]">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center border-2 border-green-200 animate-bounce shadow-sm">
                          <Send size={32} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-hand text-xl font-bold text-stone-800">
                              {t('ticket_sent', 'Ticket Sent!')}
                            </h3>
                            <p className="font-medium text-stone-500 text-sm max-w-xs mx-auto">
                              {t('ticket_sent_desc', 'We will get back to you shortly.')}
                            </p>
                        </div>
                      </div>
                    ) : (
                      <form id="help-form" onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium flex items-center gap-2">
                             <X size={16} />
                             {error}
                          </div>
                        )}
                        {/* Subject Input */}
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-2 font-hand font-bold text-stone-700 text-sm md:text-base">
                            <span className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-[10px] font-sans font-bold">1</span>
                            {t('ticket_subject', 'Subject')}
                          </label>
                          <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full bg-white border border-stone-300 focus:border-school-board rounded-lg px-3 py-2 outline-none font-sans text-stone-800 text-sm md:text-base transition-all shadow-sm focus:shadow-md placeholder:text-stone-400/70"
                            placeholder={t('ticket_subject_placeholder', 'e.g. Issue with PDF upload...')}
                          />
                        </div>

                        {/* Message Input */}
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-2 font-hand font-bold text-stone-700 text-sm md:text-base">
                            <span className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-[10px] font-sans font-bold">2</span>
                            {t('ticket_message', 'Message')}
                          </label>
                          <div className="relative">
                            <textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              required
                              rows={5}
                              className="w-full bg-white border border-stone-300 rounded-lg p-3 focus:border-school-board outline-none font-sans text-stone-800 text-sm md:text-base transition-all resize-none shadow-sm focus:shadow-md leading-relaxed placeholder:text-stone-400/70"
                              placeholder={t('ticket_message_placeholder', 'Describe your issue here...')}
                            />
                            {/* Decorative Icon */}
                            <div className="absolute bottom-3 right-3 text-stone-200 pointer-events-none">
                                <MessageSquare size={18} />
                            </div>
                          </div>
                        </div>
                      </form>
                    )}
                </div>

                {/* Bottom Bar / Footer - Compact */}
                {!isSuccess && (
                    <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2 shrink-0 rounded-b-lg">
                        <BrandButton 
                            variant="ghost" 
                            onClick={onClose}
                            disabled={isSending}
                            size="small"
                        >
                            {t('cancel', 'Cancel')}
                        </BrandButton>
                        
                        <BrandButton
                            type="submit"
                            form="help-form"
                            disabled={isSending || !message.trim()}
                            icon={isSending ? Loader2 : Send}
                            size="small"
                            className="min-w-[100px]"
                        >
                            {isSending ? t('sending', 'Sending...') : t('send_ticket', 'Send Ticket')}
                        </BrandButton>
                    </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
