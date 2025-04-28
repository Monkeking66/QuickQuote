import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Quote } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

import { Sidebar } from "@/components/shared/sidebar";
import { MobileHeader } from "@/components/shared/mobile-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  PlusIcon, 
  Loader2, 
  Search, 
  Eye, 
  Copy, 
  Bell
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function QuotesListPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch quotes
  const { data: quotes, isLoading } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
  });

  // Filter quotes based on search and status filter
  const filteredQuotes = quotes?.filter((quote) => {
    const matchesSearch = quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (quote.clientEmail && quote.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = !statusFilter || statusFilter === "all" || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleNewQuote = () => {
    navigate("/create-quote");
  };

  const handleViewQuote = (id: number) => {
    navigate(`/quote-final/${id}`);
  };

  const handleDuplicateQuote = (id: number) => {
    // Functionality to duplicate a quote would go here
    console.log(`Duplicate quote ${id}`);
  };

  const handleSendReminder = (id: number) => {
    // Functionality to send a reminder would go here
    console.log(`Send reminder for quote ${id}`);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 lg:mr-64 pt-16 lg:pt-0">
        <MobileHeader />
        
        <div className="p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">הצעות מחיר</h1>
                <p className="text-gray-600">ניהול וצפייה בכל הצעות המחיר שלך</p>
              </div>
              
              <Button 
                onClick={handleNewQuote}
                className="rounded-full flex items-center gap-2 self-start"
              >
                <PlusIcon className="h-4 w-4 ml-1" />
                <span>הצעת מחיר חדשה</span>
              </Button>
            </div>
            
            {/* Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="חיפוש לפי שם לקוח או אימייל"
                  className="pl-3 pr-10 text-right"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-48">
                <Select
                  value={statusFilter}
                  onValueChange={(value: string) => setStatusFilter(value || "all")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="כל הסטטוסים" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הסטטוסים</SelectItem>
                    <SelectItem value="draft">טיוטה</SelectItem>
                    <SelectItem value="pending">בהמתנה</SelectItem>
                    <SelectItem value="approved">אושר</SelectItem>
                    <SelectItem value="rejected">נדחה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Quotes Table */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : !filteredQuotes || filteredQuotes.length === 0 ? (
              <Card>
                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">אין הצעות מחיר עדיין</h3>
                  <p className="text-gray-500 mb-4">התחל ליצור הצעות מחיר מקצועיות עכשיו</p>
                  <Button 
                    onClick={handleNewQuote} 
                    className="rounded-full flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4 ml-1" />
                    <span>צור הצעה חדשה</span>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full dir-rtl">
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
                      {filteredQuotes.map((quote) => (
                        <tr key={quote.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-700">
                                {quote.clientName.charAt(0)}
                              </div>
                              <div>
                                <div>{quote.clientName}</div>
                                {quote.clientEmail && (
                                  <div className="text-xs text-gray-500">{quote.clientEmail}</div>
                                )}
                              </div>
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
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100"
                                onClick={() => handleViewQuote(quote.id)}
                                title="צפייה"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100"
                                onClick={() => handleDuplicateQuote(quote.id)}
                                title="שכפול"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100"
                                onClick={() => handleSendReminder(quote.id)}
                                title="שלח תזכורת"
                                disabled={quote.status !== 'pending'}
                              >
                                <Bell className="h-4 w-4" />
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
