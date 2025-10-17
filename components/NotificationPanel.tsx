import * as React from 'react';
import type { Notification } from '../types';
import * as Lucide from 'lucide-react';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onClearAll: () => void;
}

const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `há ${Math.floor(interval)} anos`;
    interval = seconds / 2592000;
    if (interval > 1) return `há ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `há ${Math.floor(interval)} dias`;
    interval = seconds / 3600;
    if (interval > 1) return `há ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `há ${Math.floor(interval)} minutos`;
    return "agora mesmo";
};


const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, notifications, onMarkAsRead, onClearAll }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-40"
            onClick={onClose}
        >
            <div 
                className="absolute top-16 right-4 sm:right-6 lg:right-8 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 z-50 animate-fade-in-down"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Notificações</h3>
                    {notifications.length > 0 && (
                        <button 
                            onClick={onClearAll} 
                            className="text-xs text-red-500 hover:underline flex items-center"
                        >
                            <Lucide.Trash2 size={12} className="mr-1"/> Limpar tudo
                        </button>
                    )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map(notification => (
                            <div key={notification.id} className={`p-5 border-b border-slate-100 dark:border-slate-700/50 ${!notification.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-1.5">
                                         <div className={`w-2 h-2 rounded-full ${!notification.read ? 'bg-primary animate-pulse' : 'bg-transparent'}`}></div>
                                    </div>
                                    <div className="ml-3 flex-grow">
                                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{notification.title}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 break-words">{notification.description}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{timeSince(notification.date)}</p>
                                    </div>
                                    {!notification.read && (
                                        <div className="ml-2 flex-shrink-0">
                                            <button 
                                                onClick={() => onMarkAsRead(notification.id)} 
                                                className="p-1 rounded-full text-slate-400 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-500/20 dark:hover:text-green-400"
                                                title="Marcar como lida"
                                            >
                                                <Lucide.CheckCircle size={16}/>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-10">
                            <Lucide.Bell className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-600"/>
                            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Tudo limpo!</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Você não tem novas notificações.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPanel;