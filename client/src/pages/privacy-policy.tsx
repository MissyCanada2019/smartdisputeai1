import { useEffect } from "react";

export default function PrivacyPolicy() {
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
      <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500 mb-6">Effective Date: {currentDate}</p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <ul className="list-disc list-inside mb-2 pl-4 space-y-1">
            <li><span className="font-medium">Personal Info:</span> Name, address, phone, email (for generating documents and account use)</li>
            <li><span className="font-medium">Form Input Data:</span> Dispute or complaint details entered into our system</li>
            <li><span className="font-medium">Payment Info:</span> Processed securely via Stripe or third-party gateways (we do not store card data)</li>
            <li><span className="font-medium">Usage Data:</span> Device, browser, and session info (for security and improvement)</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Info</h2>
          <ul className="list-disc list-inside mb-2 pl-4 space-y-1">
            <li>To generate dispute letters, legal documents, and timelines</li>
            <li>To send you your documents via email or make them downloadable</li>
            <li>To process payments and subscriptions</li>
            <li>To contact you with important updates</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">3. How We Protect Your Info</h2>
          <p className="mb-2">We use:</p>
          <ul className="list-disc list-inside mb-2 pl-4 space-y-1">
            <li>SSL encryption</li>
            <li>Access-restricted storage</li>
            <li>Periodic security audits</li>
          </ul>
          <p className="mb-2">
            Your data is stored in Canada or other countries with equivalent privacy standards.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">4. Data Sharing</h2>
          <p className="mb-2">We do not sell or rent your personal info.</p>
          <p className="mb-2">We may share data:</p>
          <ul className="list-disc list-inside mb-2 pl-4 space-y-1">
            <li>With service providers (e.g. Stripe, Google Workspace)</li>
            <li>If required by law (e.g. subpoena, fraud investigation)</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
          <p className="mb-2">We retain your data only as long as needed to:</p>
          <ul className="list-disc list-inside mb-2 pl-4 space-y-1">
            <li>Provide the service</li>
            <li>Meet legal obligations</li>
          </ul>
          <p className="mb-2">
            You may request deletion of your data at any time by emailing support@smartdispute.ai.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">6. Children's Privacy</h2>
          <p className="mb-2">
            This service is not intended for use by children under 18.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
          <p className="mb-2">You may:</p>
          <ul className="list-disc list-inside mb-2 pl-4 space-y-1">
            <li>Access or correct your data</li>
            <li>Request deletion</li>
            <li>Withdraw consent (note: may affect service)</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
          <p className="mb-2">
            For privacy concerns, contact us at:
            <a href="mailto:support@smartdispute.ai" className="text-blue-600 hover:underline ml-1">
              support@smartdispute.ai
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}