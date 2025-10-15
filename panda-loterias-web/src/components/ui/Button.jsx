// /src/components/ui/Button.jsx
import React from 'react';
import { Button as ChakraButton } from '@chakra-ui/react';

const VARIANTS = {
  primary: {
    bg: 'panda.green',
    color: 'white',
    _hover: { bg: 'panda.green', filter: 'brightness(0.95)' },
    _active: { bg: 'panda.green', filter: 'brightness(0.9)' },
  },
  secondary: {
    bg: 'white',
    color: 'panda.green',
    borderWidth: '1px',
    borderColor: 'panda.green',
    _hover: { bg: 'panda.green', color: 'white' },
    _active: { bg: 'panda.green', color: 'white', filter: 'brightness(0.95)' },
  },
  danger: {
    bg: 'panda.red',
    color: 'white',
    _hover: { bg: 'panda.red', filter: 'brightness(0.95)' },
    _active: { bg: 'panda.red', filter: 'brightness(0.9)' },
  },
  ghost: {
    bg: 'transparent',
    color: 'panda.dark',
    _hover: { bg: 'transparent', color: 'panda.green' },
    _active: { bg: 'transparent', color: 'panda.green', opacity: 0.8 },
  },
  outline: {
    bg: 'white',
    color: 'panda.green',
    borderWidth: '1px',
    borderColor: 'panda.green',
    _hover: { bg: 'panda.green', color: 'white' },
    _active: { bg: 'panda.green', color: 'white', opacity: 0.9 },
  },
};

const Button = ({
  variant = 'primary',
  isLoading,
  children,
  ...props
}) => {
  const styleProps = VARIANTS[variant] ?? VARIANTS.primary;

  return (
    <ChakraButton
      borderRadius="var(--radius-base)"
      fontWeight="600"
      py="6"
      isLoading={isLoading}
      {...styleProps}
      {...props}
    >
      {children}
    </ChakraButton>
  );
};

export default Button;
