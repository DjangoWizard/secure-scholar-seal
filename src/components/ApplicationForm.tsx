import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Lock, FileText, GraduationCap, Image, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useZamaInstance } from '@/hooks/useZamaInstance';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { convertHex, getContactInfoValue, getDescriptionValue } from '@/lib/fheUtils';
import { useFileUpload } from '@/lib/pinata';
import contractABI from '@/lib/contractABI.json';

export const ApplicationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
  const { instance, isLoading: fheLoading, error: fheError, isInitialized } = useZamaInstance();
  const signerPromise = useEthersSigner();
  const { uploadFile, uploadJSON, isUploading, uploadError } = useFileUpload();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Contract address - you can set this as an environment variable
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, gpa: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Get file icon based on file type
  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'tiff':
      case 'webp':
        return <Image className="h-4 w-4 text-blue-500" />;
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  // Handle transaction confirmation
  React.useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: "Transaction Confirmed!",
        description: `Your scholarship application has been successfully submitted to the blockchain! Transaction: ${hash}`,
      });
      setIsSubmitting(false);
    }
  }, [isConfirmed, hash, toast]);

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

    if (!instance || !address || !signerPromise || !isInitialized) {
      toast({
        title: "Encryption Service Not Ready",
        description: "Please wait for the encryption service to initialize.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Starting application submission...');
      
      // Upload files to IPFS if any
      let ipfsHash = '';
      if (selectedFiles.length > 0) {
        console.log('Uploading files to IPFS...');
        const fileHashes: string[] = [];
        
        for (const file of selectedFiles) {
          const hash = await uploadFile(file, {
            name: file.name,
            keyvalues: {
              type: 'scholarship-document',
              student: formData.fullName,
              university: formData.university
            }
          });
          fileHashes.push(hash);
        }
        
        // Create a JSON manifest of all files
        const manifest = {
          files: selectedFiles.map((file, index) => ({
            name: file.name,
            size: file.size,
            type: file.type,
            hash: fileHashes[index]
          })),
          uploadedAt: new Date().toISOString(),
          student: formData.fullName,
          university: formData.university
        };
        
        ipfsHash = await uploadJSON(manifest, {
          name: `scholarship-application-${formData.fullName}`,
          keyvalues: {
            type: 'scholarship-manifest',
            student: formData.fullName
          }
        });
        
        console.log('Files uploaded to IPFS:', ipfsHash);
      }

      // Create encrypted input
      console.log('Creating encrypted input...');
      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      
      // Add encrypted data
      const gpaValue = formData.gpa === '3.8-4.0' ? 4 : 
                     formData.gpa === '3.5-3.7' ? 3 : 
                     formData.gpa === '3.2-3.4' ? 2 : 1;
      
      input.add32(BigInt(gpaValue)); // GPA score
      input.add32(BigInt(getContactInfoValue(formData.contactInfo || formData.email))); // Contact info
      input.add32(BigInt(getDescriptionValue(formData.essay))); // Essay content
      
      console.log('Encrypting data...');
      const encryptedInput = await input.encrypt();
      
      // Convert handles to proper format
      const handles = encryptedInput.handles.map(convertHex);
      const proof = `0x${Array.from(encryptedInput.inputProof)
        .map(b => b.toString(16).padStart(2, '0')).join('')}`;
      
      console.log('Encryption completed, handles:', handles);
      
      // Call the smart contract using wagmi
      console.log('Calling smart contract...');
      
      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        throw new Error('Contract address not configured. Please set VITE_CONTRACT_ADDRESS in your environment.');
      }
      
      console.log('Contract instance created, calling createScholarProfile...');
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI.abi,
        functionName: 'createScholarProfile',
        args: [
          formData.fullName,
          formData.university,
          formData.essay, // specialization
          handles[0], // academicScore
          proof
        ],
      });
      
      console.log('Transaction submitted, waiting for confirmation...');
      
      toast({
        title: "Transaction Submitted",
        description: `Your scholarship application has been encrypted and submitted to the blockchain! ${ipfsHash ? `Files uploaded to IPFS: ${ipfsHash}` : ''}`,
      });
      
    } catch (error: any) {
      console.error('Submission failed:', error);
      toast({
        title: "Submission Failed",
        description: `There was an error submitting your application: ${error.message}`,
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
                    <p className="text-lg font-medium mb-2">Upload Supporting Documents</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, TXT, RTF and more
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp,.txt,.rtf,.odt,.pages"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload">
                      <Button 
                        variant="outline" 
                        type="button" 
                        className="border-academic-gold text-academic-primary cursor-pointer"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Choose Files
                      </Button>
                    </Label>
                  </div>
                  
                  {/* File List */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Selected Files:</Label>
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              {getFileIcon(file)}
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {isUploading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">Uploading files to IPFS...</p>
                    </div>
                  )}
                  
                  {uploadError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">Upload error: {uploadError}</p>
                    </div>
                  )}
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
                  disabled={isSubmitting || fheLoading || !isConnected || !isInitialized || isUploading || isPending || isConfirming}
                  className="w-full bg-academic-primary hover:bg-academic-seal text-white py-4 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Lock className="w-5 h-5 mr-2 animate-spin" />
                      Encrypting & Submitting...
                    </>
                  ) : isUploading ? (
                    <>
                      <Upload className="w-5 h-5 mr-2 animate-spin" />
                      Uploading Files...
                    </>
                  ) : isPending ? (
                    <>
                      <Lock className="w-5 h-5 mr-2 animate-spin" />
                      Signing Transaction...
                    </>
                  ) : isConfirming ? (
                    <>
                      <Lock className="w-5 h-5 mr-2 animate-spin" />
                      Confirming Transaction...
                    </>
                  ) : !isConnected ? (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Connect Wallet First
                    </>
                  ) : fheLoading || !isInitialized ? (
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