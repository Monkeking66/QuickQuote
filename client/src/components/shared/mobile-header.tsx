import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  Menu, 
  X, 
  HomeIcon, 
  PlusCircleIcon, 
  FileTextIcon, 
  SettingsIcon,
  LogOutIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MobileHeader() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/", label: "דף הבית", icon: HomeIcon },
    { href: "/create-quote", label: "יצירת הצעה", icon: PlusCircleIcon },
    { href: "/quotes", label: "הצעות מחיר", icon: FileTextIcon },
    { href: "/settings", label: "הגדרות", icon: SettingsIcon },
  ];

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const initials = getInitials(`${firstName} ${lastName}`);

  return (
    <header className="lg:hidden fixed top-0 inset-x-0 bg-white z-10 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-lg">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%] max-w-sm p-0">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-accent text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{firstName} {lastName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <nav className="flex-1 p-4">
                {navItems.map((item) => {
                  const isActive = item.href === location;
                  return (
                    <div
                      key={item.href}
                      className={`flex items-center gap-3 p-3 mb-2 rounded-xl cursor-pointer ${
                        isActive ? "bg-accent bg-opacity-10 text-accent" : "hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        setOpen(false);
                        window.location.href = item.href;
                      }}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className={isActive ? "font-medium" : ""}>{item.label}</span>
                    </div>
                  );
                })}
              </nav>
              
              <div className="p-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setOpen(false);
                    logoutMutation.mutate();
                  }}
                >
                  <LogOutIcon className="h-4 w-4" />
                  <span>התנתקות</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <h1 className="text-xl font-bold text-accent">QuickQuote</h1>
        
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-accent text-white text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
