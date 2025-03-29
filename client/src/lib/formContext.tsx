import { ReactNode, createContext, useContext, useState } from "react";
import { DocumentTemplate, UserInfoFormValues } from "@shared/schema";

interface FormState {
  currentStep: number;
  userInfo?: UserInfoFormValues;
  selectedTemplate?: DocumentTemplate;
  documentData?: Record<string, any>;
  documentId?: number;
}

interface FormContextType {
  formState: FormState;
  setFormState: (state: FormState) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formState, setFormState] = useState<FormState>({
    currentStep: 1
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
