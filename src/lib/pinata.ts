import { useState } from 'react';

// Pinata IPFS file upload utility
export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface PinataMetadata {
  name?: string;
  keyvalues?: Record<string, string>;
}

export class PinataUploader {
  private apiKey: string;
  private secretKey: string;
  private gatewayUrl: string;

  constructor(apiKey: string, secretKey: string, gatewayUrl: string = 'https://gateway.pinata.cloud') {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.gatewayUrl = gatewayUrl;
  }

  async uploadFile(file: File, metadata?: PinataMetadata): Promise<PinataResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata) {
      formData.append('pinataMetadata', JSON.stringify(metadata));
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': this.apiKey,
        'pinata_secret_api_key': this.secretKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async uploadJSON(data: any, metadata?: PinataMetadata): Promise<PinataResponse> {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': this.apiKey,
        'pinata_secret_api_key': this.secretKey,
      },
      body: JSON.stringify({
        pinataContent: data,
        pinataMetadata: metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    return await response.json();
  }

  getFileUrl(ipfsHash: string): string {
    return `${this.gatewayUrl}/ipfs/${ipfsHash}`;
  }
}

// Default Pinata configuration
export const createPinataUploader = (): PinataUploader => {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY || '';
  const secretKey = import.meta.env.VITE_PINATA_SECRET_KEY || '';
  
  if (!apiKey || !secretKey) {
    throw new Error('Pinata API keys not configured. Please set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY');
  }
  
  return new PinataUploader(apiKey, secretKey);
};

// Hook for file upload
export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = async (file: File, metadata?: PinataMetadata): Promise<string> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const uploader = createPinataUploader();
      const result = await uploader.uploadFile(file, metadata);
      return result.IpfsHash;
    } catch (error: any) {
      setUploadError(error.message);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadJSON = async (data: any, metadata?: PinataMetadata): Promise<string> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const uploader = createPinataUploader();
      const result = await uploader.uploadJSON(data, metadata);
      return result.IpfsHash;
    } catch (error: any) {
      setUploadError(error.message);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    uploadJSON,
    isUploading,
    uploadError,
  };
};
