// /src/pages/DashboardPage.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Link,
  Spinner,
  Icon,
  Button,
  SimpleGrid, // Vamos usar um Grid para os botões
} from '@chakra-ui/react';
import { FaHistory, FaListOl, FaPlus } from 'react-icons/fa'; // Adicionado FaPlus

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <VStack justify="center" h="50vh">
        <Spinner size="xl" />
        <Text>Carregando dados do usuário...</Text>
      </VStack>
    );
  }

  const formattedCredits = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(user.virtual_credits);

  return (
    // Usamos o Container aqui para "centralizar" o conteúdo do Dashboard
    <Box maxW="container.lg" mx="auto"> 

      {/* 1. SEÇÃO DE SALDO (Como na Imagem 7) */}
      <Box bg="white" p="6" borderRadius="lg" shadow="md" w="100%" mb="8">
        <Text fontSize="md" color="gray.600">Seu Saldo Atual:</Text>
        <Heading as="h3" size="2xl" color="panda.green">
          P$ {formattedCredits}
        </Heading>
      </Box>

      {/* 2. SEÇÃO DE AÇÃO PRINCIPAL (O Botão "Nova Aposta") */}
      <Box mb="8">
        <Heading as="h3" size="lg" mb="4">Nova Aposta</Heading>
        <Link as={RouterLink} to="/apostar/jogo" _hover={{ textDecoration: 'none' }}>
          <Button 
            leftIcon={<Icon as={FaPlus} />} 
            colorScheme="green"
            bg="panda.green"
            color="white"
            size="lg"
            w="100%"
            py="8" // Botão alto
          >
            Clique aqui para fazer uma nova aposta
          </Button>
        </Link>
      </Box>

      {/* 3. SEÇÃO DE NAVEGAÇÃO SECUNDÁRIA */}
      <Heading as="h3" size="lg" mb="4">Opções</Heading>
      {/* Usamos SimpleGrid para os botões ficarem responsivos */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
        <Link as={RouterLink} to="/historico" _hover={{ textDecoration: 'none' }}>
          <Button leftIcon={<Icon as={FaHistory} />} variant="outline" w="100%" py="6">
            Ver Histórico de Apostas
          </Button>
        </Link>
        <Link as={RouterLink} to="/resultados" _hover={{ textDecoration: 'none' }}>
          <Button leftIcon={<Icon as={FaListOl} />} variant="outline" w="100%" py="6">
            Ver Resultados Públicos
          </Button>
        </Link>
      </SimpleGrid>

    </Box>
  );
};

export default DashboardPage;