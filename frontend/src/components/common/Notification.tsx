import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useAppDispatch } from '../../store';
import { removeNotification } from '../../store/slices/uiSlice';
import { NotificationType } from '../../store/slices/uiSlice';

interface NotificationProps {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  message,
  duration = 5000,
  onClose,
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    dispatch(removeNotification(id));
    onClose?.();
  };

  const typeStyles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${typeStyles[type]} shadow-lg max-w-md transform transition-all duration-300 ease-in-out`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-1">{message}</div>
        <button
          onClick={handleClose}
          className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Close notification"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Notification; 