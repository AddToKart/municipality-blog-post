import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowRight, Bell, Calendar, Users } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                <Bell size={14} className="mr-2" />
                Latest Updates Available
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Welcome to
                <span className="block text-blue-200">Santa Maria</span>
              </h1>
              
              <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
                Stay connected with your municipal government. Get the latest news, 
                announcements, and important updates that matter to our community.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">150+</div>
                <div className="text-blue-200 text-sm">Posts Published</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">25K+</div>
                <div className="text-blue-200 text-sm">Citizens Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-blue-200 text-sm">Satisfaction Rate</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Calendar size={20} className="mr-2" />
                View Latest Posts
                <ArrowRight size={16} className="ml-2" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Users size={20} className="mr-2" />
                About Our Municipality
              </Button>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/8815531/pexels-photo-8815531.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Santa Maria Municipality Building"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Municipal Hall
                </h3>
                <p className="text-white/90 text-sm">
                  Serving our community with dedication and transparency since 1952
                </p>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-emerald-500 rounded-full p-4 shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}