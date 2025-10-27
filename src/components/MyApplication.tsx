import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useZamaInstance } from '@/hooks/useZamaInstance';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, Unlock, FileText, GraduationCap, ExternalLink, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import contractABI from '@/lib/contractABI.json';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface ScholarProfile {
  profileId: string;
  academicScore: string; // Encrypted bytes32
  verificationLevel: string; // Encrypted bytes32
  reputationScore: string; // Encrypted bytes32
  isVerified: boolean;
  isActive: boolean;
  name: string;
  institution: string;
  specialization: string;
  scholar: string;
  createdAt: string;
  lastUpdated: string;
}

interface DecryptedData {
  academicScore?: number;
  verificationLevel?: number;
  reputationScore?: number;
}

export const MyApplication = () => {
  const { address, isConnected } = useAccount();
  const { instance, isLoading: fheLoading, error: fheError, isInitialized } = useZamaInstance();
  const signerPromise = useEthersSigner();
  const { toast } = useToast();

  const [decryptedData, setDecryptedData] = useState<Record<string, DecryptedData>>({});
  const [isDecrypting, setIsDecrypting] = useState<Record<string, boolean>>({});
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null);

  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x4a1390b602B658f5800530A54f3e3d8c67D3bc1F';

  // Read profile IDs for the current user
  const { data: profileIds, isLoading: isLoadingProfileIds, error: profileIdsError } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: contractABI.abi,
    functionName: 'getProfileIdsByScholar',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read profile count (for display, if needed)
  const { data: profileCount } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: contractABI.abi,
    functionName: 'getProfileCount',
    query: {
      enabled: !!CONTRACT_ADDRESS,
    },
  });

  // Debug logging for profile IDs
  useEffect(() => {
    console.log('Profile IDs query result:', {
      profileIds,
      isLoadingProfileIds,
      profileIdsError,
      address,
      isConnected,
      contractAddress: CONTRACT_ADDRESS
    });
  }, [profileIds, isLoadingProfileIds, profileIdsError, address, isConnected, CONTRACT_ADDRESS]);

  // Process profiles from profileIds - we'll fetch data manually
  const [profiles, setProfiles] = useState<ScholarProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [hasProfileErrors, setHasProfileErrors] = useState(false);

  // Load profile data when profileIds change
  useEffect(() => {
    const loadProfiles = async () => {
      if (!profileIds || profileIds.length === 0) {
        setProfiles([]);
        return;
      }

      setIsLoadingProfiles(true);
      setHasProfileErrors(false);
      
      try {
        // Use wagmi's readContract action directly
        const { readContract } = await import('wagmi/actions');
        const { getConfig } = await import('wagmi');
        const config = getConfig();
        
        const profilePromises = profileIds.map(async (profileId: bigint) => {
          try {
            const profileData = await readContract(config, {
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: contractABI.abi,
              functionName: 'getScholarEncryptedData',
              args: [profileId],
            });
            console.log(`Profile data for ID ${profileId}:`, profileData);
            
            return {
              profileId: profileId.toString(),
              academicScore: profileData.academicScore,
              verificationLevel: profileData.verificationLevel,
              reputationScore: profileData.reputationScore,
              isVerified: profileData.isVerified,
              isActive: profileData.isActive,
              name: profileData.name,
              institution: profileData.institution,
              specialization: profileData.specialization,
              scholar: profileData.scholar,
              createdAt: new Date(Number(profileData.createdAt) * 1000).toLocaleString(),
              lastUpdated: new Date(Number(profileData.lastUpdated) * 1000).toLocaleString(),
            };
          } catch (error) {
            console.error(`Could not fetch profile ${profileId}:`, error);
            setHasProfileErrors(true);
            return null;
          }
        });

        const results = await Promise.all(profilePromises);
        const validProfiles = results.filter((profile): profile is ScholarProfile => profile !== null);
        
        console.log('Processed profiles from contract:', validProfiles);
        setProfiles(validProfiles);
      } catch (error) {
        console.error('Error loading profiles:', error);
        setHasProfileErrors(true);
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    loadProfiles();
  }, [profileIds, CONTRACT_ADDRESS]);


  const decryptProfileData = async (profile: ScholarProfile) => {
    if (!instance || !address || !signerPromise || !isInitialized) {
      toast({
        title: "Encryption Service Not Ready",
        description: "Please wait for the encryption service to initialize.",
        variant: "destructive"
      });
      return;
    }

    setIsDecrypting(prev => ({ ...prev, [profile.profileId]: true }));
    try {
      const signer = await signerPromise;
      if (!signer) {
        throw new Error("Signer not available for decryption.");
      }

      // Decrypt academicScore
      const decryptedAcademicScore = await instance.userDecrypt(
        CONTRACT_ADDRESS,
        address,
        profile.academicScore
      );

      // Decrypt verificationLevel
      const decryptedVerificationLevel = await instance.userDecrypt(
        CONTRACT_ADDRESS,
        address,
        profile.verificationLevel
      );

      // Decrypt reputationScore
      const decryptedReputationScore = await instance.userDecrypt(
        CONTRACT_ADDRESS,
        address,
        profile.reputationScore
      );

      setDecryptedData(prev => ({
        ...prev,
        [profile.profileId]: {
          academicScore: Number(decryptedAcademicScore),
          verificationLevel: Number(decryptedVerificationLevel),
          reputationScore: Number(decryptedReputationScore),
        }
      }));

      toast({
        title: "Decryption Successful",
        description: `Sensitive data for application ${profile.profileId} has been decrypted.`,
      });

    } catch (err: any) {
      console.error("Decryption failed:", err);
      toast({
        title: "Decryption Failed",
        description: `Failed to decrypt data for application ${profile.profileId}: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsDecrypting(prev => ({ ...prev, [profile.profileId]: false }));
    }
  };

  const getGpaRange = (score: number | undefined) => {
    if (score === undefined) return 'N/A';
    if (score === 4) return '3.8 - 4.0';
    if (score === 3) return '3.5 - 3.7';
    if (score === 2) return '3.2 - 3.4';
    if (score === 1) return '3.0 - 3.1';
    return 'Unknown';
  };

  if (!isConnected) {
    return (
      <section id="my-applications" className="py-16 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <Card className="border-academic-gold/20 shadow-academic">
              <CardHeader className="bg-gradient-to-r from-envelope-sealed to-envelope-open border-b">
                <CardTitle className="flex items-center gap-3 text-academic-primary">
                  <div className="p-2 rounded-lg bg-academic-primary text-white">
                    <User className="w-5 h-5" />
                  </div>
                  My Applications
                </CardTitle>
                <CardDescription>
                  Connect your wallet to view your submitted scholarship applications.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Please connect your wallet to view your applications.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  if (fheLoading || isLoadingProfileIds || isLoadingProfiles) {
    return (
      <section id="my-applications" className="py-16 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <Card className="border-academic-gold/20 shadow-academic">
              <CardHeader className="bg-gradient-to-r from-envelope-sealed to-envelope-open border-b">
                <CardTitle className="flex items-center gap-3 text-academic-primary">
                  <div className="p-2 rounded-lg bg-academic-primary text-white">
                    <User className="w-5 h-5" />
                  </div>
                  My Applications
                </CardTitle>
                <CardDescription>
                  Loading your submitted scholarship applications...
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-academic-primary mx-auto" />
                <p className="text-muted-foreground mt-4">Loading applications and encryption service...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  if (fheError || profileIdsError || hasProfileErrors) {
    return (
      <section id="my-applications" className="py-16 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <Card className="border-academic-gold/20 shadow-academic">
              <CardHeader className="bg-gradient-to-r from-envelope-sealed to-envelope-open border-b">
                <CardTitle className="flex items-center gap-3 text-academic-primary">
                  <div className="p-2 rounded-lg bg-academic-primary text-white">
                    <User className="w-5 h-5" />
                  </div>
                  My Applications
                </CardTitle>
                <CardDescription>
                  Error loading your submitted scholarship applications.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <p className="text-red-500">Error: {fheError?.message || profileIdsError?.message || 'Failed to load profile data'}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  if (profiles.length === 0) {
    return (
      <section id="my-applications" className="py-16 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <Card className="border-academic-gold/20 shadow-academic">
              <CardHeader className="bg-gradient-to-r from-envelope-sealed to-envelope-open border-b">
                <CardTitle className="flex items-center gap-3 text-academic-primary">
                  <div className="p-2 rounded-lg bg-academic-primary text-white">
                    <User className="w-5 h-5" />
                  </div>
                  My Applications
                </CardTitle>
                <CardDescription>
                  You have not submitted any scholarship applications yet.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Start by submitting a new application!</p>
              </CardContent>
            </Card>
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
              View and decrypt your submitted scholarship applications.
            </p>
            {profileCount && (
              <p className="text-sm text-muted-foreground mt-2">
                Total profiles in contract: {profileCount.toString()}
              </p>
            )}
          </div>

          <div className="space-y-8">
            {profiles.map(profile => (
              <Card key={profile.profileId} className="border-academic-gold/20 shadow-academic">
                <CardHeader className="bg-gradient-to-r from-envelope-sealed to-envelope-open border-b flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-academic-primary text-white">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-academic-primary">
                      Application #{profile.profileId} - {profile.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={profile.isVerified ? "default" : "secondary"}>
                      {profile.isVerified ? "Verified" : "Pending Verification"}
                    </Badge>
                    <Badge variant={profile.isActive ? "default" : "destructive"}>
                      {profile.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="text-academic-primary font-semibold">{profile.name}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">University</p>
                      <p className="text-academic-primary font-semibold">{profile.institution}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Specialization</p>
                      <p className="text-academic-primary font-semibold">{profile.specialization}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Submitted On</p>
                      <p className="text-academic-primary font-semibold">{profile.createdAt}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-academic-primary flex items-center gap-2">
                      <Lock className="w-5 h-5" /> Encrypted Data
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Academic Score (GPA)</p>
                        {decryptedData[profile.profileId]?.academicScore !== undefined ? (
                          <p className="text-green-600 font-semibold flex items-center gap-1">
                            <Unlock className="w-4 h-4" /> {getGpaRange(decryptedData[profile.profileId]?.academicScore)}
                          </p>
                        ) : (
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Lock className="w-4 h-4" /> ••••••
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Verification Level</p>
                        {decryptedData[profile.profileId]?.verificationLevel !== undefined ? (
                          <p className="text-green-600 font-semibold flex items-center gap-1">
                            <Unlock className="w-4 h-4" /> {decryptedData[profile.profileId]?.verificationLevel}
                          </p>
                        ) : (
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Lock className="w-4 h-4" /> ••••••
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Reputation Score</p>
                        {decryptedData[profile.profileId]?.reputationScore !== undefined ? (
                          <p className="text-green-600 font-semibold flex items-center gap-1">
                            <Unlock className="w-4 h-4" /> {decryptedData[profile.profileId]?.reputationScore}
                          </p>
                        ) : (
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Lock className="w-4 h-4" /> ••••••
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => decryptProfileData(profile)}
                      disabled={isDecrypting[profile.profileId] || !isInitialized || fheLoading}
                      className="bg-academic-primary hover:bg-academic-seal text-white"
                    >
                      {isDecrypting[profile.profileId] ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Decrypting...
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4 mr-2" /> Decrypt Data
                        </>
                      )}
                    </Button>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="technical-details">
                      <AccordionTrigger className="text-academic-primary hover:no-underline">
                        Technical Details
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Encrypted Academic Score Hash</p>
                          <p className="font-mono text-xs break-all bg-muted p-2 rounded">{profile.academicScore}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Encrypted Verification Level Hash</p>
                          <p className="font-mono text-xs break-all bg-muted p-2 rounded">{profile.verificationLevel}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Encrypted Reputation Score Hash</p>
                          <p className="font-mono text-xs break-all bg-muted p-2 rounded">{profile.reputationScore}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">View on Etherscan</p>
                          <a
                            href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}#readContract`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline flex items-center gap-1"
                          >
                            Contract on Etherscan <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};