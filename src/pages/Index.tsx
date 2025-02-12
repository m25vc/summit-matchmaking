
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    // For now, we'll just show a toast since auth isn't implemented yet
    toast.info("Sign in functionality coming soon!");
  };

  const handleGetStarted = () => {
    // For now, we'll just show a toast since auth isn't implemented yet
    toast.info("Get started functionality coming soon!");
  };

  const handleLearnMore = () => {
    // Scroll to features section smoothly
    const featuresSection = document.querySelector('#features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full px-6 py-4 backdrop-blur-lg border-b border-slate-200/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-theme-800">MeetMatcherHub</h1>
          <Button variant="outline" className="gap-2" onClick={handleSignIn}>
            Sign In <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full text-center space-y-8 animate-slide-in">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-5xl font-bold tracking-tight text-theme-900">
              Connect Founders with VCs
            </h1>
            <p className="text-xl text-theme-600 max-w-2xl mx-auto">
              An intelligent matching platform that brings together visionary founders 
              and strategic investors for meaningful connections.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-4 justify-center"
          >
            <Button size="lg" className="gap-2" onClick={handleGetStarted}>
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={handleLearnMore}>
              Learn More
            </Button>
          </motion.div>

          <motion.div
            id="features"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-6 rounded-xl text-left"
              >
                <h3 className="text-lg font-semibold mb-2 text-theme-800">{feature.title}</h3>
                <p className="text-theme-600">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

const features = [
  {
    title: "Smart Matching",
    description: "Our intelligent algorithm pairs founders with the most relevant VCs based on industry, stage, and investment criteria.",
  },
  {
    title: "Priority System",
    description: "Organize your potential matches into high, medium, and low priority buckets for efficient networking.",
  },
  {
    title: "Secure & Private",
    description: "Enterprise-grade security ensures your data and preferences remain confidential and protected.",
  },
];

export default Index;
