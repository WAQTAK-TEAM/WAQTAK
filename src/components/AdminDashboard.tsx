import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, SupportTicket, FeedbackItem, Task, Advertisement, AdPlacement, AdStatus } from '../types';
import { useAdminSync } from '../hooks/useAdminSync';
import { AdBanner } from './AdBanner';
import {
  Shield, Users, CheckSquare, MessageSquare, HelpCircle,
  Activity, Star, Trash2, Edit3, CheckCircle2, Lock, Sparkles,
  RefreshCw, Send, AlertTriangle, Filter, CornerDownLeft, Eye, Zap, Database,
  Megaphone, Plus, ExternalLink, Calendar, Layers, Play, Pause, X
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, t, showToast, refreshData } = useApp();

  const {
    stats,
    usersList,
    allTasks,
    tickets,
    feedbacks,
    activityLogs,
    ads,
    dbVersion,
    lastSyncedAt,
    isConnected,
    isSyncing,
    syncError,
    liveEventsCount,
    recentWrites,
    triggerManualSync
  } = useAdminSync(user?.id, user?.role);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'TASKS' | 'TICKETS' | 'FEEDBACKS' | 'LOGS' | 'ADS'>('OVERVIEW');

  // Ad Management Modals & Filters
  const [adFilterStatus, setAdFilterStatus] = useState<string>('ALL');
  const [adFilterPlacement, setAdFilterPlacement] = useState<string>('ALL');
  const [searchAd, setSearchAd] = useState<string>('');

  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);

  const [adForm, setAdForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    targetUrl: '',
    buttonText: 'اكتشف المزيد',
    placement: 'DASHBOARD' as AdPlacement,
    status: 'ACTIVE' as AdStatus,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    priority: 5
  });

  // Reply states
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  
  const [replyingFeedbackId, setReplyingFeedbackId] = useState<string | null>(null);
  const [feedbackReplyText, setFeedbackReplyText] = useState('');

  const [taskFilterStatus, setTaskFilterStatus] = useState<string>('ALL');

  const authHeaders = {
    'Content-Type': 'application/json',
    'x-user-id': user?.id || ''
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        showToast('تم تحديث صلاحية المستخدم بنجاح!');
        triggerManualSync();
        refreshData();
      }
    } catch (err) {
      showToast('حدث خطأ أثناء تحديث الصلاحيات', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('هل أنت تأكد من حذف هذا المستخدم وجميع بياناته؟')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        showToast('تم حذف المستخدم بنجاح');
        triggerManualSync();
        refreshData();
      } else {
        const data = await res.json();
        showToast(data.error || 'فشل حذف المستخدم', 'error');
      }
    } catch (err) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast('تم تحديث حالة المهمة بنجاح');
        triggerManualSync();
        refreshData();
      }
    } catch (err) {
      showToast('فشل تحديث المهمة', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        showToast('تم حذف المهمة');
        triggerManualSync();
        refreshData();
      }
    } catch (err) {
      showToast('خطأ أثناء الحذف', 'error');
    }
  };

  const handleAdminTicketReply = async (ticketId: string) => {
    if (!ticketReplyText.trim()) return;
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          message: ticketReplyText,
          status: 'RESOLVED'
        })
      });
      if (res.ok) {
        const data = await res.json();
        showToast('تم إرسال رد الإدارة وحل التذكرة بنجاح!');
        setSelectedTicket(data.ticket);
        setTicketReplyText('');
        triggerManualSync();
        refreshData();
      }
    } catch (err) {
      showToast('فشل تقديم الرد', 'error');
    }
  };

  const handleFeedbackReply = async (feedbackId: string) => {
    if (!feedbackReplyText.trim()) return;
    try {
      const res = await fetch(`/api/admin/feedbacks/${feedbackId}/reply`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          adminReply: feedbackReplyText,
          status: 'RESOLVED'
        })
      });
      if (res.ok) {
        showToast('تم تسجيل رد الإدارة على التقييم بنجاح!');
        setReplyingFeedbackId(null);
        setFeedbackReplyText('');
        triggerManualSync();
        refreshData();
      }
    } catch (err) {
      showToast('فشل حفظ الرد', 'error');
    }
  };

  // ADVERTISEMENT HANDLERS
  const handleOpenAdModal = (adToEdit?: Advertisement) => {
    if (adToEdit) {
      setEditingAd(adToEdit);
      setAdForm({
        title: adToEdit.title,
        description: adToEdit.description || '',
        imageUrl: adToEdit.imageUrl,
        targetUrl: adToEdit.targetUrl,
        buttonText: adToEdit.buttonText || 'اكتشف المزيد',
        placement: adToEdit.placement,
        status: adToEdit.status,
        startDate: adToEdit.startDate || new Date().toISOString().split('T')[0],
        endDate: adToEdit.endDate || '',
        priority: adToEdit.priority || 5
      });
    } else {
      setEditingAd(null);
      setAdForm({
        title: '',
        description: '',
        imageUrl: '',
        targetUrl: '',
        buttonText: 'اكتشف المزيد',
        placement: 'DASHBOARD',
        status: 'ACTIVE',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        priority: 5
      });
    }
    setIsAdModalOpen(true);
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adForm.title.trim() || !adForm.imageUrl.trim() || !adForm.targetUrl.trim()) {
      showToast('يرجى ملء جميع الحقول الإلزامية (العنوان، رابط الصورة، ورابط التوجيه)', 'error');
      return;
    }

    try {
      const url = editingAd ? `/api/admin/ads/${editingAd.id}` : '/api/admin/ads';
      const method = editingAd ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(adForm)
      });

      if (res.ok) {
        showToast(editingAd ? 'تم تعديل الإعلان بنجاح!' : 'تم إضافة الإعلان بنجاح!');
        setIsAdModalOpen(false);
        triggerManualSync();
        refreshData();
      } else {
        const data = await res.json();
        showToast(data.error || 'فشل حفظ الإعلان', 'error');
      }
    } catch (err) {
      showToast('حدث خطأ أثناء الاتصال بالخادم', 'error');
    }
  };

  const handleToggleAdStatus = async (adId: string, currentStatus: AdStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/ads/${adId}/status`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(`تم ${nextStatus === 'ACTIVE' ? 'تفعيل' : 'إيقاف'} الإعلان بنجاح`);
        triggerManualSync();
        refreshData();
      }
    } catch (err) {
      showToast('فشل تغيير حالة الإعلان', 'error');
    }
  };

  const handleDeleteAd = async (adId: string, adTitle: string) => {
    if (!window.confirm(`هل أنت تأكد من حذف الإعلان "${adTitle}" نهائياً؟`)) return;
    try {
      const res = await fetch(`/api/admin/ads/${adId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        showToast('تم حذف الإعلان بنجاح');
        triggerManualSync();
        refreshData();
      } else {
        showToast('فشل حذف الإعلان', 'error');
      }
    } catch (err) {
      showToast('خطأ بالاتصال بالخادم', 'error');
    }
  };

  const filteredAds = (ads || []).filter(ad => {
    if (adFilterStatus !== 'ALL' && ad.status !== adFilterStatus) return false;
    if (adFilterPlacement !== 'ALL' && ad.placement !== adFilterPlacement) return false;
    if (searchAd.trim() && !ad.title.toLowerCase().includes(searchAd.toLowerCase()) && !ad.description.toLowerCase().includes(searchAd.toLowerCase())) {
      return false;
    }
    return true;
  });

  const filteredTasks = allTasks.filter(t => {
    if (taskFilterStatus === 'ALL') return true;
    return t.status === taskFilterStatus;
  });

  // Strict Role-Based Access Control (RBAC) Guard
  if (user?.role !== 'ADMIN' && user?.email !== 'admin@gmail.com') {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-950 max-w-md mx-auto my-12 space-y-4 shadow-xl">
        <Lock className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">وصول محظور — غير مصرح (Access Denied)</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          هذه المنطقة محمية ببروتوكولات الأمان والتحكم بالصلاحيات (RBAC). تقتصر الصلاحية فقط على مدير النظام الأصلي (<code className="text-amber-500 font-bold">admin@gmail.com</code>).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* HEADER BANNER WITH REAL-TIME STATUS & RBAC SECURITY BADGE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white rounded-3xl border border-amber-900/60 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 z-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 font-black shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2 flex-wrap">
              <span>مركز إدارة وقتك (Chronox Admin Console)</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>مزامنة فورية (v{dbVersion})</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>حساب موثوق ({user?.email || 'admin@gmail.com'})</span>
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-3">
              <span>متابعة ومزامنة إحصائيات النظام ومختلف كتابات المستخدمين لحظياً بحماية كاملة.</span>
              <span className="text-[10px] text-amber-300/80 font-mono">
                {lastSyncedAt ? `آخر تحديث: ${lastSyncedAt.toLocaleTimeString('ar-EG')}` : ''}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-bold text-slate-200 text-[11px]">
              {isConnected ? 'اتصال المزامنة الفوري نشط' : 'جاري الاستعادة...'}
            </span>
          </div>

          <button
            onClick={() => triggerManualSync()}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>مزامنة فورية الآن</span>
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto gap-1">
        {[
          { id: 'OVERVIEW', label: 'نظرة عامة والمزامنة الحية', icon: Activity, count: null },
          { id: 'USERS', label: 'المستخدمون', icon: Users, count: usersList.length },
          { id: 'TASKS', label: 'جميع المهام', icon: CheckSquare, count: allTasks.length },
          { id: 'TICKETS', label: 'تذاكر الدعم', icon: HelpCircle, count: tickets.length },
          { id: 'FEEDBACKS', label: 'التقييمات والملاحظات', icon: MessageSquare, count: feedbacks.length },
          { id: 'ADS', label: 'إدارة الإعلانات', icon: Megaphone, count: (ads || []).length },
          { id: 'LOGS', label: 'سجل الأنشطة', icon: Activity, count: activityLogs.length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & REAL-TIME STATS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="text-xs text-slate-500 font-bold">إجمالي المستخدمين المسجلين</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats?.totalUsers || usersList.length}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>محدث تلقائياً مع تسجيلات الجدد</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="text-xs text-slate-500 font-bold">المهام النشطة (قيد التنفيذ)</div>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats?.activeTasks || allTasks.filter(t => t.status !== 'COMPLETED').length}</div>
              <div className="text-[10px] text-blue-500 font-semibold mt-2">
                من أصل {stats?.totalTasks || allTasks.length} مهمة إجمالية
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="text-xs text-slate-500 font-bold">المهام المكتملة بنجاح</div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats?.completedTasks || allTasks.filter(t => t.status === 'COMPLETED').length}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-2">
                معدل إنجاز: {allTasks.length ? Math.round((allTasks.filter(t => t.status === 'COMPLETED').length / allTasks.length) * 100) : 0}%
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="text-xs text-slate-500 font-bold">التذاكر والتقييمات الفورية</div>
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">{(stats?.totalTickets || tickets.length) + (stats?.totalFeedbacks || feedbacks.length)}</div>
              <div className="text-[10px] text-purple-500 font-semibold mt-2">
                تذاكر مفتوحة: {tickets.filter(t => t.status !== 'RESOLVED').length}
              </div>
            </div>
          </div>

          {/* REAL-TIME WRITE FEED */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-500 animate-bounce" />
                <span>شريط المزامنة المباشرة لكتابات المستخدمين (Real-time Database Write Stream)</span>
              </h3>
              <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                تحديث تلقائي لحُزم البيانات
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentWrites.length > 0 ? (
                recentWrites.map(rw => (
                  <div key={rw.id} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between text-amber-900 dark:text-amber-200 animate-fade-in">
                    <div className="flex items-center gap-2 font-semibold">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{rw.text}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{rw.time}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-400 text-center">
                  المزامنة نشطة! أي إضافة أو إكمال مهمة أو تسجيل مستخدم من قبل أي يوزر ستظهر فوراً هنا.
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>حالة خوادم النظام والمزامنة السحابية (System Health)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold">Express API Engine</div>
                  <div className="text-[10px] text-emerald-600/80 mt-0.5">متصل وتتم المزامنة بنجاح</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold">JSON Database Storage</div>
                  <div className="text-[10px] text-emerald-600/80 mt-0.5">قاعدة البيانات آمنة ومحدثة</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold">Gemini AI Model</div>
                  <div className="text-[10px] text-emerald-600/80 mt-0.5">جاهز للتوجيه وتحليل المهام</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 space-y-4 overflow-x-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">قائمة مستخدمي منصة وقتك ({usersList.length})</h3>
          </div>

          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 pb-2 font-bold">
                <th className="p-3">المستخدم</th>
                <th className="p-3">البريد الإلكتروني</th>
                <th className="p-3">المهام</th>
                <th className="p-3">الأهداف</th>
                <th className="p-3">الصلاحية (Role)</th>
                <th className="p-3">تعديل الصلاحية</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="p-3 font-bold text-blue-600">{u.tasksCount || 0}</td>
                  <td className="p-3 font-bold text-indigo-600">{u.goalsCount || 0}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      u.role === 'SUPPORT' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={e => handleChangeRole(u.id, e.target.value)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="USER">مستخدم (USER)</option>
                      <option value="SUPPORT">فريق الدعم (SUPPORT)</option>
                      <option value="ADMIN">مدير نظام (ADMIN)</option>
                    </select>
                  </td>
                  <td className="p-3 text-center">
                    {u.id !== 'usr_admin' && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 transition-colors cursor-pointer"
                        title="حذف المستخدم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ALL TASKS MANAGEMENT */}
      {activeTab === 'TASKS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              جميع مهام النظام المزامنة ({filteredTasks.length})
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">فلترة حسب الحالة:</span>
              <select
                value={taskFilterStatus}
                onChange={e => setTaskFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              >
                <option value="ALL">الكل</option>
                <option value="PENDING">قيد الانتظار (PENDING)</option>
                <option value="COMPLETED">مكتملة (COMPLETED)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTasks.map(t => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{t.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                      t.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {t.priority}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {t.description || 'لا يوجد وصف مضاف'}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>صاحب المهمة: <strong className="text-slate-700 dark:text-slate-200">{t.userName}</strong></span>
                    <span>{t.dueDate || 'بدون تاريخ'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/40 dark:border-slate-700/40">
                  <button
                    onClick={() => handleToggleTaskStatus(t.id, t.status)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      t.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {t.status === 'COMPLETED' ? '✓ مكتملة' : 'معلقة'}
                  </button>

                  <button
                    onClick={() => handleDeleteTask(t.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SUPPORT TICKETS & REPLIES */}
      {activeTab === 'TICKETS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <h3 className="font-extrabold text-xs text-slate-500 uppercase px-2">تذاكر الدعم المفتوحة ({tickets.length})</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {tickets.map(tkt => (
                <div
                  key={tkt.id}
                  onClick={() => setSelectedTicket(tkt)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all text-xs ${
                    selectedTicket?.id === tkt.id
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="font-bold text-slate-900 dark:text-white truncate">{tkt.subject}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">من: {tkt.userName}</div>
                  <div className="flex items-center justify-between mt-2 text-[10px]">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      tkt.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tkt.status}
                    </span>
                    <span className="text-slate-400">{tkt.createdAt.split('T')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between min-h-[420px]">
            {selectedTicket ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h2 className="font-black text-base text-slate-900 dark:text-white">{selectedTicket.subject}</h2>
                      <div className="text-xs text-slate-500 mt-0.5">من: {selectedTicket.userName} ({selectedTicket.userEmail})</div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {selectedTicket.status}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-800 dark:text-slate-200 mt-4 leading-relaxed">
                    {selectedTicket.message}
                  </div>

                  {/* Previous Replies */}
                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs font-bold text-slate-500">محادثات الردود ({selectedTicket.messages?.length || 0})</h4>
                    {selectedTicket.messages?.map(msg => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-2xl text-xs space-y-1 ${
                          msg.senderRole === 'ADMIN'
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 mr-4'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 ml-4'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1 text-[11px]">
                          <span>{msg.senderName}</span>
                          <span className="text-[9px] opacity-70">({msg.senderRole})</span>
                        </div>
                        <div>{msg.text}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response Input */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    أكتب رد الإدارة الرسمي لحل التذكرة:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ticketReplyText}
                      onChange={e => setTicketReplyText(e.target.value)}
                      placeholder="تم استلام طلبك ومراجعة الأمر وجاري..."
                      className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={() => handleAdminTicketReply(selectedTicket.id)}
                      className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>إرسال الرد وحل التذكرة</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs">
                اختر تذكرة دعم من القائمة لعرض تفاصيلها والرد عليها مباشرة.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: FEEDBACKS */}
      {activeTab === 'FEEDBACKS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {feedbacks.map(f => (
            <div key={f.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-slate-900 dark:text-white">{f.userName || 'مستخدم وقتك'}</div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: f.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                  {f.comment || f.message}
                </p>

                {f.adminReply && (
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
                    <strong>رد الإدارة:</strong> {f.adminReply}
                  </div>
                )}
              </div>

              {replyingFeedbackId === f.id ? (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <input
                    type="text"
                    value={feedbackReplyText}
                    onChange={e => setFeedbackReplyText(e.target.value)}
                    placeholder="شكراً لملاحظتك القيمة، جاري التحديث..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFeedbackReply(f.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-[11px]"
                    >
                      حفظ الرد
                    </button>
                    <button
                      onClick={() => setReplyingFeedbackId(null)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-[11px]"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setReplyingFeedbackId(f.id);
                    setFeedbackReplyText(f.adminReply || '');
                  }}
                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 self-start pt-2 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{f.adminReply ? 'تعديل رد الإدارة' : 'إضافة رد الإدارة'}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: ACTIVITY LOGS */}
      {activeTab === 'LOGS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">سجل أنشطة النظام والعمليات (System Activity Logs)</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {activityLogs.map((log, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{log.userName}</span>
                  <span className="mx-2 text-slate-400">•</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{log.action}</span>
                  <span className="mx-2 text-slate-400">•</span>
                  <span className="text-slate-500">{log.details}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{log.timestamp ? log.timestamp.split('T')[1]?.substring(0, 5) : 'الآن'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: ADVERTISEMENTS MANAGEMENT */}
      {activeTab === 'ADS' && (
        <div className="space-y-6">
          
          {/* ADS OVERVIEW STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs text-slate-500 font-bold">إجمالي الإعلانات</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{(ads || []).length}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs text-emerald-600 font-bold">الإعلانات النشطة</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {(ads || []).filter(a => a.status === 'ACTIVE').length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs text-blue-600 font-bold">المشاهدات (Impressions)</div>
              <div className="text-2xl font-black text-blue-600 mt-1">
                {(ads || []).reduce((acc, a) => acc + (a.impressions || 0), 0)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs text-indigo-600 font-bold">النقرات (Clicks)</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">
                {(ads || []).reduce((acc, a) => acc + (a.clicks || 0), 0)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
              <div className="text-xs text-amber-500 font-bold">معدل النقر (CTR %)</div>
              <div className="text-2xl font-black text-amber-500 mt-1">
                {(() => {
                  const totalImp = (ads || []).reduce((acc, a) => acc + (a.impressions || 0), 0);
                  const totalClk = (ads || []).reduce((acc, a) => acc + (a.clicks || 0), 0);
                  return totalImp > 0 ? ((totalClk / totalImp) * 100).toFixed(1) + '%' : '0%';
                })()}
              </div>
            </div>
          </div>

          {/* TOP CONTROLS & ACTIONS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Search Bar */}
              <input
                type="text"
                value={searchAd}
                onChange={e => setSearchAd(e.target.value)}
                placeholder="بحث في الإعلانات..."
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none w-full sm:w-48"
              />

              {/* Status Filter */}
              <select
                value={adFilterStatus}
                onChange={e => setAdFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none cursor-pointer"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="ACTIVE">نشط (Active)</option>
                <option value="SCHEDULED">مجدول (Scheduled)</option>
                <option value="PAUSED">متوقف (Paused)</option>
                <option value="EXPIRED">منتهي (Expired)</option>
                <option value="DRAFT">مسودة (Draft)</option>
              </select>

              {/* Placement Filter */}
              <select
                value={adFilterPlacement}
                onChange={e => setAdFilterPlacement(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none cursor-pointer"
              >
                <option value="ALL">جميع الأماكن</option>
                <option value="DASHBOARD">لوحة التحكم (Dashboard)</option>
                <option value="SIDEBAR">الشريط الجانبي (Sidebar)</option>
                <option value="PUBLIC">الصفحات العامة (Public)</option>
              </select>
            </div>

            <button
              onClick={() => handleOpenAdModal()}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة إعلان جديد</span>
            </button>
          </div>

          {/* ADS LIST CARDS */}
          {filteredAds.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Megaphone className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">لا توجد إعلانات مطابقة</h3>
              <p className="text-xs text-slate-500">قم بإضافة إعلانات جديدة لعرضها للمستخدمين في النظام.</p>
              <button
                onClick={() => handleOpenAdModal()}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                + إنشاء إعلان الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAds.map(ad => {
                const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0';
                
                let statusBadgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                if (ad.status === 'ACTIVE') statusBadgeColor = 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/40';
                if (ad.status === 'SCHEDULED') statusBadgeColor = 'bg-blue-500/20 text-blue-600 border border-blue-500/40';
                if (ad.status === 'PAUSED') statusBadgeColor = 'bg-amber-500/20 text-amber-600 border border-amber-500/40';
                if (ad.status === 'EXPIRED') statusBadgeColor = 'bg-red-500/20 text-red-600 border border-red-500/40';

                return (
                  <div key={ad.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      {/* Image Thumbnail Header */}
                      <div className="relative h-36 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        {ad.imageUrl ? (
                          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Megaphone className="w-8 h-8" />
                          </div>
                        )}
                        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold backdrop-blur-md ${statusBadgeColor}`}>
                          {ad.status === 'ACTIVE' && 'نشط Active'}
                          {ad.status === 'SCHEDULED' && 'مجدول Scheduled'}
                          {ad.status === 'PAUSED' && 'متوقف Paused'}
                          {ad.status === 'EXPIRED' && 'منتهي Expired'}
                          {ad.status === 'DRAFT' && 'مسودة Draft'}
                        </span>
                        
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                          {ad.placement}
                        </span>
                      </div>

                      {/* Content Details */}
                      <div className="p-4 space-y-2">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                          {ad.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {ad.description || 'لا يوجد وصف مضاف'}
                        </p>

                        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="font-semibold">الأولوية:</span> <strong className="text-amber-500">{ad.priority || 5}</strong>
                          </div>
                          <div>
                            <span className="font-semibold">المشاهدات:</span> <strong className="text-blue-600">{ad.impressions || 0}</strong>
                          </div>
                          <div>
                            <span className="font-semibold">النقرات:</span> <strong className="text-indigo-600">{ad.clicks || 0}</strong> ({ctr}%)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                      <button
                        onClick={() => handleToggleAdStatus(ad.id, ad.status)}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          ad.status === 'ACTIVE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                        title={ad.status === 'ACTIVE' ? 'إيقاف الإعلان' : 'تفعيل الإعلان'}
                      >
                        {ad.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span className="text-[11px]">{ad.status === 'ACTIVE' ? 'إيقاف' : 'تفعيل'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPreviewAd(ad)}
                          className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors text-xs font-bold cursor-pointer flex items-center gap-1"
                          title="معاينة الإعلان"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[11px]">معاينة</span>
                        </button>

                        <button
                          onClick={() => handleOpenAdModal(ad)}
                          className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-200 transition-colors text-xs font-bold cursor-pointer"
                          title="تعديل"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteAd(ad.id, ad.title)}
                          className="p-2 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 hover:bg-red-200 transition-colors text-xs font-bold cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ADVERTISEMENT FORM MODAL */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-xl w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                <span>{editingAd ? 'تعديل بيانات الإعلان' : 'إنشاء إعلان جديد'}</span>
              </h3>
              <button onClick={() => setIsAdModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAd} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">عنوان الإعلان *</label>
                <input
                  type="text"
                  value={adForm.title}
                  onChange={e => setAdForm({ ...adForm, title: e.target.value })}
                  placeholder="مثال: عرض خاص بمناسبة التخرج..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">وصف الإعلان</label>
                <textarea
                  value={adForm.description}
                  onChange={e => setAdForm({ ...adForm, description: e.target.value })}
                  placeholder="اكتب وصفاً جذاباً ومختصراً للإعلان..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">رابط الصورة (Image URL) *</label>
                  <input
                    type="url"
                    value={adForm.imageUrl}
                    onChange={e => setAdForm({ ...adForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">رابط التوجيه (Destination URL) *</label>
                  <input
                    type="url"
                    value={adForm.targetUrl}
                    onChange={e => setAdForm({ ...adForm, targetUrl: e.target.value })}
                    placeholder="https://..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">نص الزر (CTA)</label>
                  <input
                    type="text"
                    value={adForm.buttonText}
                    onChange={e => setAdForm({ ...adForm, buttonText: e.target.value })}
                    placeholder="اعرف المزيد"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">مكان العرض (Placement)</label>
                  <select
                    value={adForm.placement}
                    onChange={e => setAdForm({ ...adForm, placement: e.target.value as AdPlacement })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none cursor-pointer"
                  >
                    <option value="DASHBOARD">لوحة التحكم (Dashboard)</option>
                    <option value="SIDEBAR">الشريط الجانبي (Sidebar)</option>
                    <option value="PUBLIC">الصفحات العامة (Public)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">الحالة الأولية (Status)</label>
                  <select
                    value={adForm.status}
                    onChange={e => setAdForm({ ...adForm, status: e.target.value as AdStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">نشط (Active)</option>
                    <option value="SCHEDULED">مجدول (Scheduled)</option>
                    <option value="PAUSED">متوقف (Paused)</option>
                    <option value="DRAFT">مسودة (Draft)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">تاريخ البدء</label>
                  <input
                    type="date"
                    value={adForm.startDate}
                    onChange={e => setAdForm({ ...adForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={adForm.endDate}
                    onChange={e => setAdForm({ ...adForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">الأولوية (1 - 10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={adForm.priority}
                    onChange={e => setAdForm({ ...adForm, priority: parseInt(e.target.value) || 5 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-md"
                >
                  {editingAd ? 'حفظ التعديلات' : 'نشر الإعلان'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AD PREVIEW MODAL */}
      {previewAd && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-500" />
                <span>معاينة حية للإعلان للمستخدمين ({previewAd.placement})</span>
              </h3>
              <button onClick={() => setPreviewAd(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-5 shadow-xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                    {previewAd.imageUrl && (
                      <img
                        src={previewAd.imageUrl}
                        alt={previewAd.title}
                        className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-white/20"
                      />
                    )}
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        إعلان راعي
                      </span>
                      <h4 className="text-base font-extrabold text-white">{previewAd.title}</h4>
                      <p className="text-xs text-blue-100/90">{previewAd.description}</p>
                    </div>
                  </div>

                  <a
                    href={previewAd.targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2"
                  >
                    <span>{previewAd.buttonText || 'اكتشف المزيد'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewAd(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

