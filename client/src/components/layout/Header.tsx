import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();

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
          <span className="text-xl font-semibold text-primary">SmartDisputesAICanada</span>
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className={`text-gray-600 hover:text-primary font-medium ${location === '/' ? 'text-primary' : ''}`}>
            Home
          </Link>
          <Link href="/document-selection" className={`text-gray-600 hover:text-primary font-medium ${location.includes('/document') ? 'text-primary' : ''}`}>
            Services
          </Link>
          <Link href="/subscribe" className={`text-gray-600 hover:text-primary font-medium ${location === '/subscribe' ? 'text-primary' : ''}`}>
            AI Assistant
          </Link>
          <Link href="/about" className={`text-gray-600 hover:text-primary font-medium ${location === '/about' ? 'text-primary' : ''}`}>
            About
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <a href="#" className="hidden md:inline-block text-gray-600 hover:text-primary">Sign In</a>
          <Link href="/user-info" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
            Get Started
          </Link>
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
