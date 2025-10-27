import { useState, useEffect } from 'react';

async function loadFHE() {
  try {
    // Try bundle import first
    const bundle = await import('@zama-fhe/relayer-sdk/bundle');
    return {
      createInstance: bundle.createInstance,
      initSDK: bundle.initSDK,
      SepoliaConfig: bundle.SepoliaConfig
    };
  } catch (e) {
    console.log('Bundle import failed, trying CDN fallback...');
    // Fallback to global if CDN is loaded
    if ((window as any).ZamaRelayerSDK) {
      console.log('Using CDN SDK');
      return {
        createInstance: (window as any).ZamaRelayerSDK.createInstance,
        initSDK: (window as any).ZamaRelayerSDK.initSDK,
        SepoliaConfig: (window as any).ZamaRelayerSDK.SepoliaConfig
      };
    }
    throw new Error('FHE SDK not available - neither bundle nor CDN loaded');
  }
}

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
      const fhe = await loadFHE();
      
      // Add retry logic for initSDK
      let retryCount = 0;
      const maxRetries = 3;
      let initSuccess = false;
      
      while (retryCount < maxRetries && !initSuccess) {
        try {
          console.log(`Attempting SDK initialization (${retryCount + 1}/${maxRetries})...`);
          await fhe.initSDK();
          initSuccess = true;
          console.log('SDK initialized successfully');
        } catch (initError) {
          retryCount++;
          console.error(`SDK initialization attempt ${retryCount} failed:`, initError);
          if (retryCount >= maxRetries) {
            throw initError;
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      const config = {
        ...fhe.SepoliaConfig,
        network: (window as any).ethereum
      };

      console.log('Creating FHE instance with config:', config);
      const zamaInstance = await fhe.createInstance(config);
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
