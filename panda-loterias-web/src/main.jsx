// /src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Estilos globais

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider.jsx';
import { ChakraProvider } from '@chakra-ui/react';

import { theme } from './theme';
import { NewBetProvider } from './context/NewBetProvider.jsx';
import { BetSlipProvider } from './context/BetSlipProvider.jsx';
import { GameRulesProvider } from './context/GameRulesProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ChakraProvider theme={theme}>
          <GameRulesProvider> {/* <-- 2. ENVELOPAR */}
            <NewBetProvider>
              <BetSlipProvider>
                <App />
              </BetSlipProvider>
            </NewBetProvider>
          </GameRulesProvider>
        </ChakraProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);