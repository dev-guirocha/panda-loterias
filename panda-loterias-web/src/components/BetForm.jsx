// /src/components/BetForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/api';
import { useAuth } from '../hooks/useAuth';
import {
  Box,
  FormControl,
  FormLabel,
  Select, // Substitui o <select>
  SimpleGrid, // Cria um grid responsivo
  VStack,
  NumberInput, // Para o campo de valor
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  Spinner,
  Text,
  HStack,
} from '@chakra-ui/react';
import Button from './ui/Button';
import InputField from './ui/InputField';

const BetForm = () => {
  // --- (Estados para as regras, não mudou) ---
  const [rules, setRules] = useState({
    schedules: [],
    betTypes: [],
    prizeTiers: [],
    payoutRules: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // --- (Estados de seleção, não mudou) ---
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [selectedBetType, setSelectedBetType] = useState('');
  const [selectedPrizeTier, setSelectedPrizeTier] = useState('');
  const [numbersBetted, setNumbersBetted] = useState('');
  const [amountWagered, setAmountWagered] = useState('1.00'); // Default para R$1

  // --- (Estados de feedback, não mudou) ---
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Para o loading do botão
  
  const { refreshUser } = useAuth();


  // --- (useEffect para buscar regras, não mudou) ---
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await api.get('/game/rules');
        setRules(response.data);
      } catch (err) {
        console.error("Erro ao buscar regras:", err);
        setError("Não foi possível carregar as regras do jogo.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRules();
  }, []);

  // --- (useMemo para lógica cascata, não mudou) ---
  const availableBetTypes = useMemo(() => {
    return rules.betTypes;
  }, [rules.betTypes]);
  
  const availablePrizeTiers = useMemo(() => {
    if (!selectedBetType) return [];
    const betTypeId = rules.betTypes.find(bt => bt.id === parseInt(selectedBetType))?.id;
    if (!betTypeId) return [];
    const validTierIds = rules.payoutRules
      .filter(rule => rule.bet_type_id === betTypeId)
      .map(rule => rule.prize_tier_id);
    return rules.prizeTiers.filter(tier => validTierIds.includes(tier.id));
  }, [selectedBetType, rules.betTypes, rules.prizeTiers, rules.payoutRules]);


  // --- (Função de Envio, levemente alterada) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true); // Ativa o loading

    try {
      const numbersList = numbersBetted
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value !== '');

      const betPayload = {
        game_type_id: 1,
        draw_schedule_id: parseInt(selectedSchedule),
        bet_type_id: parseInt(selectedBetType),
        prize_tier_id: parseInt(selectedPrizeTier),
        numbers_betted: numbersList,
        amount_wagered: parseFloat(amountWagered),
      };

      const response = await api.post('/bets', betPayload);
      
      setSuccess(`Aposta (ID: ${response.data.bet.id}) realizada com sucesso!`);
      refreshUser(); // Atualiza o saldo!
      
      // Limpar o formulário (menos o valor)
      setNumbersBetted('');
      setSelectedBetType('');
      setSelectedPrizeTier('');
      setSelectedSchedule('');

    } catch (err) {
      console.error("Erro ao fazer aposta:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Erro desconhecido ao realizar aposta.");
      }
    } finally {
      setIsSubmitting(false); // Desativa o loading
    }
  };

  // --- 7. O Render (JSX) ---
  if (isLoading) {
    return (
      <HStack>
        <Spinner size="md" />
        <Text>Carregando regras de apostas...</Text>
      </HStack>
    );
  }

  return (
    <Box as="form" onSubmit={handleSubmit} bg="white" p="6" borderRadius="lg" shadow="md">
      <VStack spacing="6">
        {/* Usamos SimpleGrid para deixar responsivo (2 colunas em desktop, 1 em celular) */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing="6" width="100%">
          <FormControl isRequired>
            <FormLabel>Horário:</FormLabel>
            <Select 
              placeholder="Selecione um horário" 
              value={selectedSchedule} 
              onChange={(e) => setSelectedSchedule(e.target.value)}
            >
              {rules.schedules.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.draw_time})
                </option>
              ))}
            </Select>
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Modalidade:</FormLabel>
            <Select 
              placeholder="Selecione a modalidade" 
              value={selectedBetType} 
              onChange={(e) => {
                setSelectedBetType(e.target.value);
                setSelectedPrizeTier(''); // Reseta a condição ao mudar a modalidade
              }}
            >
              {availableBetTypes.map(bt => (
                <option key={bt.id} value={bt.id}>{bt.name}</option>
              ))}
            </Select>
          </FormControl>
          
          <FormControl isRequired isDisabled={!selectedBetType}>
            <FormLabel>Condição:</FormLabel>
            <Select 
              placeholder="Selecione a condição"
              value={selectedPrizeTier} 
              onChange={(e) => setSelectedPrizeTier(e.target.value)}
            >
              {availablePrizeTiers.map(pt => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing="6" width="100%">
          <InputField
            label='Números (ex: "15" ou "10,15"):'
            helperText='Separe múltiplos palpites com vírgula.'
            inputProps={{
              value: numbersBetted,
              onChange: (e) => setNumbersBetted(e.target.value),
              placeholder: 'Ex: 15',
            }}
          />
          
          <FormControl isRequired>
            <FormLabel>Valor (P$):</FormLabel>
            <NumberInput
              value={amountWagered}
              onChange={(valueString) => setAmountWagered(valueString)}
              defaultValue={1}
              precision={2}
              min={0.01}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </SimpleGrid>

        {/* Feedback e Botão */}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}
        {success && (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            {success}
          </Alert>
        )}
        
        <Button type="submit" width="full" isLoading={isSubmitting}>
          Apostar!
        </Button>
      </VStack>
    </Box>
  );
};

export default BetForm;
