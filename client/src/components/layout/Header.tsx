import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/authContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Navigate to home after logout
    window.location.href = "/";
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
              <Link href="/login" className="hidden md:inline-block text-gray-600 hover:text-primary">Sign In</Link>
              <Link href="/user-info" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
                Get Started
              </Link>
            </>
          )}
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
        </div>
      </div>
    </header>
  );
}
