import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import {
  ArrowRight,
  Bell,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Award,
  Sparkles,
} from "lucide-react";
import { cn } from "../../lib/utils";

export function Hero() {
  const stats = [
    {
      value: "150+",
      label: "Posts Published",
      description:
        "Comprehensive news and announcements about our municipality",
      icon: Calendar,
      trend: "+12% this month",
    },
    {
      value: "25K+",
      label: "Citizens Served",
      description: "Active community members engaged with our services",
      icon: Users,
      trend: "Growing daily",
    },
    {
      value: "98%",
      label: "Satisfaction",
      description: "Citizen satisfaction rate based on recent surveys",
      icon: Award,
      trend: "+5% from last year",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: "slide 20s linear infinite",
        }}
      />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
            <div className="space-y-6">
              <Badge
                variant="secondary"
                className="bg-background/10 text-primary-foreground border-primary-foreground/20 backdrop-blur-sm"
              >
                <Bell size={14} className="mr-2 animate-pulse" />
                Latest Updates Available
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
                Welcome to{" "}
                <span className="block bg-gradient-to-r from-primary-foreground to-primary-foreground/70 bg-clip-text text-transparent">
                  Santa Maria
                </span>
              </h1>

              <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-2xl">
                Stay connected with your municipal government. Get the latest
                news, announcements, and important updates that matter to our
                community.
              </p>
            </div>

            {/* Interactive Stats */}
            <div className="grid grid-cols-3 gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <HoverCard key={index} openDelay={200}>
                  <HoverCardTrigger asChild>
                    <div className="cursor-pointer group">
                      <div
                        className={cn(
                          "relative p-4 rounded-lg bg-background/10 backdrop-blur-sm border border-primary-foreground/20",
                          "transition-all duration-300 hover:scale-105 hover:bg-background/20 hover:border-primary-foreground/40"
                        )}
                      >
                        <div className="flex flex-col items-center text-center space-y-2">
                          <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground/80 group-hover:text-primary-foreground transition-colors" />
                          <div className="text-2xl md:text-3xl font-bold">
                            {stat.value}
                          </div>
                          <div className="text-xs md:text-sm text-primary-foreground/70 font-medium">
                            {stat.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <stat.icon className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold">{stat.label}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {stat.description}
                      </p>
                      <Separator />
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-muted-foreground">
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/posts">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-background text-primary hover:bg-background/90 group"
                >
                  <Calendar size={20} className="mr-2" />
                  View Latest Posts
                  <ArrowRight
                    size={16}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </Link>

              <a href="/#about">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm"
                >
                  <Users size={20} className="mr-2" />
                  About Our Municipality
                </Button>
              </a>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative animate-in fade-in slide-in-from-right duration-1000 delay-300">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-background/20 backdrop-blur-sm group">
              <div className="relative overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/8815531/pexels-photo-8815531.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Santa Maria Municipality Building"
                  className="w-full h-72 md:h-96 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/90 backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <Badge className="bg-background/90 text-foreground border-0">
                    Est. 1952
                  </Badge>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  Municipal Hall
                </h3>
                <p className="text-white/90 text-sm md:text-base">
                  Serving our community with dedication and transparency for
                  over 70 years
                </p>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="hidden lg:block">
              <div className="absolute -top-6 -right-6 animate-bounce">
                <div className="p-4 rounded-2xl bg-background shadow-2xl border border-border">
                  <Bell className="w-7 h-7 text-primary" />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 animate-pulse">
                <div className="p-4 rounded-2xl bg-emerald-500 shadow-2xl">
                  <Users className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="absolute top-1/2 -right-8 -translate-y-1/2">
                <div className="p-3 rounded-xl bg-amber-500 shadow-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(60px, 60px);
          }
        }
      `}</style>
    </section>
  );
}
