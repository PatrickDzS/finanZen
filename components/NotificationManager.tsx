import * as React from 'react';
import type { Notification } from '../types';
import * as Lucide from 'lucide-react';

interface NotificationManagerProps {
    notifications: Notification[];
}

const NotificationToast: React.FC<{ notification: Notification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
    const [isExiting, setIsExiting] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onDismiss(notification.id), 300); // Wait for exit animation
        }, 4000); // Auto-dismiss after 4 seconds

        return () => clearTimeout(timer);
    }, [notification.id, onDismiss]);

    const handleDismissClick = () => {
        setIsExiting(true);
        setTimeout(() => onDismiss(notification.id), 300);
    };

    const animationClasses = isExiting 
        ? 'opacity-0 scale-95' 
        : 'opacity-100 scale-100';

    return (
        <div className={`w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl rounded-xl pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out ${animationClasses}`}>
            <div className="p-6">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {notification.title.toLowerCase().includes('conquista') ? (
                            <Lucide.CheckCircle className="h-7 w-7 text-green-400" aria-hidden="true" />
                        ) : (
                            <Lucide.Info className="h-7 w-7 text-primary" aria-hidden="true" />
                        )}
                    </div>
                    <div className="ml-4 w-0 flex-1">
                        <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{notification.title}</p>
                        <p className="mt-1 text-base text-slate-600 dark:text-slate-300">{notification.description}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={handleDismissClick}
                            className="bg-white dark:bg-slate-800 rounded-md inline-flex text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-primary"
                        >
                            <span className="sr-only">Close</span>
                            <Lucide.X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NotificationManager: React.FC<NotificationManagerProps> = ({ notifications }) => {
    const [toasts, setToasts] = React.useState<Notification[]>([]);

    React.useEffect(() => {
        if (notifications.length > 0) {
            const latestNotification = notifications[0];
            // Prevent duplicate toasts from appearing
            if (!toasts.find(t => t.id === latestNotification.id)) {
                 // Show max 3 toasts at a time
                 setToasts(prev => [latestNotification, ...prev].slice(0, 3));
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notifications]);

    const handleDismiss = (id: string) => {
        setToasts(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div
            aria-live="assertive"
            className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 z-[100]"
        >
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {toasts.map(notification => (
                    <NotificationToast
                        key={notification.id}
                        notification={notification}
                        onDismiss={handleDismiss}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotificationManager;