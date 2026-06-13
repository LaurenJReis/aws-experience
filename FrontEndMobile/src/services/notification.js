import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registrarPushToken(jwtToken) {
  if (!Device.isDevice) return null;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();

  await api.patch('/api/usuario/fcm-token',
    { token: expoPushToken },
    { headers: { Authorization: `Bearer ${jwtToken}` } }
  );

  return expoPushToken;
}

export function onNotificationReceived(callback) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function onNotificationTapped(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
