import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Star, X, MessageSquare, Send } from 'lucide-react';

export const FeedbackModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, t, showToast } = useApp();
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<'SUGGESTION' | 'BUG' | 'FEATURE_REQUEST' | 'GENERAL'>('SUGGESTION');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name,
          userEmail: user?.email,
          rating,
          category,
          message
        })
      });
      const data = await res.json();
      if (data.feedback) {
        showToast('شكراً جزيلاً لتقييمك وملاحظاتك القيمة! ❤️');
        onClose();
        setMessage('');
      }
    } catch (err) {
      showToast('حدث خطأ في إرسال الملاحظات', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">تقييم وملاحظات وقتك</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Star Rating */}
          <div className="text-center space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">كيف تقيم تجربتك مع منصة وقتك؟</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 cursor-pointer"
                >
                  <Star className={`w-7 h-7 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نوع الملاحظة</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none"
            >
              <option value="SUGGESTION">اقتراح تحسين</option>
              <option value="BUG">الإبلاغ عن خلل تقني</option>
              <option value="FEATURE_REQUEST">طلب ميزة جديدة</option>
              <option value="GENERAL">رأي عام</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ملاحظاتك واقتراحاتك *</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="اكتب انطباعاتك أو أي أفكار تسهم في تطوير منصة وقتك..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
            >
              إرسال التقيم
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              إلغاء
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
