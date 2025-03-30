import { useEffect } from "react";

export default function Disclaimer() {
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
      <h1 className="text-3xl font-bold mb-8 text-center">Legal Disclaimer</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500 mb-6">Effective Date: {currentDate}</p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">No Legal Advice</h2>
          <p className="mb-2">
            SmartDispute.ai provides tools, templates, and educational resources to help Canadians represent 
            themselves in legal matters. This platform does not provide legal advice, opinions, or representation.
          </p>
          <p className="mb-2">
            Using SmartDispute.ai does not establish a lawyer-client relationship.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Accuracy of Information</h2>
          <p className="mb-2">
            While we strive to provide accurate and up-to-date information, SmartDispute.ai makes no guarantees 
            about the completeness, reliability, or legality of the materials provided. Laws change, and 
            application varies by case.
          </p>
          <p className="mb-2">
            You are responsible for reviewing all generated documents before submitting them and for verifying 
            deadlines and requirements with your relevant legal or administrative body.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">No Guarantee of Outcome</h2>
          <p className="mb-2">
            SmartDispute.ai cannot guarantee any legal result or outcome in court, housing tribunals, credit bureaus, 
            or other agencies.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Use at Your Own Risk</h2>
          <p className="mb-2">
            All tools, letters, and forms are provided "as is" without warranties of any kind, expressed or implied. 
            Use of SmartDispute.ai is at your sole discretion and risk.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">External Links</h2>
          <p className="mb-2">
            SmartDispute.ai may contain links to external websites that are not operated by us. We have no 
            control over, and assume no responsibility for, the content, privacy policies, or practices of 
            any third-party websites or services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Regional Differences</h2>
          <p className="mb-2">
            While our service is designed for use in Canada, laws vary by province and territory. What may be 
            applicable in one region may not be applicable in another. You are responsible for ensuring that your 
            use of any information or documents complies with the laws in your specific jurisdiction.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">User Responsibility</h2>
          <p className="mb-2">
            By using SmartDispute.ai, you acknowledge and agree that you are solely responsible for:
          </p>
          <ul className="list-disc list-inside mb-2 pl-4 space-y-1">
            <li>The accuracy of information you provide</li>
            <li>Reviewing any documents before submitting them to a third party</li>
            <li>Understanding and meeting all legal deadlines and requirements</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Contact</h2>
          <p className="mb-2">
            If you have any questions about this disclaimer, please contact us at:
            <a href="mailto:support@smartdispute.ai" className="text-blue-600 hover:underline ml-1">
              support@smartdispute.ai
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}