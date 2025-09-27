import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Globe } from 'lucide-react';

export function Footer() {
  const quickLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Online Forms', href: '#forms' },
    { name: 'Business Permits', href: '#permits' },
    { name: 'Tax Information', href: '#taxes' },
    { name: 'Ordinances', href: '#ordinances' },
    { name: 'Transparency', href: '#transparency' },
  ];

  const departments = [
    { name: 'Mayor\'s Office', href: '#mayor' },
    { name: 'Municipal Council', href: '#council' },
    { name: 'Health Department', href: '#health' },
    { name: 'Public Works', href: '#works' },
    { name: 'Social Services', href: '#social' },
    { name: 'Tourism Office', href: '#tourism' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-full p-2">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">SM</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold">Santa Maria</h3>
                <p className="text-sm text-gray-400">Municipality</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Serving our community with dedication, transparency, and excellence. 
              Building a better future for all residents of Santa Maria through 
              innovative governance and quality public services.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Departments</h4>
            <ul className="space-y-2">
              {departments.map((dept) => (
                <li key={dept.name}>
                  <a
                    href={dept.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {dept.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-400">
                  <p>Municipal Hall, Santa Maria</p>
                  <p>Province, Philippines 1234</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-blue-400 flex-shrink-0" />
                <span className="text-sm text-gray-400">+63 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-blue-400 flex-shrink-0" />
                <span className="text-sm text-gray-400">info@santamaria.gov.ph</span>
              </div>
            </div>
            
            {/* Office Hours */}
            <div className="mt-6">
              <h5 className="font-medium mb-2">Office Hours</h5>
              <div className="text-sm text-gray-400 space-y-1">
                <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                <p>Saturday: 8:00 AM - 12:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2024 Municipality of Santa Maria. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#accessibility" className="text-sm text-gray-400 hover:text-white transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}