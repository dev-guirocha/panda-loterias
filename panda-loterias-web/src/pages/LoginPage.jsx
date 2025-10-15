// /src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  Alert,
  AlertIcon,
  VStack, // Stack vertical para organizar o formulário
  Link,   // Componente de Link do Chakra
  Center, // Para centralizar
} from '@chakra-ui/react';

const LoginPage = () => {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Para o botão de loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Ativa o loading

    try {
      await auth.login(email, password);
      // O redirecionamento é feito pelo AuthContext
    } catch (err) {
      console.error(err);
      setError('Falha no login. Verifique seu email e senha.');
    } finally {
      setIsLoading(false); // Desativa o loading
    }
  };

  return (
    <Center>
      <Box 
        w="100%" 
        maxW="400px" // Largura máxima do formulário
        p="8" 
        borderWidth={1} 
        borderRadius="lg" 
        shadow="md"
        bg="white" // Fundo branco para contrastar
      >
        <Heading as="h2" size="lg" textAlign="center" mb="6">
          Página de Login
        </Heading>
        
        <form onSubmit={handleSubmit}>
          {/* VStack organiza os itens verticalmente com espaçamento */}
          <VStack spacing="4">
            <FormControl isRequired>
              <FormLabel htmlFor="email">Email:</FormLabel>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel htmlFor="password">Senha:</FormLabel>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            
            {/* Mostra o Alerta de Erro do Chakra */}
            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}
            
            <Button
              type="submit"
              colorScheme="green" // Usa o tema "green"
              bg="panda.green"    // Nossa cor customizada!
              color="white"
              isLoading={isLoading} // Mostra um spinner se estiver logando
              width="full"        // Ocupa a largura toda
            >
              Entrar
            </Button>
          </VStack>
        </form>
        
        <Text mt="6" textAlign="center">
          Não tem uma conta?{' '}
          {/* Usamos o Link do Chakra estilizado como o Link do Router */}
          <Link as={RouterLink} to="/register" color="panda.green" fontWeight="bold">
            Cadastre-se aqui
          </Link>
        </Text>
      </Box>
    </Center>
  );
};

export default LoginPage;