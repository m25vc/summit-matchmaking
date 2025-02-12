
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    toast.info("Sign in functionality coming soon!");
  };

  const handleContact = () => {
    toast.info("Contact functionality coming soon!");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-12">
            <h1 className="text-2xl font-bold text-[#c41230]">M25</h1>
            <div className="hidden md:flex space-x-6 text-gray-600">
              <a href="#" className="hover:text-gray-900">About</a>
              <a href="#" className="hover:text-gray-900">Team</a>
              <a href="#" className="hover:text-gray-900">Portfolio</a>
              <a href="#" className="hover:text-gray-900">Scope</a>
              <a href="#" className="hover:text-gray-900">Blog</a>
              <a href="#" className="hover:text-gray-900">Summit</a>
              <a href="#" className="hover:text-gray-900">Midwest Startups</a>
              <a href="#" className="hover:text-gray-900">Contact</a>
            </div>
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
        <div className="absolute inset-0 bg-[url('/path/to/midwest-image.jpg')] bg-cover bg-center">
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
                Seeding the next generation of Midwest unicorns.
              </h1>
              <p className="text-3xl font-semibold text-[#c41230]">
                Investing in Akron, OH.
              </p>
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
                Contact Us
              </Button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
