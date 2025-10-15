// /src/context/AuthProvider.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

// 1. Importamos o CONTEXTO do arquivo .js
import { AuthContext } from './AuthContext';

// 2. Este arquivo .jsx exporta APENAS o Componente Provedor
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setToken(null);
    navigate('/login');
  }, [navigate]);

  const fetchUser = useCallback(() => {
    api.get('/user/me')
      .then(response => setUser(response.data))
      .catch(() => {
        console.error("Token inválido, deslogando.");
        logout();
      });
  }, [logout]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchUser();
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token, fetchUser]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setToken(response.data.token);
      navigate('/');
    } catch (error) {
      console.error("Falha no login", error);
      throw error;
    }
  }, [navigate]);

  const register = useCallback(async (name, email, password) => {
    try {
      await api.post('/auth/register', { name, email, password });
      await login(email, password);
    } catch (error) {
      console.error("Falha no registro", error);
      throw error;
    }
  }, [login]);

  const refreshUser = useCallback(() => {
     if(token) {
        fetchUser();
     }
  }, [token, fetchUser]);

  // O valor que será provido
  const value = {
    token,
    user,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};