
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ticketService } from '../../lib/api';
import { MessageSquare, CheckCircle, Clock, XCircle, AlertCircle, Trash2, Mail, User } from 'lucide-react';

interface Ticket {
  id: string;
  subject?: string;
  message: string;
  status: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

export function AdminTickets() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      const data = await ticketService.getAll();
      setTickets(data);
    } catch (err) {
      setError(t('failed_to_load_tickets', 'Failed to load tickets'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await ticketService.updateStatus(id, newStatus);
      fetchTickets(); // Refresh list
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'OPEN': 
        return {
            bg: 'bg-amber-100',
            text: 'text-amber-800',
            border: 'border-amber-800',
            icon: AlertCircle,
            label: t('ticket_status_open', 'Open')
        };
      case 'CLOSED': 
        return {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-800',
            icon: CheckCircle,
            label: t('ticket_status_closed', 'Closed')
        };
      case 'IN_PROGRESS': 
        return {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            border: 'border-blue-800',
            icon: Clock,
            label: t('ticket_status_in_progress', 'In Progress')
        };
      default: 
        return {
            bg: 'bg-stone-100',
            text: 'text-stone-800',
            border: 'border-stone-800',
            icon: MessageSquare,
            label: status
        };
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-school-board rounded-full animate-spin mb-4"></div>
        <p className="text-stone-500 font-bold animate-pulse">{t('loading_tickets', 'Loading tickets...')}</p>
    </div>
  );
  
  if (error) return (
    <div className="p-8 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border-2 border-red-200 inline-flex items-center gap-2 font-bold">
            <AlertCircle />
            {error}
        </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold font-hand text-stone-800 flex items-center gap-3">
            <div className="bg-school-board text-white p-2 rounded-lg border-2 border-stone-800 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <MessageSquare className="w-6 h-6" />
            </div>
            {t('admin_tickets_title', 'Support Tickets')}
            <span className="text-lg bg-stone-200 text-stone-600 px-3 py-1 rounded-full font-sans font-bold border-2 border-stone-800">
                {tickets.length}
            </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-[#fcfbf9] rounded-2xl border-2 border-dashed border-stone-300">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                    <MessageSquare size={40} />
                </div>
                <p className="text-stone-500 font-bold text-xl font-hand">{t('no_tickets_found', 'No tickets found.')}</p>
            </div>
        ) : (
            tickets.map((ticket) => {
                const statusStyle = getStatusStyle(ticket.status);
                const StatusIcon = statusStyle.icon;
                
                return (
                    <div key={ticket.id} className="group bg-[#fcfbf9] rounded-xl border-2 border-stone-800 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b-2 border-stone-200 bg-white/50 flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-stone-800 font-hand leading-tight mb-1 break-words">
                                    {ticket.subject || t('ticket_subject_missing', 'No Subject')}
                                </h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                                    <Clock size={12} />
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className={`shrink-0 px-2 py-1 rounded-lg border-2 ${statusStyle.border} ${statusStyle.bg} ${statusStyle.text} text-xs font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]`}>
                                <StatusIcon size={12} />
                                {statusStyle.label}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-4 flex-1">
                            <div className="bg-white p-3 rounded-lg border border-stone-200 text-stone-600 text-sm leading-relaxed mb-4 min-h-[80px] font-medium shadow-inner">
                                "{ticket.message}"
                            </div>
                            
                            <div className="flex items-center gap-3 text-xs text-stone-500 font-bold bg-stone-100 p-2 rounded-lg border border-stone-200">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-stone-200 text-stone-400 shrink-0">
                                    <User size={16} />
                                </div>
                                <div className="min-w-0">
                                    <div className="truncate text-stone-800">{ticket.user.name || t('unknown_user', 'Unknown')}</div>
                                    <div className="truncate text-[10px] text-stone-400 font-normal">{ticket.user.email}</div>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="p-3 bg-stone-50 border-t-2 border-stone-200 flex justify-end gap-2">
                            {ticket.status !== 'CLOSED' ? (
                                <button 
                                    onClick={() => updateStatus(ticket.id, 'CLOSED')}
                                    className="px-3 py-1.5 bg-white border-2 border-stone-800 text-stone-800 rounded-lg text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:shadow-none transition-all flex items-center gap-1.5"
                                    title={t('mark_as_closed', 'Close Ticket')}
                                >
                                    <CheckCircle size={14} className="text-green-600" />
                                    {t('close', 'Close')}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => updateStatus(ticket.id, 'OPEN')}
                                    className="px-3 py-1.5 bg-white border-2 border-stone-800 text-stone-800 rounded-lg text-xs font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:shadow-none transition-all flex items-center gap-1.5 opacity-60 hover:opacity-100"
                                    title={t('mark_as_open', 'Reopen Ticket')}
                                >
                                    <AlertCircle size={14} className="text-amber-600" />
                                    {t('reopen', 'Reopen')}
                                </button>
                            )}
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
}
