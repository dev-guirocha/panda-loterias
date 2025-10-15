// /src/components/ui/InputField.jsx
import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  FormHelperText,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';

const InputField = ({
  label,
  helperText,
  error,
  isRequired = true,
  inputProps = {},
  labelProps = {},
  leftElement,
  rightElement,
  leftElementProps = {},
  rightElementProps = {},
  inputGroupProps = {},
  children,
  ...props
}) => (
  <FormControl
    isRequired={isRequired}
    isInvalid={!!error}
    {...props}
  >
    {label && (
      <FormLabel fontWeight="600" {...labelProps}>
        {label}
      </FormLabel>
    )}

    {(leftElement || rightElement) ? (
      <InputGroup {...inputGroupProps}>
        {leftElement && (
          <InputLeftElement pointerEvents="none" {...leftElementProps}>
            {leftElement}
          </InputLeftElement>
        )}

        <Input
          borderRadius="var(--radius-base)"
          focusBorderColor="panda.green"
          pl={leftElement ? '3rem' : undefined}
          pr={rightElement ? '3rem' : undefined}
          {...inputProps}
        />

        {rightElement && (
          <InputRightElement pointerEvents="none" {...rightElementProps}>
            {rightElement}
          </InputRightElement>
        )}
      </InputGroup>
    ) : (
      <Input
        borderRadius="var(--radius-base)"
        focusBorderColor="panda.green"
        {...inputProps}
      />
    )}

    {helperText && !error && (
      <FormHelperText color="var(--color-muted)">
        {helperText}
      </FormHelperText>
    )}

    {error && (
      <FormErrorMessage>{error}</FormErrorMessage>
    )}

    {children}
  </FormControl>
);

export default InputField;
