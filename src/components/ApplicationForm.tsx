import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Lock, FileText, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ApplicationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate encryption and submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Application Sealed & Submitted",
      description: "Your scholarship application has been encrypted and submitted to the committee.",
    });
    
    setIsSubmitting(false);
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
                      placeholder="Enter your full name" 
                      required 
                      className="border-academic-gold/30 focus:ring-academic-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
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
                      placeholder="Your University Name" 
                      required 
                      className="border-academic-gold/30 focus:ring-academic-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gpa">Current GPA</Label>
                    <Select>
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

                <Button 
                  type="submit" 
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-academic-primary hover:bg-academic-seal text-white py-4 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Lock className="w-5 h-5 mr-2 animate-spin" />
                      Encrypting & Submitting...
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