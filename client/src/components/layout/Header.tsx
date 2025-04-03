import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/authContext";
import { useOnboarding } from "@/context/onboardingContext";
import { Button } from "@/components/ui/button";
import { TutorialButton } from "@/components/onboarding";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { HelpCircle } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { startOnboarding } = useOnboarding();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // Navigate to home after logout
    window.location.href = "/";
  };
  
  const handleTutorialStart = (journeyType: 'tenant' | 'cas' | 'general') => {
    const tutorialId = journeyType === 'tenant' 
      ? 'tenant-journey' 
      : journeyType === 'cas' 
        ? 'cas-journey' 
        : 'general-journey';
    startOnboarding(tutorialId);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <svg 
            className="text-primary text-3xl mr-2 w-8 h-8" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l9 6 9-6M3 12l9 6 9-6M3 18l9 6 9-6" />
          </svg>
          <span className="text-xl font-semibold text-primary">SmartDispute.ai Canada</span>
        </Link>
        
        <nav className="hidden md:flex space-x-4">
          <Link href="/" className={`text-gray-600 hover:text-primary font-medium ${location === '/' ? 'text-primary' : ''}`}>
            Home
          </Link>
          <Link href="/services" className={`text-gray-600 hover:text-primary font-medium ${location === '/services' ? 'text-primary' : ''}`}>
            Services
          </Link>
          <Link href="/document-management" className={`text-gray-600 hover:text-primary font-medium ${location === '/document-management' ? 'text-primary' : ''}`}>
            My Documents
          </Link>
          <Link href="/community" className={`text-gray-600 hover:text-primary font-medium ${location.startsWith('/community') ? 'text-primary' : ''}`}>
            Community
          </Link>
          <Link href="/resource-sharing" className={`text-gray-600 hover:text-primary font-medium ${location.startsWith('/resource-sharing') ? 'text-primary' : ''}`}>
            Resources
          </Link>
          <Link href="/subscribe" className={`text-gray-600 hover:text-primary font-medium ${location === '/subscribe' ? 'text-primary' : ''}`}>
            AI Assistant
          </Link>
          <Link href="/chat" className={`text-gray-600 hover:text-primary font-medium ${location === '/chat' ? 'text-primary' : ''}`}>
            Chat
          </Link>
          <Link href="/faq" className={`text-gray-600 hover:text-primary font-medium ${location === '/faq' ? 'text-primary' : ''}`}>
            FAQ
          </Link>
          <Link href="/about" className={`text-gray-600 hover:text-primary font-medium ${location === '/about' ? 'text-primary' : ''}`}>
            About
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {/* Tutorial Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-1">
                <HelpCircle size={16} />
                <span>Tutorials</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Interactive Tutorials</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleTutorialStart('general')}>
                Platform Overview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTutorialStart('tenant')}>
                Tenant Dispute Guide
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTutorialStart('cas')}>
                CAS Navigation Guide
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/onboarding">All Tutorials</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <span>{user?.firstName || user?.username}</span>
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/document-management">My Documents</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/case-analysis">Case Analysis</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/evidence-upload">Evidence Upload</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <a href="/standalone-login" className="inline-block text-gray-600 hover:text-primary">Sign In</a>
              <a href="/standalone-login?tab=register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
                Get Started
              </a>
            </>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden text-gray-600">
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col space-y-4 mt-8">
                <SheetClose asChild>
                  <Link href="/" className={`text-gray-600 hover:text-primary font-medium ${location === '/' ? 'text-primary' : ''}`}>
                    Home
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/services" className={`text-gray-600 hover:text-primary font-medium ${location === '/services' ? 'text-primary' : ''}`}>
                    Services
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/document-management" className={`text-gray-600 hover:text-primary font-medium ${location === '/document-management' ? 'text-primary' : ''}`}>
                    My Documents
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/community" className={`text-gray-600 hover:text-primary font-medium ${location.startsWith('/community') ? 'text-primary' : ''}`}>
                    Community
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/resource-sharing" className={`text-gray-600 hover:text-primary font-medium ${location.startsWith('/resource-sharing') ? 'text-primary' : ''}`}>
                    Resources
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/chat" className={`text-gray-600 hover:text-primary font-medium ${location === '/chat' ? 'text-primary' : ''}`}>
                    Chat
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/subscribe" className={`text-gray-600 hover:text-primary font-medium ${location === '/subscribe' ? 'text-primary' : ''}`}>
                    AI Assistant
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/faq" className={`text-gray-600 hover:text-primary font-medium ${location === '/faq' ? 'text-primary' : ''}`}>
                    FAQ
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/about" className={`text-gray-600 hover:text-primary font-medium ${location === '/about' ? 'text-primary' : ''}`}>
                    About
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/onboarding" className={`text-gray-600 hover:text-primary font-medium ${location === '/onboarding' ? 'text-primary' : ''}`}>
                    Tutorials
                  </Link>
                </SheetClose>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex flex-col space-y-2 mb-4">
                    <p className="text-sm text-gray-500">Quick Tutorials:</p>
                    <SheetClose asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="justify-start"
                        onClick={() => handleTutorialStart('general')}
                      >
                        <HelpCircle size={14} className="mr-2" />
                        Platform Overview
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="justify-start"
                        onClick={() => handleTutorialStart('tenant')}
                      >
                        <HelpCircle size={14} className="mr-2" />
                        Tenant Dispute Guide
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="justify-start"
                        onClick={() => handleTutorialStart('cas')}
                      >
                        <HelpCircle size={14} className="mr-2" />
                        CAS Navigation Guide
                      </Button>
                    </SheetClose>
                  </div>
                
                  {isAuthenticated ? (
                    <SheetClose asChild>
                      <Button 
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full"
                      >
                        Sign Out
                      </Button>
                    </SheetClose>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <SheetClose asChild>
                        <a href="/standalone-login" className="text-gray-600 hover:text-primary text-center py-2">
                          Sign In
                        </a>
                      </SheetClose>
                      <SheetClose asChild>
                        <a href="/standalone-login?tab=register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 text-center">
                          Get Started
                        </a>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
