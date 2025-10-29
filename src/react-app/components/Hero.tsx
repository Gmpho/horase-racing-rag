import { Button } from "./ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-racing-darker via-racing-dark to-black animate-fade-in">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(30,64,175,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(124,58,237,0.1),transparent_70%)]" />
      </div>

      <div className="relative z-10 px-6 mx-auto text-center max-w-7xl lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 mb-10 border rounded-full bg-racing-primary/10 border-racing-primary/20 animate-scale-in">
            <TrendingUp className="w-5 h-5 mr-3 text-racing-primary" />
            <span className="text-sm font-semibold text-racing-primary tracking-wide uppercase">AI-Powered Analytics</span>
          </div>

          {/* Headline */}
          <h1 className="mb-8 text-5xl font-bold leading-tight text-white sm:text-7xl lg:text-8xl font-display animate-slide-up">
            Advanced Horse Racing
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-racing-primary via-racing-secondary to-racing-accent">
              Analytics & Predictions
            </span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-4xl mx-auto mb-16 text-xl leading-relaxed text-racing-light sm:text-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Leverage cutting-edge AI and real-time data to make informed betting decisions.
            Analyze performance trends, predict outcomes, and maximize your winning potential.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-6 mb-20 sm:flex-row animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button
              size="lg"
              className="px-10 py-5 text-lg font-bold text-white bg-racing-primary hover:bg-racing-primary/90 group shadow-2xl shadow-racing-primary/25 hover:shadow-racing-primary/40 transition-all duration-300 hover:scale-105"
            >
              Start Analyzing
              <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-10 py-5 text-lg font-semibold text-racing-light border-racing-primary/30 hover:bg-racing-primary/10 hover:border-racing-primary transition-all duration-300"
            >
              View Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid max-w-3xl grid-cols-1 gap-10 mx-auto sm:grid-cols-3 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="text-center group">
              <div className="mb-3 text-4xl font-bold text-white group-hover:text-racing-accent transition-colors duration-300">99.2%</div>
              <div className="text-racing-light font-medium">Prediction Accuracy</div>
            </div>
            <div className="text-center group">
              <div className="mb-3 text-4xl font-bold text-white group-hover:text-racing-accent transition-colors duration-300">50K+</div>
              <div className="text-racing-light font-medium">Races Analyzed</div>
            </div>
            <div className="text-center group">
              <div className="mb-3 text-4xl font-bold text-white group-hover:text-racing-accent transition-colors duration-300">24/7</div>
              <div className="text-racing-light font-medium">Real-time Updates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute transform -translate-x-1/2 bottom-10 left-1/2 animate-bounce">
        <div className="flex justify-center w-8 h-12 border-2 border-racing-light/30 rounded-full hover:border-racing-primary/50 transition-colors duration-300">
          <div className="w-1.5 h-4 mt-3 bg-racing-light rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;