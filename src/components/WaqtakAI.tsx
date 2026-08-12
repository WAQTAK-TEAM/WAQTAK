import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AIMessage } from '../types';
import {
  Bot, Send, Mic, MicOff, Sparkles, CheckCircle2,
  AlertCircle, Trash2, ArrowLeft, RefreshCw, Zap
} from 'lucide-react';

export const WaqtakAI: React.FC = () => {
  const { lang, t, addTask, showToast } = useApp();

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: lang === 'en'
        ? "Hello! I am WAQTAK AI. How can I assist you with your tasks, calendar, or goals today?"
        : "أهلاً بك! أنا وقتك AI، مساعدك الشخصي لإدارة الوقت والإنتاجية. كيف أساعدك اليوم في تنظيم مهامك وتحقيق أهدافك؟",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const msgText = textToSend || input;
    if (!msgText.trim() || loading) return;

    const userMsg: AIMessage = {
      id: `msg_usr_${Date.now()}`,
      sender: 'user',
      text: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgText, lang })
      });
      if (!res.ok) throw new Error('AI service response not ok');
      const data = await res.json();

      const aiMsg: AIMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: data.reply || (lang === 'en' ? "I've processed your request!" : "تمت معالجة طلبك بنجاح!"),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionRequired: data.actionRequired
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'ai',
          text: lang === 'en'
            ? "I am analyzing your agenda. Focus on your top urgent tasks today!"
            : "يقوم وقتك AI بتحليل جدولك. يوصى بالتركيز على أهم المهام العاجلة المتبقية اليوم!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (msgId: string, action: any) => {
    if (action.type === 'CREATE_TASK' && action.payload) {
      await addTask(action.payload);
      setMessages(prev =>
        prev.map(m => m.id === msgId ? {
          ...m,
          actionRequired: { ...m.actionRequired!, confirmed: true }
        } : m)
      );
      showToast(t('aiActionSuccess'));
    }
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      showToast('المتصفح لا يدعم التفاعل الصوتي المباشر', 'error');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US';

    if (!isListening) {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white rounded-3xl border border-blue-900/60 shadow-xl ai-glow">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Bot className="w-6 h-6 text-white animate-bounce" />
          </div>
          <div>
            <h1 className="text-xl font-black flex items-center gap-2">
              <span>{t('aiName')}</span>
              <span className="text-[10px] bg-blue-500/30 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-semibold">
                Online
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              مساعدك المتقدم لإدارة المهام والأولويات والأهداف بواسطة Chronox Team
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([])}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1 cursor-pointer"
          title="مسح المحادثة"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* SUGGESTED PROMPTS */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>{t('suggestedPrompts')}</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {[t('prompt1'), t('prompt2'), t('prompt3'), t('prompt4')].map((p, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(p)}
              className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium hover:border-blue-500 hover:text-blue-600 transition-all cursor-pointer shadow-2xs"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT MESSAGES AREA & INPUT CONTAINER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6 shadow-xs flex flex-col h-[520px]">
        {/* Scrollable messages container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pl-1 custom-scrollbar mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex items-start gap-2.5 max-w-[88%] sm:max-w-[82%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                  msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-blue-950 text-blue-400 border border-blue-800'
                }`}>
                  {msg.sender === 'user' ? 'أنت' : <Bot className="w-4 h-4" />}
                </div>

                <div className={`p-3.5 sm:p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                }`}>
                  {msg.text}

                  {/* Confirmable Action Box */}
                  {msg.actionRequired && (
                    <div className="mt-3 p-3 rounded-xl bg-blue-950/80 border border-blue-800 text-blue-100 space-y-2">
                      <div className="font-bold flex items-center gap-1 text-[11px] text-blue-300">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>إجراء تنفيذي مقترح: {msg.actionRequired.payload?.title}</span>
                      </div>

                      {!msg.actionRequired.confirmed ? (
                        <button
                          onClick={() => handleConfirmAction(msg.id, msg.actionRequired)}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg transition-all cursor-pointer"
                        >
                          [تأكيد تنفيذ الإجراء فوراً]
                        </button>
                      ) : (
                        <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تم تنفيذ الإجراء وإضافة المهمة بنجاح!</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-[10px] opacity-60 text-left mt-1 dir-ltr">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-blue-500 font-semibold p-2">
              <Bot className="w-4 h-4 animate-spin" />
              <span>{t('aiThinking')}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT FORM DOCKED AT BOTTOM */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder={t('typeMessagePrompt')}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            onClick={toggleVoiceInput}
            className={`p-3 rounded-2xl transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title={t('voiceInput')}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || loading}
            className="px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
