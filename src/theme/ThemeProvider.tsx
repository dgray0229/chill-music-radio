import React from 'react';
import { ThemeProvider } from '@shopify/restyle';

import theme from './index';

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
