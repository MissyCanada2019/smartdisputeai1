import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { provinces } from "@shared/schema";

// Define resources by province
const resourcesByProvince: Record<string, { title: string; url: string; description: string }[]> = {
  "Alberta": [
    {
      title: "Legal Aid Alberta",
      url: "https://www.legalaid.ab.ca/",
      description: "Provides legal services to Albertans with low incomes"
    },
    {
      title: "Centre for Public Legal Education Alberta",
      url: "https://www.cplea.ca/",
      description: "Free legal information for Albertans"
    },
    {
      title: "Alberta Human Rights Commission",
      url: "https://www.albertahumanrights.ab.ca/",
      description: "Resources for human rights complaints and issues"
    }
  ],
  "British Columbia": [
    {
      title: "Legal Aid BC",
      url: "https://legalaid.bc.ca/",
      description: "Legal services for people with low incomes"
    },
    {
      title: "Access Pro Bono BC",
      url: "https://accessprobono.ca/",
      description: "Free legal advice and representation"
    },
    {
      title: "Justice Education Society",
      url: "https://www.justiceeducation.ca/",
      description: "Resources on navigating BC's legal system"
    }
  ],
  "Manitoba": [
    {
      title: "Legal Aid Manitoba",
      url: "https://www.legalaid.mb.ca/",
      description: "Legal services for eligible Manitobans"
    },
    {
      title: "Community Legal Education Association",
      url: "https://www.communitylegal.mb.ca/",
      description: "Legal information and resources"
    },
    {
      title: "Manitoba Justice",
      url: "https://www.gov.mb.ca/justice/",
      description: "Government legal resources and services"
    }
  ],
  "New Brunswick": [
    {
      title: "New Brunswick Legal Aid Services Commission",
      url: "https://www.legalaid.nb.ca/",
      description: "Legal assistance for eligible residents"
    },
    {
      title: "Public Legal Education and Information Service",
      url: "http://www.legal-info-legale.nb.ca/",
      description: "Free legal information and education"
    }
  ],
  "Newfoundland and Labrador": [
    {
      title: "Newfoundland and Labrador Legal Aid Commission",
      url: "https://www.legalaid.nl.ca/",
      description: "Legal services for qualified residents"
    },
    {
      title: "Public Legal Information Association of NL",
      url: "https://publiclegalinfo.com/",
      description: "Legal information and education resources"
    }
  ],
  "Nova Scotia": [
    {
      title: "Nova Scotia Legal Aid",
      url: "https://www.nslegalaid.ca/",
      description: "Legal services for qualified residents"
    },
    {
      title: "Legal Information Society of Nova Scotia",
      url: "https://www.legalinfo.org/",
      description: "Free legal information and resources"
    }
  ],
  "Ontario": [
    {
      title: "Legal Aid Ontario",
      url: "https://www.legalaid.on.ca/",
      description: "Legal services for low-income Ontarians"
    },
    {
      title: "Community Legal Education Ontario",
      url: "https://www.cleo.on.ca/",
      description: "Free legal information resources"
    },
    {
      title: "Steps to Justice",
      url: "https://stepstojustice.ca/",
      description: "Practical legal information for everyday problems"
    },
    {
      title: "Ontario Tenant Rights",
      url: "https://ontariotenants.ca/",
      description: "Information on tenant rights and housing issues"
    }
  ],
  "Prince Edward Island": [
    {
      title: "PEI Legal Aid",
      url: "https://www.legalaidpei.ca/",
      description: "Legal services for eligible residents"
    },
    {
      title: "Community Legal Information",
      url: "https://www.legalinfopei.ca/",
      description: "Free legal information and resources"
    }
  ],
  "Quebec": [
    {
      title: "Commission des services juridiques",
      url: "https://www.csj.qc.ca/",
      description: "Legal aid services in Quebec"
    },
    {
      title: "Éducaloi",
      url: "https://educaloi.qc.ca/",
      description: "Legal information in plain language"
    }
  ],
  "Saskatchewan": [
    {
      title: "Legal Aid Saskatchewan",
      url: "https://www.legalaid.sk.ca/",
      description: "Legal services for qualified residents"
    },
    {
      title: "Public Legal Education Association of Saskatchewan",
      url: "https://www.plea.org/",
      description: "Legal information for the public"
    }
  ],
  "Northwest Territories": [
    {
      title: "Legal Aid Commission of the NWT",
      url: "https://www.justice.gov.nt.ca/en/legal-aid/",
      description: "Legal assistance for residents"
    }
  ],
  "Nunavut": [
    {
      title: "Legal Services Board of Nunavut",
      url: "https://nulas.ca/",
      description: "Legal aid services for Nunavut residents"
    }
  ],
  "Yukon": [
    {
      title: "Yukon Legal Services Society",
      url: "https://legalaid.yk.ca/",
      description: "Legal services for eligible Yukoners"
    }
  ],
  "National": [
    {
      title: "Department of Justice Canada",
      url: "https://www.justice.gc.ca/",
      description: "Federal government legal information"
    },
    {
      title: "Canadian Legal Information Institute (CanLII)",
      url: "https://www.canlii.org/",
      description: "Access to Canadian court judgments and legislation"
    },
    {
      title: "National Self-Represented Litigants Project",
      url: "https://representingyourselfcanada.com/",
      description: "Resources for self-represented litigants"
    }
  ]
};

// Define category-specific resources
const categoryResources: Record<string, { title: string; url: string; description: string }[]> = {
  "landlord-tenant": [
    {
      title: "Canada Mortgage and Housing Corporation",
      url: "https://www.cmhc-schl.gc.ca/",
      description: "Information on housing rights and responsibilities"
    }
  ],
  "childrens-aid": [
    {
      title: "Child Welfare League of Canada",
      url: "https://www.cwlc.ca/",
      description: "Resources for navigating child welfare systems"
    },
    {
      title: "Justice for Children and Youth",
      url: "https://jfcy.org/",
      description: "Legal rights for children and youth"
    }
  ],
  "equifax": [
    {
      title: "Financial Consumer Agency of Canada",
      url: "https://www.canada.ca/en/financial-consumer-agency.html",
      description: "Information on credit reporting and disputes"
    }
  ],
  "transition": [
    {
      title: "Homeless Hub",
      url: "https://www.homelesshub.ca/",
      description: "Resources for housing insecurity and transitions"
    }
  ]
};

interface LegalResourceLinksProps {
  category?: string;
}

export default function LegalResourceLinks({ category }: LegalResourceLinksProps) {
  const [selectedProvince, setSelectedProvince] = useState<string>("National");

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-red-50">
        <CardTitle className="text-red-700">Legal Resources</CardTitle>
        <CardDescription>
          Free resources to help you understand your rights and options
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <label htmlFor="province-select" className="block text-sm font-medium mb-2">
            Select Your Province/Territory
          </label>
          <Select
            value={selectedProvince}
            onValueChange={setSelectedProvince}
          >
            <SelectTrigger id="province-select" className="w-full">
              <SelectValue placeholder="Select a province" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="National">All of Canada (National)</SelectItem>
              {provinces.map((province) => (
                <SelectItem key={province.value} value={province.label}>
                  {province.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Province-specific resources */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">
            {selectedProvince === "National" ? "National Resources" : `${selectedProvince} Resources`}
          </h3>
          <div className="grid gap-3">
            {resourcesByProvince[selectedProvince]?.map((resource, index) => (
              <div key={index} className="border rounded-md p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{resource.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                      <span>Visit</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category-specific resources if category is provided */}
        {category && categoryResources[category] && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-lg">
              {category === "childrens-aid" ? "Children's Aid" : 
               category === "landlord-tenant" ? "Landlord-Tenant" : 
               category === "equifax" ? "Equifax" : 
               category === "transition" ? "Transition Services" : 
               category.charAt(0).toUpperCase() + category.slice(1)} Specific Resources
            </h3>
            <div className="grid gap-3">
              {categoryResources[category].map((resource, index) => (
                <div key={index} className="border rounded-md p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{resource.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        <span>Visit</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p>Disclaimer: These resources are provided for informational purposes only and do not constitute legal advice. SmartDispute.ai Canada is not affiliated with these organizations.</p>
        </div>
      </CardContent>
    </Card>
  );
}