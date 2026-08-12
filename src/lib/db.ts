import Dexie, { Table } from 'dexie';
import {
  Task, Goal, CalendarEvent, FocusSession,
  User, SystemSettings, Advertisement
} from '../types';

export interface LocalUserSetting {
  id: string; // userId or 'default'
  userId: string;
  theme: 'light' | 'dark';
  language: 'ar' | 'en';
  updatedAt: string;
}

export class WaqtakLocalDatabase extends Dexie {
  tasks!: Table<Task, string>;
  goals!: Table<Goal, string>;
  calendarEvents!: Table<CalendarEvent, string>;
  focusSessions!: Table<FocusSession, string>;
  users!: Table<User, string>;
  userSettings!: Table<LocalUserSetting, string>;
  advertisements!: Table<Advertisement, string>;

  constructor() {
    super('WaqtakLocalDB');
    this.version(1).stores({
      tasks: 'id, userId, status, priority, dueDate, createdAt',
      goals: 'id, userId, status, category, targetDate, createdAt',
      calendarEvents: 'id, userId, date, startTime',
      focusSessions: 'id, userId, startTime, completed',
      users: 'id, email',
      userSettings: 'id, userId',
      advertisements: 'id, status, placement'
    });
  }
}

export const localDB = new WaqtakLocalDatabase();

// Sync helper utilities
export async function saveLocalTasks(tasks: Task[]) {
  try {
    await localDB.tasks.bulkPut(tasks);
  } catch (err) {
    console.error('Dexie error saving tasks:', err);
  }
}

export async function getLocalTasks(userId: string): Promise<Task[]> {
  try {
    return await localDB.tasks.where('userId').equals(userId).toArray();
  } catch (err) {
    console.error('Dexie error getting tasks:', err);
    return [];
  }
}

export async function saveLocalGoals(goals: Goal[]) {
  try {
    await localDB.goals.bulkPut(goals);
  } catch (err) {
    console.error('Dexie error saving goals:', err);
  }
}

export async function getLocalGoals(userId: string): Promise<Goal[]> {
  try {
    return await localDB.goals.where('userId').equals(userId).toArray();
  } catch (err) {
    console.error('Dexie error getting goals:', err);
    return [];
  }
}

export async function saveLocalUserSettings(setting: LocalUserSetting) {
  try {
    await localDB.userSettings.put(setting);
  } catch (err) {
    console.error('Dexie error saving settings:', err);
  }
}

export async function getLocalUserSettings(userId: string): Promise<LocalUserSetting | undefined> {
  try {
    return await localDB.userSettings.get(userId);
  } catch (err) {
    console.error('Dexie error getting settings:', err);
    return undefined;
  }
}
