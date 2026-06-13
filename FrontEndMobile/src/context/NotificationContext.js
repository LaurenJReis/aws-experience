import React, { createContext, useContext, useEffect, useState } from 'react';
import { onNotificationReceived, onNotificationTapped } from '../services/notification';

const NotificationContext = createContext({});

export function NotificationProvider({ children, navigationRef }) {
  const [lastNotification, setLastNotification] = useState(null);

  useEffect(() => {
    const sub1 = onNotificationReceived((notification) => {
      setLastNotification(notification.request.content);
    });

    const sub2 = onNotificationTapped((response) => {
      const data = response.notification.request.content.data;
      // Navega para tela de acompanhamento ao tocar na notificação
      if (navigationRef?.current && data?.etapa) {
        navigationRef.current.navigate('Acompanhamento');
      }
    });

    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ lastNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
