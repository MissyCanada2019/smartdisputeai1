import { useEffect } from "react";

export default function TermsOfService() {
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
      <h1 className="text-3xl font-bold mb-8 text-center">Terms of Service</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500 mb-6">Effective Date: {currentDate}</p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="mb-2">
            By accessing or using SmartDispute.ai ("the Service"), you agree to be bound by these Terms of Service. 
            If you do not agree, do not use the platform.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
          <p className="mb-2">
            SmartDispute.ai is an AI-powered self-help tool designed to assist Canadians in preparing legal letters, 
            forms, and documentation for personal use in disputes such as housing, credit reporting errors, and administrative complaints.
          </p>
          <p className="mb-2">
            SmartDispute.ai does not provide legal advice and is not a substitute for a licensed lawyer.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">3. Eligibility</h2>
          <p className="mb-2">To use this service, you must:</p>
          <ul className="list-disc list-inside mb-2 pl-4 space-y-1">
            <li>Be at least 18 years old</li>
            <li>Reside in Canada</li>
            <li>Use the service for lawful, personal purposes only</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">4. No Legal Representation</h2>
          <p className="mb-2">
            SmartDispute.ai is not a law firm.
          </p>
          <p className="mb-2">
            No lawyer-client relationship is formed by using the site. All documents generated are for informational 
            and self-help purposes only.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">5. User Responsibilities</h2>
          <p className="mb-2">You are solely responsible for:</p>
          <ul className="list-disc list-inside mb-2 pl-4 space-y-1">
            <li>Reviewing any generated documents before submitting them</li>
            <li>Meeting any legal deadlines or procedural rules</li>
            <li>Uploading accurate and truthful information</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">6. Payments and Refunds</h2>
          <p className="mb-2">
            Fees for document downloads, subscriptions, or services are clearly displayed at checkout.
          </p>
          <p className="mb-2">
            Due to the digital nature of the product, all sales are final, except where required by law.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
          <p className="mb-2">SmartDispute.ai and its creators are not liable for:</p>
          <ul className="list-disc list-inside mb-2 pl-4 space-y-1">
            <li>Court outcomes</li>
            <li>Missed deadlines</li>
            <li>Errors resulting from user-entered information</li>
          </ul>
          <p className="mb-2">
            Maximum liability is limited to the amount you paid for the specific service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
          <p className="mb-2">
            We reserve the right to suspend or terminate any account that violates our terms or is used to abuse 
            or threaten others.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">9. Modifications</h2>
          <p className="mb-2">
            We may update these Terms at any time. Continued use of the service after changes means you accept the new terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Contact</h2>
          <p className="mb-2">
            For questions about these Terms, please contact us at:
            <a href="mailto:support@smartdispute.ai" className="text-blue-600 hover:underline ml-1">
              support@smartdispute.ai
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}