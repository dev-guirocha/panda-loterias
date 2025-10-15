// /src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Alert,
  AlertIcon,
  VStack, // Stack vertical para organizar o formulário
  Link,   // Componente de Link do Chakra
  Center, // Para centralizar
  Icon,
  useToast,
} from '@chakra-ui/react';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import { FaPaw } from 'react-icons/fa';

const LoginPage = () => {
  const auth = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false); // Para o botão de loading

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (field, value) => {
    if (field === 'email') {
      if (!value.trim()) return 'Informe seu email.';
      if (!emailRegex.test(value)) return 'Forneça um email válido.';
    }
    if (field === 'password') {
      if (!value.trim()) return 'Informe sua senha.';
      if (value.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.';
    }
    return '';
  };

  const validateForm = () => {
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);
    setFieldErrors({ email: emailError, password: passwordError });
    return !emailError && !passwordError;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setFieldErrors((prev) => ({ ...prev, email: validateField('email', value) }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setFieldErrors((prev) => ({ ...prev, password: validateField('password', value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const isValid = validateForm();
    if (!isValid) {
      toast({
        status: 'error',
        title: 'Reveja os campos',
        description: 'Corrija as informações destacadas antes de continuar.',
      });
      return;
    }

    setIsLoading(true); // Ativa o loading

    try {
      await auth.login(email, password);
      toast({
        status: 'success',
        title: 'Login realizado!',
        description: 'Bem-vindo de volta à Panda Loterias.',
      });
      // O redirecionamento é feito pelo AuthContext
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.error || 'Falha no login. Verifique seu email e senha.';
      console.error('Falha no login', err);
      setServerError(message);
      toast({
        status: 'error',
        title: 'Não foi possível entrar',
        description: message,
      });
    } finally {
      setIsLoading(false); // Desativa o loading
    }
  };

  return (
    <Center>
      <Box
        w="100%"
        maxW="420px"
        px={{ base: 6, sm: 8 }}
        py={{ base: 6, sm: 8 }}
        borderWidth={1}
        borderRadius="2xl"
        shadow="lg"
        bg="white" // Fundo branco para contrastar
        mx="auto"
      >
        <Heading
          as="h2"
          size="lg"
          textAlign="center"
          mb="6"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap="2"
        >
          <Icon as={FaPaw} color="panda.red" />
          Página de Login
        </Heading>
        
        <form onSubmit={handleSubmit}>
          {/* VStack organiza os itens verticalmente com espaçamento */}
          <VStack spacing="4">
            <InputField
              label="Email"
              error={fieldErrors.email}
              inputProps={{
                type: 'email',
                id: 'email',
                value: email,
                onChange: handleEmailChange,
              }}
            />

            <InputField
              label="Senha"
              error={fieldErrors.password}
              inputProps={{
                type: 'password',
                id: 'password',
                value: password,
                onChange: handlePasswordChange,
              }}
            />
            
            {/* Mostra o Alerta de Erro do Chakra */}
            {serverError && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {serverError}
              </Alert>
            )}
            
            <Button type="submit" isLoading={isLoading} width="full">
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
