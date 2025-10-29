import { Twitter, Facebook, Instagram, Github } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Analytics", href: "#analytics" },
      { name: "Predictions", href: "#predictions" },
      { name: "Data", href: "#data" },
      { name: "API", href: "#api" },
    ],
    company: [
      { name: "About", href: "#about" },
      { name: "Blog", href: "#blog" },
      { name: "Careers", href: "#careers" },
      { name: "Contact", href: "#contact" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
      { name: "Compliance", href: "#compliance" },
      { name: "Responsible Gaming", href: "#responsible" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "GitHub", icon: Github, href: "#" },
  ];

  return (
    <footer className="border-t bg-racing-darker border-gray-800/50">
      <div className="px-6 py-16 mx-auto max-w-7xl lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2 animate-fade-in">
            <h3 className="mb-6 text-3xl font-bold text-white font-display">Horse Racing Analytics</h3>
            <p className="max-w-lg mb-8 text-lg leading-relaxed text-racing-light">
              Advanced AI-powered analytics for horse racing predictions.
              Make data-driven decisions with real-time insights and comprehensive race data.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="transition-all duration-300 text-racing-light hover:text-racing-primary hover:scale-110"
                  aria-label={social.name}
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h4 className="mb-6 text-xl font-semibold text-white">Product</h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="inline-block transition-colors duration-300 text-racing-light hover:text-racing-primary hover:translate-x-1"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h4 className="mb-6 text-xl font-semibold text-white">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="inline-block transition-colors duration-300 text-racing-light hover:text-racing-primary hover:translate-x-1"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h4 className="mb-6 text-xl font-semibold text-white">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="inline-block transition-colors duration-300 text-racing-light hover:text-racing-primary hover:translate-x-1"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-12 mt-16 border-t border-gray-800/50">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-base text-racing-light">
              © {currentYear} Horse Racing Analytics. All rights reserved.
            </p>
            <p className="mt-4 text-base text-racing-light md:mt-0">
              Built with ❤️ for horse racing enthusiasts
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;