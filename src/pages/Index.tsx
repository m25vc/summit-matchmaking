
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleContact = () => {
    window.location.href = "mailto:jay@m25vc.com";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-12">
            <img 
              src="/lovable-uploads/ed6dc4fc-70bd-4ee0-aa8e-01c89f7c45f3.png" 
              alt="M25 Logo" 
              className="h-8 w-auto"
            />
            <span className="text-lg text-gray-600">The Club M25 Summit</span>
          </div>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={handleSignIn}
          >
            Sign In <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('photo-1605810230434-7631ac76ec81')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative min-h-[calc(100vh-73px)] flex flex-col justify-center px-6">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h1 className="text-6xl md:text-7xl font-bold text-white max-w-4xl">
                The Club M25 Summit
              </h1>
              <p className="text-xl text-white max-w-3xl leading-relaxed">
                The Club M25 Summit is an annual gathering of our portfolio companies and investors for a two-day event each fall. Designed to elevate founders, foster community, and enhance connectivity, the Summit facilitates thousands of one-on-one meetings alongside engaging activities breakout sessions, speakers and social dinners. Held every year the city of Chicago, this event offers an unparalleled opportunity for startups and investors alike to forge meaningful connections with leading VC firms from across the nation. Use this platform to get matched with other attendees and schedule your one-on-one meetings, ensuring you make the most of your time at the Summit by connecting with the right people based on mutual interests and objectives.
              </p>
              <a 
                href="https://m25vc.com/summit" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center text-white hover:text-gray-200 transition-colors"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Learn more about the Summit on M25's website
              </a>
              <div className="flex gap-4 pt-6">
                <Button 
                  size="lg"
                  className="bg-[#c41230] hover:bg-[#a00e27] text-white"
                  onClick={handleSignIn}
                >
                  Get Matched Now
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-8 right-8"
            >
              <Button 
                size="lg" 
                className="bg-[#e85c41] hover:bg-[#c41230] text-white gap-2"
                onClick={handleContact}
              >
                <MessageCircle className="w-5 h-5" />
                Contact Support
              </Button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
