import { useState, useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFormState } from "@/lib/formContext";
import { useNavigate } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface DocumentPreviewerProps {
  onComplete: () => void;
}

export default function DocumentPreviewer({ onComplete }: DocumentPreviewerProps) {
  const [formState, setFormState] = useFormState();
  const [_, navigate] = useNavigate();
  const { toast } = useToast();
  const [previewContent, setPreviewContent] = useState<string>("");
  
  const template = formState.selectedTemplate;
  
  if (!template) {
    navigate("/document-selection");
    return null;
  }
  
  // Create a form schema based on the template's required fields
  const form = useForm({
    defaultValues: formState.documentData || {},
  });
  
  // Update preview when form values change
  useEffect(() => {
    const subscription = form.watch((data) => {
      let content = template.templateContent;
      
      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          content = content.replace(new RegExp(`\\[${key}\\]`, 'g'), value as string);
        }
      });
      
      setPreviewContent(content);
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch, template.templateContent]);
  
  const onSubmit = (data: any) => {
    setFormState({
      ...formState,
      documentData: data,
      currentStep: 4
    });
    
    toast({
      title: "Document customized",
      description: "Your document has been customized successfully."
    });
    
    onComplete();
  };
  
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Fill in Document Details</h3>
        <p className="text-gray-600 mb-6">
          Please fill in the required information to complete your document.
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {template.requiredFields.map((field: string) => {
              // Format field labels for better readability
              const formatLabel = (field: string) => {
                return field
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())
                  .replace(/([a-z])([A-Z])/g, '$1 $2');
              };
              
              return (
                <FormField
                  key={field}
                  control={form.control}
                  name={field}
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>{formatLabel(field)}</FormLabel>
                      <FormControl>
                        {field.toLowerCase().includes('description') || field.toLowerCase().includes('grounds') ? (
                          <Textarea 
                            value={value as string || ''}
                            onChange={onChange}
                            {...fieldProps}
                            placeholder={`Enter ${formatLabel(field).toLowerCase()}`}
                            rows={4}
                          />
                        ) : (
                          <Input 
                            value={value as string || ''}
                            onChange={onChange}
                            {...fieldProps}
                            placeholder={`Enter ${formatLabel(field).toLowerCase()}`}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            })}
            
            <div className="flex justify-between mt-8">
              <Button type="button" variant="outline" onClick={() => navigate("/document-selection")}>
                Back
              </Button>
              <Button type="submit">
                Preview Document
              </Button>
            </div>
          </form>
        </Form>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Document Preview</h3>
        <Card className="p-6 bg-white rounded shadow-sm h-[600px] overflow-auto">
          <div className="prose prose-sm max-w-none">
            {previewContent ? (
              <div dangerouslySetInnerHTML={{ __html: previewContent.replace(/\n/g, '<br />') }} />
            ) : (
              <div className="text-gray-400 italic">
                Fill in the form to preview your document here.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
