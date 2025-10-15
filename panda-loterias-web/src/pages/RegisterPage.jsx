// /src/pages/RegisterPage.jsx
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
  VStack,
  Link,
  Center,
} from '@chakra-ui/react';

const RegisterPage = () => {
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password.length < 3) {
      setError('A senha precisa ter pelo menos 3 caracteres.');
      setIsLoading(false);
      return;
    }

    try {
      await auth.register(name, email, password);
      // Redirecionamento feito pelo AuthContext
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        setError('Este email já está cadastrado.');
      } else {
        setError('Falha no registro.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center>
      <Box 
        w="100%" 
        maxW="400px" 
        p="8" 
        borderWidth={1} 
        borderRadius="lg" 
        shadow="md"
        bg="white"
      >
        <Heading as="h2" size="lg" textAlign="center" mb="6">
          Página de Registro
        </Heading>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing="4">
            <FormControl isRequired>
              <FormLabel htmlFor="name">Nome:</FormLabel>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            
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
            
            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}
            
            <Button
              type="submit"
              colorScheme="green"
              bg="panda.green"
              color="white"
              isLoading={isLoading}
              width="full"
            >
              Cadastrar
            </Button>
          </VStack>
        </form>
        
        <Text mt="6" textAlign="center">
          Já tem uma conta?{' '}
          <Link as={RouterLink} to="/login" color="panda.green" fontWeight="bold">
            Faça o login aqui
          </Link>
        </Text>
      </Box>
    </Center>
  );
};

export default RegisterPage;