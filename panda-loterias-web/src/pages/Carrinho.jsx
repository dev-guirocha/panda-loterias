// /src/pages/Carrinho.jsx
import React, { useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Stack,
  Divider,
  Badge,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaShoppingCart, FaPlus } from 'react-icons/fa';
import Button from '../components/ui/Button';
import { useBetSlip } from '../hooks/useBetSlip';
import { useAuth } from '../hooks/useAuth';
import api from '../api/api';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
};

const Carrinho = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { bets, removeBet, clearSlip } = useBetSlip();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = useMemo(
    () => bets.reduce((sum, bet) => sum + Number(bet.amount_wagered || 0), 0),
    [bets]
  );

  const handleRemove = (betId) => {
    removeBet(betId);
    toast({
      status: 'info',
      title: 'Aposta removida',
      description: 'O item foi retirado do carrinho.',
    });
  };

  const handleClear = () => {
    clearSlip();
    toast({
      status: 'info',
      title: 'Carrinho limpo',
      description: 'Todos os itens foram removidos.',
    });
  };

  const handleFinalize = async () => {
    if (!bets.length) {
      toast({ status: 'warning', title: 'Carrinho vazio', description: 'Adicione apostas antes de finalizar.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = bets.map((bet) => ({
        game_type_id: bet.game_type_id,
        bet_type_id: bet.bet_type_id,
        prize_tier_id: bet.prize_tier_id,
        draw_schedule_id: bet.draw_schedule_id,
        numbers_betted: bet.numbers_betted,
        amount_wagered: bet.amount_wagered,
      }));

      await api.post('/bets/slip', payload);

      toast({ status: 'success', title: 'Apostas enviadas!', description: 'Seu carrinho foi processado com sucesso.' });
      clearSlip();
      refreshUser?.();
      navigate('/historico');
    } catch (error) {
      console.error('Erro ao finalizar apostas:', error);
      const message = error?.response?.data?.message || error?.response?.data?.error || 'Não foi possível finalizar as apostas.';
      toast({ status: 'error', title: 'Falha ao finalizar', description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box bg="white" borderRadius="2xl" shadow="lg" p={{ base: 6, md: 8 }}>
      <HStack justify="space-between" mb={6} spacing={4}>
        <HStack spacing={3}>
          <Icon as={FaShoppingCart} boxSize={7} color="panda.green" />
          <Heading as="h2" size="lg" color="panda.dark">
            Seu Carrinho de Apostas
          </Heading>
        </HStack>
        <Badge colorScheme={bets.length ? 'green' : 'gray'} borderRadius="full" px={3} py={1}>
          {bets.length} {bets.length === 1 ? 'aposta' : 'apostas'}
        </Badge>
      </HStack>

      {!bets.length ? (
        <VStack spacing={6} py={10} textAlign="center">
          <Text fontSize="lg" color="gray.600">
            Seu carrinho está vazio. Que tal começar uma nova aposta?
          </Text>
          <Button
            leftIcon={<Icon as={FaPlus} />}
            onClick={() => navigate('/apostar/jogo')}
          >
            Iniciar nova aposta
          </Button>
        </VStack>
      ) : (
        <Stack spacing={6}>
          <VStack spacing={4} align="stretch">
            {bets.map((bet) => (
              <Box key={bet.id} borderWidth={1} borderRadius="lg" p={4} borderColor="gray.200">
                <HStack justify="space-between" align="start" mb={3}>
                  <VStack spacing={1} align="flex-start">
                    <Text fontWeight="600" color="panda.dark">
                      {bet.game_text || 'Modalidade'} • {bet.schedule_text || 'Sorteio'}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {bet.bet_type_text} • {bet.prize_tier_text}
                    </Text>
                  </VStack>
                  <Badge colorScheme="green">{formatCurrency(bet.amount_wagered)}</Badge>
                </HStack>
                <Text fontSize="sm" color="gray.700">
                  Palpites: {Array.isArray(bet.numbers_betted) ? bet.numbers_betted.join(', ') : bet.numbers_betted}
                </Text>

                <Button
                  mt={4}
                  variant="ghost"
                  leftIcon={<Icon as={FaTrashAlt} />}
                  onClick={() => handleRemove(bet.id)}
                >
                  Remover aposta
                </Button>
              </Box>
            ))}
          </VStack>

          <Divider />

          <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" spacing={4}>
            <Text fontWeight="700" fontSize="lg">
              Total: {formatCurrency(totalAmount)}
            </Text>

            <HStack spacing={3} w={{ base: '100%', md: 'auto' }}>
              <Button
                variant="outline"
                onClick={handleClear}
                w={{ base: '50%', md: 'auto' }}
                disabled={!bets.length}
              >
                Limpar carrinho
              </Button>
              <Button
                onClick={handleFinalize}
                isLoading={isSubmitting}
                w={{ base: '50%', md: 'auto' }}
              >
                Finalizar apostas
              </Button>
            </HStack>
          </Stack>
        </Stack>
      )}
    </Box>
  );
};

export default Carrinho;
