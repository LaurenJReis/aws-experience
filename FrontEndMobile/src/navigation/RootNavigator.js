import React, { useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import PublicNavigator from './PublicNavigator';
import ClienteNavigator from './ClienteNavigator';
import VendedorNavigator from './VendedorNavigator';
import { COLORS } from '../constants';

export default function RootNavigator() {
  const { user, token, loading } = useAuth();
  const navigationRef = useRef();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.red} />
      </View>
    );
  }

  const isAuthenticated = !!token && !!user;
  const role = user?.role || user?.tipo || user?.perfil || '';
  const isVendedor = role.toUpperCase() === 'VENDEDOR' || role.toUpperCase() === 'ADMIN';

  return (
    <NavigationContainer ref={navigationRef}>
      <NotificationProvider navigationRef={navigationRef}>
        {!isAuthenticated ? (
          <PublicNavigator />
        ) : isVendedor ? (
          <VendedorNavigator />
        ) : (
          <ClienteNavigator />
        )}
      </NotificationProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.screenBg,
  },
});
