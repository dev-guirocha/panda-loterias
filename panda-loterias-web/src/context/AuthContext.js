// /src/context/AuthContext.js
import { createContext } from 'react';

// Este arquivo .js exporta APENAS o objeto do contexto.
// Como não é um .jsx, o Fast Refresh não vai reclamar.
export const AuthContext = createContext(null);