import React, { useState, useEffect } from "react";
import { 
  ComposableMap, 
  Geographies, 
  Geography,
  ZoomableGroup,
  Marker
} from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, MapPin } from "lucide-react";

// GeoJSON for Canadian provinces
const CANADA_GEO_URL = "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/canada.geojson";

interface ProvinceData {
  id: string;
  name: string;
  tenantRights: {
    rating: number;
    details: string[];
    resources: { name: string; url: string }[];
  };
  parentalRights: {
    rating: number;
    details: string[];
    resources: { name: string; url: string }[];
  };
  keyCities: { name: string; coordinates: [number, number] }[];
}

const provinceData: ProvinceData[] = [
  {
    id: "ON",
    name: "Ontario",
    tenantRights: {
      rating: 4,
      details: [
        "Rent increase caps of 2.5% for 2023",
        "Landlord and Tenant Board for dispute resolution",
        "90-day notice required for rent increases",
        "Tenants have right to reasonable enjoyment"
      ],
      resources: [
        { name: "Landlord and Tenant Board", url: "https://tribunalsontario.ca/ltb/" },
        { name: "Ontario Tenant Rights", url: "https://www.ontario.ca/page/renting-ontario-your-rights" }
      ]
    },
    parentalRights: {
      rating: 3,
      details: [
        "Birth parents have automatic parental rights",
        "Non-birth parents may need to apply for parental recognition",
        "CAS must follow specific protocols for removal",
        "Parents have right to legal representation in child protection cases"
      ],
      resources: [
        { name: "Ontario Child Protection", url: "https://www.ontario.ca/page/child-protection-services" },
        { name: "Legal Aid Ontario", url: "https://www.legalaid.on.ca/services/family-legal-issues/child-protection/" }
      ]
    },
    keyCities: [
      { name: "Toronto", coordinates: [-79.3832, 43.6532] },
      { name: "Ottawa", coordinates: [-75.6972, 45.4215] }
    ]
  },
  {
    id: "QC",
    name: "Quebec",
    tenantRights: {
      rating: 5,
      details: [
        "Rental Board (TAL) controls rent increases",
        "Landlords cannot refuse pets without valid reason",
        "Leases automatically renew",
        "Extensive eviction protections for tenants"
      ],
      resources: [
        { name: "Tribunal administratif du logement", url: "https://www.tal.gouv.qc.ca/" },
        { name: "Educaloi Housing Rights", url: "https://educaloi.qc.ca/en/categories/housing/" }
      ]
    },
    parentalRights: {
      rating: 4,
      details: [
        "Strong recognition of parental authority",
        "Both parents have equal rights to decision-making",
        "DYP must prove reasonable grounds for intervention",
        "Parents entitled to legal aid for child protection matters"
      ],
      resources: [
        { name: "Director of Youth Protection", url: "https://www.quebec.ca/en/family-and-support-for-individuals/childhood/youth-protection" },
        { name: "Commission des droits de la personne", url: "https://www.cdpdj.qc.ca/en" }
      ]
    },
    keyCities: [
      { name: "Montreal", coordinates: [-73.5674, 45.5017] },
      { name: "Quebec City", coordinates: [-71.2082, 46.8139] }
    ]
  },
  {
    id: "BC",
    name: "British Columbia",
    tenantRights: {
      rating: 4,
      details: [
        "Rent increases limited to 2% for 2023",
        "Residential Tenancy Branch for dispute resolution",
        "Tenants can withhold rent for serious repairs",
        "Strong protections against eviction"
      ],
      resources: [
        { name: "Residential Tenancy Branch", url: "https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies" },
        { name: "TRAC Tenant Resource", url: "https://tenants.bc.ca/" }
      ]
    },
    parentalRights: {
      rating: 4,
      details: [
        "Parents maintain rights unless court orders otherwise",
        "MCFD must follow specific steps before removal",
        "Parents entitled to disclosure of evidence",
        "Indigenous families have specific considerations in child welfare"
      ],
      resources: [
        { name: "Ministry of Children and Family Development", url: "https://www2.gov.bc.ca/gov/content/governments/organizational-structure/ministries-organizations/ministries/children-and-family-development" },
        { name: "Legal Aid BC", url: "https://legalaid.bc.ca/legal_aid/childProtection" }
      ]
    },
    keyCities: [
      { name: "Vancouver", coordinates: [-123.1207, 49.2827] },
      { name: "Victoria", coordinates: [-123.3656, 48.4284] }
    ]
  },
  {
    id: "AB",
    name: "Alberta",
    tenantRights: {
      rating: 3,
      details: [
        "No rent control or rent increase limits",
        "Residential Tenancy Dispute Resolution Service",
        "24-hour notice required for landlord entry",
        "Security deposits limited to one month's rent"
      ],
      resources: [
        { name: "Residential Tenancy Dispute Resolution Service", url: "https://www.alberta.ca/residential-tenancy-dispute-resolution-service.aspx" },
        { name: "Alberta Tenant Rights", url: "https://www.alberta.ca/information-tenants-landlords.aspx" }
      ]
    },
    parentalRights: {
      rating: 3,
      details: [
        "Parents have right to be informed of child intervention",
        "Child intervention services required to explore family options",
        "Parents can request administrative review of decisions",
        "Right to legal representation in child protection hearings"
      ],
      resources: [
        { name: "Alberta Children's Services", url: "https://www.alberta.ca/childrens-services.aspx" },
        { name: "Legal Aid Alberta", url: "https://www.legalaid.ab.ca/services/family-matters/" }
      ]
    },
    keyCities: [
      { name: "Calgary", coordinates: [-114.0719, 51.0447] },
      { name: "Edmonton", coordinates: [-113.4909, 53.5444] }
    ]
  },
  {
    id: "MB",
    name: "Manitoba",
    tenantRights: {
      rating: 3,
      details: [
        "Residential Tenancies Commission for disputes",
        "Rent increases capped at 2.5% for 2023",
        "24-hour notice required for landlord entry",
        "Tenants have right to sublet with consent"
      ],
      resources: [
        { name: "Residential Tenancies Branch", url: "https://www.gov.mb.ca/cca/rtb/" },
        { name: "Tenant Rights Manitoba", url: "https://www.gov.mb.ca/cca/rtb/tenant/index.html" }
      ]
    },
    parentalRights: {
      rating: 3,
      details: [
        "Parents entitled to information about child welfare proceedings",
        "Child and Family Services must attempt family reunification when possible",
        "Parents have right to appeal apprehension orders",
        "Indigenous families have special considerations"
      ],
      resources: [
        { name: "Manitoba Child and Family Services", url: "https://www.gov.mb.ca/fs/childfam/index.html" },
        { name: "Legal Aid Manitoba", url: "https://www.legalaid.mb.ca/" }
      ]
    },
    keyCities: [
      { name: "Winnipeg", coordinates: [-97.1385, 49.8951] },
      { name: "Brandon", coordinates: [-99.9515, 49.8436] }
    ]
  },
  {
    id: "SK",
    name: "Saskatchewan",
    tenantRights: {
      rating: 2,
      details: [
        "No rent control or rent increase caps",
        "Office of Residential Tenancies for disputes",
        "24-hour notice required for landlord entry",
        "Limited eviction protections"
      ],
      resources: [
        { name: "Office of Residential Tenancies", url: "https://www.saskatchewan.ca/government/government-structure/boards-commissions-and-agencies/office-of-residential-tenancies" },
        { name: "Saskatchewan Tenant Rights", url: "https://www.saskatchewan.ca/residents/housing-and-renting/renting-and-leasing/tenant-rights-and-responsibilities" }
      ]
    },
    parentalRights: {
      rating: 3,
      details: [
        "Parents must be notified of child apprehension",
        "Ministry required to develop case plan with family input",
        "Parents have right to apply for return of child",
        "Legal representation available for child protection hearings"
      ],
      resources: [
        { name: "Saskatchewan Child and Family Services", url: "https://www.saskatchewan.ca/residents/family-and-social-support/child-and-family-services" },
        { name: "Public Legal Education Association", url: "https://www.plea.org/family-law" }
      ]
    },
    keyCities: [
      { name: "Saskatoon", coordinates: [-106.6702, 52.1332] },
      { name: "Regina", coordinates: [-104.6189, 50.4452] }
    ]
  },
  {
    id: "NS",
    name: "Nova Scotia",
    tenantRights: {
      rating: 3,
      details: [
        "Rent increases limited to 2% until December 2023",
        "Residential Tenancies program for dispute resolution",
        "Notice periods based on length of tenancy",
        "Security deposits limited to half month's rent"
      ],
      resources: [
        { name: "Residential Tenancies Program", url: "https://beta.novascotia.ca/programs-and-services/residential-tenancies-program" },
        { name: "Nova Scotia Legal Aid", url: "https://www.nslegalaid.ca/legal-issues/housing/" }
      ]
    },
    parentalRights: {
      rating: 3,
      details: [
        "Parents have right to legal representation",
        "Department of Community Services must meet strict criteria for removal",
        "Court oversight of child protection proceedings",
        "Parents can apply for variation of orders"
      ],
      resources: [
        { name: "Child Protection Services", url: "https://novascotia.ca/coms/families/childprotection/" },
        { name: "Nova Scotia Legal Aid", url: "https://www.nslegalaid.ca/legal-issues/child-protection/" }
      ]
    },
    keyCities: [
      { name: "Halifax", coordinates: [-63.5724, 44.6476] },
      { name: "Sydney", coordinates: [-60.1831, 46.1368] }
    ]
  },
  {
    id: "NB",
    name: "New Brunswick",
    tenantRights: {
      rating: 2,
      details: [
        "No rent control",
        "Residential Tenancies Tribunal for disputes",
        "24-hour notice required for landlord entry",
        "Limited protections against eviction"
      ],
      resources: [
        { name: "Residential Tenancies Tribunal", url: "https://www2.gnb.ca/content/gnb/en/services/services_renderer.201292.Residential_Tenancies_Tribunal.html" },
        { name: "Public Legal Education NB", url: "https://www.legal-info-legale.nb.ca/en/landlords_and_tenants" }
      ]
    },
    parentalRights: {
      rating: 3,
      details: [
        "Parents entitled to legal representation",
        "Social Development must follow strict protocols",
        "Parents have right to maintain contact during investigation",
        "Court must approve permanent guardianship orders"
      ],
      resources: [
        { name: "Child Protection Services", url: "https://www2.gnb.ca/content/gnb/en/departments/social_development/protection.html" },
        { name: "New Brunswick Legal Aid", url: "https://www.legalaid-aidejuridique-nb.ca/" }
      ]
    },
    keyCities: [
      { name: "Fredericton", coordinates: [-66.6431, 45.9636] },
      { name: "Saint John", coordinates: [-66.0633, 45.2733] }
    ]
  },
  {
    id: "NL",
    name: "Newfoundland and Labrador",
    tenantRights: {
      rating: 2,
      details: [
        "No rent control",
        "Residential Tenancies Division for disputes",
        "24-hour notice required for landlord entry",
        "Limited protections for tenants"
      ],
      resources: [
        { name: "Residential Tenancies", url: "https://www.servicenl.gov.nl.ca/landlord/index.html" },
        { name: "Public Legal Information", url: "https://publiclegalinfo.com/housing/" }
      ]
    },
    parentalRights: {
      rating: 3,
      details: [
        "Parents entitled to legal representation",
        "Children's Law Act governs parental rights",
        "Department of Children, Seniors and Social Development must follow strict protocols",
        "Court oversight of child protection proceedings"
      ],
      resources: [
        { name: "Child Protection Services", url: "https://www.gov.nl.ca/cssd/childrenfamilies/childprotection/" },
        { name: "Newfoundland and Labrador Legal Aid", url: "https://www.legalaid.nl.ca/" }
      ]
    },
    keyCities: [
      { name: "St. John's", coordinates: [-52.7126, 47.5615] },
      { name: "Corner Brook", coordinates: [-57.9528, 48.9567] }
    ]
  },
  {
    id: "PE",
    name: "Prince Edward Island",
    tenantRights: {
      rating: 3,
      details: [
        "Rent increases capped at 0-10% for 2023 (varies by property)",
        "Director of Residential Rental Property for disputes",
        "24-hour notice required for landlord entry",
        "Moderate eviction protections"
      ],
      resources: [
        { name: "Office of the Director of Residential Rental Property", url: "https://www.irac.pe.ca/rental/" },
        { name: "Community Legal Information", url: "https://www.legalinfopei.ca/en/housing-laws" }
      ]
    },
    parentalRights: {
      rating: 3,
      details: [
        "Parents entitled to notification of child protection proceedings",
        "Child Protection Act governs intervention criteria",
        "Parents have right to legal representation",
        "Court must approve permanent orders"
      ],
      resources: [
        { name: "Child Protection Services", url: "https://www.princeedwardisland.ca/en/information/social-development-and-housing/child-protection-services" },
        { name: "PEI Legal Aid", url: "https://www.legalaidpei.ca/" }
      ]
    },
    keyCities: [
      { name: "Charlottetown", coordinates: [-63.1261, 46.2382] },
      { name: "Summerside", coordinates: [-63.7891, 46.3950] }
    ]
  },
  {
    id: "YT",
    name: "Yukon",
    tenantRights: {
      rating: 3,
      details: [
        "Residential Landlord and Tenant Office for disputes",
        "Rent increases limited to once per year",
        "24-hour notice required for landlord entry",
        "Moderate tenant protections"
      ],
      resources: [
        { name: "Residential Landlord and Tenant Office", url: "https://yukon.ca/en/housing-and-property/renting/residential-tenancies-office" },
        { name: "Yukon Public Legal Education", url: "https://www.yukonplei.ca/housing.html" }
      ]
    },
    parentalRights: {
      rating: 3,
      details: [
        "Parents entitled to legal representation",
        "Child and Family Services Act governs intervention",
        "Special provisions for Indigenous families",
        "Parents have right to appeal protection decisions"
      ],
      resources: [
        { name: "Family and Children's Services", url: "https://yukon.ca/en/family-and-social-supports/child-and-youth-services" },
        { name: "Yukon Legal Services Society", url: "https://legalaid.yk.ca/" }
      ]
    },
    keyCities: [
      { name: "Whitehorse", coordinates: [-135.0568, 60.7212] }
    ]
  },
  {
    id: "NT",
    name: "Northwest Territories",
    tenantRights: {
      rating: 2,
      details: [
        "No rent control",
        "Rental Office for dispute resolution",
        "24-hour notice required for landlord entry",
        "Limited eviction protections"
      ],
      resources: [
        { name: "Rental Office", url: "https://www.justice.gov.nt.ca/en/rental-office/" },
        { name: "NWT Legal Aid", url: "https://www.justice.gov.nt.ca/en/legal-aid/" }
      ]
    },
    parentalRights: {
      rating: 3,
      details: [
        "Parents entitled to legal representation",
        "Child and Family Services Act governs intervention",
        "Special provisions for Indigenous families",
        "Plan of care committees can include family members"
      ],
      resources: [
        { name: "Child and Family Services", url: "https://www.hss.gov.nt.ca/en/services/child-and-family-services" },
        { name: "NWT Legal Aid", url: "https://www.justice.gov.nt.ca/en/legal-aid/" }
      ]
    },
    keyCities: [
      { name: "Yellowknife", coordinates: [-114.3719, 62.4540] }
    ]
  },
  {
    id: "NU",
    name: "Nunavut",
    tenantRights: {
      rating: 2,
      details: [
        "No rent control",
        "Rental Officer for dispute resolution",
        "24-hour notice required for landlord entry",
        "Limited tenant protections"
      ],
      resources: [
        { name: "Rental Officer", url: "https://www.nunavutlegalservices.ca/housing-law" },
        { name: "Legal Services Board", url: "https://www.nunavutlegalservices.ca/" }
      ]
    },
    parentalRights: {
      rating: 3,
      details: [
        "Parents entitled to legal representation",
        "Child and Family Services Act governs intervention",
        "Strong focus on Inuit cultural values",
        "Community involvement in child welfare decisions"
      ],
      resources: [
        { name: "Child and Family Services", url: "https://www.gov.nu.ca/family-services/information/child-family-services" },
        { name: "Legal Services Board", url: "https://www.nunavutlegalservices.ca/" }
      ]
    },
    keyCities: [
      { name: "Iqaluit", coordinates: [-68.5170, 63.7467] }
    ]
  }
];

// Map configuration interface
interface MapConfig {
  center: [number, number];
  scale: number;
  minZoom: number;
  maxZoom: number;
}

// Map configuration
const mapConfig: MapConfig = {
  center: [-95, 62],
  scale: 600,
  minZoom: 1,
  maxZoom: 5,
};

export default function CanadaMap() {
  const [tooltipContent, setTooltipContent] = useState("");
  const [activeCategory, setActiveCategory] = useState<"tenantRights" | "parentalRights">("tenantRights");
  const [selectedProvince, setSelectedProvince] = useState<ProvinceData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  // Color scale for province ratings
  const colorScale = scaleQuantile<string>()
    .domain(provinceData.map(p => p[activeCategory].rating))
    .range([
      "#cfe2f3", // Lightest blue for lowest ratings
      "#9fc5e8",
      "#6fa8dc",
      "#3d85c6",
      "#0b5394"  // Darkest blue for highest ratings
    ]);

  // Handler for province click
  const handleProvinceClick = (geo: Geography) => {
    const provinceId = geo.properties.iso_a2_sub;
    const province = provinceData.find(p => p.id === provinceId);
    if (province) {
      setSelectedProvince(province);
    }
  };

  // Handle mouse events for tooltip
  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = (geo: Geography) => {
    const provinceId = geo.properties.iso_a2_sub;
    const province = provinceData.find(p => p.id === provinceId);
    if (province) {
      const rating = province[activeCategory].rating;
      setTooltipContent(`${province.name}: ${rating}/5 rating`);
      setIsTooltipVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsTooltipVisible(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Canadian Legal Rights Interactive Map</CardTitle>
          <CardDescription>Explore legal rights across Canadian provinces and territories</CardDescription>
          <Tabs 
            defaultValue="tenantRights" 
            value={activeCategory}
            onValueChange={(value) => setActiveCategory(value as "tenantRights" | "parentalRights")}
            className="w-full mt-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tenantRights">Tenant Rights</TabsTrigger>
              <TabsTrigger value="parentalRights">Parental Rights</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col-reverse md:flex-row gap-8">
            <div className="w-full md:w-2/3 relative" onMouseMove={handleMouseMove}>
              <div className="bg-white rounded-lg border overflow-hidden">
                <ComposableMap
                  projection="geoAzimuthalEqualArea"
                  projectionConfig={{
                    rotate: [95, -60, 0],
                    scale: mapConfig.scale,
                  }}
                  width={800}
                  height={600}
                  style={{ width: "100%", height: "auto" }}
                >
                  <ZoomableGroup
                    center={mapConfig.center}
                    zoom={1}
                    maxZoom={mapConfig.maxZoom}
                    minZoom={mapConfig.minZoom}
                  >
                    <Geographies geography={CANADA_GEO_URL}>
                      {({ geographies }: { geographies: Geography[] }) =>
                        geographies.map((geo: Geography) => {
                          const provinceId = geo.properties.iso_a2_sub;
                          const province = provinceData.find(p => p.id === provinceId);
                          const isActive = selectedProvince?.id === provinceId;
                          
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={province ? colorScale(province[activeCategory].rating) : "#EEE"}
                              stroke="#FFFFFF"
                              strokeWidth={0.5}
                              style={{
                                default: {
                                  outline: "none",
                                  transition: "all 0.3s",
                                },
                                hover: {
                                  fill: "#90CDF4",
                                  outline: "none",
                                  cursor: "pointer",
                                  stroke: "#000",
                                  strokeWidth: 1
                                },
                                pressed: {
                                  outline: "none",
                                },
                              }}
                              onClick={() => handleProvinceClick(geo)}
                              onMouseEnter={() => handleMouseEnter(geo)}
                              onMouseLeave={handleMouseLeave}
                            />
                          );
                        })
                      }
                    </Geographies>
                    
                    {/* Render city markers only for the selected province */}
                    {selectedProvince?.keyCities.map(city => (
                      <Marker key={city.name} coordinates={city.coordinates}>
                        <g transform="translate(-12, -24)">
                          <MapPin 
                            size={24} 
                            className="text-red-500 stroke-[1.5px] fill-current"
                          />
                        </g>
                        <text
                          textAnchor="middle"
                          y={-30}
                          style={{ fontFamily: "system-ui", fill: "#242424", fontSize: "10px" }}
                        >
                          {city.name}
                        </text>
                      </Marker>
                    ))}
                  </ZoomableGroup>
                </ComposableMap>
                
                {/* Rating Legend */}
                <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow-md">
                  <div className="text-xs font-semibold mb-1">Rating Scale</div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-[#cfe2f3]"></div>
                    <div className="w-4 h-4 bg-[#9fc5e8]"></div>
                    <div className="w-4 h-4 bg-[#6fa8dc]"></div>
                    <div className="w-4 h-4 bg-[#3d85c6]"></div>
                    <div className="w-4 h-4 bg-[#0b5394]"></div>
                    <div className="ml-2 text-xs">
                      <span>1</span>
                      <span className="mx-3">-</span>
                      <span>5</span>
                    </div>
                  </div>
                </div>
                
                {/* Tooltip */}
                {isTooltipVisible && (
                  <div 
                    className="absolute bg-black text-white py-1 px-2 rounded text-xs"
                    style={{ 
                      left: `${tooltipPosition.x + 10}px`, 
                      top: `${tooltipPosition.y - 20}px`,
                      transform: 'translate(-50%, -100%)',
                      pointerEvents: 'none',
                      zIndex: 1000
                    }}
                  >
                    {tooltipContent}
                  </div>
                )}
              </div>
              
              <div className="flex justify-center mt-4 text-sm text-gray-500 items-center">
                <Info size={14} className="mr-1" />
                Click on a province to view detailed rights information
              </div>
            </div>
            
            <div className="w-full md:w-1/3">
              {selectedProvince ? (
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{selectedProvince.name}</h3>
                    <Badge variant="outline" className="text-lg">
                      {selectedProvince[activeCategory].rating}/5
                    </Badge>
                  </div>
                  
                  <h4 className="font-semibold mb-2">
                    {activeCategory === "tenantRights" ? "Tenant Rights" : "Parental Rights"}
                  </h4>
                  
                  <ul className="space-y-2 mb-4">
                    {selectedProvince[activeCategory].details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="text-blue-500 mt-1">•</div>
                        <div>{detail}</div>
                      </li>
                    ))}
                  </ul>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Resources</h4>
                    <ul className="space-y-2">
                      {selectedProvince[activeCategory].resources.map((resource, i) => (
                        <li key={i}>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center"
                          >
                            <span className="mr-1">→</span>
                            {resource.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 text-center flex flex-col items-center justify-center h-full">
                  <MapPin size={48} className="text-blue-500 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Select a Province</h3>
                  <p className="text-blue-600 text-sm">
                    Click on any province or territory to view detailed information about 
                    {activeCategory === "tenantRights" ? " tenant " : " parental "} 
                    rights in that region
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}