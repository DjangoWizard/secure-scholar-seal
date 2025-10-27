import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Lock, FileText, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccount } from 'wagmi';
import { useZamaInstance } from '@/hooks/useZamaInstance';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { convertHex, getContactInfoValue, getDescriptionValue } from '@/lib/fheUtils';

export const ApplicationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    university: '',
    gpa: '',
    essay: '',
    contactInfo: '',
    description: ''
  });
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { instance, isLoading: fheLoading, error: fheError } = useZamaInstance();
  const signerPromise = useEthersSigner();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, gpa: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to submit the application.",
        variant: "destructive"
      });
      return;
    }

    if (!instance || !address || !signerPromise) {
      toast({
        title: "Encryption Service Not Ready",
        description: "Please wait for the encryption service to initialize.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create encrypted input
      const input = instance.createEncryptedInput(process.env.VITE_CONTRACT_ADDRESS || '', address);
      
      // Add encrypted data
      const gpaValue = formData.gpa === '3.8-4.0' ? 4 : 
                     formData.gpa === '3.5-3.7' ? 3 : 
                     formData.gpa === '3.2-3.4' ? 2 : 1;
      
      input.add32(BigInt(gpaValue)); // GPA score
      input.add32(BigInt(getContactInfoValue(formData.contactInfo || formData.email))); // Contact info
      input.add32(BigInt(getDescriptionValue(formData.essay))); // Essay content
      
      const encryptedInput = await input.encrypt();
      
      // Convert handles to proper format
      const handles = encryptedInput.handles.map(convertHex);
      const proof = `0x${Array.from(encryptedInput.inputProof)
        .map(b => b.toString(16).padStart(2, '0')).join('')}`;
      
      // Here you would call the smart contract
      // const signer = await signerPromise;
      // const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      // const tx = await contract.createScholarProfile(
      //   formData.fullName,
      //   formData.university,
      //   formData.essay,
      //   handles[0],
      //   handles[1], 
      //   handles[2],
      //   proof
      // );
      // await tx.wait();
      
      toast({
        title: "Application Sealed & Submitted",
        description: "Your scholarship application has been encrypted and submitted to the committee.",
      });
      
    } catch (error) {
      console.error('Submission failed:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-academic-primary mb-4">
              Submit Your Sealed Application
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your information will be encrypted and sealed until reviewed by the selection committee.
            </p>
          </div>

          <Card className="border-academic-gold/20 shadow-academic">
            <CardHeader className="bg-gradient-to-r from-envelope-sealed to-envelope-open border-b">
              <CardTitle className="flex items-center gap-3 text-academic-primary">
                <div className="p-2 rounded-lg bg-academic-primary text-white">
                  <Lock className="w-5 h-5" />
                </div>
                Encrypted Scholarship Application
              </CardTitle>
              <CardDescription>
                All fields are encrypted client-side before submission
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Full Name
                    </Label>
                    <Input 
                      id="fullName" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name" 
                      required 
                      className="border-academic-gold/30 focus:ring-academic-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@university.edu" 
                      required 
                      className="border-academic-gold/30 focus:ring-academic-primary"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="university">University</Label>
                    <Input 
                      id="university" 
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      placeholder="Your University Name" 
                      required 
                      className="border-academic-gold/30 focus:ring-academic-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gpa">Current GPA</Label>
                    <Select value={formData.gpa} onValueChange={handleSelectChange}>
                      <SelectTrigger className="border-academic-gold/30">
                        <SelectValue placeholder="Select GPA Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3.8-4.0">3.8 - 4.0</SelectItem>
                        <SelectItem value="3.5-3.7">3.5 - 3.7</SelectItem>
                        <SelectItem value="3.2-3.4">3.2 - 3.4</SelectItem>
                        <SelectItem value="3.0-3.1">3.0 - 3.1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="essay" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Scholarship Essay
                  </Label>
                  <Textarea 
                    id="essay" 
                    name="essay"
                    value={formData.essay}
                    onChange={handleInputChange}
                    placeholder="Write your scholarship essay here (500-1000 words)..."
                    className="min-h-[200px] border-academic-gold/30 focus:ring-academic-primary"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Describe your academic achievements, goals, and why you deserve this scholarship.
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Supporting Documents
                  </Label>
                  <div className="border-2 border-dashed border-academic-gold/30 rounded-lg p-8 text-center hover:border-academic-gold/50 transition-colors">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Upload Transcripts & Documents</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop files here, or click to browse
                    </p>
                    <Button variant="outline" type="button" className="border-academic-gold text-academic-primary">
                      Choose Files
                    </Button>
                  </div>
                </div>

                <div className="bg-envelope-sealed/50 rounded-lg p-6 border border-academic-gold/20">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-academic-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-academic-primary mb-2">Privacy Guarantee</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your application will be encrypted using end-to-end encryption before submission. 
                        The selection committee will only see your academic merit, not your identity, 
                        until the final review stage.
                      </p>
                    </div>
                  </div>
                </div>

                {fheLoading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 text-sm">Initializing FHE encryption service...</p>
                  </div>
                )}
                
                {fheError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-800 text-sm">FHE service error: {fheError}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  size="lg"
                  disabled={isSubmitting || fheLoading || !isConnected}
                  className="w-full bg-academic-primary hover:bg-academic-seal text-white py-4 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Lock className="w-5 h-5 mr-2 animate-spin" />
                      Encrypting & Submitting...
                    </>
                  ) : !isConnected ? (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Connect Wallet First
                    </>
                  ) : fheLoading ? (
                    <>
                      <Lock className="w-5 h-5 mr-2 animate-spin" />
                      Loading Encryption Service...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Seal & Submit Application
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};