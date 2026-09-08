import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { Notification } from '../types';
import toast from 'react-hot-toast';
import { Bell, Check, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_request': return '📨';
      case 'request_accepted': return '✅';
      case 'request_rejected': return '❌';
      case 'request_completed': return '🎉';
      case 'new_message': return '💬';
      case 'new_review': return '⭐';
      case 'new_match': return '🤝';
      default: return '🔔';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notifications
          {unreadCount > 0 && (
            <span className="text-sm font-medium text-primary-600">({unreadCount} unread)</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <Check className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No notifications</h3>
          <p className="text-gray-500">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div
              key={notif._id}
              className={`bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 ${
                !notif.read ? 'border-l-4 border-l-primary-500' : ''
              }`}
            >
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                {notif.message && <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif._id)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif._id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
