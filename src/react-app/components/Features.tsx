import FeatureCard from "./FeatureCard";
import {
  Zap,
  BarChart3,
  Shield,
  Clock,
  Database,
  Brain
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Predictions",
      description: "Advanced machine learning algorithms analyze historical data, current conditions, and patterns to provide accurate race predictions."
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Live data feeds and instant analysis help you make informed decisions as race conditions change in real-time."
    },
    {
      icon: Database,
      title: "Comprehensive Data",
      description: "Access to extensive historical race data, horse performance metrics, jockey statistics, and track conditions."
    },
    {
      icon: Shield,
      title: "Compliance & Security",
      description: "Built with regulatory compliance in mind, ensuring fair play and data privacy protection for all users."
    },
    {
      icon: Clock,
      title: "24/7 Monitoring",
      description: "Continuous monitoring of races worldwide with instant notifications and updates as events unfold."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Edge computing technology ensures sub-second response times for real-time decision making."
    }
  ];

  return (
    <section className="py-24 bg-racing-darker">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="mb-20 text-center animate-fade-in">
          <h2 className="mb-6 text-4xl font-bold text-white sm:text-5xl font-display">
            Powerful Features for Winning Insights
          </h2>
          <p className="max-w-4xl mx-auto text-xl leading-relaxed text-racing-light">
            Everything you need to analyze horse racing data and make data-driven betting decisions
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;