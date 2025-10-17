import * as React from 'react';
import * as Lucide from 'lucide-react';

interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-b-0 border-t-4 border-t-slate-700 dark:border-t-slate-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-0 border-b-4 border-b-slate-700 dark:border-b-slate-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-0 border-l-4 border-l-slate-700 dark:border-l-slate-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-0 border-r-4 border-r-slate-700 dark:border-r-slate-900',
  }

  const childWithHandlers = React.cloneElement(children, {
    onMouseEnter: () => setIsVisible(true),
    onMouseLeave: () => setIsVisible(false),
    onFocus: () => setIsVisible(true),
    onBlur: () => setIsVisible(false),
  });

  return (
    <div className="relative inline-flex">
      {childWithHandlers}
      <div 
        className={`absolute z-20 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div
          role="tooltip"
          className={`${positionClasses[position]} w-max max-w-xs px-3 py-2 text-sm font-medium text-white bg-slate-700 dark:bg-slate-900 rounded-lg shadow-lg`}
        >
          {content}
          <div className={`absolute w-0 h-0 ${arrowClasses[position]}`}></div>
        </div>
      </div>
    </div>
  );
};

export const InfoTooltip: React.FC<{ content: React.ReactNode }> = ({ content }) => {
    return (
        <Tooltip content={content}>
            <button type="button" aria-label="Mais informações" className="ml-1.5 p-0.5 text-slate-400 dark:text-slate-500 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
                <Lucide.Info size={14} />
            </button>
        </Tooltip>
    )
}
