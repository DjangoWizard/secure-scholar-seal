import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { http } from 'viem';

const config = getDefaultConfig({
  appName: 'Secure Scholar Seal',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'your-walletconnect-project-id',
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_RPC_URL || 'https://sepolia.infura.io/v3/your-infura-key'),
  },
});

const queryClient = new QueryClient();

interface WalletProvidersProps {
  children: React.ReactNode;
}

export const WalletProviders = ({ children }: WalletProvidersProps) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: 'hsl(215 50% 25%)',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};