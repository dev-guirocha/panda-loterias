// /src/pages/wizard/SelectGamePage.jsx
import React from 'react'; // Removemos useState e useEffect
import { useNavigate } from 'react-router-dom';
import WizardLayout from '../../components/WizardLayout';
import { Box, VStack, Text, Spinner, Flex, Icon, Divider } from '@chakra-ui/react';
import { FaClover } from 'react-icons/fa6'; // Corrigido para fa6!
import { useNewBet } from '../../hooks/useNewBet';
import { useGameRules } from '../../hooks/useGameRules'; // <-- 1. IMPORTAR O "CÉREBRO" DE REGRAS

// (O componente ListItem não muda)
const ListItem = ({ text, onClick }) => (
  <Box as="button" w="100%" onClick={onClick} _hover={{ bg: 'gray.100' }}>
    <Flex align="center" p="4">
      <Icon as={FaClover} color="panda.green" mr="4" />
      <Text fontSize="lg" fontWeight="medium">{text}</Text>
    </Flex>
    <Divider />
  </Box>
);

const SelectGamePage = () => {
  const navigate = useNavigate();
  const { updateBet } = useNewBet();
  
  // 2. USAR O "CÉREBRO" DE REGRAS
  // Não precisamos mais de 'gameTypes' ou 'isLoading' locais!
  const { rules, isLoading } = useGameRules();

  // 3. REMOVEMOS O 'useEffect' INTEIRO QUE CHAMAVA A API.

  const handleSelectGame = (game) => {
    updateBet('game_type_id', game.id, game.name);
    navigate('/apostar/sorteio');
  };
  
  if (isLoading) {
    return (
      <WizardLayout title="Nova Aposta">
        {/* Usamos o 'isLoading' global do cérebro */}
        <VStack justify="center" h="50vh">
          <Spinner size="xl" />
          <Text>Carregando regras do jogo...</Text>
        </VStack>
      </WizardLayout>
    );
  }

  return (
    <WizardLayout title="Nova Aposta">
      <VStack spacing="0" align="stretch" bg="white">
        {/* 4. Usamos as regras do cérebro */}
        {rules.gameTypes.map(game => (
          <ListItem 
            key={game.id}
            text={game.name}
            onClick={() => handleSelectGame(game)}
          />
        ))}
      </VStack>
    </WizardLayout>
  );
};

export default SelectGamePage;