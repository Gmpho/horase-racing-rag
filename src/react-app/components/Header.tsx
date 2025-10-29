import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "#" },
    { name: "Analytics", href: "#analytics" },
    { name: "Predictions", href: "#predictions" },
    { name: "Data", href: "#data" },
    { name: "About", href: "#about" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-racing-darker/95 backdrop-blur-md animate-fade-in">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="flex items-center justify-between py-5">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white font-display">Horse Racing Analytics</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden space-x-10 md:flex">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="relative transition-all duration-300 text-racing-light hover:text-white hover:scale-105 group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-racing-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="items-center hidden space-x-6 md:flex">
            <Button variant="ghost" className="transition-all duration-300 text-racing-light hover:text-white hover:bg-white/10">
              Sign In
            </Button>
            <Button className="bg-racing-primary hover:bg-racing-primary/90 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-racing-primary/25">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="transition-all duration-300 text-racing-light hover:text-white hover:bg-white/10"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-up">
            <div className="px-4 pt-4 pb-6 space-y-3 border-t border-gray-800 bg-racing-darker/98 backdrop-blur-md">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-3 transition-all duration-300 rounded-lg text-racing-light hover:text-white hover:bg-white/5"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="px-4 pt-4 space-y-3 border-t border-gray-800">
                <Button variant="ghost" className="justify-start w-full text-racing-light hover:text-white hover:bg-white/10">
                  Sign In
                </Button>
                <Button className="w-full font-semibold text-white bg-racing-primary hover:bg-racing-primary/90">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;