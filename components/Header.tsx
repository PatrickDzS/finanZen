import * as React from 'react';
import * as Lucide from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationPanel from './NotificationPanel';
import type { Notification } from '../types';

interface HeaderProps {
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
    onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ notifications, setNotifications, onMenuToggle }) => {
    const [isPanelOpen, setIsPanelOpen] = React.useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleTogglePanel = () => {
        setIsPanelOpen(prev => !prev);
    };

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };
    
    const handleClearAll = () => {
        setNotifications([]);
    };

    return (
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700/50 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <button
                            onClick={onMenuToggle}
                            className="lg:hidden p-2 -ml-2 mr-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                            aria-label="Open menu"
                        >
                            <Lucide.Menu size={24} />
                        </button>
                        <a href="#/" className="flex items-center" aria-label="Dashboard">
                            <Lucide.PiggyBank className="w-8 h-8 text-primary" />
                            <h1 className="ml-3 text-2xl font-bold text-slate-800 dark:text-slate-100 hidden sm:block">
                               Finanzen
                            </h1>
                        </a>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="relative">
                            <button
                                onClick={handleTogglePanel}
                                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-800 transform hover:scale-110"
                                aria-label="View notifications"
                            >
                                <Lucide.Bell size={20} className="icon-swing" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            <NotificationPanel 
                                isOpen={isPanelOpen} 
                                onClose={() => setIsPanelOpen(false)} 
                                notifications={notifications}
                                onMarkAsRead={handleMarkAsRead}
                                onClearAll={handleClearAll}
                            />
                        </div>
                        <ThemeToggle />
                        <a 
                            href="#/perfil"
                            className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:ring-2 hover:ring-primary/50 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-800" 
                            aria-label="User profile"
                        >
                            <Lucide.User size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;