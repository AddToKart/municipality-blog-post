import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Globe,
  Building2,
  Clock,
  Shield,
  FileText,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Separator } from "../ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export function Footer() {
  const quickLinks = [
    { name: "Services", href: "/#services", icon: Building2 },
    { name: "Online Forms", href: "/#forms", icon: FileText },
    { name: "Business Permits", href: "/#permits", icon: Shield },
    { name: "Tax Information", href: "/#taxes", icon: FileText },
    { name: "Ordinances", href: "/#ordinances", icon: FileText },
    { name: "Transparency", href: "/#transparency", icon: Shield },
  ];

  const departments = [
    { name: "Mayor's Office", href: "#mayor" },
    { name: "Municipal Council", href: "#council" },
    { name: "Health Department", href: "#health" },
    { name: "Public Works", href: "#works" },
    { name: "Social Services", href: "#social" },
    { name: "Tourism Office", href: "#tourism" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      href: "https://facebook.com",
      color: "hover:text-blue-400",
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: "https://twitter.com",
      color: "hover:text-sky-400",
    },
    {
      name: "Website",
      icon: Globe,
      href: "https://santamaria.gov.ph",
      color: "hover:text-emerald-400",
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 border-t border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-primary rounded-lg p-2 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Santa Maria</h3>
                <p className="text-sm text-gray-400">Municipality Portal</p>
              </div>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed">
              Serving our community with dedication, transparency, and
              excellence. Building a better future for all residents through
              innovative governance.
            </p>

            <Separator className="bg-gray-800" />

            {/* Social Links */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-white">
                Connect With Us
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className={`inline-flex items-center justify-center rounded-md border border-gray-700 bg-gray-800/50 hover:bg-gray-800 h-9 w-9 ${social.color} transition-all`}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="flex items-center gap-2 text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm group"
                  >
                    <link.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Departments
            </h4>
            <ul className="space-y-3">
              {departments.map((dept) => (
                <li key={dept.name}>
                  <a
                    href={dept.href}
                    className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-primary transition-colors" />
                    {dept.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">
              Contact Us
            </h4>

            <div className="space-y-3">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-sm">
                  <p>Municipal Hall, Santa Maria</p>
                  <p>Province, Philippines 1234</p>
                </div>
              </a>

              <a
                href="tel:+63555123456"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <Phone className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm">+63 (555) 123-4567</span>
              </a>

              <a
                href="mailto:info@santamaria.gov.ph"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
              >
                <Mail className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm">info@santamaria.gov.ph</span>
              </a>
            </div>

            <Separator className="bg-gray-800" />

            {/* Office Hours */}
            <div>
              <h5 className="font-medium text-white mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Office Hours
              </h5>
              <div className="text-sm text-gray-400 space-y-1">
                <p>Mon - Fri: 8:00 AM - 5:00 PM</p>
                <p>Saturday: 8:00 AM - 12:00 PM</p>
                <p className="text-gray-500">Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Accordion Layout */}
        <div className="md:hidden space-y-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-primary rounded-lg p-2">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Santa Maria</h3>
              <p className="text-sm text-gray-400">Municipality Portal</p>
            </div>
          </Link>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="quick-links" className="border-gray-800">
              <AccordionTrigger className="text-white hover:text-primary">
                Quick Links
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3 pt-2">
                  {quickLinks.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        <link.icon className="w-4 h-4" />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="departments" className="border-gray-800">
              <AccordionTrigger className="text-white hover:text-primary">
                Departments
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3 pt-2">
                  {departments.map((dept) => (
                    <li key={dept.name}>
                      <a
                        href={dept.href}
                        className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {dept.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contact" className="border-gray-800">
              <AccordionTrigger className="text-white hover:text-primary">
                Contact Information
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-gray-400">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p>Municipal Hall, Santa Maria</p>
                      <p>Province, Philippines 1234</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">+63 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">info@santamaria.gov.ph</span>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-white mb-2">Office Hours</h5>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Mon - Fri: 8:00 AM - 5:00 PM</p>
                    <p>Saturday: 8:00 AM - 12:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator className="bg-gray-800" />

          {/* Social Links Mobile */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Connect With Us</p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center rounded-md border border-gray-700 bg-gray-800/50 h-9 w-9 ${social.color} transition-all`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <Separator className="my-8 bg-gray-800" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 text-center md:text-left">
            © {new Date().getFullYear()} Municipality of Santa Maria. All
            rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <a
              href="#privacy"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#accessibility"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
