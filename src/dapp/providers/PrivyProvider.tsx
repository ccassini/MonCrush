import React from 'react';
import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';

// Privy Configuration Constants
const PRIVY_APP_ID = 'cmeotm65602asif0denwk78mu';
const MONAD_GAMES_ID_CROSS_APP_ID = 'cmd8euall0037le0my79qpz42';

interface PrivyProviderProps {
  children: React.ReactNode;
}

export const PrivyProvider: React.FC<PrivyProviderProps> = ({ children }) => {
  return (
    <PrivyProviderBase
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark' as const,
          accentColor: '#ffd700' as const,
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets' as const,
        },
        loginMethodsAndOrder: {
          // Enable Monad Games ID support
          primary: [`privy:${MONAD_GAMES_ID_CROSS_APP_ID}`],
        },
        // Simple login methods
        loginMethods: ['wallet', 'email'] as ['wallet', 'email']
      }}
    >
      {children}
    </PrivyProviderBase>
  );
};

export default PrivyProvider;
