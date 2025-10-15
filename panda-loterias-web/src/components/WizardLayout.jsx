// /src/components/WizardLayout.jsx
import React from 'react';
import { Box, Flex, Heading, Icon } from '@chakra-ui/react';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useBetSlip } from '../hooks/useBetSlip'; // Para o ícone do carrinho

// Este layout será o "frame" para todas as telas de aposta
const WizardLayout = ({ title, children }) => {
  const navigate = useNavigate();
  const { betCount } = useBetSlip(); // Pega a contagem de itens no carrinho

  return (
    <Box>
      {/* 1. O Header (Verde-limão) */}
      <Box bg="#cddc39" p="4" shadow="md"> {/* Cor aproximada da inspiração */}
        <Flex align="center" justify="space-between" maxW="container.xl" mx="auto">
          <Flex align="center">
            <Icon
              as={FaArrowLeft}
              boxSize="6"
              mr="4"
              cursor="pointer"
              onClick={() => navigate(-1)} // -1 = Voltar para a página anterior
            />
            <Heading as="h2" size="md" color="blackAlpha.800">
              {title}
            </Heading>
          </Flex>

          {/* Ícone do Carrinho (opcional, mas legal) */}
          <Flex as="button" onClick={() => navigate('/carrinho')} position="relative">
            <Icon as={FaShoppingCart} boxSize="6" />
            {betCount > 0 && (
              <Box
                as="span"
                position="absolute"
                top="-1"
                right="-2"
                bg="panda.red"
                color="white"
                borderRadius="full"
                fontSize="xs"
                boxSize="5"
                textAlign="center"
                lineHeight="5"
              >
                {betCount}
              </Box>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* 2. O Conteúdo da Página (em layout "fluido") */}
      <Box pt="4">
        {/* O conteúdo (lista de jogos, lista de modalidades, etc.) entra aqui */}
        {children}
      </Box>
    </Box>
  );
};

export default WizardLayout;
