// /src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Importe o Layout
import Layout from './components/Layout';

// Importe as páginas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BetHistoryPage from './pages/BetHistoryPage';
import ResultsPage from './pages/ResultsPage';

// 1. IMPORTE O NOSSO "SEGURANÇA"
import ProtectedRoute from './components/ProtectedRoute';
import SelectGamePage from './pages/wizard/SelectGamePage'; // Nova página do wizard
import SelectSchedulePage from './pages/wizard/SelectSchedulePage.jsx'; // Nova página do wizard
import SelectBetTypePage from './pages/wizard/SelectBetTypePage.jsx';
import SelectPrizeTierPage from './pages/wizard/SelectPrizeTierPage.jsx';
import EnterBetPage from './pages/wizard/EnterBetPage.jsx';
// ... (outros imports do wizard conforme necessário)

function App() {
  return (
    <Layout>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/resultados" element={<ResultsPage />} /> 
        
        {/* Rotas Privadas */}
        <Route 
          path="/" 
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} 
        />
        <Route 
          path="/historico" 
          element={<ProtectedRoute><BetHistoryPage /></ProtectedRoute>}
        />
        
        {/* --- 2. NOVAS ROTAS DO WIZARD --- */}
        <Route 
          path="/apostar/jogo"
          element={<ProtectedRoute><SelectGamePage /></ProtectedRoute>}
        />
        <Route 
          path="/apostar/jogo"
          element={<ProtectedRoute><SelectGamePage /></ProtectedRoute>}
        />
        <Route 
          path="/apostar/sorteio" // <-- 2. ADICIONAR ROTA
          element={<ProtectedRoute><SelectSchedulePage /></ProtectedRoute>}
        />
        <Route 
          path="/apostar/jogo"
          element={<ProtectedRoute><SelectGamePage /></ProtectedRoute>}
        />
        <Route 
          path="/apostar/sorteio"
          element={<ProtectedRoute><SelectSchedulePage /></ProtectedRoute>}
        />
        <Route 
          path="/apostar/modalidade" // <-- 2. ADICIONAR ROTA
          element={<ProtectedRoute><SelectBetTypePage /></ProtectedRoute>}
        />
        <Route 
          path="/apostar/jogo"
          element={<ProtectedRoute><SelectGamePage /></ProtectedRoute>}
        />
        <Route 
          path="/apostar/sorteio"
          element={<ProtectedRoute><SelectSchedulePage /></ProtectedRoute>}
        />
        <Route 
          path="/apostar/modalidade"
          element={<ProtectedRoute><SelectBetTypePage /></ProtectedRoute>}
        />
        <Route 
          path="/apostar/colocacao" // <-- 2. ADICIONAR ROTA
          element={<ProtectedRoute><SelectPrizeTierPage /></ProtectedRoute>}
        />
        <Route path="/apostar/jogo" element={<ProtectedRoute><SelectGamePage /></ProtectedRoute>} />
        <Route path="/apostar/sorteio" element={<ProtectedRoute><SelectSchedulePage /></ProtectedRoute>} />
        <Route path="/apostar/modalidade" element={<ProtectedRoute><SelectBetTypePage /></ProtectedRoute>} />
        <Route path="/apostar/colocacao" element={<ProtectedRoute><SelectPrizeTierPage /></ProtectedRoute>} />
        <Route 
          path="/apostar/palpites" // <-- 2. ADICIONAR ROTA
          element={<ProtectedRoute><EnterBetPage /></ProtectedRoute>} 
        />
      </Routes>
    </Layout>
  );
}

export default App;