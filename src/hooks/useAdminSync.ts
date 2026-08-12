import { useState, useEffect, useRef, useCallback } from 'react';
import { User, Task, SupportTicket, FeedbackItem, Advertisement } from '../types';

export interface SystemStats {
  totalUsers: number;
  activeTasks: number;
  completedTasks: number;
  totalTasks: number;
  overdueTasks: number;
  totalGoals: number;
  totalTickets: number;
  totalFeedbacks: number;
  totalFocusSessions: number;
  totalAds?: number;
  activeAdsCount?: number;
  totalAdImpressions?: number;
  totalAdClicks?: number;
  systemStatus: string;
}

export interface AdminSyncState {
  stats: SystemStats | null;
  usersList: any[];
  allTasks: any[];
  tickets: SupportTicket[];
  feedbacks: FeedbackItem[];
  activityLogs: any[];
  ads: Advertisement[];
  dbVersion: number;
  lastSyncedAt: Date | null;
  isConnected: boolean;
  isSyncing: boolean;
  syncError: string | null;
  liveEventsCount: number;
  recentWrites: { id: string; time: string; text: string }[];
}

export function useAdminSync(userId?: string, userRole?: string) {
  const [syncState, setSyncState] = useState<AdminSyncState>({
    stats: null,
    usersList: [],
    allTasks: [],
    tickets: [],
    feedbacks: [],
    activityLogs: [],
    ads: [],
    dbVersion: 0,
    lastSyncedAt: null,
    isConnected: false,
    isSyncing: false,
    syncError: null,
    liveEventsCount: 0,
    recentWrites: [],
  });

  const lastVersionRef = useRef<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchFullAdminData = useCallback(async () => {
    if (userRole !== 'ADMIN') return;
    try {
      setSyncState(prev => ({ ...prev, isSyncing: true }));
      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': userId || ''
      };

      const res = await fetch('/api/admin/live-sync', { headers });
      if (res.ok) {
        const data = await res.json();
        const newVersion = data.dbVersion || Date.now();
        const hasNewWrite = lastVersionRef.current !== 0 && lastVersionRef.current !== newVersion;

        lastVersionRef.current = newVersion;

        setSyncState(prev => {
          const newWrites = [...prev.recentWrites];
          if (hasNewWrite) {
            newWrites.unshift({
              id: `w_${Date.now()}`,
              time: new Date().toLocaleTimeString('ar-EG'),
              text: `تحديث قاعدة البيانات (v${newVersion}): مزامنة البيانات والأنشطة الإعلانية`
            });
            if (newWrites.length > 10) newWrites.pop();
          }

          return {
            ...prev,
            stats: data.stats || null,
            usersList: data.users || [],
            allTasks: data.tasks || [],
            tickets: data.tickets || [],
            feedbacks: data.feedbacks || [],
            activityLogs: data.logs || [],
            ads: data.ads || [],
            dbVersion: newVersion,
            lastSyncedAt: new Date(),
            isConnected: true,
            isSyncing: false,
            syncError: null,
            liveEventsCount: hasNewWrite ? prev.liveEventsCount + 1 : prev.liveEventsCount,
            recentWrites: newWrites
          };
        });
      } else {
        setSyncState(prev => ({
          ...prev,
          isConnected: false,
          isSyncing: false,
          syncError: 'فشل المزامنة مع خادم الإدارة'
        }));
      }
    } catch (err: any) {
      setSyncState(prev => ({
        ...prev,
        isConnected: false,
        isSyncing: false,
        syncError: err.message || 'خطأ في اتصال المزامنة'
      }));
    }
  }, [userId, userRole]);

  useEffect(() => {
    if (userRole !== 'ADMIN') return;

    // Initial load
    fetchFullAdminData();

    // Setup EventSource for SSE real-time pushes
    let es: EventSource | null = null;
    try {
      es = new EventSource(`/api/admin/stream?userId=${encodeURIComponent(userId || '')}`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'SYNC' || data.type === 'HEARTBEAT') {
            if (data.dbVersion && data.dbVersion !== lastVersionRef.current) {
              fetchFullAdminData();
            }
          }
        } catch (e) {
          // ignore
        }
      };

      es.onerror = () => {
        setSyncState(prev => ({ ...prev, isConnected: false }));
      };

      es.onopen = () => {
        setSyncState(prev => ({ ...prev, isConnected: true }));
      };
    } catch (e) {
      console.warn('SSE creation error, fallback to light polling');
    }

    // Light polling interval fallback (3 seconds) ensures data stays 100% current
    const interval = setInterval(() => {
      fetchFullAdminData();
    }, 3000);

    return () => {
      if (es) es.close();
      clearInterval(interval);
    };
  }, [userId, userRole, fetchFullAdminData]);

  return {
    ...syncState,
    triggerManualSync: fetchFullAdminData
  };
}
