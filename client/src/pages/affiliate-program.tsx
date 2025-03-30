import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function AffiliateProgram() {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would handle the form submission logic
    alert("Thank you for your application! We'll be in touch soon.");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Become a SmartDispute Affiliate</h1>
          <p className="text-xl text-gray-600">Help others get justice. Get paid doing it.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">What You Get</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>$5 commission per paid letter or form</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>25% recurring commission on subscriptions</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Instant access to your affiliate dashboard</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Monthly payout via e-Transfer or PayPal</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Custom tracking links and promo assets</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Perfect For</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Tenant advocates</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Credit repair influencers</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Legal TikTok creators</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Community leaders</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Anyone with a voice and a mission</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Apply to Become a SmartDispute Affiliate</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="Your full name" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="your@email.com" required />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (optional)</Label>
                <Input id="phone" placeholder="(123) 456-7890" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="social">Social Media Handles</Label>
                <Input id="social" placeholder="@username (TikTok, Insta, etc.)" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website or Channel (if applicable)</Label>
              <Input id="website" placeholder="https://your-website.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Briefly tell us why you're a good fit (max 200 words)</Label>
              <Textarea id="reason" placeholder="Share why you'd make a great affiliate..." required className="min-h-[100px]" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="promotion">How do you plan to promote SmartDispute.ai?</Label>
              <Textarea id="promotion" placeholder="Explain your promotion strategy..." required className="min-h-[100px]" />
            </div>
            
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox id="terms" required />
              <Label htmlFor="terms" className="leading-tight">
                I agree to the <a href="#affiliate-terms" className="text-blue-600 hover:underline">Affiliate Terms & Conditions</a>
              </Label>
            </div>
            
            <div className="pt-2">
              <Button type="submit" className="w-full md:w-auto">Submit Application</Button>
            </div>
          </form>
        </div>
        
        <div id="affiliate-terms" className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Affiliate Terms</h2>
          <p className="mb-3">By joining the SmartDispute Affiliate Program, you agree to:</p>
          
          <ul className="space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">•</span>
              <span>Only use your affiliate link in ethical, non-spam promotional content</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">•</span>
              <span>Not misrepresent the services offered by SmartDispute.ai</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">•</span>
              <span>Not make legal claims or offer legal advice on behalf of the brand</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">•</span>
              <span>Payouts are sent monthly once your balance exceeds $25 CAD</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">•</span>
              <span>Affiliates engaging in fraudulent traffic or misrepresentation will be removed immediately</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}