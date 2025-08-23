import React from 'react';
import { useAppSelector } from '../../store';
import Notification from './Notification';

const NotificationContainer: React.FC = () => {
  const notifications = useAppSelector((state) => state.ui.notifications);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          type={notification.type}
          message={notification.message}
          duration={notification.duration}
        />
      ))}
    </div>
  );
};

export default NotificationContainer; 