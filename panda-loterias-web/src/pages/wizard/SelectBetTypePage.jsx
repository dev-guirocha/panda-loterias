// /src/pages/wizard/SelectBetTypePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import WizardLayout from '../../components/WizardLayout';
import { Box, VStack, Text, Spinner, Flex, Icon, Divider, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { FaTag, FaSearch } from 'react-icons/fa'; // Ícone de Etiqueta
import { useNewBet } from '../../hooks/useNewBet';
import { useGameRules } from '../../hooks/useGameRules';
import { useMemo, useState } from 'react'; // Para a barra de busca

// (Componente ListItem)
const ListItem = ({ text, onClick }) => (
  <Box as="button" w="100%" onClick={onClick} _hover={{ bg: 'gray.100' }}>
    <Flex align="center" p="4">
      <Icon as={FaTag} color="gray.500" mr="4" />
      <Text fontSize="lg" fontWeight="medium">{text}</Text>
    </Flex>
    <Divider />
  </Box>
);

const SelectBetTypePage = () => {
  const navigate = useNavigate();
  const { betInProgress, updateBet } = useNewBet();
  const { rules, isLoading } = useGameRules();
  
  // Estado para a barra de busca (como na Imagem 2)
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra as modalidades com base na busca
  const filteredBetTypes = useMemo(() => {
    if (!searchTerm) {
      return rules.betTypes; // Se não há busca, mostra tudo
    }
    return rules.betTypes.filter(bt => 
      bt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, rules.betTypes]);

  const handleSelectBetType = (betType) => {
    updateBet('bet_type_id', betType.id, betType.name);
    navigate('/apostar/colocacao'); // Próxima página
  };
  
  if (isLoading) { /* ... (mesmo código do Spinner) ... */ }

  return (
    // O título agora é o nome do sorteio! (Ex: "PTM")
    <WizardLayout title={betInProgress.draw_schedule_id_text || "Modalidade"}>
      
      {/* Barra de Busca (como na Imagem 2) */}
      <Box p="4" bg="white">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input 
            placeholder="Buscar modalidade..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </Box>

      <VStack spacing="0" align="stretch" bg="white">
        {filteredBetTypes.map(bt => (
          <ListItem 
            key={bt.id}
            text={bt.name}
            onClick={() => handleSelectBetType(bt)}
          />
        ))}
      </VStack>
    </WizardLayout>
  );
};

export default SelectBetTypePage;