import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Send, Phone, MapPin, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { t, showToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('تم إرسال رسالتك إلى فريق Chronox بنجاح!');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">اتصل بنا — Chronox Team</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">يسعدنا دائماً استلام استفساراتكم واقتراحاتكم لتطوير منصة وقتك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">البريد الإلكتروني</div>
              <div className="text-[11px] text-slate-500">support@waqtak.chronox.app</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Phone className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">الهاتف والواتساب</div>
              <div className="text-[11px] text-slate-500">+20 100 000 0000</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">الموقع</div>
              <div className="text-[11px] text-slate-500">القاهرة، مصر</div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">الموضوع</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">الرسالة</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md">
              إرسال الرسالة
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
