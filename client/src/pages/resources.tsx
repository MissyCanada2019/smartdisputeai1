import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LegalResourceLinks from "@/components/resources/LegalResourceLinks";
import { disputeCategories } from "@shared/schema";

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-800 inline-block text-transparent bg-clip-text">
            Know Your Rights
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Access free legal resources and information specific to your province and situation.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Browse Resources by Category</h2>
          <Tabs onValueChange={setActiveCategory} defaultValue="">
            <TabsList className="w-full max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4">
              {disputeCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
              <TabsTrigger value="">All Resources</TabsTrigger>
            </TabsList>
            {disputeCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                <div className="grid gap-6 items-start">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-xl font-semibold mb-3">{category.name} Rights</h3>
                    <div className="prose max-w-none text-gray-700">
                      {category.id === "landlord-tenant" && (
                        <>
                          <p>As a tenant in Canada, you have several important rights, including:</p>
                          <ul>
                            <li>The right to a safe and well-maintained home</li>
                            <li>Protection against unfair or unlawful eviction</li>
                            <li>Right to privacy and reasonable notice before landlord enters</li>
                            <li>Protection against discrimination based on race, gender, disability, etc.</li>
                            <li>The right to dispute unfair rent increases (varies by province)</li>
                          </ul>
                          <p>Provincial laws provide specific protections, which is why location-specific resources are critical.</p>
                        </>
                      )}

                      {category.id === "childrens-aid" && (
                        <>
                          <p>When dealing with Children's Aid Societies in Canada, you have important rights:</p>
                          <ul>
                            <li>The right to be informed about any concerns regarding your children</li>
                            <li>The right to legal representation and court hearing before children can be removed (except in emergencies)</li>
                            <li>The right to participate in creating a plan to address concerns</li>
                            <li>The right to maintain contact with your children in most circumstances</li>
                            <li>The right to be treated with respect and without discrimination</li>
                          </ul>
                          <p>The child welfare system can be complex, but you have the right to advocate for your family.</p>
                        </>
                      )}

                      {category.id === "equifax" && (
                        <>
                          <p>When dealing with credit bureaus like Equifax in Canada, you have these rights:</p>
                          <ul>
                            <li>The right to access your credit report for free at least once a year</li>
                            <li>The right to dispute inaccurate or incomplete information</li>
                            <li>The right to add a consumer statement to your file</li>
                            <li>The right to know who has accessed your credit report</li>
                            <li>The right to have outdated negative information removed after a specific time period</li>
                          </ul>
                          <p>Credit bureaus must investigate disputes and correct errors in a timely manner.</p>
                        </>
                      )}

                      {category.id === "transition" && (
                        <>
                          <p>When using transition services in Canada, you should know these rights:</p>
                          <ul>
                            <li>The right to be treated with dignity and respect</li>
                            <li>The right to access emergency shelter services</li>
                            <li>The right to privacy and confidentiality</li>
                            <li>The right to receive services without discrimination</li>
                            <li>The right to be informed about available resources and support options</li>
                          </ul>
                          <p>Transition services should provide support that respects your autonomy and helps you move toward stability.</p>
                        </>
                      )}
                    </div>
                  </div>
                  <LegalResourceLinks category={category.id} />
                </div>
              </TabsContent>
            ))}
            <TabsContent value="" className="mt-6">
              <div className="grid gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-xl font-semibold mb-3">General Legal Rights in Canada</h3>
                  <div className="prose max-w-none text-gray-700">
                    <p>All Canadians have fundamental rights protected by the Canadian Charter of Rights and Freedoms, including:</p>
                    <ul>
                      <li>Freedom of expression and association</li>
                      <li>The right to equal treatment under the law</li>
                      <li>The right to be presumed innocent until proven guilty</li>
                      <li>The right to reasonable privacy</li>
                      <li>Protection against unreasonable search and seizure</li>
                    </ul>
                    <p>Understanding your rights is the first step to effectively advocating for yourself.</p>
                  </div>
                </div>
                <LegalResourceLinks />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}