import { useAuth } from "@/hooks/use-auth";
import { cn, getInitials } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import {
  HomeIcon,
  PlusCircleIcon,
  FileTextIcon,
  SettingsIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";

export function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();

  type StatisticsData = {
    totalQuotes: number;
    monthlyQuotes: number;
    monthlyLimit: number;
  };

  const { data: statistics = { totalQuotes: 0, monthlyQuotes: 0, monthlyLimit: 50 } } = useQuery<StatisticsData>({
    queryKey: ["/api/statistics"],
    enabled: !!user,
  });

  const navItems = [
    { href: "/", label: "דף הבית", icon: HomeIcon },
    { href: "/create-quote", label: "יצירת הצעה", icon: PlusCircleIcon },
    { href: "/quotes", label: "הצעות מחיר", icon: FileTextIcon },
    { href: "/settings", label: "הגדרות", icon: SettingsIcon },
  ];

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const initials = getInitials(`${firstName} ${lastName}`);
  const monthlyQuotas = statistics.monthlyQuotes;
  const monthlyLimit = statistics.monthlyLimit;
  const quotasPercentage = (monthlyQuotas / monthlyLimit) * 100;

  // Calculate remaining trial days
  const trialEndDate = user?.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
  const today = new Date();
  const daysLeft = trialEndDate ? Math.max(0, Math.ceil((trialEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  
  return (
    <aside className="hidden lg:flex flex-col bg-white shadow-md w-64 fixed right-0 inset-y-0 z-10">
      <div className="p-6 text-right">
        <h1 className="text-2xl font-bold text-accent">QuickQuote</h1>
      </div>
      
      <nav className="flex-1 py-4">
        <div className="px-4 mb-8">
          {navItems.map((item) => {
            const isActive = item.href === location;
            return (
              <div
                key={item.href}
                className={cn(
                  "flex items-center gap-3 p-3 mb-2 rounded-xl transition-colors cursor-pointer",
                  isActive 
                    ? "bg-accent/5 text-accent border-r-2 border-accent" 
                    : "hover:bg-gray-100"
                )}
                onClick={() => navigate(item.href)}
              >
                <item.icon className="h-5 w-5" />
                <span className={isActive ? "font-medium" : ""}>{item.label}</span>
              </div>
            );
          })}
        </div>
        
        <div className="px-6 text-right">
          <p className="text-sm text-gray-500 mb-2">המסלול שלך</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium">ניסיון חינם</span>
              {daysLeft > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-800 py-1 px-2 rounded-full">
                  {daysLeft} ימים נותרו
                </span>
              )}
            </div>
            <Progress value={quotasPercentage} className="h-2 mb-3" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{monthlyQuotas} / {monthlyLimit} הצעות</span>
              <span>החודש</span>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-accent text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-right">
            <p className="font-medium">{firstName} {lastName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rtl-ml-auto" 
            onClick={() => logoutMutation.mutate()}
            title="התנתק"
          >
            <LogOutIcon className="h-4 w-4 rtl-flip" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
