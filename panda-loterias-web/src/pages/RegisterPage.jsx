// /src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Alert,
  AlertIcon,
  VStack,
  Link,
  Center,
  Icon,
  useToast,
} from '@chakra-ui/react';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import { FaPaw } from 'react-icons/fa';

const RegisterPage = () => {
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (field, value) => {
    if (field === 'name') {
      if (!value.trim()) return 'Informe seu nome.';
      if (value.trim().length < 3) return 'O nome precisa ter pelo menos 3 caracteres.';
    }
    if (field === 'email') {
      if (!value.trim()) return 'Informe seu email.';
      if (!emailRegex.test(value)) return 'Forneça um email válido.';
    }
    if (field === 'password') {
      if (!value.trim()) return 'Informe uma senha.';
      if (value.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.';
      if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value)) {
        return 'A senha deve conter letras maiúsculas, minúsculas e números.';
      }
    }
    return '';
  };

  const validateForm = () => {
    const nameError = validateField('name', name);
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);
    setFieldErrors({ name: nameError, email: emailError, password: passwordError });
    return !nameError && !emailError && !passwordError;
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setFieldErrors((prev) => ({ ...prev, name: validateField('name', value) }));
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
        title: 'Revise o formulário',
        description: 'Corrija os campos destacados antes de prosseguir.',
      });
      return;
    }

    setIsLoading(true);

    try {
      await auth.register(name, email, password);
      toast({
        status: 'success',
        title: 'Cadastro realizado!',
        description: 'Sua conta foi criada e você já está logado.',
      });
      // Redirecionamento feito pelo AuthContext
    } catch (err) {
      console.error('Falha no registro', err);
      const message = err?.response?.data?.message || err?.response?.data?.error || 'Falha no registro.';
      const details = err?.response?.data?.details;
      setServerError(details ? details.join(' ') : message);
      toast({
        status: 'error',
        title: 'Não foi possível concluir o cadastro',
        description: details ? details.join(' ') : message,
      });
    } finally {
      setIsLoading(false);
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
        bg="white"
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
          <Icon as={FaPaw} color="panda.green" />
          Página de Registro
        </Heading>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing="4">
            <InputField
              label="Nome"
              error={fieldErrors.name}
              inputProps={{
                type: 'text',
                id: 'name',
                value: name,
                onChange: handleNameChange,
              }}
            />
            
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
              helperText="Use letras maiúsculas, minúsculas e números."
              error={fieldErrors.password}
              inputProps={{
                type: 'password',
                id: 'password',
                value: password,
                onChange: handlePasswordChange,
              }}
            />
            
            {serverError && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {serverError}
              </Alert>
            )}
            
            <Button type="submit" isLoading={isLoading} width="full">
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
