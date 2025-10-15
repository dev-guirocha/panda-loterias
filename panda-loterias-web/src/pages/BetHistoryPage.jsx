// /src/pages/BetHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Table, // O componente de Tabela do Chakra
  Thead, // Cabeçalho da Tabela
  Tbody, // Corpo da Tabela
  Tr,    // Linha
  Th,    // Célula de Cabeçalho
  Td,    // Célula de Dado
  VStack,
  Link,
  Tag,   // Para estilizar o status (WON/LOST)
  Button,
  Icon,
} from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa'; // Ícone de "Voltar"

const BetHistoryPage = () => {
  const [bets, setBets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      // (A lógica de busca não muda)
      try {
        const response = await api.get('/user/bets');
        setBets(response.data);
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        setError('Não foi possível carregar seu histórico.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Helper para estilizar o status com as Tags do Chakra
  const getStatusTag = (status) => {
    if (status === 'WON') {
      return <Tag colorScheme="green" size="md">VENCEU</Tag>;
    }
    if (status === 'LOST') {
      return <Tag colorScheme="red" size="md">PERDEU</Tag>;
    }
    return <Tag colorScheme="gray" size="md">PENDENTE</Tag>;
  };

  if (isLoading) {
    return (
      <VStack justify="center" h="50vh">
        <Spinner size="xl" />
        <Text>Carregando histórico...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Link as={RouterLink} to="/">
        <Button leftIcon={<Icon as={FaArrowLeft} />} colorScheme="gray" variant="outline" mb="6">
          Voltar ao Dashboard
        </Button>
      </Link>
      <Heading as="h2" size="lg" mb="6">Meu Histórico de Apostas</Heading>

      {/* A Tabela Chakra substitui o <table> HTML */}
      <Box bg="white" p="6" borderRadius="lg" shadow="md">
        {bets.length === 0 ? (
          <Text>Você ainda não fez nenhuma aposta.</Text>
        ) : (
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th>Data</Th>
                <Th>Sorteio</Th>
                <Th>Aposta</Th>
                <Th>Números</Th>
                <Th isNumeric>Valor</Th>
                <Th isNumeric>Prêmio</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {bets.map(bet => (
                <Tr key={bet.bet_id}>
                  <Td>{new Date(bet.draw_date).toLocaleDateString('pt-BR')}</Td>
                  <Td>{bet.draw_schedule}</Td>
                  <Td>{bet.bet_type} ({bet.prize_tier})</Td>
                  <Td>{bet.numbers_betted}</Td>
                  <Td isNumeric>P$ {Number(bet.amount_wagered).toFixed(2)}</Td>
                  <Td isNumeric>P$ {Number(bet.amount_won).toFixed(2)}</Td>
                  <Td>{getStatusTag(bet.status)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
};

export default BetHistoryPage;