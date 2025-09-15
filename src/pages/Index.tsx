import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { ApplicationForm } from '@/components/ApplicationForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ApplicationForm />
      </main>
      <footer className="bg-academic-primary text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm opacity-90">
            © 2024 Secure Scholar Seal. Revolutionizing academic credentials with FHE technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
