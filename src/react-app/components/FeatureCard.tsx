import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="p-8 transition-all duration-500 border bg-racing-darker/50 backdrop-blur-sm border-gray-800/50 rounded-2xl hover:border-racing-primary/30 hover:shadow-2xl hover:shadow-racing-primary/10 hover:scale-105 group animate-fade-in">
      <div className="flex items-center justify-center w-16 h-16 mb-6 transition-all duration-300 rounded-xl bg-racing-primary/10 group-hover:bg-racing-primary/20 group-hover:scale-110">
        <Icon className="w-8 h-8 text-racing-primary" />
      </div>
      <h3 className="mb-4 text-2xl font-semibold text-white transition-colors duration-300 group-hover:text-racing-primary">{title}</h3>
      <p className="text-lg leading-relaxed text-racing-light">{description}</p>
    </div>
  );
};

export default FeatureCard;