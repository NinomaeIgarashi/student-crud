import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

// NotificationBanner: Renders an in-page non-modal alert banner for feedback and error reporting
export function NotificationBanner({ notification, onDismiss }) {
  if (!notification || !notification.message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-300 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
    info: {
      bg: 'bg-sky-50 border-sky-300 text-sky-900',
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
    },
  };

  const currentStyle = typeConfig[notification.type] || typeConfig.info;

  return (
    <div
      className={`border rounded-xl p-4 flex items-center justify-between shadow-sm transition-all animate-fadeIn ${currentStyle.bg}`}
      role="alert"
    >
      <div className="flex items-center gap-3">
        {currentStyle.icon}
        <span className="font-medium text-sm md:text-base">{notification.message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-slate-500 hover:text-slate-800 p-1 rounded-lg hover:bg-black/5 transition"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
