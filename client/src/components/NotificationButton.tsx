import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationPanel from './NotificationPanel';

interface NotificationButtonProps {
  className?: string;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock unread count - in a real app, this would come from your notification service
  useEffect(() => {
    const mockUnreadCount = 3; // This would be fetched from your API
    setUnreadCount(mockUnreadCount);
  }, []);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={togglePanel}
        className={`relative p-2 sm:p-3 rounded-lg text-text dark:text-dark-text hover:bg-background dark:hover:bg-dark-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
        aria-label="Open notifications"
        aria-expanded={isOpen}
      >
        <Bell size={20} className="sm:w-6 sm:h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center min-w-0">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default NotificationButton;
