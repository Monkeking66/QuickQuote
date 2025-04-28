import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

import { Sidebar } from "@/components/shared/sidebar";
import { MobileHeader } from "@/components/shared/mobile-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Loader2, Upload, Check } from "lucide-react";
import { Link } from "wouter";

type ProfileFormData = {
  firstName: string;
  lastName: string;
  businessName: string;
  phone: string;
  address: string;
  website: string;
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      businessName: user?.businessName || "",
      phone: user?.phone || "",
      address: user?.address || "",
      website: user?.website || "",
    }
  });

  // Fetch profile data
  const { data: statistics } = useQuery({
    queryKey: ["/api/statistics"],
  });

  // Calculate remaining trial days
  const trialEndDate = user?.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
  const today = new Date();
  const daysLeft = trialEndDate ? Math.max(0, Math.ceil((trialEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : 0;

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const res = await apiRequest("PATCH", "/api/profile", data);
      return res.json();
    },
    onSuccess: (updatedUser: Omit<User, 'password'>) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "הפרופיל עודכן בהצלחה",
        description: "הפרטים האישיים שלך עודכנו בהצלחה",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בעדכון הפרופיל",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleLogoUpload = () => {
    // Simulate upload process
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "הלוגו הועלה בהצלחה",
        description: "ניתן לראות את הלוגו בהצעות המחיר החדשות",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 lg:mr-64 pt-16 lg:pt-0">
        <MobileHeader />
        
        <div className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">הגדרות</h1>
              <p className="text-gray-600">ניהול פרופיל וההגדרות האישיות שלך</p>
            </div>
            
            {/* Settings Tabs */}
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="mb-8"
            >
              <TabsList className="bg-white mb-2 p-1 border overflow-x-auto">
                <TabsTrigger value="profile">פרטי עסק</TabsTrigger>
                <TabsTrigger value="style">עיצוב וסגנון</TabsTrigger>
                <TabsTrigger value="security">אבטחה</TabsTrigger>
                <TabsTrigger value="notifications">התראות</TabsTrigger>
              </TabsList>
              
              <Card className="shadow-sm border">
                <TabsContent value="profile" className="p-0 m-0">
                  <CardContent className="p-6">
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                          <div className="text-center p-4">
                            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 relative">
                              {user?.logoUrl ? (
                                <img src={user.logoUrl} alt="לוגו העסק" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3 1.343 3-3-1.343-3-3-3zM11 19a6 6 0 01-6-6c0-6 12-6 12 0 0 3.771-3.582 6-6 6z" />
                                </svg>
                              )}
                              <Button 
                                type="button"
                                className="absolute bottom-0 right-0 bg-accent text-white rounded-full p-2 shadow-sm"
                                size="icon"
                                onClick={handleLogoUpload}
                                disabled={isUploading}
                              >
                                {isUploading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Upload className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <p className="text-sm text-gray-500">העלה לוגו לעסק שלך</p>
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium mb-1" htmlFor="firstName">שם פרטי</label>
                              <Input 
                                id="firstName" 
                                {...form.register("firstName")}
                                placeholder="שם פרטי" 
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1" htmlFor="lastName">שם משפחה</label>
                              <Input 
                                id="lastName" 
                                {...form.register("lastName")}
                                placeholder="שם משפחה" 
                              />
                            </div>
                            
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium mb-1" htmlFor="businessName">שם העסק</label>
                              <Input 
                                id="businessName" 
                                {...form.register("businessName")}
                                placeholder="שם העסק שלך" 
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1" htmlFor="phone">טלפון</label>
                              <Input 
                                id="phone" 
                                {...form.register("phone")}
                                placeholder="מספר טלפון" 
                                dir="ltr"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1" htmlFor="website">אתר אינטרנט</label>
                              <Input 
                                id="website" 
                                {...form.register("website")}
                                placeholder="כתובת האתר שלך" 
                                dir="ltr"
                              />
                            </div>
                            
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium mb-1" htmlFor="address">כתובת</label>
                              <Input 
                                id="address" 
                                {...form.register("address")}
                                placeholder="הכתובת הפיזית של העסק" 
                              />
                            </div>

                            <div className="md:col-span-2">
                              <Button 
                                type="submit" 
                                className="rounded-full"
                                disabled={updateProfileMutation.isPending}
                              >
                                {updateProfileMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                ) : (
                                  <Check className="h-4 w-4 ml-2" />
                                )}
                                שמור שינויים
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="style" className="p-0 m-0">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">הגדרות עיצוב</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-1">צבע מותג</label>
                          <div className="grid grid-cols-5 gap-2">
                            {["#7E57C2", "#3F51B5", "#2196F3", "#4CAF50", "#FF9800"].map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${color === "#7E57C2" ? "ring-2 ring-accent ring-offset-2" : ""}`}
                                style={{ backgroundColor: color }}
                                aria-label={`בחר צבע ${color}`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">פונט</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              className="p-3 border border-accent rounded-lg text-center"
                            >
                              <span className="font-assistant">Assistant</span>
                            </button>
                            <button
                              type="button"
                              className="p-3 border border-gray-200 rounded-lg text-center"
                            >
                              <span style={{ fontFamily: 'Rubik' }}>Rubik</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button className="rounded-full">
                          <Check className="h-4 w-4 ml-2" />
                          שמור הגדרות עיצוב
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="security" className="p-0 m-0">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">הגדרות אבטחה</h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">סיסמה נוכחית</label>
                          <Input type="password" placeholder="הזן את הסיסמה הנוכחית" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">סיסמה חדשה</label>
                          <Input type="password" placeholder="הזן סיסמה חדשה" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">אימות סיסמה</label>
                          <Input type="password" placeholder="הזן שוב את הסיסמה החדשה" />
                        </div>
                        
                        <div className="pt-2">
                          <Button className="rounded-full">
                            שינוי סיסמה
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border-t pt-6 mt-6">
                        <h4 className="text-base font-medium text-red-600 mb-2">מחיקת חשבון</h4>
                        <p className="text-sm text-gray-500 mb-4">
                          מחיקת החשבון היא פעולה בלתי הפיכה. כל הנתונים שלך יימחקו לצמיתות.
                        </p>
                        <Button variant="destructive">
                          מחק את החשבון שלי
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="notifications" className="p-0 m-0">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">הגדרות התראות</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">התראות על הצעות מחיר חדשות</h4>
                            <p className="text-sm text-gray-500">קבל התראות כאשר הצעת מחיר נוצרת</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">התראות על תגובות ללקוח</h4>
                            <p className="text-sm text-gray-500">קבל התראות כאשר לקוח מגיב להצעת מחיר</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">עדכוני מערכת</h4>
                            <p className="text-sm text-gray-500">קבל התראות על עדכונים ושינויים במערכת</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                          </label>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button className="rounded-full">
                          שמור הגדרות התראות
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
              </Card>
            </Tabs>
            
            {/* Subscription */}
            <Card className="shadow-sm mb-8">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg font-bold mb-4">המנוי שלך</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">ניסיון חינם</span>
                    {daysLeft > 0 ? (
                      <span className="text-xs bg-yellow-100 text-yellow-800 py-1 px-2 rounded-full">
                        {daysLeft} ימים נותרו
                      </span>
                    ) : (
                      <span className="text-xs bg-red-100 text-red-800 py-1 px-2 rounded-full">
                        הסתיים
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {daysLeft > 0 ? (
                      `המנוי שלך יסתיים בעוד ${daysLeft} ימים. שדרג עכשיו כדי להמשיך ליהנות מכל התכונות.`
                    ) : (
                      `המנוי שלך הסתיים. שדרג עכשיו כדי להמשיך ליהנות מכל התכונות.`
                    )}
                  </p>
                  <Button className="w-full rounded-full">
                    שדרג למנוי פרמיום
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 flex flex-col">
                    <div className="mb-3">
                      <h4 className="font-medium">מנוי חודשי</h4>
                      <p className="text-2xl font-bold">₪50 <span className="text-sm font-normal text-gray-500">/ חודש</span></p>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        עד 50 הצעות מחיר בחודש
                      </li>
                      <li className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        כל העיצובים זמינים
                      </li>
                      <li className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        יצוא ל-PDF
                      </li>
                    </ul>
                    <Button 
                      variant="outline" 
                      className="mt-auto w-full border-accent text-accent hover:bg-accent hover:text-white rounded-full"
                    >
                      בחירה
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 flex flex-col bg-accent bg-opacity-5 border-accent">
                    <div className="mb-1">
                      <span className="inline-block bg-accent text-white text-xs px-2 py-1 rounded-full mb-2">המשתלם ביותר</span>
                      <h4 className="font-medium">מנוי שנתי</h4>
                      <p className="text-2xl font-bold">₪480 <span className="text-sm font-normal text-gray-500">/ שנה</span></p>
                      <p className="text-sm text-green-600">חיסכון של ₪120 בשנה!</p>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        כל התכונות של המנוי החודשי
                      </li>
                      <li className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        2 חודשים במתנה
                      </li>
                      <li className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        עדיפות בתמיכה
                      </li>
                    </ul>
                    <Button className="mt-auto w-full rounded-full">
                      בחירה
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Compliance */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>
                <Link href="/privacy"><a className="text-accent hover:underline">מדיניות פרטיות</a></Link> •
                <Link href="/terms"><a className="text-accent hover:underline mr-2">תנאי שימוש</a></Link> •
                <Link href="/accessibility"><a className="text-accent hover:underline mr-2">הצהרת נגישות</a></Link> •
                <a href="#" className="text-accent hover:underline mr-2">מחיקת חשבון</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
