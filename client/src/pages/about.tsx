import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Facebook, Instagram, Linkedin, Star, Twitter, TrendingUp, Users } from "lucide-react";
import teresaPhoto from "@assets/IMG_0103.jpeg";
import jadaPhoto from "@assets/IMG_0276.jpeg";
import DocumentComplexityAnalyzer from "@/components/analyzer/DocumentComplexityAnalyzer";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-800 inline-block text-transparent bg-clip-text">
            About SmartDispute.ai Canada
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering Canadians to fight unfair treatment without the high cost of legal representation.
          </p>
        </div>

        {/* Founder story - dark themed section */}
        <div className="bg-gray-900 text-white rounded-lg shadow-xl overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <h2 className="text-3xl font-bold text-red-500 mb-8">Why I Built SmartDispute.ai Canada</h2>
            
            <div className="md:flex gap-8 items-start">
              <div className="mb-6 md:mb-0 md:w-1/3 flex-shrink-0">
                <img 
                  src={teresaPhoto} 
                  alt="Teresa Bertin, Founder of SmartDispute.ai Canada" 
                  className="rounded-lg shadow-lg w-full h-auto object-cover aspect-square"
                />
              </div>
              
              <div className="space-y-4 md:w-2/3">
                <p className="text-lg leading-relaxed">
                  I didn't build this platform because I wanted to.<br />  
                  I built it because I had no choice.
                </p>
                
                <p className="text-lg leading-relaxed">
                  My name is <strong>Teresa Bertin</strong>. I'm a Métis mother, self-represented advocate, and survivor of a broken system. Over the past two years, I've fought tooth and nail to protect my kids from unsafe housing, health threats, and systemic neglect.
                  My two-year-old son was hospitalized with respiratory illness because of untreated mold. I was served eviction notices while begging for repairs. I watched agencies like By-law and CAS weaponize their power instead of offering help. And I did it all without a lawyer—because I couldn't afford one.
                </p>
                
                <p className="text-lg leading-relaxed">
                  I learned to draft legal documents on my own. I filed T2 and T6 applications. I documented everything. And I won battles I was never supposed to win.
                </p>
                
                <p className="text-lg leading-relaxed">
                  Through that fight, I realized something: <em>it's not that people don't want to fight back—it's that they don't know how.</em> The system is designed to confuse and exhaust you. Legal help is a luxury. But your rights? Your rights are not.
                </p>
                
                <p className="text-lg leading-relaxed">
                  That's why I created <strong>SmartDispute.ai Canada</strong>—an AI-powered legal assistant that helps everyday people fight back, one letter at a time. It starts with credit disputes and housing complaints, and it's growing into a full-blown toolkit for self-represented warriors.
                </p>
                
                <p className="text-lg leading-relaxed font-medium">
                  This isn't just an app.<br />  
                  It's my resistance.<br />  
                  It's my answer to the question: <em>"What now?"</em>
                </p>
                
                <p className="text-lg leading-relaxed">
                  And if it helps you protect your home, fix your credit, or keep your family together—then it's already working.
                </p>
                
                <p className="text-gray-400 text-right pt-6 italic">— Teresa Bertin, Founder</p>
              </div>
            </div>
          </div>
        </div>

        {/* Jada's story - dark themed section */}
        <div className="bg-gray-900 text-white rounded-lg shadow-xl overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <h2 className="text-3xl font-bold text-red-500 mb-8">About Me – Jada's Story</h2>
            
            <div className="md:flex gap-8 items-start">
              <div className="mb-6 md:mb-0 md:w-1/3 flex-shrink-0">
                <img 
                  src={jadaPhoto} 
                  alt="Jada, Marketing Manager at SmartDispute.ai Canada" 
                  className="rounded-lg shadow-lg w-full h-auto object-cover aspect-square"
                />
              </div>
              
              <div className="space-y-4 md:w-2/3">
                <p className="text-lg leading-relaxed">
                  My name is <strong>Jada</strong>, Marketing Manager at SmartDispute.ai Canada, and I've lived through more than most people can imagine. From childhood trauma to heartbreak, addiction, and loss—I've faced darkness and come out stronger every time.
                </p>
                
                <p className="text-lg leading-relaxed">
                  When I was 10, I set fire to my apartment trying to hide a bad test from my mom. I was terrified of disappointing her. That moment spiraled into a series of events that exposed how alone I really was. I was kicked out at 15 and had no stable family support. Thankfully, a friend's mother took me in and showed me the kind of love and loyalty I never knew I needed.
                </p>
                
                <p className="text-lg leading-relaxed">
                  In grade 10, a terrible accident in shop class landed me in the ICU burn unit at Hamilton General. I flatlined on the table due to blood loss and lost a finger. The woman who had taken me in stayed by my side the entire time, even losing her job to be there for me. She was my angel. Losing her recently was one of the hardest things I've faced.
                </p>
                
                <p className="text-lg leading-relaxed">
                  After the accident, I was bullied badly. People said I did it for attention. They called me a freak. I became addicted to the painkillers prescribed to me and hit a point where I didn't want to live anymore. I tried to end it all, but once again, that same woman saved my life. She believed in me when I didn't believe in myself.
                </p>
                
                <p className="text-lg leading-relaxed">
                  At 18, I got engaged and thought I had finally found peace—until I came home one day and found my fiancé with someone else. I lost everything—my relationship, my home, my job, and eventually dropped out of the culinary arts program at Conestoga College. I hit rock bottom and didn't see a way out.
                </p>
                
                <p className="text-lg leading-relaxed">
                  But in 2017, my world changed. I had a beautiful baby boy, Landon. He became my reason to keep going. I got clean and stayed clean—for a while. But one night, thinking I was strong enough, I slipped. That one mistake cost me everything. I lost custody of my son and ended up back in jail. While waiting for bail, I was served papers saying my son had been apprehended. That crushed me.
                </p>
                
                <p className="text-lg leading-relaxed">
                  After I was released, things escalated again. A fight with my mom turned violent. I was scared, I reacted, and I'll carry the weight of that moment forever. But what came after was something I never expected—healing. My mom and I have rebuilt our relationship. She's clean now and has become the mom I always needed. We're closer than ever.
                </p>
                
                <p className="text-lg leading-relaxed font-medium">
                  This is my story—raw, painful, and real. But it's also a story of survival, resilience, and rising above. I'm Jada. I've walked through hell and came out swinging. I'm not a victim. I'm a fighter. And I'm just getting started.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Mission and Vision */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-red-50 border-none">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-700">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                To challenge and reform Canada's biased judicial system by arming everyday citizens with powerful legal tools that level the playing field, regardless of their income or asset bracket. We're fighting to dismantle a system that prioritizes wealth over justice.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-none">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-700">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                A transformed Canada where true justice prevails - where the outcome of legal disputes isn't determined by who has the most money but by who has the strongest case. A system that's genuinely fair, not merely claiming to be while perpetuating inequalities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* The future section */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">The Journey Is Just Beginning</h2>
          <p className="mb-6">
            SmartDispute.ai Canada is only the first step in a much larger vision. We're building a comprehensive ecosystem that will revolutionize how everyday Canadians interact with the legal system.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 rounded-lg p-5">
              <TrendingUp className="h-8 w-8 mb-4" />
              <h3 className="font-bold text-lg mb-2">Expanding Access</h3>
              <p className="text-white/80 text-sm">
                Future developments will include more dispute types, additional government agencies, and tools for more complex legal challenges.
              </p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-5">
              <Users className="h-8 w-8 mb-4" />
              <h3 className="font-bold text-lg mb-2">Community Power</h3>
              <p className="text-white/80 text-sm">
                Building networks of mutual support where users can share experiences, advice, and success stories in their legal journeys.
              </p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-5">
              <Star className="h-8 w-8 mb-4" />
              <h3 className="font-bold text-lg mb-2">Advanced AI</h3>
              <p className="text-white/80 text-sm">
                Developing more sophisticated AI tools to provide personalized guidance and document generation tailored to individual circumstances.
              </p>
            </div>
          </div>
        </div>

        {/* Document Complexity Analyzer */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-4">One-Click Legal Document Complexity Analyzer</h2>
          <p className="text-gray-700 mb-6">
            Legal documents are often intentionally written to be confusing and difficult to understand. Our AI-powered analyzer breaks down complex legal jargon into simple, understandable language, helping you make informed decisions without expensive legal consultations.
          </p>
          <div className="mt-4">
            <DocumentComplexityAnalyzer />
          </div>
        </div>
        
        {/* Call to Action Section */}
        <div className="bg-gray-50 rounded-lg p-10 shadow-lg border border-red-200 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Ready to Fight Back?</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            You don't have to face the system alone. SmartDispute.ai gives you the legal tools that powerful institutions don't want you to have.
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex-1 max-w-xs">
              <h3 className="font-bold text-lg mb-3 text-red-700">Create Your First Document</h3>
              <p className="text-gray-600 mb-4">
                Generate a legally sound document in minutes, tailored to your specific situation and provincial requirements.
              </p>
              <a href="/documents" className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors w-full text-center">
                Start Now
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex-1 max-w-xs">
              <h3 className="font-bold text-lg mb-3 text-red-700">Analyze Your Case</h3>
              <p className="text-gray-600 mb-4">
                Upload your evidence and get an AI-powered analysis of your case's strengths, weaknesses, and next steps.
              </p>
              <a href="/case-analysis" className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors w-full text-center">
                Analyze Evidence
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex-1 max-w-xs">
              <h3 className="font-bold text-lg mb-3 text-red-700">Join Our Community</h3>
              <p className="text-gray-600 mb-4">
                Connect with others fighting similar battles, share experiences, and find support in your legal journey.
              </p>
              <a href="/community" className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors w-full text-center">
                Join Community
              </a>
            </div>
          </div>
          
          <div className="bg-red-50 p-5 rounded-lg inline-block">
            <p className="text-gray-800 font-medium">
              "The system doesn't work for people like us. But we can work the system." <br />
              <span className="text-sm text-gray-600 italic">— Teresa Bertin, Founder</span>
            </p>
          </div>
        </div>

        {/* Values section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-5">
              <h3 className="font-bold text-lg mb-2 text-red-700">True Justice</h3>
              <p className="text-gray-700">
                We believe in a legal system that works equally for everyone, not just for those who can afford to buy favorable outcomes. Justice shouldn't have a price tag.
              </p>
            </div>
            
            <div className="border rounded-lg p-5">
              <h3 className="font-bold text-lg mb-2 text-red-700">Empowerment</h3>
              <p className="text-gray-700">
                We don't just solve problems for people — we equip everyday Canadians with the legal tools previously reserved for the privileged and wealthy.
              </p>
            </div>
            
            <div className="border rounded-lg p-5">
              <h3 className="font-bold text-lg mb-2 text-red-700">Systemic Change</h3>
              <p className="text-gray-700">
                We're working toward a complete revamp of a broken system, challenging the institutional bias that favors wealth over merit in our courts and government agencies.
              </p>
            </div>
            
            <div className="border rounded-lg p-5">
              <h3 className="font-bold text-lg mb-2 text-red-700">Resilience</h3>
              <p className="text-gray-700">
                We stand with those who've been knocked down by a biased system, providing both the tools and solidarity needed to rise up and demand the fair treatment they deserve.
              </p>
            </div>
          </div>
        </div>
        
        {/* Get in Contact Section */}
        <div className="mt-12 py-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-center">Get In Contact</h2>
          <p className="text-center text-gray-600 mb-6">
            Connect with us directly for questions, support, or to learn more about our services.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <a href="https://www.facebook.com/share/1CuiiMqjWk/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" 
               className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Facebook className="h-5 w-5" />
              <span>Facebook</span>
            </a>
            <a href="https://x.com/smartdisputesai?s=21" target="_blank" rel="noopener noreferrer" 
               className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 transition-colors">
              <Twitter className="h-5 w-5" />
              <span>Twitter</span>
            </a>
            <a href="https://wa.me/message/JRUKWPOXZSJFK1" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
            <a href="mailto:support@smartdispute.ai" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Email</span>
            </a>
          </div>
          
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} SmartDispute.ai Canada. All rights reserved.</p>
            <div className="mt-2 flex justify-center gap-4">
              <a href="/terms" className="hover:text-red-600 transition-colors">Terms of Service</a>
              <a href="/privacy" className="hover:text-red-600 transition-colors">Privacy Policy</a>
              <a href="/contact" className="hover:text-red-600 transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}