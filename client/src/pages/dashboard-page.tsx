import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/shared/sidebar";
import { MobileHeader } from "@/components/shared/mobile-header";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateHebrew, formatCurrency } from "@/lib/utils";
import { PlusIcon, HelpCircleIcon, LineChartIcon, Loader2, DollarSignIcon, CheckCircleIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Quote } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/statistics"],
  });

  const { data: recentQuotes, isLoading: quotesLoading } = useQuery<Quote[]>({
    queryKey: ["/api/quotes/recent"],
  });

  // Format today's date in Hebrew
  const today = formatDateHebrew(new Date());

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 lg:mr-64 pt-16 lg:pt-0">
        <MobileHeader />
        
        <div className="p-4 md:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">ברוך הבא, {user?.firstName || "משתמש"}!</h1>
            <p className="text-gray-600">{today}</p>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statsLoading ? (
              <div className="col-span-3 flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent bg-opacity-10 flex items-center justify-center">
                        <LineChartIcon className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">הצעות החודש</p>
                        <p className="text-2xl font-bold">{statistics?.monthlyQuotes || 0} / {statistics?.monthlyLimit || 50}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSignIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">סך הכנסות</p>
                        <p className="text-2xl font-bold">{formatCurrency(statistics?.totalRevenue || 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">אחוז הצלחה</p>
                        <p className="text-2xl font-bold">{statistics?.successRate || 0}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">פעולות מהירות</h2>
              <Button variant="ghost" className="text-accent hover:text-accent/80 p-0 flex items-center gap-1 text-sm">
                <span>איך זה עובד?</span>
                <HelpCircleIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => navigate("/create-quote")}
                variant="outline"
                className="bg-white border-2 border-accent text-accent hover:bg-accent hover:text-white rounded-xl p-6 h-auto flex items-center gap-4 justify-start"
              >
                <div className="w-12 h-12 rounded-full bg-accent bg-opacity-10 flex items-center justify-center text-accent">
                  <PlusIcon className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <p className="font-bold">יצירת הצעת מחיר חדשה</p>
                  <p className="text-sm opacity-75">צור הצעת מחיר מקצועית תוך דקות</p>
                </div>
              </Button>
              
              <Card className="shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">ניהול תבניות</p>
                    <p className="text-sm text-gray-500">צור ונהל תבניות להצעות מחיר</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Recent Quotes */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">הצעות אחרונות</h2>
              <Link href="/quotes">
                <a className="text-accent hover:underline text-sm">לכל ההצעות</a>
              </Link>
            </div>
            
            {quotesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : !recentQuotes || recentQuotes.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">אין הצעות מחיר עדיין</h3>
                  <p className="text-gray-500 mb-4">התחל ליצור הצעות מחיר מקצועיות עכשיו</p>
                  <Button 
                    onClick={() => navigate("/create-quote")} 
                    className="rounded-full"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    <span>צור הצעה</span>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-right">
                      <tr>
                        <th className="py-4 px-6 text-sm font-medium text-gray-500">לקוח</th>
                        <th className="py-4 px-6 text-sm font-medium text-gray-500">תאריך</th>
                        <th className="py-4 px-6 text-sm font-medium text-gray-500">סכום</th>
                        <th className="py-4 px-6 text-sm font-medium text-gray-500">סטטוס</th>
                        <th className="py-4 px-6 text-sm font-medium text-gray-500">פעולות</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentQuotes.map((quote) => (
                        <tr key={quote.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-700">
                                {quote.clientName.charAt(0)}
                              </div>
                              <span>{quote.clientName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-500">
                            {new Date(quote.createdAt).toLocaleDateString('he-IL')}
                          </td>
                          <td className="py-4 px-6 font-medium">
                            {quote.price ? formatCurrency(quote.price) : '-'}
                          </td>
                          <td className="py-4 px-6">
                            <StatusBadge status={quote.status} />
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </Button>
                              <Button variant="ghost" size="icon" className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </Button>
                              <Button variant="ghost" size="icon" className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                </svg>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let bgColor, textColor, label;
  
  switch (status) {
    case 'approved':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      label = 'אושר';
      break;
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      label = 'בהמתנה';
      break;
    case 'rejected':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      label = 'נדחה';
      break;
    case 'draft':
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      label = 'טיוטה';
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
}
