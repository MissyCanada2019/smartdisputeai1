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
                  I'm Teresa—an advocate, a fighter, and a determined challenger of a system that's stacked against ordinary citizens. Life has tested me in ways most people wouldn't believe, but I refuse to be silenced or defeated. I've battled housing injustices, legal roadblocks, and systemic neglect, all while witnessing firsthand how our judicial system favors those with deep pockets over those with legitimate claims.
                </p>
                <p>
                  Through my own painful experiences, I've seen how our so-called "justice" system is fundamentally broken and biased. When you can't afford expensive legal representation, you're treated as a second-class citizen. The system isn't impartial—it's designed to protect the privileged and powerful while making it nearly impossible for regular Canadians to stand up for their rights.
                </p>
                <p>
                  I'm advocating for a complete revamp of this crooked and biased judicial system. Justice shouldn't depend on your income or asset bracket. The scales need to be leveled—not just adjusted slightly, but fundamentally rebalanced to create true fairness. Everyone deserves an equal shot at justice, regardless of their financial status or connections.
                </p>
                <p>
                  That's why I created SmartDisputesAICanada—to fight back against this imbalance by giving everyday Canadians the tools they need to challenge unfair credit reports, landlord disputes, government agencies, and more without needing expensive lawyers. I took my own battles and transformed them into solutions that empower others facing similar injustices.
                </p>
                <p className="font-medium">
                  I stand for genuine equality under the law, not just the illusion of it. My journey isn't just about my personal struggle—it's about creating systemic change. It's about building a world where fairness isn't determined by the size of your wallet. And if you're here, that means you're ready to join this fight for true justice.
                </p>
                <p className="font-bold">
                  Let's make real justice happen—together.
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