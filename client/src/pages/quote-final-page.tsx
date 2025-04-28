import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Quote } from "@shared/schema";

import { Sidebar } from "@/components/shared/sidebar";
import { MobileHeader } from "@/components/shared/mobile-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2, 
  Download, 
  Edit, 
  Copy, 
  Loader2, 
  Send,
  Home 
} from "lucide-react";

export default function QuoteFinalPage() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const quoteId = parseInt(params.id);
  const [recipient, setRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("הצעת מחיר עבור הפרויקט");
  const [emailMessage, setEmailMessage] = useState("שלום רב,\nמצורפת הצעת מחיר עבור הפרויקט שדיברנו עליו. אשמח לענות על כל שאלה.\nבברכה,");

  // Fetch quote data
  const { data: quote, isLoading } = useQuery<Quote>({
    queryKey: [`/api/quotes/${quoteId}`],
  });

  // Update quote status mutation
  const updateQuoteMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest("PATCH", `/api/quotes/${quoteId}`, { 
        status,
        sentAt: status === 'pending' ? new Date().toISOString() : undefined
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quotes/${quoteId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בעדכון הצעת המחיר",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send quote mutation
  const sendQuoteMutation = useMutation({
    mutationFn: async () => {
      // First update the quote status to 'pending'
      await updateQuoteMutation.mutateAsync('pending');
      
      // Then simulate sending email (in a real app this would call an API endpoint)
      const res = await apiRequest("PATCH", `/api/quotes/${quoteId}`, { 
        clientEmail: recipient,
        status: 'pending'
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "הצעת המחיר נשלחה בהצלחה",
        description: `נשלח ל: ${recipient}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בשליחת הצעת המחיר",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    navigate("/");
  };

  // Handle sending quote
  const handleSendQuote = () => {
    if (!recipient) {
      toast({
        title: "שגיאה",
        description: "יש להזין כתובת אימייל לשליחה",
        variant: "destructive",
      });
      return;
    }
    sendQuoteMutation.mutate();
  };

  // Initialize recipient email from quote data
  useState(() => {
    if (quote?.clientEmail) {
      setRecipient(quote.clientEmail);
    }
  });

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

  const templateStyle = quote?.templateStyle || 'professional';
  // This would be a real PDF preview URL in production
  const pdfPreviewUrl = `https://via.placeholder.com/800x1000?text=Quote+PDF+Preview+${templateStyle}`;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 lg:mr-64 pt-16 lg:pt-0">
        <MobileHeader />
        
        <div className="p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2">הצעת המחיר מוכנה!</h1>
              <p className="text-gray-600">הצעת המחיר נוצרה בהצלחה ומוכנה לשליחה ללקוח</p>
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
                <div className="flex-1 h-1 bg-accent mx-4"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">3</div>
                  <span className="mt-2 text-sm font-medium">סיום</span>
                </div>
              </div>
            </div>
            
            {/* PDF Preview */}
            <Card className="shadow-sm mb-8">
              <CardContent className="p-6 md:p-8">
                <div className="bg-gray-50 rounded-lg border aspect-w-4 aspect-h-5 mb-4">
                  <iframe 
                    title="תצוגה מקדימה של הצעת המחיר" 
                    className="w-full h-full"
                    src={pdfPreviewUrl}
                  />
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => navigate(`/create-quote`)}
                  >
                    <Edit className="h-5 w-5" />
                    <span>עריכה</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>הורדה כ-PDF</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-5 w-5" />
                    <span>שכפול</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Send Options */}
            <Card className="shadow-sm mb-8">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg font-bold mb-4">שליחה ללקוח</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="recipient-email">אימייל הנמען</label>
                    <Input 
                      id="recipient-email" 
                      type="email" 
                      placeholder="הזן כתובת דוא״ל" 
                      value={recipient} 
                      onChange={(e) => setRecipient(e.target.value)} 
                      dir="ltr"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="subject">נושא המייל</label>
                    <Input 
                      id="subject" 
                      type="text" 
                      placeholder="נושא ההודעה" 
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1" htmlFor="message">הודעה</label>
                    <Textarea 
                      id="message" 
                      rows={3} 
                      placeholder="תוכן ההודעה ללקוח..." 
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Button 
                variant="outline" 
                className="rounded-full order-2 sm:order-1 flex items-center gap-2"
                onClick={handleBackToDashboard}
              >
                <Home className="h-4 w-4 ml-1" />
                חזרה לדף הבית
              </Button>
              
              <Button 
                className="rounded-full order-1 sm:order-2 flex items-center gap-2"
                onClick={handleSendQuote}
                disabled={sendQuoteMutation.isPending}
              >
                {sendQuoteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <Send className="h-4 w-4 ml-1" />
                )}
                שליחה ללקוח
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
