import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { AuthForms } from "@/components/auth/auth-forms";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Auth form section */}
      <div className="flex-1 flex flex-col justify-center p-4 md:p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-accent mb-2">QuickQuote</h1>
            <p className="text-gray-600">הצעות מחיר מעוצבות במהירות וקלות</p>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <AuthForms />
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              ההרשמה מהווה הסכמה ל
              <span className="text-accent hover:underline mx-1 cursor-pointer" onClick={() => navigate("/terms")}>
                תנאי השימוש
              </span>
              ו
              <span className="text-accent hover:underline mx-1 cursor-pointer" onClick={() => navigate("/privacy")}>
                מדיניות הפרטיות
              </span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Hero image section */}
      <div className="hidden md:flex flex-1 bg-accent">
        <div className="flex flex-col justify-center p-8 text-white max-w-lg mx-auto">
          <h2 className="text-3xl font-bold mb-4">הדרך המהירה ליצירת הצעות מחיר מקצועיות</h2>
          
          <ul className="space-y-6 my-8">
            <li className="flex items-start gap-3">
              <div className="rounded-full bg-white bg-opacity-20 p-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1">צור הצעות בקלות</h3>
                <p className="opacity-90">מלא את הפרטים, בחר עיצוב, וסיים - פשוט ומהיר</p>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <div className="rounded-full bg-white bg-opacity-20 p-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1">עיצוב מקצועי</h3>
                <p className="opacity-90">תבניות מעוצבות המותאמות לעולם העסקי הישראלי</p>
              </div>
            </li>
            
            <li className="flex items-start gap-3">
              <div className="rounded-full bg-white bg-opacity-20 p-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1">חסוך זמן וכסף</h3>
                <p className="opacity-90">מקסם את הזמן שלך ליצירת עסקאות חדשות במקום לעבוד על מסמכים</p>
              </div>
            </li>
          </ul>
          
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <p className="font-bold">נסה חינם למשך 14 יום</p>
            <p className="text-sm opacity-90">ללא התחייבות, בטל בכל עת</p>
          </div>
        </div>
      </div>
    </div>
  );
}
