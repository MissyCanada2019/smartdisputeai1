import { ReactNode, createContext, useContext, useState } from "react";
import { DocumentTemplate, UserInfoFormValues } from "@shared/schema";

interface FormState {
  currentStep: number;
  userInfo?: UserInfoFormValues;
  selectedTemplate?: DocumentTemplate;
  documentData?: Record<string, any>;
  documentId?: number;
  // Evidence-related fields
  issueDescription?: string;
  agency?: string;
  province?: string;
  evidenceFileIds?: number[];
  userId?: number | null;
  caseAnalysis?: {
    id?: number;
    caseSummary?: string;
    recommendedForms?: any[];
    meritScore?: number;
    meritAssessment?: string;
    predictedOutcome?: string;
  };
  recommendedForms?: any[];
}

interface FormContextType {
  formState: FormState;
  setFormState: (state: FormState) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formState, setFormState] = useState<FormState>({
    currentStep: 0
  });

  return (
    <FormContext.Provider value={{ formState, setFormState }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormState(): [FormState, (state: FormState) => void] {
  const context = useContext(FormContext);
  
  if (context === undefined) {
    throw new Error("useFormState must be used within a FormProvider");
  }
  
  return [context.formState, context.setFormState];
}
