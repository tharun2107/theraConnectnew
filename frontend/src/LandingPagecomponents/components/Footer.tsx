import { Separator } from "./ui/separator";
import { Heart, Linkedin, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Subtle gradient line at top */}
      <div className="h-1 bg-gradient-to-r from-cyan-400 to-purple-500"></div>
      
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">TheraConnect</h3>
              <p className="text-gray-300 leading-relaxed">
                Connecting children with trusted therapists through secure, 
                accessible, and innovative technology solutions.
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300 text-sm">hello@theraconnect.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300 text-sm">1-800-THERAPY</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300 text-sm">San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-3">
              {['About Us', 'How It Works', 'Find Therapists', 'For Therapists', 'Pricing', 'Blog'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-muted-foreground hover:text-primary transition-smooth text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground">Support</h4>
            <ul className="space-y-3">
              {['Help Center', 'Contact Support', 'Safety & Privacy', 'Community Guidelines', 'Emergency Resources', 'System Status'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-muted-foreground hover:text-primary transition-smooth text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Social */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'HIPAA Compliance', 'Cookie Policy', 'Accessibility'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-muted-foreground hover:text-primary transition-smooth text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>

            {/* Social Media */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-foreground">Follow Us</h5>
              <div className="flex space-x-4">
                {[
                  { icon: Linkedin, href: '#', label: 'LinkedIn' },
                  { icon: Twitter, href: '#', label: 'Twitter' },
                  { icon: Instagram, href: '#', label: 'Instagram' }
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center hover:shadow-glow transition-smooth group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4 text-primary-foreground group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-muted-foreground text-sm">
            <span>© {currentYear} TheraConnect. All Rights Reserved.</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              <span>for families</span>
            </span>
          </div>

          {/* Certifications */}
          <div className="flex items-center space-x-4">
            <div className="bg-white px-3 py-1 rounded shadow-soft">
              <span className="text-xs font-semibold text-gray-700">HIPAA Compliant</span>
            </div>
            <div className="bg-white px-3 py-1 rounded shadow-soft">
              <span className="text-xs font-semibold text-gray-700">SOC 2 Certified</span>
            </div>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm text-center">
            <strong>Crisis Support:</strong> If you or your child are experiencing a mental health emergency, 
            please call 988 (Suicide & Crisis Lifeline) or go to your nearest emergency room immediately.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;