import { useState, useEffect } from 'react';
import { createInstance, initSDK, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

export function useZamaInstance() {
  const [instance, setInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeZama = async () => {
    if (isLoading || isInitialized) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting FHE initialization...');

      // Check if ethereum provider is available
      if (!(window as any).ethereum) {
        throw new Error('Ethereum provider not found');
      }

      console.log('Ethereum provider found, initializing SDK...');
      await initSDK();
      console.log('SDK initialized successfully');

      const config = {
        ...SepoliaConfig,
        network: (window as any).ethereum
      };

      console.log('Creating FHE instance with config:', config);
      const zamaInstance = await createInstance(config);
      console.log('FHE instance created successfully');
      
      setInstance(zamaInstance);
      setIsInitialized(true);

    } catch (err: any) {
      console.error('Failed to initialize Zama instance:', err);
      setError(`Failed to initialize encryption service: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeZama();
  }, []);

  return {
    instance,
    isLoading,
    error,
    isInitialized,
    initializeZama
  };
}
