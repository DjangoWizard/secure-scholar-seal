import { WalletConnect } from './WalletConnect';
import { Shield, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => scrollToSection('application-form')}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Submit Application
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection('my-applications')}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                My Applications
              </Button>
            </nav>
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
};