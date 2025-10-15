// /src/pages/ResultsPage.jsx
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
  VStack,
  HStack,
  Link,
  Icon,
  List,     // Componente de Lista
  ListItem,
  ListIcon,
  Tag,
} from '@chakra-ui/react';
import { FaArrowLeft, FaTrophy } from 'react-icons/fa'; // Ícone de Troféu
import Button from '../components/ui/Button';

// (A Mini gameLogic que criamos antes)
const gameLogic = {
  getDezena: (num) => (num ? num.slice(-2) : ''),
  getGrupo: (num) => {
    if (!num || num.length < 2) return '?';
    const dezenaStr = num.slice(-2);
    if (dezenaStr === '00') return '25';
    const grupo = Math.ceil(parseInt(parseInt(dezenaStr, 10) / 4));
    return String(grupo);
  }
};

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // (A lógica de busca não muda)
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get('/draws/results');
        setResults(response.data);
      } catch (err) {
        console.error("Erro ao buscar resultados:", err);
        setError('Não foi possível carregar os resultados.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (isLoading) {
    return (
      <VStack justify="center" h="50vh">
        <Spinner size="xl" />
        <Text>Carregando resultados...</Text>
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
        <Button
          leftIcon={<Icon as={FaArrowLeft} />}
          variant="outline"
          borderColor="gray.200"
          color="panda.dark"
          bg="white"
          _hover={{ bg: 'gray.50' }}
          mb="6"
        >
          Voltar ao Dashboard
        </Button>
      </Link>
      <Heading as="h2" size="lg" mb="6">Resultados dos Sorteios (Hoje)</Heading>
      
      {/* VStack para empilhar os cards de resultado */}
      <VStack spacing="6" align="stretch">
        {results.length === 0 ? (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            Nenhum resultado publicado para hoje ainda.
          </Alert>
        ) : (
          results.map(r => (
            <Box key={r.draw_id} bg="white" p="6" borderRadius="lg" shadow="md">
              <HStack justify="space-between" mb="4">
                <Heading as="h3" size="md">{r.schedule_name}</Heading>
                <Tag>{new Date(r.draw_date).toLocaleDateString('pt-BR')} - {r.draw_time}</Tag>
              </HStack>
              
              {/* Lista estilizada dos prêmios */}
              <List spacing="3">
                <ListItem fontSize="lg">
                  <ListIcon as={FaTrophy} color="yellow.500" />
                  <strong>1º: {r.results.prize1} (Grupo {gameLogic.getGrupo(r.results.prize1)})</strong>
                </ListItem>
                <ListItem>
                  <ListIcon as={FaTrophy} color="gray.400" />
                  2º: {r.results.prize2} (Grupo {gameLogic.getGrupo(r.results.prize2)})
                </ListItem>
                <ListItem>
                  <ListIcon as={FaTrophy} color="gray.400" />
                  3º: {r.results.prize3} (Grupo {gameLogic.getGrupo(r.results.prize3)})
                </ListItem>
                <ListItem>
                  <ListIcon as={FaTrophy} color="gray.400" />
                  4º: {r.results.prize4} (Grupo {gameLogic.getGrupo(r.results.prize4)})
                </ListItem>
                <ListItem>
                  <ListIcon as={FaTrophy} color="gray.400" />
                  5º: {r.results.prize5} (Grupo {gameLogic.getGrupo(r.results.prize5)})
                </ListItem>
              </List>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default ResultsPage;
