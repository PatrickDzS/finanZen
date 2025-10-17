import * as React from 'react';
import * as Lucide from 'lucide-react';

interface NavItemProps {
    href: string;
    isActive: boolean;
    icon: React.ReactNode;
    children: React.ReactNode;
    isMobile?: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ href, isActive, icon, children, isMobile, onClick }) => {
    const baseClasses = "group flex items-center px-4 py-3 font-semibold transition-colors duration-200 w-full";
    
    // Mobile-specific styles - Refatorado para maior destaque do item ativo
    const mobileClasses = `rounded-lg text-base ${
        isActive 
        ? 'bg-primary text-white shadow-lg' // O estado ativo já possui alto contraste, mantendo-o forte.
        : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-100' // Suaviza o estado inativo para aumentar a hierarquia visual.
    }`;
    
    // Desktop-specific styles
    const desktopClasses = `text-base border-b-2 ${
        isActive 
        ? 'text-primary border-primary' 
        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 border-transparent'
    }`;

    return (
        <a
            href={href}
            onClick={onClick}
            className={`${baseClasses} ${isMobile ? mobileClasses : desktopClasses}`}
        >
            <span className={`transition-transform duration-200 group-hover:scale-110 ${isMobile ? '' : 'mr-2'}`}>
                {icon}
            </span>
            <span className={isMobile ? "ml-3" : ""}>{children}</span>
        </a>
    );
};


interface NavigationProps {
    activeTab: string;
    isMobileMenuOpen: boolean;
    onClose: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, isMobileMenuOpen, onClose }) => {
    
    const navItems = [
        { href: "#/", tab: 'dashboard', icon: <Lucide.LayoutDashboard size={20} />, label: 'Dashboard' },
        { href: "#/contas", tab: 'contas', icon: <Lucide.ReceiptText size={20} />, label: 'Contas' },
        { href: "#/investimentos", tab: 'investimentos', icon: <Lucide.CandlestickChart size={20} />, label: 'Investimentos' },
        { href: "#/metas", tab: 'metas', icon: <Lucide.Target size={20} />, label: 'Metas' },
        { href: "#/zenscore", tab: 'zenscore', icon: <Lucide.Gauge size={20} />, label: 'Zen Score' },
        { href: "#/conquistas", tab: 'conquistas', icon: <Lucide.Award size={20} />, label: 'Conquistas' },
    ];

    const sidebarContent = (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <a href="#/" onClick={onClose} className="flex items-center" aria-label="Dashboard">
                    <Lucide.PiggyBank className="w-8 h-8 text-primary" />
                    <h1 className="ml-3 text-2xl font-bold text-slate-100">
                        Finanzen
                    </h1>
                </a>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700"
                    aria-label="Close menu"
                >
                    <Lucide.X size={24} />
                </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map(item => (
                    <NavItem 
                        key={item.tab} 
                        href={item.href} 
                        isActive={activeTab === item.tab} 
                        icon={item.icon}
                        isMobile={true}
                        onClick={onClose}
                    >
                       {item.label}
                    </NavItem>
                ))}
            </nav>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar */}
            <div 
                className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                aria-hidden={!isMobileMenuOpen}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60" onClick={onClose} tabIndex={-1}></div>
                
                {/* Sidebar */}
                <aside 
                    className={`absolute top-0 left-0 h-full w-72 bg-slate-800 shadow-xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Main menu"
                >
                    {sidebarContent}
                </aside>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex mb-8 border-b border-slate-200 dark:border-slate-700 items-center justify-start">
                {navItems.map(item => (
                   <NavItem key={item.tab} href={item.href} isActive={activeTab === item.tab} icon={item.icon}>
                       {item.label}
                   </NavItem>
                ))}
            </nav>
        </>
    );
};

export default Navigation;