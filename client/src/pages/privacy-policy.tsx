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
          <h2 className="text-xl font-semibold mb-3">3. Security & Data Handling</h2>
          <p className="mb-4">
            The security of your personal information is a top priority at SmartDispute.ai. We implement and maintain a comprehensive security program designed to protect your data from unauthorized access, use, alteration, or disclosure.
          </p>
          
          <h3 className="text-lg font-medium mb-2 text-gray-800">How We Secure Your Data:</h3>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Encryption:</span> All data is encrypted in transit using TLS/SSL protocols and at rest using industry-standard encryption algorithms</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Access Controls:</span> Strict role-based access controls limit employee access to personal data</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Secure Infrastructure:</span> Data is stored on servers in secure facilities with advanced physical security measures</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Security Testing:</span> Regular vulnerability assessments and security audits are conducted on our systems</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Intrusion Detection:</span> Automated systems monitor for suspicious activities and unauthorized access attempts</div>
            </li>
          </ul>
          
          <h3 className="text-lg font-medium mb-2 text-gray-800">Data Storage and Residency:</h3>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Canadian Storage:</span> Your information is primarily stored in Canadian data centers to comply with Canadian privacy laws</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Data Sovereignty:</span> We prioritize keeping your data within Canada or jurisdictions with equivalent privacy protections</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Backup Protection:</span> All backups are encrypted and protected with the same level of security as primary data</div>
            </li>
          </ul>
          
          <h3 className="text-lg font-medium mb-2 text-gray-800">Security Compliance:</h3>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">PIPEDA Compliance:</span> Our security practices align with the Personal Information Protection and Electronic Documents Act</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Security Training:</span> Regular security awareness training for all staff who may access personal data</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Incident Response:</span> Documented procedures for responding to and mitigating potential data breaches</div>
            </li>
          </ul>
          
          <p className="mt-2">
            While we implement these safeguards to protect your personal information, no security system is impenetrable. We continually evaluate and enhance our security measures to provide the highest level of protection for your data.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">4. Data Sharing and Third Parties</h2>
          
          <p className="mb-4 font-medium text-gray-800">
            We do not sell, trade, or rent your personal information to third parties for marketing or commercial purposes.
          </p>
          
          <h3 className="text-lg font-medium mb-2 text-gray-800">Limited Sharing Circumstances:</h3>
          <p className="mb-2">We may share your information only in the following limited contexts:</p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Service Providers:</span> With trusted third-party service providers who help us operate our platform, such as payment processors (PayPal), cloud hosting services, and analysis tools. These providers are contractually obligated to handle your data securely and only for specified purposes.</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Legal Requirements:</span> When required to comply with applicable laws, regulations, legal processes (such as court orders or subpoenas), or governmental requests.</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Protection of Rights:</span> When necessary to investigate, prevent, or take action regarding potential violations of our terms of service, suspected fraud, situations involving potential threats to the physical safety of any person, or as otherwise required by law.</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Business Transfers:</span> In connection with a business transaction such as a merger, acquisition, or sale of assets, but only if the recipient agrees to protect your data in accordance with this privacy policy.</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">With Your Consent:</span> In circumstances not covered above, we will seek your explicit consent before sharing your personal information.</div>
            </li>
          </ul>
          
          <h3 className="text-lg font-medium mb-2 text-gray-800">Third-Party Service Providers:</h3>
          <p className="mb-2">We work with the following types of service providers who may process your data:</p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Payment Processing:</span> PayPal for secure payment processing</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Cloud Infrastructure:</span> Secure cloud hosting and storage providers</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Analytics:</span> Tools to help us understand how users interact with our platform (with privacy-preserving settings enabled)</div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-700 font-medium mr-2">•</span>
              <div><span className="font-medium">Communication:</span> Email and messaging service providers to facilitate communication with you</div>
            </li>
          </ul>
          
          <p className="mt-2">
            All service providers are carefully selected and must demonstrate adequate security and privacy safeguards. We limit the information shared to only what is necessary for the specific service.
          </p>
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