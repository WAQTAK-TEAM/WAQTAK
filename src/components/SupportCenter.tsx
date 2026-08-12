import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SupportTicket } from '../types';
import {
  HelpCircle, Plus, MessageSquare, Send, CheckCircle2,
  Clock, AlertCircle, X, Shield
} from 'lucide-react';

export const SupportCenter: React.FC = () => {
  const { user, t, showToast } = useApp();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('TECHNICAL');
  const [priority, setPriority] = useState('MEDIUM');
  const [message, setMessage] = useState('');

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  const authHeaders = {
    'Content-Type': 'application/json',
    'x-user-id': user?.id || ''
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/support/tickets', { headers: authHeaders });
      if (!res.ok) return;
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTickets();
  }, [user?.id]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name,
          userEmail: user?.email,
          subject,
          category,
          priority,
          message
        })
      });
      const data = await res.json();
      if (data.ticket) {
        showToast('تم فتح تذكرة الدعم بنجاح!');
        setIsModalOpen(false);
        setSubject('');
        setMessage('');
        fetchTickets();
      }
    } catch (err) {
      showToast('حدث خطأ أثناء فتح التذكرة', 'error');
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          senderName: user?.name || 'فريق الدعم',
          message: replyText
        })
      });
      const data = await res.json();
      if (data.ticket) {
        showToast('تم تقديم الرد بنجاح');
        setSelectedTicket(data.ticket);
        setReplyText('');
        fetchTickets();
      }
    } catch (err) {
      showToast('حدث خطأ في تقديم الرد', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-purple-600" />
            <span>{t('supportCenter')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            فريق Chronox في خدمتك دائماً لمساعدتك وحل أي استفسارات أو مشاكل تقنية
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>فتح تذكرة دعم جديدة</span>
        </button>
      </div>

      {/* TICKETS LIST & DETAIL VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Ticket List */}
        <div className="md:col-span-1 space-y-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
          <h3 className="font-bold text-xs text-slate-500 uppercase px-2">تذاكري المفتوحة ({tickets.length})</h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {tickets.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">لا توجد تذاكر دعم مفتوحة حالياً.</p>
            ) : (
              tickets.map(tkt => (
                <div
                  key={tkt.id}
                  onClick={() => setSelectedTicket(tkt)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all text-xs ${
                    selectedTicket?.id === tkt.id
                      ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="font-bold text-slate-900 dark:text-white truncate">{tkt.subject}</div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      tkt.status === 'OPEN' ? 'bg-amber-100 text-amber-700' :
                      tkt.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {tkt.status}
                    </span>
                    <span>{tkt.createdAt.split('T')[0]}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Details & Chat */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between min-h-[400px]">
          {selectedTicket ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="font-black text-base text-slate-900 dark:text-white">{selectedTicket.subject}</h2>
                    <div className="text-xs text-slate-500 mt-0.5">من: {selectedTicket.userName} ({selectedTicket.userEmail})</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                    {selectedTicket.status}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-800 dark:text-slate-200 mt-4 leading-relaxed">
                  {selectedTicket.message}
                </div>

                {/* Responses */}
                <div className="mt-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500">الردود ({selectedTicket.responses?.length || 0})</h4>
                  {selectedTicket.responses?.map(r => (
                    <div key={r.id} className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs space-y-1">
                      <div className="font-bold text-purple-400 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" /> {r.senderName}
                      </div>
                      <div className="text-slate-200">{r.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="أكتب ردك هنا..."
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
                <button
                  onClick={handleSendReply}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center my-auto space-y-2 text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto" />
              <p className="text-xs">اختر تذكرة دعم من القائمة لعرض التفاصيل والتواصل مع الفريق.</p>
            </div>
          )}
        </div>

      </div>

      {/* CREATE TICKET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">تذكرة دعم جديدة</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">عنوان التذكرة *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="مشكلة في تسجيل الدخول، استفسار..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">تفاصيل الرسالة *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="اشرح المشكلة أو الاستفسار بالتفصيل..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl">
                  ارسال التذكرة
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 font-bold text-xs rounded-xl">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
