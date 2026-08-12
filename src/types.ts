export type Language = 'ar' | 'en';
export type UserRole = 'USER' | 'SUPPORT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash?: string;
  avatar?: string;
  bio?: string;
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'system';
  createdAt: string;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type TaskCategory = 'WORK' | 'STUDY' | 'PERSONAL' | 'HEALTH' | 'FINANCE' | 'OTHER';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  estimatedDurationMinutes?: number;
  reminderMinutesBefore?: number;
  subtasks: Subtask[];
  goalId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  type: 'SHORT_TERM' | 'LONG_TERM';
  targetDate: string;
  progress: number; // 0-100
  milestones: GoalMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD HH:mm
  endDate: string; // YYYY-MM-DD HH:mm
  type: 'EVENT' | 'TASK_DEADLINE' | 'FOCUS_SESSION';
  color?: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  completedAt: string;
  notes?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionRequired?: {
    type: 'CREATE_TASK' | 'UPDATE_PRIORITY' | 'CREATE_GOAL' | 'GENERATE_PLAN';
    payload: any;
    confirmed?: boolean;
  };
}

export interface AIConversation {
  id: string;
  userId: string;
  messages: AIMessage[];
  updatedAt: string;
}

export type TicketCategory = 'TECHNICAL' | 'ACCOUNT' | 'AI' | 'BILLING' | 'BUG' | 'SUGGESTION' | 'OTHER';
export type TicketStatus = 'OPEN' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface SupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  assignedTo?: string;
  message?: string;
  messages: SupportMessage[];
  responses?: any[];
  createdAt: string;
  updatedAt: string;
}

export type FeedbackType = 'BUG' | 'FEATURE' | 'SUGGESTION' | 'COMPLAINT';
export type FeedbackStatus = 'NEW' | 'REVIEWING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1-5
  type: FeedbackType;
  comment: string;
  message?: string;
  category?: string;
  status: FeedbackStatus;
  adminReply?: string;
  createdAt: string;
}

export type Feedback = FeedbackItem;

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'DEADLINE' | 'OVERDUE' | 'COMPLETED' | 'GOAL' | 'AI' | 'SUPPORT' | 'SYSTEM';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface SystemSettings {
  announcement?: string;
  allowRegistrations: boolean;
  aiEnabled: boolean;
  maintenanceMode: boolean;
  supportEmail: string;
}

export interface ProductivityStats {
  completedTasksCount: number;
  overdueTasksCount: number;
  pendingTasksCount: number;
  completionRate: number; // percentage
  totalFocusTimeMinutes: number;
  productivityScore: number; // 0-100
  weeklyCompletion: { day: string; completed: number; created: number }[];
  focusTimeWeekly: { day: string; minutes: number }[];
  priorityDistribution: { priority: TaskPriority; count: number }[];
}

export type AdPlacement = 'DASHBOARD' | 'SIDEBAR' | 'PUBLIC';
export type AdStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'EXPIRED';

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  buttonText: string;
  placement: AdPlacement;
  status: AdStatus;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  priority: number; // 1-10
  impressions: number;
  clicks: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
