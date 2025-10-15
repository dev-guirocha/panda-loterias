// /src/pages/wizard/SelectPrizeTierPage.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WizardLayout from '../../components/WizardLayout';
import { Box, VStack, Text, Spinner, Flex, Icon, Divider, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { FaAward, FaSearch } from 'react-icons/fa'; // Ícone de Prêmio
import { useNewBet } from '../../hooks/useNewBet';
import { useGameRules } from '../../hooks/useGameRules';

// (Componente ListItem)
const ListItem = ({ text, description, onClick }) => (
  <Box as="button" w="100%" onClick={onClick} _hover={{ bg: 'gray.100' }}>
    <Flex align="center" p="4">
      <Icon as={FaAward} color="gray.500" mr="4" />
      <Box textAlign="left">
        <Text fontSize="lg" fontWeight="medium">{text}</Text>
        {description && <Text fontSize="sm" color="gray.600">{description}</Text>}
      </Box>
    </Flex>
    <Divider />
  </Box>
);

const SelectPrizeTierPage = () => {
  const navigate = useNavigate();
  const { betInProgress, updateBet } = useNewBet();
  const { rules, isLoading } = useGameRules();
  const [searchTerm, setSearchTerm] = useState('');

  // --- A LÓGICA DE FILTRO (CASCATA) ---
  const availablePrizeTiers = useMemo(() => {
    // 1. Pega o ID da modalidade que o usuário já escolheu (ex: CENTENA)
    const selectedBetTypeId = betInProgress.bet_type_id;
    if (!selectedBetTypeId) {
      // Se o usuário chegou aqui sem escolher uma modalidade, não mostre nada
      // (Isso não deve acontecer no fluxo normal)
      return [];
    }

    // 2. Filtra as 'payoutRules' para achar só as regras dessa modalidade
    const validTierIds = rules.payoutRules
      .filter(rule => rule.bet_type_id === selectedBetTypeId)
      .map(rule => rule.prize_tier_id); // Ex: [1, 2]

    // 3. Filtra a lista principal de 'prizeTiers' para mostrar só as válidas
    const validTiers = rules.prizeTiers.filter(tier => 
      validTierIds.includes(tier.id)
    );

    // 4. Aplica a barra de busca
    if (!searchTerm) {
      return validTiers; // Retorna todas as válidas
    }
    return validTiers.filter(tier =>
      tier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tier.description && tier.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  }, [betInProgress.bet_type_id, rules.payoutRules, rules.prizeTiers, searchTerm]);

  const handleSelectPrizeTier = (tier) => {
    updateBet('prize_tier_id', tier.id, tier.name);
    navigate('/apostar/palpites'); // Próxima página (inserir números)
  };
  
  if (isLoading) { /* ... (mesmo código do Spinner) ... */ }

  return (
    // O título agora é a modalidade! (Ex: "CENTENA")
    <WizardLayout title={betInProgress.bet_type_id_text || "Colocação"}>
      
      {/* Barra de Busca (como na Imagem 1) */}
      <Box p="4" bg="white">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input 
            placeholder="Buscar colocação..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </Box>

      <VStack spacing="0" align="stretch" bg="white">
        {availablePrizeTiers.map(pt => (
          <ListItem 
            key={pt.id}
            text={pt.name}
            description={pt.description}
            onClick={() => handleSelectPrizeTier(pt)}
          />
        ))}
      </VStack>
    </WizardLayout>
  );
};

export default SelectPrizeTierPage;