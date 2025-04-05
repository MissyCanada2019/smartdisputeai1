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
          <h2 className="text-xl font-semibold mb-3">4. No Legal Representation or Advice</h2>
          <p className="mb-2">
            SmartDispute.ai is not a law firm and does not provide legal advice, legal opinions, or legal representation.
          </p>
          <p className="mb-2">
            Using SmartDispute.ai does not create an attorney-client relationship between you and SmartDispute.ai, its employees, or its contractors. All content, documents, and tools provided are for informational and self-help purposes only.
          </p>
          <p className="mb-2">
            The information provided through our platform is not a substitute for personalized advice from a qualified legal professional. Every legal situation is unique, and the documents and information generated through our service should be reviewed by a licensed attorney if you have concerns about their applicability to your specific situation.
          </p>
          <p className="mb-2">
            SmartDispute.ai does not guarantee the validity or effectiveness of any documents or strategies provided. Legal rules, regulations, and procedures vary by jurisdiction and change over time. The information provided is general in nature and may not be current or applicable to your specific circumstances.
          </p>
          <p className="mb-2">
            If your matter involves complex legal issues, significant financial or personal stakes, or potential criminal implications, we strongly recommend consulting with a licensed attorney in your jurisdiction.
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
          <h2 className="text-xl font-semibold mb-3">9. Security and Data Handling</h2>
          <p className="mb-2">
            We take the security and privacy of your information seriously. By using SmartDispute.ai, you acknowledge and agree to our data handling practices as outlined in this section and in our Privacy Policy.
          </p>
          
          <h3 className="text-lg font-medium mb-2 mt-4">9.1 Data Storage and Protection</h3>
          <p className="mb-2">
            Your submitted documents, personal information, and account data are stored securely with industry-standard encryption and access controls. We implement administrative, technical, and physical safeguards designed to protect your information.
          </p>
          <p className="mb-2">
            You acknowledge that no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
          </p>
          
          <h3 className="text-lg font-medium mb-2 mt-4">9.2 Data Processing</h3>
          <p className="mb-2">
            When you upload documents or enter information, you grant SmartDispute.ai the right to process this data for the purpose of providing our services, including analysis by artificial intelligence systems. You warrant that you have the legal right to submit any documents you upload and that they do not violate any third-party rights.
          </p>
          
          <h3 className="text-lg font-medium mb-2 mt-4">9.3 Data Retention and Deletion</h3>
          <p className="mb-2">
            We retain your data as outlined in our Privacy Policy. You may request deletion of your account and associated data at any time by contacting us. However, we may retain certain information as required by law or for legitimate business purposes, such as fraud prevention.
          </p>
          
          <h3 className="text-lg font-medium mb-2 mt-4">9.4 Third-Party Services</h3>
          <p className="mb-2">
            Our service integrates with various third-party services, such as payment processors. Your use of these services is subject to their respective terms and privacy policies. SmartDispute.ai is not responsible for the privacy practices or content of these third-party services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">10. Modifications</h2>
          <p className="mb-2">
            We may update these Terms at any time. Continued use of the service after changes means you accept the new terms. We will make reasonable efforts to notify you of significant changes through email or notices on our website.
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