import { useEffect } from "react";

export default function CookiePolicy() {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const currentDate = new Date().toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Cookie Policy</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500 mb-6">Effective Date: {currentDate}</p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">1. What Are Cookies?</h2>
          <p className="mb-2">
            Cookies are small text files stored on your device when you visit a website. They help improve user experience, 
            remember settings, and analyze site usage.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">2. Types of Cookies We Use</h2>
          <ul className="space-y-3">
            <li>
              <span className="font-medium">Essential Cookies:</span>
              <p className="ml-4">Required for the operation of SmartDispute.ai. These include session and login cookies.</p>
            </li>
            <li>
              <span className="font-medium">Performance Cookies:</span>
              <p className="ml-4">Help us understand how visitors use the site (e.g., which pages are visited most often). This data is anonymized.</p>
            </li>
            <li>
              <span className="font-medium">Functionality Cookies:</span>
              <p className="ml-4">Remember your preferences (e.g., saved form data) for a smoother experience.</p>
            </li>
            <li>
              <span className="font-medium">Third-Party Cookies:</span>
              <p className="ml-4">May be used by payment processors (e.g., Stripe), analytics tools (e.g., Google Analytics), or embedded services. These services may collect information according to their own policies.</p>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">3. How to Manage Cookies</h2>
          <p className="mb-2">
            Most browsers let you refuse or delete cookies. Disabling cookies may affect the functionality of the website.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">4. Consent</h2>
          <p className="mb-2">
            By using SmartDispute.ai, you consent to the use of cookies as described in this policy.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Contact</h2>
          <p className="mb-2">
            For questions or concerns about cookie use, contact:
            <a href="mailto:support@smartdispute.ai" className="text-blue-600 hover:underline ml-1">
              support@smartdispute.ai
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}