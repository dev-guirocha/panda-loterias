// /src/components/Layout.jsx
import React from 'react';
import { Box, Flex, Container, Image, Heading, Text, Spacer } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './ui/Button';

const Layout = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Garante o redirecionamento
  };

  return (
    <Box>
      {/* --- 1. O CABEÇALHO --- */}
      <Box as="header" bg="white" shadow="sm">
        <Container maxW="container.xl" py="4">
          <Flex align="center">
            
            {/* --- Logo e Título --- */}
            <RouterLink to="/">
              <Flex align="center">
                <Image 
                  src="/pandalogo.png" // Puxa da pasta /public
                  alt="Panda Loterias Logo" 
                  boxSize="50px" // 50px de tamanho
                  mr="4" // Margem à direita
                />
                <Heading as="h1" size="md" color="panda.dark">
                  Panda Loterias
                </Heading>
              </Flex>
            </RouterLink>

            <Spacer /> {/* Empurra todo o resto para a direita */}

            {/* --- Navegação e Usuário --- */}
            <Flex align="center">
              {isAuthenticated ? (
                // --- Se ESTÁ LOGADO ---
                <>
                  <Text mr="4">Olá, <strong>{user?.name}</strong>!</Text>
                  <RouterLink to="/historico">
                    <Button variant="ghost" mr="4">Histórico</Button>
                  </RouterLink>
                  <RouterLink to="/resultados">
                    <Button variant="ghost" mr="4">Resultados</Button>
                  </RouterLink>
                  <Button variant="danger" onClick={handleLogout}>
                    Sair
                  </Button>
                </>
              ) : (
                // --- Se NÃO ESTÁ LOGADO ---
                <>
                  <RouterLink to="/resultados">
                    <Button variant="ghost" mr="4">Resultados</Button>
                  </RouterLink>
                  <RouterLink to="/login">
                    <Button variant="ghost" mr="4">Login</Button>
                  </RouterLink>
                  <RouterLink to="/register">
                    <Button>Cadastre-se</Button>
                  </RouterLink>
                </>
              )}
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* --- 2. O CONTEÚDO PRINCIPAL DA PÁGINA --- */}
      <Box as="main" py={{ base: 6, md: 8 }}>
        <Container maxW="container.lg" px={{ base: 4, md: 6 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
