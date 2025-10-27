import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  EyeOff, 
  FileText, 
  GraduationCap, 
  Calendar, 
  Shield, 
  Lock, 
  Unlock,
  Download,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccount, useReadContract } from 'wagmi';
import { useZamaInstance } from '@/hooks/useZamaInstance';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import contractABI from '@/lib/contractABI.json';

interface ScholarProfile {
  profileId: string;
  academicScore: string;
  verificationLevel: string;
  reputationScore: string;
  name: string;
  institution: string;
  specialization: string;
  scholar: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastUpdated: string;
}

interface DecryptedData {
  academicScore: number;
  verificationLevel: number;
  reputationScore: number;
}

export const MyApplication = () => {
  const [profiles, setProfiles] = useState<ScholarProfile[]>([]);
  const [decryptedData, setDecryptedData] = useState<Record<string, DecryptedData>>({});
  const [isDecrypting, setIsDecrypting] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { instance, isInitialized } = useZamaInstance();
  const signerPromise = useEthersSigner();

  // Contract address - deployed to Sepolia testnet
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x7AC73d56fF5be33C2122E10a738072DB7c9FB34c';

  // Mock data for demonstration - in real app, this would come from contract events or subgraph
  const mockProfiles: ScholarProfile[] = [
    {
      profileId: "1",
      academicScore: "0x29b65c32282d32b7bc4c54c9d7d7ffb7cbd88db1df000000000000aa36a70400",
      verificationLevel: "0x0000000000000000000000000000000000000000000000000000000000000000",
      reputationScore: "0x0000000000000000000000000000000000000000000000000000000000000000",
      name: "John Smith",
      institution: "Stanford University",
      specialization: "Computer Science",
      scholar: address || "0x0000000000000000000000000000000000000000",
      isVerified: false,
      isActive: true,
      createdAt: "2025-10-27T03:02:49.666Z",
      lastUpdated: "2025-10-27T03:02:49.666Z"
    }
  ];

  // Load user's applications
  useEffect(() => {
    if (isConnected && address) {
      loadUserApplications();
    }
  }, [isConnected, address]);

  const loadUserApplications = async () => {
    setIsLoading(true);
    try {
      // In a real application, you would query the contract or use a subgraph
      // For now, we'll use mock data
      setProfiles(mockProfiles);
    } catch (error: any) {
      console.error('Failed to load applications:', error);
      toast({
        title: "Error Loading Applications",
        description: "Failed to load your scholarship applications.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const decryptProfileData = async (profileId: string) => {
    if (!instance || !address || !signerPromise || !isInitialized) {
      toast({
        title: "Decryption Service Not Ready",
        description: "Please wait for the decryption service to initialize.",
        variant: "destructive"
      });
      return;
    }

    setIsDecrypting(prev => ({ ...prev, [profileId]: true }));

    try {
      const profile = profiles.find(p => p.profileId === profileId);
      if (!profile) return;

      console.log('Starting decryption for profile:', profileId);

      // Create decryption request
      const signer = await signerPromise;
      
      // Convert hex strings to proper format for decryption
      const academicScoreBytes = profile.academicScore.startsWith('0x') 
        ? profile.academicScore.slice(2) 
        : profile.academicScore;
      
      const verificationLevelBytes = profile.verificationLevel.startsWith('0x') 
        ? profile.verificationLevel.slice(2) 
        : profile.verificationLevel;
      
      const reputationScoreBytes = profile.reputationScore.startsWith('0x') 
        ? profile.reputationScore.slice(2) 
        : profile.reputationScore;

      // Decrypt the data using FHE instance
      const decryptedAcademicScore = await instance.userDecrypt(
        CONTRACT_ADDRESS,
        address,
        `0x${academicScoreBytes}`
      );

      const decryptedVerificationLevel = await instance.userDecrypt(
        CONTRACT_ADDRESS,
        address,
        `0x${verificationLevelBytes}`
      );

      const decryptedReputationScore = await instance.userDecrypt(
        CONTRACT_ADDRESS,
        address,
        `0x${reputationScoreBytes}`
      );

      console.log('Decryption results:', {
        academicScore: decryptedAcademicScore,
        verificationLevel: decryptedVerificationLevel,
        reputationScore: decryptedReputationScore
      });

      // Store decrypted data
      setDecryptedData(prev => ({
        ...prev,
        [profileId]: {
          academicScore: Number(decryptedAcademicScore),
          verificationLevel: Number(decryptedVerificationLevel),
          reputationScore: Number(decryptedReputationScore)
        }
      }));

      toast({
        title: "Data Decrypted Successfully",
        description: "Your encrypted application data has been decrypted and is now visible.",
      });

    } catch (error: any) {
      console.error('Decryption failed:', error);
      toast({
        title: "Decryption Failed",
        description: `Failed to decrypt data: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsDecrypting(prev => ({ ...prev, [profileId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGPAFromScore = (score: number) => {
    switch (score) {
      case 4: return "3.8 - 4.0";
      case 3: return "3.5 - 3.7";
      case 2: return "3.2 - 3.4";
      case 1: return "3.0 - 3.1";
      default: return "Unknown";
    }
  };

  if (!isConnected) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-8 bg-muted rounded-lg">
              <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-muted-foreground">
                Please connect your wallet to view your scholarship applications.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="my-applications" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-academic-primary mb-4">
              My Applications
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              View and manage your scholarship applications. Decrypt sensitive data to see your encrypted academic information.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-academic-primary" />
              <p className="text-muted-foreground">Loading your applications...</p>
            </div>
          ) : profiles.length === 0 ? (
            <Card className="border-academic-gold/20 shadow-academic">
              <CardContent className="p-8 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Applications Found</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't submitted any scholarship applications yet.
                </p>
                <Button 
                  onClick={() => window.location.href = '/#application-form'}
                  className="bg-academic-primary hover:bg-academic-seal"
                >
                  Submit Application
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {profiles.map((profile) => (
                <Card key={profile.profileId} className="border-academic-gold/20 shadow-academic">
                  <CardHeader className="bg-gradient-to-r from-envelope-sealed to-envelope-open border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-3 text-academic-primary">
                          <div className="p-2 rounded-lg bg-academic-primary text-white">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          {profile.name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {profile.institution} • {profile.specialization}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={profile.isVerified ? "default" : "secondary"}>
                          {profile.isVerified ? "Verified" : "Pending"}
                        </Badge>
                        <Badge variant={profile.isActive ? "default" : "destructive"}>
                          {profile.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Public Information */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-academic-primary flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Public Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{profile.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Institution:</span>
                            <span className="font-medium">{profile.institution}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Specialization:</span>
                            <span className="font-medium">{profile.specialization}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={profile.isVerified ? "default" : "secondary"} className="text-xs">
                              {profile.isVerified ? "Verified" : "Pending Review"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Encrypted Information */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-academic-primary flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Encrypted Information
                        </h4>
                        
                        {decryptedData[profile.profileId] ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">GPA Range:</span>
                              <span className="font-medium text-green-600">
                                {getGPAFromScore(decryptedData[profile.profileId].academicScore)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Verification Level:</span>
                              <span className="font-medium">{decryptedData[profile.profileId].verificationLevel}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Reputation Score:</span>
                              <span className="font-medium">{decryptedData[profile.profileId].reputationScore}</span>
                            </div>
                            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-green-800 text-xs">
                              <div className="flex items-center gap-1">
                                <Unlock className="w-3 h-3" />
                                Data decrypted and visible
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-3 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                <Lock className="w-4 h-4" />
                                Sensitive data encrypted
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span>GPA Range:</span>
                                  <span className="font-mono">••••••</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Verification Level:</span>
                                  <span className="font-mono">••••••</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Reputation Score:</span>
                                  <span className="font-mono">••••••</span>
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => decryptProfileData(profile.profileId)}
                              disabled={isDecrypting[profile.profileId] || !isInitialized}
                              size="sm"
                              className="w-full bg-academic-primary hover:bg-academic-seal"
                            >
                              {isDecrypting[profile.profileId] ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Decrypting...
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Decrypt Data
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Application Details */}
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground">Submitted</div>
                          <div className="font-medium">{formatDate(profile.createdAt)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground">Last Updated</div>
                          <div className="font-medium">{formatDate(profile.lastUpdated)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-muted-foreground">Profile ID</div>
                          <div className="font-mono text-xs">{profile.profileId}</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Etherscan
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedProfile(
                          expandedProfile === profile.profileId ? null : profile.profileId
                        )}
                      >
                        {expandedProfile === profile.profileId ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Show Details
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Expanded Details */}
                    {expandedProfile === profile.profileId && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h5 className="font-semibold mb-2">Technical Details</h5>
                        <div className="space-y-2 text-xs font-mono">
                          <div>
                            <span className="text-muted-foreground">Academic Score Hash:</span>
                            <div className="break-all">{profile.academicScore}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Verification Level Hash:</span>
                            <div className="break-all">{profile.verificationLevel}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Reputation Score Hash:</span>
                            <div className="break-all">{profile.reputationScore}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
