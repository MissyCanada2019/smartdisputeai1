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
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>
                <span className="font-medium">Personal Info:</span> Name, address, phone, email (for generating documents and account use)
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>
                <span className="font-medium">Form Input Data:</span> Dispute or complaint details entered into our system
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>
                <span className="font-medium">Payment Info:</span> Processed securely via Stripe or third-party gateways (we do not store card data)
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>
                <span className="font-medium">Usage Data:</span> Device, browser, and session info (for security and improvement)
              </div>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Info</h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>To generate dispute letters, legal documents, and timelines</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>To send you your documents via email or make them downloadable</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>To process payments and subscriptions</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>To contact you with important updates</div>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">3. How We Protect Your Info</h2>
          <p className="mb-2">We use:</p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>SSL encryption</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>Access-restricted storage</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>Periodic security audits</div>
            </li>
          </ul>
          <p className="mt-2">
            Your data is stored in Canada or other countries with equivalent privacy standards.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">4. Data Sharing</h2>
          <p className="mb-2">We do not sell or rent your personal info.</p>
          <p className="mb-2">We may share data:</p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>With service providers (e.g. Stripe, Google Workspace)</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>If required by law (e.g. subpoena, fraud investigation)</div>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
          <p className="mb-2">We retain your data only as long as needed to:</p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>Provide the service</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>Meet legal obligations</div>
            </li>
          </ul>
          <p className="mt-2">
            You may request deletion of your data at any time by emailing 
            <a href="mailto:support@smartdispute.ai" className="text-blue-600 hover:underline ml-1">
              support@smartdispute.ai
            </a>.
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
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>Access or correct your data</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>Request deletion</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div>Withdraw consent (note: may affect service)</div>
            </li>
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