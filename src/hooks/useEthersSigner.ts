import { useAccount, useWalletClient } from 'wagmi';
import { useEffect, useState } from 'react';

export function useEthersSigner() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [signerPromise, setSignerPromise] = useState<Promise<any> | null>(null);

  useEffect(() => {
    if (isConnected && walletClient) {
      const getSigner = async () => {
        try {
          // Convert viem walletClient to ethers signer
          const { createWalletClient, http } = await import('viem');
          const { privateKeyToAccount } = await import('viem/accounts');
          
          // For demo purposes, we'll use a mock signer
          // In production, you'd need to properly convert the walletClient
          return {
            getAddress: () => address,
            signMessage: async (message: string) => {
              return await walletClient.signMessage({
                account: address as `0x${string}`,
                message: message as `0x${string}`
              });
            },
            signTypedData: async (domain: any, types: any, value: any) => {
              return await walletClient.signTypedData({
                account: address as `0x${string}`,
                domain,
                types,
                primaryType: 'UserDecryptRequestVerification',
                message: value
              });
            }
          };
        } catch (error) {
          console.error('Failed to create signer:', error);
          throw error;
        }
      };
      
      setSignerPromise(getSigner());
    } else {
      setSignerPromise(null);
    }
  }, [isConnected, walletClient, address]);

  return signerPromise;
}
