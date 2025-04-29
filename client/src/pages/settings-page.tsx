import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import * as Switch from "@radix-ui/react-switch";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

type ProfileFormData = {
  firstName: string;
  lastName: string;
  businessName: string;
  phone: string;
  address: string;
  website: string;
};

type NotificationsFormData = {
  newQuotesNotifications: boolean;
  clientResponseNotifications: boolean;
  systemUpdatesNotifications: boolean;
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#7E57C2");
  const [selectedFont, setSelectedFont] = useState("assistant");

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      businessName: user?.businessName || "",
      phone: user?.phone || "",
      address: user?.address || "",
      website: user?.website || "",
    }
  });

  const notificationsForm = useForm<NotificationsFormData>({
    defaultValues: {
      newQuotesNotifications: true,
      clientResponseNotifications: true,
      systemUpdatesNotifications: false,
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

  // Update design settings mutation
  const updateDesignSettingsMutation = useMutation({
    mutationFn: async (data: { color: string; font: string }) => {
      try {
        const res = await apiRequest("PATCH", "/api/design-settings", {
          designSettings: {
            brandColor: data.color,
            fontFamily: data.font
          }
        });
        return res.json();
      } catch (error) {
        console.error("Error saving design settings:", error);
        throw new Error("שגיאה בשמירת הגדרות העיצוב");
      }
    },
    onSuccess: () => {
      toast({
        title: "הגדרות העיצוב נשמרו",
        description: "השינויים יוחלו בהצעות המחיר החדשות",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בשמירת הגדרות העיצוב",
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

  const handleSaveDesignSettings = () => {
    try {
      updateDesignSettingsMutation.mutate({
        color: selectedColor,
        font: selectedFont
      });
    } catch (error) {
      console.error("Error in handleSaveDesignSettings:", error);
      toast({
        title: "שגיאה בשמירת הגדרות העיצוב",
        description: "אירעה שגיאה בעת שמירת ההגדרות",
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
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-right">
              <h1 className="text-3xl font-bold mb-2 text-gray-900">הגדרות</h1>
              <p className="text-gray-600 text-lg">ניהול פרופיל וההגדרות האישיות שלך</p>
            </div>
            
            {/* Settings Tabs */}
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="mb-8"
            >
              <TabsList className="bg-white mb-2 p-1 border overflow-x-auto dir-rtl flex justify-center shadow-soft">
                <TabsTrigger value="profile" className="px-6 py-2 hover-lift text-lg">פרטי עסק</TabsTrigger>
                <TabsTrigger value="style" className="px-6 py-2 hover-lift text-lg">עיצוב וסגנון</TabsTrigger>
                <TabsTrigger value="security" className="px-6 py-2 hover-lift text-lg">אבטחה</TabsTrigger>
                <TabsTrigger value="notifications" className="px-6 py-2 hover-lift text-lg">התראות</TabsTrigger>
              </TabsList>
              
              <Card className="shadow-soft border">
                <TabsContent value="profile" className="p-0 m-0">
                  <CardContent className="p-6">
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="md:col-span-1 flex items-center justify-center">
                            <div className="flex flex-col items-center p-4">
                              <div className="w-40 h-40 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 relative shadow-soft">
                                {user?.logoUrl ? (
                                  <img src={user.logoUrl} alt="לוגו העסק" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3 1.343 3-3-1.343-3-3-3zM11 19a6 6 0 01-6-6c0-6 12-6 12 0 0 3.771-3.582 6-6 6z" />
                                  </svg>
                                )}
                                <Button 
                                  type="button"
                                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-12 w-12 absolute bottom-0 left-0 bg-accent text-white rounded-full p-2 shadow-soft hover-lift"
                                  size="icon"
                                  onClick={handleLogoUpload}
                                  disabled={isUploading}
                                >
                                  {isUploading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                  ) : (
                                    <Upload className="h-5 w-5" />
                                  )}
                                </Button>
                              </div>
                              <p className="text-base text-gray-500 text-center" dir="rtl">העלה לוגו לעסק שלך</p>
                            </div>
                          </div>
                          
                          <div className="md:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={profileForm.control}
                                name="firstName"
                                render={({ field }) => (
                                  <FormItem className="text-right">
                                    <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-right" dir="rtl">שם פרטי</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="שם פרטי" 
                                        dir="rtl"
                                        className="text-right focus-ring"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage className="text-right" dir="rtl" />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={profileForm.control}
                                name="lastName"
                                render={({ field }) => (
                                  <FormItem className="text-right">
                                    <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-right" dir="rtl">שם משפחה</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="שם משפחה" 
                                        dir="rtl"
                                        className="text-right focus-ring"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage className="text-right" dir="rtl" />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={profileForm.control}
                                name="businessName"
                                render={({ field }) => (
                                  <FormItem className="md:col-span-2 text-right">
                                    <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-right" dir="rtl">שם העסק</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="שם העסק שלך" 
                                        dir="rtl"
                                        className="text-right focus-ring"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage className="text-right" dir="rtl" />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={profileForm.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem className="text-right">
                                    <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-right" dir="rtl">טלפון</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="מספר טלפון" 
                                        dir="rtl"
                                        className="text-right focus-ring"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage className="text-right" dir="rtl" />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={profileForm.control}
                                name="website"
                                render={({ field }) => (
                                  <FormItem className="text-right">
                                    <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-right" dir="rtl">אתר אינטרנט</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="כתובת האתר שלך" 
                                        dir="rtl"
                                        className="text-right focus-ring"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage className="text-right" dir="rtl" />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={profileForm.control}
                                name="address"
                                render={({ field }) => (
                                  <FormItem className="md:col-span-2 text-right">
                                    <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-right" dir="rtl">כתובת</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="הכתובת הפיזית של העסק" 
                                        dir="rtl"
                                        className="text-right focus-ring"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage className="text-right" dir="rtl" />
                                  </FormItem>
                                )}
                              />

                              <div className="md:col-span-2 flex justify-center">
                                <Button 
                                  type="submit" 
                                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-full gradient-accent hover-lift shadow-soft text-lg px-8 py-2 text-right"
                                  disabled={updateProfileMutation.isPending}
                                >
                                  {updateProfileMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4 ml-2" />
                                  )}
                                  <span dir="rtl">שמור שינויים</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="style" className="p-0 m-0">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-medium text-gray-900 text-right">הגדרות עיצוב</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-center text-gray-700">צבע מותג</label>
                          <div className="grid grid-cols-5 gap-2">
                            {[
                              { color: "#7E57C2", name: "סגול" },
                              { color: "#3F51B5", name: "כחול" },
                              { color: "#2196F3", name: "תכלת" },
                              { color: "#4CAF50", name: "ירוק" },
                              { color: "#FF9800", name: "כתום" }
                            ].map(({ color, name }) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent hover-lift ${color === selectedColor ? "ring-2 ring-accent ring-offset-2" : ""}`}
                                style={{ backgroundColor: color }}
                                aria-label={`בחר צבע ${name}`}
                                onClick={() => {
                                  setSelectedColor(color);
                                  toast({
                                    title: "צבע המותג עודכן",
                                    description: `הצבע שונה ל${name}`,
                                  });
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1 text-center text-gray-700">פונט</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              className={`p-3 border ${selectedFont === "assistant" ? "border-accent" : "border-gray-200"} rounded-lg text-center hover-lift`}
                              onClick={() => {
                                setSelectedFont("assistant");
                                toast({
                                  title: "הפונט עודכן",
                                  description: "הפונט שונה ל-Assistant",
                                });
                              }}
                            >
                              <span className="font-assistant">Assistant</span>
                            </button>
                            <button
                              type="button"
                              className={`p-3 border ${selectedFont === "rubik" ? "border-accent" : "border-gray-200"} rounded-lg text-center hover-lift`}
                              onClick={() => {
                                setSelectedFont("rubik");
                                toast({
                                  title: "הפונט עודכן",
                                  description: "הפונט שונה ל-Rubik",
                                });
                              }}
                            >
                              <span style={{ fontFamily: 'Rubik' }}>Rubik</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 text-center">
                        <Button 
                          className="rounded-full gradient-accent hover-lift shadow-soft text-lg px-8 py-2"
                          onClick={handleSaveDesignSettings}
                          disabled={updateDesignSettingsMutation.isPending}
                        >
                          {updateDesignSettingsMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 ml-2" />
                          )}
                          שמור הגדרות עיצוב
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="security" className="p-0 m-0">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-medium text-gray-900 text-right">הגדרות אבטחה</h3>
                      
                      <div className="flex justify-between gap-8">
                        <div className="w-full max-w-md flex items-center">
                          <div className="border border-red-200 rounded-lg p-6 bg-red-50 w-full">
                            <div className="text-center">
                              <h4 className="text-xl font-medium text-red-600 mb-2">מחיקת חשבון</h4>
                              <p className="text-sm text-gray-500 mb-4">
                                מחיקת החשבון היא פעולה בלתי הפיכה. כל הנתונים שלך יימחקו לצמיתות.
                              </p>
                              <Button variant="destructive" className="hover-lift text-lg px-8 py-2">
                                מחק את החשבון שלי
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="w-full max-w-md">
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1 text-right text-gray-700">סיסמה נוכחית</label>
                              <Input 
                                type="password" 
                                placeholder="הזן את הסיסמה הנוכחית" 
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1 text-right text-gray-700">סיסמה חדשה</label>
                              <Input 
                                type="password" 
                                placeholder="הזן סיסמה חדשה" 
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1 text-right text-gray-700">אימות סיסמה</label>
                              <Input 
                                type="password" 
                                placeholder="הזן שוב את הסיסמה החדשה" 
                                className="text-right"
                                dir="rtl"
                              />
                            </div>
                            
                            <div className="pt-2 text-right">
                              <Button className="rounded-full gradient-accent hover-lift shadow-soft text-lg px-8 py-2">
                                שינוי סיסמה
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="notifications" className="p-0 m-0">
                  <CardContent className="p-6">
                    <Form {...notificationsForm}>
                      <form onSubmit={notificationsForm.handleSubmit((data) => {
                        console.log(data);
                        toast({
                          title: "הגדרות ההתראות נשמרו",
                          description: "העדפות ההתראות שלך עודכנו בהצלחה",
                        });
                      })}>
                        <div className="space-y-6">
                          <div className="text-center mb-8">
                            <h3 className="text-2xl font-medium text-gray-900">הגדרות התראות</h3>
                            <p className="text-gray-500 mt-2">בחר אילו התראות תרצה לקבל</p>
                          </div>
                          
                          <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
                            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover-lift">
                              <Switch.Root
                                id="newQuotesNotifications"
                                checked={notificationsForm.watch("newQuotesNotifications")}
                                onCheckedChange={(checked) => {
                                  notificationsForm.setValue("newQuotesNotifications", checked);
                                }}
                                aria-label="התראות על הצעות מחיר חדשות"
                                className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent data-[state=unchecked]:bg-gray-200"
                              >
                                <Switch.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
                              </Switch.Root>
                              <div className="text-right">
                                <label htmlFor="newQuotesNotifications" className="font-medium text-gray-900">התראות על הצעות מחיר חדשות</label>
                                <p className="text-sm text-gray-500">קבל התראות כאשר הצעת מחיר נוצרת</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover-lift">
                              <Switch.Root
                                id="clientResponseNotifications"
                                checked={notificationsForm.watch("clientResponseNotifications")}
                                onCheckedChange={(checked) => {
                                  notificationsForm.setValue("clientResponseNotifications", checked);
                                }}
                                aria-label="התראות על תגובות ללקוח"
                                className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent data-[state=unchecked]:bg-gray-200"
                              >
                                <Switch.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
                              </Switch.Root>
                              <div className="text-right">
                                <label htmlFor="clientResponseNotifications" className="font-medium text-gray-900">התראות על תגובות ללקוח</label>
                                <p className="text-sm text-gray-500">קבל התראות כאשר לקוח מגיב להצעת מחיר</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover-lift">
                              <Switch.Root
                                id="systemUpdatesNotifications"
                                checked={notificationsForm.watch("systemUpdatesNotifications")}
                                onCheckedChange={(checked) => {
                                  notificationsForm.setValue("systemUpdatesNotifications", checked);
                                }}
                                aria-label="עדכוני מערכת"
                                className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent data-[state=unchecked]:bg-gray-200"
                              >
                                <Switch.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
                              </Switch.Root>
                              <div className="text-right">
                                <label htmlFor="systemUpdatesNotifications" className="font-medium text-gray-900">עדכוני מערכת</label>
                                <p className="text-sm text-gray-500">קבל התראות על עדכונים ושינויים במערכת</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-4 text-center">
                            <Button 
                              type="submit" 
                              className="rounded-full gradient-accent hover-lift shadow-soft text-lg px-8 py-2"
                            >
                              <Check className="h-4 w-4 ml-2" />
                              שמור הגדרות התראות
                            </Button>
                          </div>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </TabsContent>
              </Card>
            </Tabs>
            
            {/* Subscription */}
            <Card className="shadow-soft mb-8">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-900 text-right">המנוי שלך</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-900">ניסיון חינם</span>
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
                  <p className="text-sm text-gray-600 mb-3 text-right">
                    {daysLeft > 0 ? (
                      `המנוי שלך יסתיים בעוד ${daysLeft} ימים. שדרג עכשיו כדי להמשיך ליהנות מכל התכונות.`
                    ) : (
                      `המנוי שלך הסתיים. שדרג עכשיו כדי להמשיך ליהנות מכל התכונות.`
                    )}
                  </p>
                  <Button className="w-full rounded-full gradient-accent hover-lift shadow-soft text-lg py-2">
                    שדרג למנוי פרמיום
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 flex flex-col hover-lift">
                    <div className="mb-3 text-right">
                      <h4 className="font-medium text-gray-900">מנוי חודשי</h4>
                      <p className="text-2xl font-bold">₪50 <span className="text-sm font-normal text-gray-500">/ חודש</span></p>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-2 mb-4 text-right">
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
                      className="mt-auto w-full border-accent text-accent hover:bg-accent hover:text-white rounded-full hover-lift text-lg py-2"
                    >
                      בחירה
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4 flex flex-col bg-accent bg-opacity-5 border-accent hover-lift">
                    <div className="mb-1 text-right">
                      <span className="inline-block bg-accent text-white text-xs px-2 py-1 rounded-full mb-2">המשתלם ביותר</span>
                      <h4 className="font-medium text-gray-900">מנוי שנתי</h4>
                      <p className="text-2xl font-bold">₪480 <span className="text-sm font-normal text-gray-500">/ שנה</span></p>
                      <p className="text-sm text-green-600">חיסכון של ₪120 בשנה!</p>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-2 mb-4 text-right">
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
                    <Button className="mt-auto w-full rounded-full gradient-accent hover-lift shadow-soft text-lg py-2">
                      בחירה
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Compliance */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>
                <a href="/privacy" className="text-accent hover:underline">מדיניות פרטיות</a> •
                <a href="/terms" className="text-accent hover:underline mr-2">תנאי שימוש</a> •
                <a href="/accessibility" className="text-accent hover:underline mr-2">הצהרת נגישות</a> •
                <a href="#" className="text-accent hover:underline mr-2">מחיקת חשבון</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
