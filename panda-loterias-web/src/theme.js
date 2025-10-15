// /src/theme.js
import { extendTheme } from '@chakra-ui/react';

// 1. Vamos definir nossas cores customizadas inspiradas na logo
const colors = {
  // Criamos uma "paleta" de cores chamada 'panda'
  panda: {
    green: '#22c55e', // Verde "LOTERIAS" (Aproximei para um verde-esmeralda)
    red: '#f87171',   // Vermelho "PANDA" (Aproximei para um salmão)
    dark: '#1a202c',  // Preto/Grafite
  },
};

// 2. Vamos definir os estilos globais
const styles = {
  global: {
    'html, body': {
      backgroundColor: 'gray.50', // Fundo de página cinza-claro
      color: 'panda.dark',        // Cor de texto padrão
    },
    a: {
      color: 'panda.green', // Links serão verdes por padrão
      _hover: {
        textDecoration: 'underline',
      },
    },
  },
};

// 3. Estendemos o tema padrão do Chakra
export const theme = extendTheme({
  colors,
  styles,
});