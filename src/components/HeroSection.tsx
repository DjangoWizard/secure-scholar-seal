import { Button } from '@/components/ui/button';
import { Shield, Lock, Award } from 'lucide-react';
import heroImage from '@/assets/hero-academic.jpg';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-background to-secondary overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-academic-primary/5 to-transparent" />
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-academic-primary">FHE-Powered</span>
                <br />
                <span className="bg-gradient-to-r from-academic-gold to-accent bg-clip-text text-transparent">
                  Academic Credentials
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Revolutionary academic credential verification using Fully Homomorphic Encryption. 
                Secure, private, and transparent scholarship applications with zero-knowledge verification.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-academic-primary hover:bg-academic-seal text-white px-8 py-4 text-lg">
                Start Application
              </Button>
              <Button variant="outline" size="lg" className="border-academic-gold text-academic-primary hover:bg-academic-gold hover:text-white px-8 py-4 text-lg">
                Learn More
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-academic-primary/10">
                  <Shield className="w-5 h-5 text-academic-primary" />
                </div>
                <span className="text-sm font-medium">FHE Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-academic-primary/10">
                  <Lock className="w-5 h-5 text-academic-primary" />
                </div>
                <span className="text-sm font-medium">Zero-Knowledge</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-academic-primary/10">
                  <Award className="w-5 h-5 text-academic-primary" />
                </div>
                <span className="text-sm font-medium">Blockchain Verified</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-academic">
              <img 
                src={heroImage} 
                alt="Academic excellence and privacy" 
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-academic-primary/20 to-transparent" />
            </div>
            
            {/* Floating envelope cards */}
            <div className="absolute -top-4 -right-4 p-4 bg-white rounded-xl shadow-envelope border border-academic-gold/20 transform rotate-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-academic-gold" />
                <span className="text-sm font-medium text-academic-primary">Sealed Application</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};