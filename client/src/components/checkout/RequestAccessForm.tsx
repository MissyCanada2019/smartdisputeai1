import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface RequestAccessFormProps {
  onSuccess: () => void;
}

export default function RequestAccessForm({ onSuccess }: RequestAccessFormProps) {
  // Custom styles for the form
  const formStyles = `
    .form-container {
      width: 100%;
      margin: 0 auto;
    }
    .form-container h3 {
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: 600;
    }
    .form-container p {
      color: #555;
      margin-bottom: 16px;
      font-size: 14px;
    }
    .form-container ul {
      margin-bottom: 20px;
      padding-left: 20px;
    }
    .form-container li {
      margin-bottom: 6px;
      color: #555;
    }
    .form-container label {
      display: block;
      font-weight: 500;
      margin-top: 16px;
      margin-bottom: 4px;
    }
    .form-container input[type="text"],
    .form-container input[type="email"],
    .form-container input[type="file"] {
      width: 100%;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #ddd;
      margin-bottom: 16px;
    }
    .form-container button {
      margin-top: 16px;
      width: 100%;
      background: #3b82f6;
      color: white;
      padding: 12px;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      font-weight: 500;
    }
    .form-container button:hover {
      background: #2563eb;
    }
    .form-message {
      font-size: 14px;
      font-style: italic;
      margin-top: 16px;
      color: #555;
    }
  `;

  const handleFormspreeSubmit = (e: React.FormEvent) => {
    // Form will be submitted to Formspree
    // We just need to show a toast notification and call the success callback
    toast({
      title: "Verification Form Submitted",
      description: "We'll review your documentation and contact you within 24-48 hours.",
    });
    
    // Call the success callback after a short delay
    setTimeout(() => {
      onSuccess();
    }, 1000);
  };

  return (
    <div className="form-container">
      <style>{formStyles}</style>
      
      <h3>Verify Your Income</h3>
      <p>Upload one of the following documents to verify your eligibility for the $25/year plan:</p>
      <ul>
        <li>Recent pay stub</li>
        <li>ODSP or OW letter</li>
        <li>CRA Notice of Assessment</li>
        <li>Student ID with financial aid documentation</li>
      </ul>

      <form 
        action="https://formspree.io/f/xwp1ryzj" 
        method="POST" 
        encType="multipart/form-data"
        onSubmit={handleFormspreeSubmit}
      >
        <label htmlFor="name">Full Name:</label>
        <input type="text" id="name" name="name" required />

        <label htmlFor="email">Email Address:</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="upload">Upload Document:</label>
        <input 
          type="file" 
          id="upload" 
          name="upload" 
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" 
          required 
        />

        <button type="submit">Submit Verification</button>
      </form>

      <p className="form-message">
        We'll review your submission within 24–48 hours and confirm by email.
        Once approved, you'll receive instructions to activate your low-income plan.
      </p>
    </div>
  );
}