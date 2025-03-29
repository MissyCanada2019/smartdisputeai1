import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Star, TrendingUp, Users } from "lucide-react";
import teresaPhoto from "@assets/IMG_0103.jpeg";

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
          
          <div className="flex items-center justify-center">
            <p className="text-lg font-medium flex items-center">
              Join us as we transform access to justice in Canada
              <ArrowRight className="ml-2 h-5 w-5" />
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
      </div>
    </div>
  );
}