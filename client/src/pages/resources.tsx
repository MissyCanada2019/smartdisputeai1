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
                          <p>As a tenant in Canada, you have significant legal protections. Landlord-tenant law varies by province, but there are common rights you should understand.</p>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">Basic Tenant Rights</h4>
                          <ul>
                            <li>The right to a safe and well-maintained home</li>
                            <li>Protection against unfair or unlawful eviction</li>
                            <li>Right to privacy and reasonable notice before landlord enters</li>
                            <li>Protection against discrimination based on race, gender, disability, etc.</li>
                            <li>The right to dispute unfair rent increases (varies by province)</li>
                          </ul>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">When Facing Eviction</h4>
                          <ul>
                            <li>Landlords must provide proper written notice with specific reasons</li>
                            <li>Notice periods vary by province (usually 30-90 days)</li>
                            <li>You have the right to dispute eviction through your provincial tenant board</li>
                            <li>Even with an eviction notice, only a court/tribunal can order you to leave</li>
                            <li>Self-help evictions (changing locks, removing belongings, cutting utilities) are illegal</li>
                          </ul>
                          <p className="mt-2 mb-2">Important: Landlords cannot physically remove you or your belongings themselves - only a sheriff or bailiff with a court order can enforce an eviction.</p>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">Repairs and Maintenance</h4>
                          <ul>
                            <li>Always request repairs in writing and keep copies</li>
                            <li>If essential repairs aren't made in reasonable time, contact your local tenant board</li>
                            <li>Document all issues with photos, dates, and detailed descriptions</li>
                            <li>In some provinces, you may withhold rent or make repairs and deduct costs (check local laws first)</li>
                            <li>Housing that poses health/safety risks may violate municipal property standards</li>
                          </ul>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">Dealing with Rent Increases</h4>
                          <ul>
                            <li>Most provinces limit how often and by how much rent can increase</li>
                            <li>Proper written notice is required (usually 90 days)</li>
                            <li>You can dispute increases that exceed provincial guidelines</li>
                            <li>Rent cannot be increased during a fixed-term lease unless specified in the lease</li>
                            <li>Landlords cannot increase rent in retaliation for exercising your rights</li>
                          </ul>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">Protecting Your Privacy</h4>
                          <ul>
                            <li>Landlords must provide notice before entering (usually 24 hours)</li>
                            <li>Entry is limited to reasonable times and purposes</li>
                            <li>Emergency entry without notice is permitted only for genuine emergencies</li>
                            <li>Excessive entries or inspections may constitute harassment</li>
                            <li>You can file a complaint if your privacy rights are violated</li>
                          </ul>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">Filing LTB Applications (Ontario)</h4>
                          <ul>
                            <li><strong>T2 Application:</strong> Use when your landlord has harassed you, substantially interfered with your reasonable enjoyment, or unreasonably interfered with your rights</li>
                            <li><strong>T6 Application:</strong> Use when your landlord hasn't done required maintenance or repairs, or provided essential services</li>
                            <li>Both applications can request rent abatement, compensation, and orders for repairs/services</li>
                            <li>File applications within one year of the alleged conduct or breach</li>
                            <li>Gather evidence: photos, videos, written requests for repairs, witness statements</li>
                          </ul>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">When to File a T6 Application</h4>
                          <ul>
                            <li>No heat, electricity, water or other essential services</li>
                            <li>Unrepaired damage affecting livability (leaking roof, mold, broken appliances)</li>
                            <li>Pest infestations that the landlord hasn't adequately addressed</li>
                            <li>Safety hazards (broken locks, malfunctioning smoke detectors)</li>
                            <li>After providing written repair requests with reasonable time to complete</li>
                          </ul>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">When to File a T2 Application</h4>
                          <ul>
                            <li>Harassment, threats, or intimidation from your landlord</li>
                            <li>Landlord entering without proper notice repeatedly</li>
                            <li>Disconnection or interference with vital services</li>
                            <li>Discrimination based on protected grounds</li>
                            <li>Unreasonable rules that substantially interfere with your enjoyment</li>
                          </ul>
                          
                          <p className="mt-4">Provincial laws provide specific protections, which is why consulting location-specific resources is critical. Document everything in writing and know that tenant boards exist to help mediate disputes. Similar applications exist in other provinces but may have different names and processes.</p>
                        </>
                      )}

                      {category.id === "childrens-aid" && (
                        <>
                          <p>When dealing with Children's Aid Societies in Canada, you have important rights. Understanding these rights is crucial to protecting your family.</p>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">When They Knock on Your Door</h4>
                          <ul>
                            <li>You have the right to know why they are investigating</li>
                            <li>You can ask for identification from any CAS worker</li>
                            <li>CAS visits are <strong>voluntary</strong> unless they have a court order</li>
                            <li>You can politely refuse entry to your home without a court order</li>
                            <li>You can request to reschedule the meeting at a time when you can have a support person present</li>
                          </ul>
                          <p className="mt-2 mb-2">Remember: While CAS has a duty to investigate reports, they cannot enter your home without consent or a court order. Stay calm and document everything.</p>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">Recognizing Intimidation Tactics</h4>
                          <ul>
                            <li>Threatening immediate removal of children without a court order</li>
                            <li>Suggesting that refusing entry means you "have something to hide"</li>
                            <li>Pressuring you to sign documents without legal advice</li>
                            <li>Making promises verbally but refusing to put them in writing</li>
                            <li>Using fear-based language instead of factual concerns</li>
                          </ul>
                          <p className="mt-2 mb-2">If you feel intimidated, calmly state that you want to cooperate but need time to consult with a legal professional.</p>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">Your Legal Rights</h4>
                          <ul>
                            <li>The right to be fully informed about any concerns regarding your children</li>
                            <li>The right to legal representation at all stages of CAS involvement</li>
                            <li>The right to a court hearing before children can be removed (except in emergencies)</li>
                            <li>The right to participate in creating a plan to address concerns</li>
                            <li>The right to maintain contact with your children in most circumstances</li>
                            <li>The right to be treated with respect and without discrimination</li>
                          </ul>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">After Being Served a Court Order</h4>
                          <ul>
                            <li>Read the order carefully - it contains specific conditions you must follow</li>
                            <li>Contact legal aid or a lawyer immediately</li>
                            <li>Attend all scheduled court appearances - missing court can severely impact your case</li>
                            <li>Gather documentation about your parenting abilities from doctors, teachers, etc.</li>
                            <li>Follow through with any services or programs recommended</li>
                            <li>Document all interactions with CAS workers</li>
                          </ul>
                          <p className="mt-2">The child welfare system can be overwhelming, but you have the right and ability to advocate for your family. Document everything, seek legal advice immediately, and focus on addressing the specific concerns raised.</p>
                        </>
                      )}

                      {category.id === "equifax" && (
                        <>
                          <p>When dealing with credit bureaus like Equifax in Canada, you have substantial legal rights to ensure your credit information is accurate and fairly represented.</p>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">Your Basic Credit Rights</h4>
                          <ul>
                            <li>The right to access your credit report for free at least once a year</li>
                            <li>The right to dispute inaccurate or incomplete information</li>
                            <li>The right to add a consumer statement to your file</li>
                            <li>The right to know who has accessed your credit report</li>
                            <li>The right to have outdated negative information removed after a specific time period</li>
                          </ul>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">Accessing Your Credit Report</h4>
                          <ul>
                            <li>Request your free credit report directly from Equifax Canada by mail, phone, or online</li>
                            <li>Verify your identity using government ID and personal information</li>
                            <li>Review your report carefully for errors, including accounts you didn't open</li>
                            <li>Check for incorrectly reported late payments or collections</li>
                            <li>Verify your personal information is accurate (name, address, SIN, etc.)</li>
                          </ul>
                          <p className="mt-2 mb-2">Tip: Requesting your report by mail is free, while instant online access may have a fee.</p>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">Disputing Errors Step-by-Step</h4>
                          <ul>
                            <li>Document all errors with supporting evidence (payment receipts, statements, etc.)</li>
                            <li>File a dispute in writing directly with Equifax, clearly identifying each error</li>
                            <li>Include copies (never originals) of supporting documents</li>
                            <li>Keep records of all communications, including dates and names</li>
                            <li>Follow up if you don't receive a response within 30 days</li>
                          </ul>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">If Your Dispute Is Rejected</h4>
                          <ul>
                            <li>Request an explanation for why the information was verified as accurate</li>
                            <li>Add a consumer statement (up to 100 words) explaining your side</li>
                            <li>File a complaint with the Financial Consumer Agency of Canada</li>
                            <li>Contact the original creditor directly to resolve the issue</li>
                            <li>Consider consulting a consumer rights lawyer if the issue significantly impacts you</li>
                          </ul>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">Protecting Your Credit Identity</h4>
                          <ul>
                            <li>Place a fraud alert on your credit file if you suspect identity theft</li>
                            <li>Request a credit freeze to prevent new accounts being opened in your name</li>
                            <li>Review your credit report regularly to catch unauthorized activity</li>
                            <li>Report suspicious activity immediately to Equifax and the police</li>
                            <li>Keep detailed records of all fraud-related communications</li>
                          </ul>
                          
                          <p className="mt-4">Credit bureaus must investigate disputes and correct errors in a timely manner, usually within 30 days. Persistence is key when addressing credit report errors, as they can significantly impact your financial well-being.</p>
                        </>
                      )}

                      {category.id === "transition" && (
                        <>
                          <p>When navigating life transitions and accessing support services in Canada, understanding your rights is essential to receiving the assistance you deserve with dignity.</p>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">Your Basic Rights in Transition Services</h4>
                          <ul>
                            <li>The right to be treated with dignity and respect</li>
                            <li>The right to access emergency shelter services</li>
                            <li>The right to privacy and confidentiality</li>
                            <li>The right to receive services without discrimination</li>
                            <li>The right to be informed about available resources and support options</li>
                          </ul>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">Accessing Emergency Housing</h4>
                          <ul>
                            <li>You can access emergency shelters without identification in most cases</li>
                            <li>You cannot be denied emergency shelter based on income, immigration status, or past history</li>
                            <li>You have the right to safe, clean accommodation that meets basic health standards</li>
                            <li>You may request accommodation appropriate to your gender identity</li>
                            <li>If turned away due to capacity, you should be referred to alternative services</li>
                          </ul>
                          <p className="mt-2 mb-2">Note: During extreme weather, many cities implement emergency protocols that increase shelter capacity.</p>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">Income and Housing Support</h4>
                          <ul>
                            <li>You may qualify for emergency social assistance even without permanent housing</li>
                            <li>Housing support workers should help you navigate rental assistance programs</li>
                            <li>You have the right to apply for social housing or rent supplements</li>
                            <li>Applications for income assistance should be processed urgently when you have no resources</li>
                            <li>You can request a review if wrongfully denied assistance</li>
                          </ul>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">When Facing Discrimination</h4>
                          <ul>
                            <li>Service providers cannot discriminate based on race, gender, disability, family status, etc.</li>
                            <li>You can file a human rights complaint if unfairly denied services</li>
                            <li>You have the right to accommodations for disabilities (physical, mental, addiction)</li>
                            <li>You cannot be denied housing solely due to receiving social assistance</li>
                            <li>You can access advocacy organizations that will help assert your rights</li>
                          </ul>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">Protecting Your Privacy</h4>
                          <ul>
                            <li>Service providers must keep your information confidential</li>
                            <li>Your information should only be shared with your consent (with limited exceptions)</li>
                            <li>You can specify which agencies may share your information</li>
                            <li>You have the right to know what information is being collected and why</li>
                            <li>You can request to view your file and correct inaccuracies</li>
                          </ul>
                          
                          <h4 className="text-lg font-semibold mt-4 mb-2">Mental Health and Addiction Support</h4>
                          <ul>
                            <li>You have the right to access mental health services during transitions</li>
                            <li>You cannot be removed from housing or services solely due to mental health issues</li>
                            <li>Harm reduction services should be available without judgment</li>
                            <li>You have the right to participate in decisions about your treatment plan</li>
                            <li>You can request culturally appropriate mental health support</li>
                          </ul>
                          
                          <p className="mt-4">Transition services should provide support that respects your autonomy and helps you move toward stability. If your rights are violated, contact legal aid or an advocacy organization for assistance.</p>
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
                    <p>All Canadians have fundamental rights that are protected by law. Understanding these basic rights is essential regardless of your specific situation.</p>
                    
                    <h4 className="text-lg font-semibold mt-4 mb-2">Canadian Charter Rights</h4>
                    <p>The Canadian Charter of Rights and Freedoms protects the following fundamental rights:</p>
                    <ul>
                      <li>Freedom of expression, religion, and association</li>
                      <li>The right to equal treatment under the law</li>
                      <li>The right to be presumed innocent until proven guilty</li>
                      <li>The right to reasonable privacy</li>
                      <li>Protection against unreasonable search and seizure</li>
                    </ul>
                    
                    <h4 className="text-lg font-semibold mt-4 mb-2">Basic Legal Rights</h4>
                    <ul>
                      <li>The right to receive legal advice when detained or arrested</li>
                      <li>The right to be informed of the reasons for your arrest or detention</li>
                      <li>The right to interpret services in legal proceedings if needed</li>
                      <li>The right to a fair trial within a reasonable time</li>
                      <li>The right to appeal certain legal decisions</li>
                    </ul>
                    
                    <h4 className="text-lg font-semibold mt-4 mb-2">Human Rights Protection</h4>
                    <ul>
                      <li>Protection from discrimination based on race, national origin, ethnic origin, color, religion, sex, age, or mental or physical disability</li>
                      <li>Protection from workplace harassment and discrimination</li>
                      <li>The right to equal access to public services</li>
                      <li>The right to file a human rights complaint if your rights are violated</li>
                      <li>The right to accommodation for disabilities in workplaces and services</li>
                    </ul>
                    
                    <h4 className="text-lg font-semibold mt-4 mb-2">Privacy Rights</h4>
                    <ul>
                      <li>The right to know what personal information is collected about you</li>
                      <li>The right to access your personal information held by organizations</li>
                      <li>The right to correct inaccurate personal information</li>
                      <li>Protection against unauthorized disclosure of your personal information</li>
                      <li>The right to file a privacy complaint with relevant authorities</li>
                    </ul>
                    
                    <p className="mt-4">Understanding your rights is the first step to effectively advocating for yourself. Remember that legal rights may be limited in certain circumstances, and interpretation can be complex - when in doubt, seek advice from a legal professional.</p>
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