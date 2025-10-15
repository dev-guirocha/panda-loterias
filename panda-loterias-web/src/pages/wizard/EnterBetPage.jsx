// /src/pages/wizard/EnterBetPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WizardLayout from '../../components/WizardLayout';
import {
  Box,
  VStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  FormHelperText, // Texto de ajuda para o input
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  HStack, // Para os botões de valor
  Button,
  Divider,
} from '@chakra-ui/react';
import { useNewBet } from '../../hooks/useNewBet'; // O "cérebro" da aposta em progresso
import { useBetSlip } from '../../hooks/useBetSlip'; // O "cérebro" do CARRINHO

// Helper para dar dicas de validação
const getValidationHint = (betTypeName) => {
  if (!betTypeName) return "Digite seus números.";
  if (betTypeName.includes('GRUPO')) return "Digite os grupos (ex: '10' ou '10,15').";
  if (betTypeName.includes('DEZENA')) return "Digite dezenas de 2 dígitos (ex: '05' ou '05,60').";
  if (betTypeName.includes('CENTENA')) return "Digite centenas de 3 dígitos (ex: '123').";
  if (betTypeName.includes('MILHAR')) return "Digite milhares de 4 dígitos (ex: '4360').";
  return "Digite seus números.";
};

const EnterBetPage = () => {
  const navigate = useNavigate();
  const { betInProgress, clearBet } = useNewBet();
  const { addBet } = useBetSlip(); // Função para ADICIONAR AO CARRINHO

  // Estados locais para os inputs desta página
  const [numbersBetted, setNumbersBetted] = useState('');
  const [amountWagered, setAmountWagered] = useState('1.00'); // Default R$1
  const [error, setError] = useState('');

  const title = `${betInProgress.bet_type_id_text || 'Palpite'} - ${betInProgress.prize_tier_id_text || ''}`;
  const hint = getValidationHint(betInProgress.bet_type_id_text);

  // Botões de valor rápido (como na Imagem 3)
  const quickAddValue = (val) => {
    const current = parseFloat(amountWagered) || 0;
    setAmountWagered((current + val).toFixed(2));
  };

  // Ação final: Adicionar ao Carrinho
  const handleAddToSlip = () => {
    // 1. Validação simples
    if (!numbersBetted || parseFloat(amountWagered) <= 0) {
      setError("Por favor, preencha os números e um valor válido.");
      return;
    }

    // 2. Monta o objeto final da aposta
    const finalBet = {
      ...betInProgress, // Pega (game_id, schedule_id, bet_type_id, prize_tier_id)
      numbers_betted: numbersBetted,
      amount_wagered: parseFloat(amountWagered),
      // (Também podemos adicionar o 'text' para o carrinho)
      game_text: betInProgress.game_type_id_text,
      schedule_text: betInProgress.draw_schedule_id_text,
      bet_type_text: betInProgress.bet_type_id_text,
      prize_tier_text: betInProgress.prize_tier_id_text,
    };

    // 3. Adiciona ao "cérebro" do Carrinho
    addBet(finalBet);

    // 4. Limpa o "cérebro" da aposta em progresso
    clearBet();

    // 5. Envia o usuário para a página do Carrinho (que criaremos a seguir)
    navigate('/carrinho');
  };

  return (
    <WizardLayout title={title}>
      <VStack spacing="6" p="4" align="stretch">
        
        {/* --- 1. SEÇÃO DOS PALPITES (Imagem 6) --- */}
        <FormControl isRequired>
          <FormLabel fontSize="lg" fontWeight="bold">Digite seu palpite:</FormLabel>
          <Input
            placeholder={hint}
            value={numbersBetted}
            onChange={(e) => setNumbersBetted(e.target.value)}
            size="lg"
            autoFocus // Foca neste campo ao carregar
          />
          <FormHelperText>{hint}</FormHelperText>
        </FormControl>

        <Divider />

        {/* --- 2. SEÇÃO DO VALOR (Imagem 3) --- */}
        <FormControl isRequired>
          <FormLabel fontSize="lg" fontWeight="bold">Valor da aposta (P$):</FormLabel>
          <NumberInput
            value={amountWagered}
            onChange={(valueString) => setAmountWagered(valueString)}
            defaultValue={1}
            precision={2}
            min={0.01}
            size="lg"
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        {/* Botões de Valor Rápido */}
        <HStack spacing="4">
          <Button onClick={() => quickAddValue(5)} variant="outline" flex="1">+5</Button>
          <Button onClick={() => quickAddValue(20)} variant="outline" flex="1">+20</Button>
          <Button onClick={() => quickAddValue(50)} variant="outline" flex="1">+50</Button>
          <Button onClick={() => quickAddValue(100)} variant="outline" flex="1">+100</Button>
        </HStack>

        <Divider />
        
        {/* --- 3. AÇÃO FINAL --- */}
        {error && <Text color="panda.red">{error}</Text>}
        
        <Button
          colorScheme="green"
          bg="panda.green"
          color="white"
          size="lg"
          py="8"
          onClick={handleAddToSlip}
        >
          Adicionar Aposta ao Carrinho
        </Button>
        
      </VStack>
    </WizardLayout>
  );
};

export default EnterBetPage;