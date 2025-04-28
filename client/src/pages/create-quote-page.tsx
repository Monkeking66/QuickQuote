import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQuoteSchema, InsertQuote } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";

import { Sidebar } from "@/components/shared/sidebar";
import { MobileHeader } from "@/components/shared/mobile-header";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";

export default function CreateQuotePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<InsertQuote>({
    resolver: zodResolver(insertQuoteSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      projectDescription: "",
      estimatedHours: undefined,
      price: undefined,
      includeVat: true,
      status: "draft",
      templateStyle: "professional",
    },
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (data: InsertQuote) => {
      const res = await apiRequest("POST", "/api/quotes", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "הצעת המחיר נשמרה",
        description: "המשך לשלב הבא",
      });
      navigate(`/quote-design/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בשמירת הצעת המחיר",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-save functionality
  const autoSave = useMutation({
    mutationFn: async (data: InsertQuote) => {
      setIsSaving(true);
      const res = await apiRequest("POST", "/api/quotes", data);
      return res.json();
    },
    onSuccess: (data) => {
      setIsSaving(false);
      // Update form with the created quote ID
      form.setValue("id" as any, data.id);
    },
    onError: () => {
      setIsSaving(false);
    },
  });

  // Debounced auto-save function
  const debouncedAutoSave = debounce((data: InsertQuote) => {
    if (data.clientName) {
      autoSave.mutate(data);
    }
  }, 500);

  // Subscribe to form changes for auto-save
  useEffect(() => {
    const subscription = form.watch((value) => {
      debouncedAutoSave(value as InsertQuote);
    });
    return () => subscription.unsubscribe();
  }, [form, debouncedAutoSave]);

  const onSubmit = form.handleSubmit((data) => {
    createQuoteMutation.mutate(data);
  });

  const saveAsDraft = () => {
    const data = form.getValues();
    if (data.clientName) {
      createQuoteMutation.mutate(data);
    } else {
      toast({
        title: "לא ניתן לשמור טיוטה ריקה",
        description: "נא להזין לפחות שם לקוח",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 lg:mr-64 pt-16 lg:pt-0">
        <MobileHeader />
        
        <div className="p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">יצירת הצעת מחיר חדשה</h1>
              <p className="text-gray-600">מלא את הפרטים ליצירת הצעת מחיר מותאמת אישית</p>
            </div>
            
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">1</div>
                  <span className="mt-2 text-sm font-medium">פרטי לקוח</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4">
                  <div className="h-1 bg-accent" style={{ width: "50%" }}></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 text-gray-500 flex items-center justify-center font-bold">2</div>
                  <span className="mt-2 text-sm font-medium text-gray-500">עיצוב</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 text-gray-500 flex items-center justify-center font-bold">3</div>
                  <span className="mt-2 text-sm font-medium text-gray-500">סיום</span>
                </div>
              </div>
            </div>
            
            {/* Form */}
            <Form {...form}>
              <form onSubmit={onSubmit}>
                <Card className="shadow-sm mb-8">
                  <CardContent className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="clientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>שם הלקוח</FormLabel>
                            <FormControl>
                              <Input placeholder="שם העסק או הלקוח" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="clientEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>אימייל הלקוח</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="דוא״ל מנהל הפרויקט/לקוח" 
                                type="email" 
                                dir="ltr"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="projectDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>תיאור הפרויקט</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="תאר את הפרויקט או השירות המוצע..." 
                                  rows={4} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="estimatedHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>שעות עבודה</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="מספר שעות משוער" 
                                type="number" 
                                min={1} 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>מחיר (₪)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder="סכום בש״ח" 
                                  type="number" 
                                  min={0} 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pr-3">
                                  <span className="text-gray-500">₪</span>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-center">
                        <FormField
                          control={form.control}
                          name="includeVat"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-x-reverse">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="mr-2 space-y-1 leading-none">
                                <FormLabel>כולל מע"מ</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Auto-save notice */}
                <div className="text-center text-sm text-gray-500 mb-8 flex items-center justify-center">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                      <span>שומר שינויים...</span>
                    </>
                  ) : (
                    <span>המידע נשמר אוטומטית בזמן העריכה</span>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <Button 
                    type="button" 
                    onClick={saveAsDraft}
                    variant="outline" 
                    className="border border-gray-300 rounded-full order-2 sm:order-1"
                  >
                    שמור כטיוטה
                  </Button>
                  
                  <Button 
                    type="submit" 
                    className="rounded-full order-1 sm:order-2"
                    disabled={createQuoteMutation.isPending}
                  >
                    {createQuoteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    המשך לעיצוב
                    <ArrowRight className="h-5 w-5 mr-1 rtl-flip" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}
