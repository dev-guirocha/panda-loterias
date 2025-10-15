// /src/pages/wizard/SelectSchedulePage.jsx
import React from 'react'; // Removemos useState e useEffect
import { useNavigate } from 'react-router-dom';
import WizardLayout from '../../components/WizardLayout';
import { Box, VStack, Text, Spinner, Flex, Icon, Divider } from '@chakra-ui/react';
import { FaClock } from 'react-icons/fa';
import { useNewBet } from '../../hooks/useNewBet';
import { useGameRules } from '../../hooks/useGameRules'; // <-- 1. IMPORTAR O "CÉREBRO" DE REGRAS

// (O componente ListItem não muda)
const ListItem = ({ text, time, onClick }) => (
  <Box as="button" w="100%" onClick={onClick} _hover={{ bg: 'gray.100' }}>
    <Flex align="center" p="4">
      <Icon as={FaClock} color="gray.500" mr="4" />
      <Text fontSize="lg" fontWeight="medium">{text}</Text>
      <Text ml="auto" color="gray.600">{time}</Text>
    </Flex>
    <Divider />
  </Box>
);

const SelectSchedulePage = () => {
  const navigate = useNavigate();
  const { betInProgress, updateBet } = useNewBet();
  
  // 2. USAR O "CÉREBRO" DE REGRAS
  const { rules, isLoading } = useGameRules();

  // 3. REMOVEMOS O 'useEffect' INTEIRO QUE CHAMAVA A API.

  const handleSelectSchedule = (schedule) => {
    updateBet('draw_schedule_id', schedule.id, schedule.name);
    navigate('/apostar/modalidade'); // Próxima página
  };
  
  if (isLoading) {
    return (
      <WizardLayout title={betInProgress.game_type_id_text || "Selecionar Sorteio"}>
        <VStack justify="center" h="50vh">
          <Spinner size="xl" />
          <Text>Carregando regras do jogo...</Text>
        </VStack>
      </WizardLayout>
    );
  }

  return (
    <WizardLayout title={betInProgress.game_type_id_text || "Selecionar Sorteio"}>
      <VStack spacing="0" align="stretch" bg="white">
        {/* 4. Usamos as regras do cérebro */}
        {rules.schedules.map(sch => (
          <ListItem 
            key={sch.id}
            text={sch.name}
            time={sch.bet_close_time.substring(0, 5)} // Mostra "11:15"
            onClick={() => handleSelectSchedule(sch)}
          />
        ))}
      </VStack>
    </WizardLayout>
  );
};

export default SelectSchedulePage;