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
  projectId: '2ec9743d0d0cd7fb94dee1a7e6d33475', // WalletConnect Project ID
  chains: [sepolia],
  transports: {
    [sepolia.id]: http('https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990'),
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