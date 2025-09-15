import { WalletConnect } from './WalletConnect';
import { Shield } from 'lucide-react';

export const Header = () => {
  return (
    <header className="w-full bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-academic-primary">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-academic-primary">Secure Scholar Seal</h1>
              <p className="text-sm text-muted-foreground">FHE-Powered Academic Credentials</p>
            </div>
          </div>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
};