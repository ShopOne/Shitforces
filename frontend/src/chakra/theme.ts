// export theme and use it in <ChakraProvider theme={theme}>
// https://chakra-ui.com/docs/features/color-mode

// 1. import `extendTheme` function
import { extendTheme } from '@chakra-ui/react';

// 2. Add your color mode config
const config = {
  initialColorMode: 'light',
  cssVarPrefix: 'ck',
};

const styles = {
  global: {
    body: {
      // workaround for override, just adding same value as src/index.css.
      bg: '#f5f5f5',
      color: 'gray.800',
      fontFamily: `-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif`,
    },
  },
};
// 3. extend the theme
export const theme = extendTheme({ config, styles });
