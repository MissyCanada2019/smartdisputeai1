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
            About SmartDisputesAICanada
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering Canadians to fight unfair treatment without the high cost of legal representation.
          </p>
        </div>

        {/* Founder story */}
        <Card className="border-none shadow-lg overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-red-700">Meet Teresa — The Founder</CardTitle>
            <CardDescription>
              From personal struggle to empowering others
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="md:flex gap-8 items-start">
              <div className="mb-6 md:mb-0 md:w-1/3 flex-shrink-0">
                <img 
                  src={teresaPhoto} 
                  alt="Teresa, Founder of SmartDisputesAICanada" 
                  className="rounded-lg shadow-lg w-full h-auto object-cover aspect-square"
                />
              </div>
              <div className="space-y-4 text-gray-700 md:w-2/3">
                <p>
                  I'm Teresa—an advocate, a fighter, and a builder of solutions. Life has tested me in ways most people wouldn't believe, but I refuse to be silenced or defeated. I've battled housing injustices, legal roadblocks, and systemic neglect, all while standing strong for my family and fighting for what's right. Every struggle has shaped me, but none have broken me.
                </p>
                <p>
                  I know what it's like to be ignored, dismissed, and told to accept less than I deserve. I've seen how the system is built to keep people like me struggling. But instead of giving up, I fought back. I learned the laws, gathered evidence, and made my voice impossible to ignore.
                </p>
                <p>
                  That's why I created SmartDisputesAICanada—a legal tool designed to help Canadians fight unfair credit reports, landlord disputes, and more without needing a lawyer. I took my own battles and turned them into solutions that empower others.
                </p>
                <p className="font-medium">
                  I stand for truth, resilience, and real change. My journey isn't just about struggle—it's about overcoming. It's about building something better. And if you're here, that means you're ready to take control of your own story too.
                </p>
                <p className="font-bold">
                  Let's make it happen—together.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Mission and Vision */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-red-50 border-none">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-700">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                To democratize access to legal tools and empower marginalized and low-income Canadians to effectively advocate for themselves against government agencies and large organizations.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-none">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-700">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                A Canada where everyone, regardless of income or background, has the ability to stand up for their rights and receive fair treatment under the law.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* The future section */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">The Journey Is Just Beginning</h2>
          <p className="mb-6">
            SmartDisputesAICanada is only the first step in a much larger vision. We're building a comprehensive ecosystem that will revolutionize how everyday Canadians interact with the legal system.
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
              <h3 className="font-bold text-lg mb-2 text-red-700">Accessibility</h3>
              <p className="text-gray-700">
                We believe legal help should be available to everyone, regardless of their financial situation or background.
              </p>
            </div>
            
            <div className="border rounded-lg p-5">
              <h3 className="font-bold text-lg mb-2 text-red-700">Empowerment</h3>
              <p className="text-gray-700">
                We don't just solve problems for people — we give them the tools and knowledge to advocate for themselves.
              </p>
            </div>
            
            <div className="border rounded-lg p-5">
              <h3 className="font-bold text-lg mb-2 text-red-700">Transparency</h3>
              <p className="text-gray-700">
                We're straightforward about what we can and cannot do, with clear pricing and no hidden fees or agendas.
              </p>
            </div>
            
            <div className="border rounded-lg p-5">
              <h3 className="font-bold text-lg mb-2 text-red-700">Resilience</h3>
              <p className="text-gray-700">
                We celebrate the power of standing up after being knocked down, and support our users through every step of their journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}