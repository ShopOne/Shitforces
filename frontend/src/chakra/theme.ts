// export theme and use it in <ChakraProvider theme={theme}>
// https://chakra-ui.com/docs/features/color-mode

// 1. import `extendTheme` function
import { extendTheme } from '@chakra-ui/react';

// 2. Add your color mode config
const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
  cssVarPrefix: 'ck',
};

const styles = {
  global: {
    // workaround for color-mode override by system-dark/light.

    body: {
      bg: 'white',
      color: 'gray.800',
    },
  },
};
// 3. extend the theme
export const theme = extendTheme({ config, styles });
