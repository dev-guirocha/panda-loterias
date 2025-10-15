// /src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // 1. Se o usuário NÃO está logado, redirecione-o para a página de login
    // 2. Guardamos o 'location' para que, após o login, ele possa voltar para onde tentou ir
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Se o usuário ESTÁ logado, mostre a página que ele pediu (o 'children')
  return children;
};

export default ProtectedRoute;