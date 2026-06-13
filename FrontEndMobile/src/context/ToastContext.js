import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Animated, Text, StyleSheet, Platform } from 'react-native';

const ToastContext = createContext({});

const TOAST_COLORS = {
  success: '#2E7D32',
  error: '#CC0000',
  info: '#1565C0',
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timeout = useRef(null);

  const show = useCallback(({ type = 'info', text1 = '', text2 = '' }) => {
    if (timeout.current) clearTimeout(timeout.current);
    setToast({ type, text1, text2 });
    Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    timeout.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setToast(null);
      });
    }, 3000);
  }, []);

  // Registra globalmente para uso fora de componentes
  ToastRef.show = show;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View style={[styles.container, { opacity, backgroundColor: TOAST_COLORS[toast.type] || TOAST_COLORS.info }]}>
          {toast.text1 ? <Text style={styles.title}>{toast.text1}</Text> : null}
          {toast.text2 ? <Text style={styles.message}>{toast.text2}</Text> : null}
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

// Ref global para uso fora de componentes (ex: AuthContext)
export const ToastRef = { show: () => {} };

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 9999,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  message: {
    color: '#FFFFFFCC',
    fontSize: 13,
    marginTop: 2,
  },
});
