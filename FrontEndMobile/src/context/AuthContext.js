import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../services/api';
import { registrarPushToken } from '../services/notification';
import { ToastRef } from './ToastContext';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await AsyncStorage.getItem('@token');
      const storedUser = await AsyncStorage.getItem('@user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, senha) {
    const response = await login(email, senha);
    const { token: newToken, ...loginData } = response.data;
    await AsyncStorage.setItem('@token', newToken);
    const api = (await import('../services/api')).default;
    api.defaults.headers.Authorization = `Bearer ${newToken}`;
    let userData = loginData;
    try {
      const meRes = await api.get('/api/usuario/me');
      userData = { ...loginData, ...meRes.data };
    } catch {}
    await AsyncStorage.setItem('@user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    registrarPushToken(newToken).catch(() => {});
    ToastRef.show({ type: 'success', text1: 'Bem-vindo!', text2: `Olá, ${userData.nome || 'usuário'}` });
    return userData;
  }

  async function signOut() {
    try {
      await AsyncStorage.removeItem('@token');
      await AsyncStorage.removeItem('@user');
    } catch {} 
    setToken(null);
    setUser(null);
    ToastRef.show({ type: 'info', text1: 'Até logo!', text2: 'Você saiu da sua conta' });
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
