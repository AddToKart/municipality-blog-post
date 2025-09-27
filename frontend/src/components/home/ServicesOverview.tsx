import React from 'react';
import { 
  FileText, 
  CreditCard, 
  Phone, 
  MapPin, 
  Users, 
  Building,
  Heart,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function ServicesOverview() {
  const services = [
    {
      icon: FileText,
      title: 'Document Services',
      description: 'Birth certificates, marriage licenses, and official permits',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: CreditCard,
      title: 'Tax Payments',
      description: 'Property tax, business tax, and other municipal fees',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Building,
      title: 'Business Permits',
      description: 'Business registration, renewals, and compliance',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Heart,
      title: 'Health Services',
      description: 'Medical assistance, health programs, and wellness initiatives',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Users,
      title: 'Social Services',
      description: 'Community programs, senior citizen benefits, and assistance',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: Briefcase,
      title: 'Employment',
      description: 'Job opportunities, skills training, and livelihood programs',
      color: 'bg-teal-100 text-teal-600'
    }
  ];

  const quickActions = [
    { title: 'Apply for Business Permit', href: '#permits' },
    { title: 'Pay Property Tax', href: '#taxes' },
    { title: 'Request Document', href: '#documents' },
    { title: 'Report an Issue', href: '#reports' }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Municipal Services
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Access a wide range of municipal services designed to serve our community's needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent size={24} />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Button variant="ghost" className="p-0 h-auto text-blue-600 hover:text-blue-700">
                    Learn More
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 text-left justify-start hover:bg-white"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm">{action.title}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <div className="bg-blue-600 text-white rounded-2xl p-8 inline-block">
            <div className="flex items-center space-x-4">
              <Phone className="w-8 h-8" />
              <div className="text-left">
                <h3 className="text-xl font-semibold">Need Assistance?</h3>
                <p className="text-blue-100">Call us at +63 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}