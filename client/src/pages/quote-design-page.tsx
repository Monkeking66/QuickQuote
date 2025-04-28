import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Quote } from "@shared/schema";

import { Sidebar } from "@/components/shared/sidebar";
import { MobileHeader } from "@/components/shared/mobile-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const TEMPLATES = [
  { id: "professional", name: "מקצועי", previewUrl: "https://via.placeholder.com/400x500?text=Professional+Template" },
  { id: "modern", name: "מודרני", previewUrl: "https://via.placeholder.com/400x500?text=Modern+Template" },
  { id: "casual", name: "קליל", previewUrl: "https://via.placeholder.com/400x500?text=Casual+Template" },
];

export default function QuoteDesignPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const quoteId = parseInt(params.id);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Fetch quote data
  const { data: quote, isLoading } = useQuery<Quote>({
    queryKey: [`/api/quotes/${quoteId}`],
  });

  // Update selected template when quote data is loaded
  useEffect(() => {
    if (quote && quote.templateStyle) {
      setSelectedTemplate(quote.templateStyle);
    }
  }, [quote]);

  // Update template style mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async (templateStyle: string) => {
      const res = await apiRequest("PATCH", `/api/quotes/${quoteId}`, { templateStyle });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quotes/${quoteId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בעדכון התבנית",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate full quote mutation
  const generateQuoteMutation = useMutation({
    mutationFn: async () => {
      // First save the template choice
      if (selectedTemplate && selectedTemplate !== quote?.templateStyle) {
        await updateTemplateMutation.mutateAsync(selectedTemplate);
      }
      return { id: quoteId };
    },
    onSuccess: () => {
      navigate(`/quote-final/${quoteId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה ביצירת הצעת המחיר",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    updateTemplateMutation.mutate(templateId);
  };

  // Handle back button
  const handleBack = () => {
    navigate("/create-quote");
  };

  // Handle generate quote
  const handleGenerateQuote = () => {
    if (!selectedTemplate) {
      toast({
        title: "בחר תבנית",
        description: "יש לבחור תבנית לפני המשך התהליך",
        variant: "destructive",
      });
      return;
    }
    generateQuoteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar />
        <main className="flex-1 lg:mr-64 pt-16 lg:pt-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 lg:mr-64 pt-16 lg:pt-0">
        <MobileHeader />
        
        <div className="p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">בחירת עיצוב</h1>
              <p className="text-gray-600">בחר את הסגנון המתאים ביותר להצעת המחיר שלך</p>
            </div>
            
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">1</div>
                  <span className="mt-2 text-sm font-medium">פרטי לקוח</span>
                </div>
                <div className="flex-1 h-1 bg-accent mx-4"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">2</div>
                  <span className="mt-2 text-sm font-medium">עיצוב</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4">
                  <div className="h-1 bg-accent" style={{ width: "0%" }}></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 text-gray-500 flex items-center justify-center font-bold">3</div>
                  <span className="mt-2 text-sm font-medium text-gray-500">סיום</span>
                </div>
              </div>
            </div>
            
            {/* Design Templates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {TEMPLATES.map((template) => (
                <div 
                  key={template.id}
                  className={`border-2 ${selectedTemplate === template.id ? 'border-accent' : 'border-gray-200'} rounded-xl overflow-hidden cursor-pointer hover:border-accent transition-colors`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="aspect-w-3 aspect-h-4 bg-gray-100">
                    <img src={template.previewUrl} alt={`תבנית ${template.name}`} className="object-cover" />
                  </div>
                  <div className={`p-4 text-center ${selectedTemplate === template.id ? 'bg-accent text-white' : ''}`}>
                    <p className="font-medium">{template.name}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Preview */}
            <Card className="shadow-sm mb-8">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg font-bold mb-4">תצוגה מקדימה</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">גרסת מחשב</p>
                    <div className="border rounded-lg overflow-hidden bg-gray-50 aspect-w-4 aspect-h-3">
                      {selectedTemplate ? (
                        <div className="flex items-center justify-center">
                          <img 
                            src={TEMPLATES.find(t => t.id === selectedTemplate)?.previewUrl || ''} 
                            alt="תצוגה מקדימה למחשב" 
                            className="max-w-full max-h-full object-contain" 
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <p>בחר תבנית לתצוגה מקדימה</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">גרסת מובייל</p>
                    <div className="mx-auto max-w-xs border rounded-lg overflow-hidden bg-gray-50 aspect-w-9 aspect-h-16">
                      {selectedTemplate ? (
                        <div className="flex items-center justify-center">
                          <img 
                            src={TEMPLATES.find(t => t.id === selectedTemplate)?.previewUrl || ''} 
                            alt="תצוגה מקדימה למובייל" 
                            className="max-w-full max-h-full object-contain" 
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <p>בחר תבנית לתצוגה מקדימה</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="rounded-full order-2 sm:order-1 flex items-center"
                onClick={handleBack}
              >
                <ArrowLeft className="h-5 w-5 ml-2 rtl-flip" />
                חזרה
              </Button>
              
              <Button 
                type="button" 
                className="rounded-full order-1 sm:order-2 flex items-center"
                onClick={handleGenerateQuote}
                disabled={!selectedTemplate || generateQuoteMutation.isPending}
              >
                {generateQuoteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                יצירת הצעת מחיר
                <ArrowRight className="h-5 w-5 mr-1 rtl-flip" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
