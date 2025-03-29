import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentTemplate, pricingTiers } from "@shared/schema";

interface DocumentCardProps {
  template: DocumentTemplate;
  onSelect: () => void;
  userIncome?: string;
  requestIncomeBased?: boolean;
}

export default function DocumentCard({
  template,
  onSelect,
  userIncome,
  requestIncomeBased
}: DocumentCardProps) {
  // Calculate the discounted price if income-based pricing is requested
  const getPrice = () => {
    if (requestIncomeBased && userIncome) {
      const tier = pricingTiers.find(tier => tier.incomeRange === userIncome);
      if (tier) {
        const discountedPrice = template.basePrice * (1 - tier.discountPercentage / 100);
        
        if (discountedPrice === 0) {
          return <span className="text-green-600 font-semibold">Free</span>;
        }
        
        return (
          <div>
            <span className="line-through text-gray-400 mr-2">${template.basePrice.toFixed(2)}</span>
            <span className="text-green-600 font-semibold">${discountedPrice.toFixed(2)}</span>
          </div>
        );
      }
    }
    
    return <span>${template.basePrice.toFixed(2)}</span>;
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gray-100 p-4 flex justify-center h-48">
        {template.previewImageUrl ? (
          <img 
            src={template.previewImageUrl} 
            alt={`${template.name} document preview`}
            className="h-full object-contain" 
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-400">
            No preview available
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-gray-800 mb-1">{template.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center text-xs text-gray-500">
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 mr-2">
              {template.applicableProvinces.includes("ALL") ? "All Provinces" : `${template.applicableProvinces.length} Provinces`}
            </span>
            {getPrice()}
          </div>
          <Button onClick={onSelect} className="ml-auto">
            Select
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
