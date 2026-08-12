import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User, Task, Goal, CalendarEvent, FocusSession,
  SupportTicket, FeedbackItem, NotificationItem, ActivityLog, SystemSettings, Language
} from '../types';
import { translations } from '../lib/translations';
import {
  localDB,
  saveLocalTasks, getLocalTasks,
  saveLocalGoals, getLocalGoals,
  saveLocalUserSettings, getLocalUserSettings
} from '../lib/db';

interface AppContextType {
  user: User | null;
  lang: Language;
  theme: 'light' | 'dark';
  setLang: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  t: (key: keyof typeof translations.ar) => string;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  
  // Data lists
  tasks: Task[];
  goals: Goal[];
  calendarEvents: CalendarEvent[];
  focusSessions: FocusSession[];
  supportTickets: SupportTicket[];
  feedbackItems: FeedbackItem[];
  notifications: NotificationItem[];
  
  // Quick Modals
  isQuickTaskModalOpen: boolean;
  setIsQuickTaskModalOpen: (open: boolean) => void;
  isQuickGoalModalOpen: boolean;
  setIsQuickGoalModalOpen: (open: boolean) => void;

  // Actions
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  
  addGoal: (goal: Partial<Goal>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  addCalendarEvent: (event: Partial<CalendarEvent>) => Promise<void>;
  addFocusSession: (session: Partial<FocusSession>) => Promise<void>;
  
  createSupportTicket: (ticket: { subject: string; category: any; description: string }) => Promise<void>;
  replySupportTicket: (ticketId: string, text: string) => Promise<void>;
  
  submitFeedback: (rating: number, type: any, comment: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
  refreshData: () => Promise<void>;
  
  // Active View Navigation
  currentView: string;
  setCurrentView: (view: string) => void;
  
  // UI Toast
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('ar');
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('waqtak_theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('landing');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  const [isQuickTaskModalOpen, setIsQuickTaskModalOpen] = useState(false);
  const [isQuickGoalModalOpen, setIsQuickGoalModalOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const t = (key: keyof typeof translations.ar): string => {
    const dict = translations[lang] || translations.ar;
    return dict[key] || translations.ar[key] || key;
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('waqtak_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    // Initial sync with document HTML
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Auto load current user from session
    const savedUserId = localStorage.getItem('waqtak_user_id');
    const headers: Record<string, string> = savedUserId ? { 'x-user-id': savedUserId } : {};

    fetch('/api/auth/me', { headers })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
          if (data.user.language) setLang(data.user.language);
          if (data.user.theme) setTheme(data.user.theme);
          if (data.user.role === 'ADMIN') {
            setCurrentView('admin');
          } else if (currentView === 'landing') {
            setCurrentView('dashboard');
          }
        }
      })
      .catch(err => console.error(err));
  }, []);

  const fetchAllData = async (userId: string) => {
    try {
      // 1. Immediately load local IndexedDB data for instantaneous local-first display
      const [localTasksList, localGoalsList] = await Promise.all([
        getLocalTasks(userId),
        getLocalGoals(userId)
      ]);
      if (localTasksList.length > 0) setTasks(localTasksList);
      if (localGoalsList.length > 0) setGoals(localGoalsList);

      const headers = { 'x-user-id': userId };

      const safeFetchJson = async (url: string) => {
        try {
          const res = await fetch(url, { headers });
          if (!res.ok) return {};
          return await res.json();
        } catch {
          return {};
        }
      };

      const [tRes, gRes, cRes, fRes, sRes, fbRes] = await Promise.all([
        safeFetchJson('/api/tasks'),
        safeFetchJson('/api/goals'),
        safeFetchJson('/api/calendar'),
        safeFetchJson('/api/focus'),
        safeFetchJson('/api/support'),
        safeFetchJson('/api/feedback'),
      ]);

      if (tRes.tasks) {
        setTasks(tRes.tasks);
        await saveLocalTasks(tRes.tasks);
      }
      if (gRes.goals) {
        setGoals(gRes.goals);
        await saveLocalGoals(gRes.goals);
      }
      if (cRes.events) setCalendarEvents(cRes.events);
      if (fRes.sessions) setFocusSessions(fRes.sessions);
      if (sRes.tickets) setSupportTickets(sRes.tickets);
      if (fbRes.feedback) setFeedbackItems(fbRes.feedback);
      
      // Auto generate initial notifications for overdue / due tasks
      const notifs: NotificationItem[] = (tRes.tasks || localTasksList || [])
        .filter((tsk: Task) => tsk.priority === 'URGENT' || tsk.priority === 'HIGH')
        .slice(0, 3)
        .map((tsk: Task, idx: number) => ({
          id: `not_auto_${idx}`,
          userId,
          title: lang === 'en' ? 'Urgent Task Reminder' : 'تذكير بمهمة عاجلة',
          message: `${tsk.title}`,
          type: 'DEADLINE',
          read: false,
          createdAt: new Date().toISOString()
        }));
      setNotifications(notifs);

    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const refreshData = async () => {
    if (user) {
      await fetchAllData(user.id);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData(user.id);
      const interval = setInterval(() => {
        fetchAllData(user.id);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const login = async (email: string, password?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || (lang === 'en' ? 'Login failed' : 'فشل تسجيل الدخول'), 'error');
        return false;
      }
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('waqtak_user_id', data.user.id);
        if (data.user.language) setLang(data.user.language);
        if (data.user.theme) setTheme(data.user.theme);
        
        if (data.user.role === 'ADMIN') {
          setCurrentView('admin');
        } else {
          setCurrentView('dashboard');
        }

        showToast(lang === 'en' ? 'Logged in successfully!' : 'تم تسجيل الدخول بنجاح!');
        return true;
      }
    } catch (err) {
      showToast(lang === 'en' ? 'Login failed' : 'فشل تسجيل الدخول', 'error');
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('waqtak_user_id');
    setCurrentView('landing');
    showToast(lang === 'en' ? 'Logged out' : 'تم تسجيل الخروج');
  };

  const addTask = async (task: Partial<Task>) => {
    if (!user) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify(task)
      });
      const data = await res.json();
      if (data.task) {
        setTasks(prev => [data.task, ...prev]);
        await localDB.tasks.put(data.task);
        showToast(lang === 'en' ? 'Task created successfully!' : 'تم إضافة المهمة بنجاح!');
      }
    } catch (err) {
      showToast(lang === 'en' ? 'Failed to add task' : 'فشل إضافة المهمة', 'error');
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.task) {
        setTasks(prev => prev.map(t => t.id === id ? data.task : t));
        await localDB.tasks.put(data.task);
        showToast(lang === 'en' ? 'Task updated' : 'تم تحديث المهمة');
      }
    } catch (err) {
      showToast(lang === 'en' ? 'Failed to update task' : 'فشل تحديث المهمة', 'error');
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id }
      });
      setTasks(prev => prev.filter(t => t.id !== id));
      await localDB.tasks.delete(id);
      showToast(lang === 'en' ? 'Task deleted' : 'تم حذف المهمة');
    } catch (err) {
      showToast(lang === 'en' ? 'Failed to delete task' : 'فشل حذف المهمة', 'error');
    }
  };

  const toggleTaskComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    await updateTask(id, { status: newStatus });
  };

  const addGoal = async (goal: Partial<Goal>) => {
    if (!user) return;
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify(goal)
      });
      const data = await res.json();
      if (data.goal) {
        setGoals(prev => [data.goal, ...prev]);
        await localDB.goals.put(data.goal);
        showToast(lang === 'en' ? 'Goal created!' : 'تم إنشاء الهدف بنجاح!');
      }
    } catch (err) {
      showToast(lang === 'en' ? 'Failed to create goal' : 'فشل إنشاء الهدف', 'error');
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.goal) {
        setGoals(prev => prev.map(g => g.id === id ? data.goal : g));
        await localDB.goals.put(data.goal);
        showToast(lang === 'en' ? 'Goal updated' : 'تم تحديث الهدف');
      }
    } catch (err) {
      showToast(lang === 'en' ? 'Failed to update goal' : 'فشل تحديث الهدف', 'error');
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    try {
      await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id }
      });
      setGoals(prev => prev.filter(g => g.id !== id));
      await localDB.goals.delete(id);
      showToast(lang === 'en' ? 'Goal deleted' : 'تم حذف الهدف');
    } catch (err) {
      showToast(lang === 'en' ? 'Failed to delete goal' : 'فشل حذف الهدف', 'error');
    }
  };

  const addCalendarEvent = async (event: Partial<CalendarEvent>) => {
    if (!user) return;
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify(event)
      });
      const data = await res.json();
      if (data.event) {
        setCalendarEvents(prev => [...prev, data.event]);
        showToast(lang === 'en' ? 'Event added to calendar' : 'تم إضافة الحدث للتقويم');
      }
    } catch (err) {
      showToast(lang === 'en' ? 'Failed to add event' : 'فشل إضافة الحدث', 'error');
    }
  };

  const addFocusSession = async (session: Partial<FocusSession>) => {
    if (!user) return;
    try {
      const res = await fetch('/api/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify(session)
      });
      const data = await res.json();
      if (data.session) {
        setFocusSessions(prev => [data.session, ...prev]);
        fetchAllData(user.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createSupportTicket = async (ticket: { subject: string; category: any; description: string }) => {
    if (!user) return;
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify(ticket)
      });
      const data = await res.json();
      if (data.ticket) {
        setSupportTickets(prev => [data.ticket, ...prev]);
        showToast(lang === 'en' ? 'Support ticket created' : 'تم إرسال تذكرة الدعم بنجاح');
      }
    } catch (err) {
      showToast(lang === 'en' ? 'Failed to create ticket' : 'فشل إنشاء تذكرة الدعم', 'error');
    }
  };

  const replySupportTicket = async (ticketId: string, text: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/support/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.ticket) {
        setSupportTickets(prev => prev.map(t => t.id === ticketId ? data.ticket : t));
        showToast(lang === 'en' ? 'Reply sent' : 'تم إرسال الرد');
      }
    } catch (err) {
      showToast(lang === 'en' ? 'Failed to send reply' : 'فشل إرسال الرد', 'error');
    }
  };

  const submitFeedback = async (rating: number, type: any, comment: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ rating, type, comment })
      });
      const data = await res.json();
      if (data.feedback) {
        setFeedbackItems(prev => [data.feedback, ...prev]);
        showToast(lang === 'en' ? 'Thank you for your feedback!' : 'شكراً لتقييمك وانطباعك القيم!');
      }
    } catch (err) {
      showToast(lang === 'en' ? 'Failed to submit feedback' : 'فشل إرسال التقييم', 'error');
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        lang,
        theme,
        setLang,
        setTheme,
        t,
        login,
        logout,
        tasks,
        goals,
        calendarEvents,
        focusSessions,
        supportTickets,
        feedbackItems,
        notifications,
        isQuickTaskModalOpen,
        setIsQuickTaskModalOpen,
        isQuickGoalModalOpen,
        setIsQuickGoalModalOpen,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        addGoal,
        updateGoal,
        deleteGoal,
        addCalendarEvent,
        addFocusSession,
        createSupportTicket,
        replySupportTicket,
        submitFeedback,
        markNotificationRead,
        refreshData,
        currentView,
        setCurrentView,
        showToast,
        toast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
