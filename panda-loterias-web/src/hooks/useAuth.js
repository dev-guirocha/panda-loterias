// /src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Vamos importar o Context

// Este arquivo exporta apenas o hook
export const useAuth = () => {
  return useContext(AuthContext);
};