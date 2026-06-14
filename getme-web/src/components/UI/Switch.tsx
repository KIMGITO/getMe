// src/components/Switch.tsx
import React, { useState, ReactNode, useEffect, useMemo } from 'react';

export interface SwitchTab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  notification?: number;
  metadata?: Record<string, any>;
}

export interface SwitchProps {
  tabs: SwitchTab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'line' | 'filled' | 'bordered' | 'minimal' | 'modern';
  position?: 'top' | 'left' | 'right' | 'bottom';
  size?: 'small' | 'medium' | 'large';
  lazyLoad?: boolean;
  keepAlive?: boolean;
  showArrows?: boolean;
  scrollable?: boolean;
  className?: string;
  tabListClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
}

const Switch: React.FC<SwitchProps> = ({
  tabs,
  defaultTab,
  onTabChange,
  variant = 'line',
  position = 'top',
  size = 'medium',
  lazyLoad = false,
  keepAlive = false,
  showArrows = false,
  scrollable = true,
  className = '',
  tabListClassName = '',
  tabClassName = '',
  contentClassName = '',
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    defaultTab || tabs[0]?.id || '',
  );
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(
    new Set(lazyLoad ? [] : [activeTab]),
  );
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    if (!lazyLoad && activeTab) {
      setLoadedTabs((prev) => new Set(prev).add(activeTab));
    }
  }, [activeTab, lazyLoad]);

  const handleTabChange = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.disabled) return;

    setActiveTab(tabId);
    onTabChange?.(tabId);

    if (!lazyLoad) {
      setLoadedTabs((prev) => new Set(prev).add(tabId));
    }
  };

  const sizeClasses = {
    small: {
      tab: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      container: 'gap-1',
    },
    medium: {
      tab: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      container: 'gap-2',
    },
    large: {
      tab: 'px-6 py-3 text-lg',
      icon: 'w-6 h-6',
      container: 'gap-3',
    },
  };

  const variantStyles = {
    line: {
      container: 'border-b border-outline-variant',
      tab: (isActive: boolean) => `
        relative
        ${
          isActive
            ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
            : 'text-on-surface-variant hover:text-on-surface'
        }
      `,
    },
    filled: {
      container: 'bg-surface-container rounded-lg p-1',
      tab: (isActive: boolean) => `
        rounded-md
        ${
          isActive
            ? 'bg-surface text-on-surface shadow-elevation-1'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-hover'
        }
      `,
    },
    bordered: {
      container:
        'border border-outline-variant rounded-lg p-1 bg-surface-container-low',
      tab: (isActive: boolean) => `
        rounded-md border
        ${
          isActive
            ? 'bg-primary-container text-on-primary-container border-primary'
            : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-hover'
        }
      `,
    },
    minimal: {
      container: '',
      tab: (isActive: boolean) => `
        ${
          isActive
            ? 'text-primary bg-primary-container/10'
            : 'text-on-surface-variant hover:text-on-surface'
        }
      `,
    },
    modern: {
      container:
        'bg-gradient-to-r from-primary to-secondary rounded-2xl p-1 backdrop-blur-sm',
      tab: (isActive: boolean) => `
        rounded-xl transition-all duration-300
        ${
          isActive
            ? 'bg-surface text-on-surface shadow-elevation-2 transform scale-105'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-hover'
        }
      `,
    },
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'flex-row space-x-4';
      case 'right':
        return 'flex-row-reverse spaece-x-4';
      case 'bottom':
        return 'flex-col-reverse space-y-4';
      default:
        return 'flex-col space-y-4';
    }
  };

  const getTabContainerClasses = () => {
    const baseClasses = `
      flex
      ${position === 'top' || position === 'bottom' ? 'flex-row' : 'flex-col'}
      ${scrollable ? 'overflow-x-auto scrollbar-thin' : 'flex-wrap'}
      ${sizeClasses[size].container}
      ${variantStyles[variant].container}
      ${tabListClassName}
    `;
    return baseClasses;
  };

  const renderContent = () => {
    if (!activeTab) return null;

    if (keepAlive) {
      return (
        <div className={`${contentClassName}`}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`transition-opacity duration-200 ${
                activeTab === tab.id ? 'block' : 'hidden'
              }`}
            >
              {tab.content}
            </div>
          ))}
        </div>
      );
    }

    if (lazyLoad) {
      const content = loadedTabs.has(activeTab)
        ? tabs.find((tab) => tab.id === activeTab)?.content
        : null;
      return <div className={contentClassName}>{content}</div>;
    }

    const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;
    return <div className={contentClassName}>{activeContent}</div>;
  };

  return (
    <div className={`flex  ${getPositionClasses()} ${className}`}>
      {/* Tab List */}
      <div className={`  ${getTabContainerClasses()}`} role="tablist">
        {showArrows && scrollable && (
          <button
            onClick={() => setIsScrolling(!isScrolling)}
            className="p-2 rounded-md hover:bg-surface-container"
          >
            ←
          </button>
        )}

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                relative flex items-center gap-2 font-medium transition-all duration-200
                ${sizeClasses[size].tab}
                ${variantStyles[variant].tab(isActive)}
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${tabClassName}
              `}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
            >
              {tab.icon && (
                <span className={sizeClasses[size].icon}>{tab.icon}</span>
              )}
              <span>{tab.label}</span>
              {tab.notification !== undefined && tab.notification > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-xs font-bold text-on-error">
                  {tab.notification > 99 ? '99+' : tab.notification}
                </span>
              )}
            </button>
          );
        })}

        {showArrows && scrollable && (
          <button
            onClick={() => setIsScrolling(!isScrolling)}
            className="p-2 rounded-md hover:bg-surface-container"
          >
            →
          </button>
        )}
      </div>

      {/* Content Panel */}
      <div className="flex-1  overflow-scroll min-w-0">{renderContent()}</div>
    </div>
  );
};

export default Switch;
