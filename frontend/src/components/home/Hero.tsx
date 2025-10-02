import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  ArrowRight,
  Bell,
  Calendar,
  Users,
  Award,
  Sparkles,
} from "lucide-react";

export function Hero() {
  const stats = [
    {
      value: "150+",
      label: "Posts Published",
      icon: Calendar,
    },
    {
      value: "25K+",
      label: "Citizens Served",
      icon: Users,
    },
    {
      value: "98%",
      label: "Satisfaction",
      icon: Award,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#2256d6] text-primary-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#1c48b2] to-[#113a94] opacity-95" />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.18'%3E%3Cpath d='M72 68v-8h-4v8h-8v4h8v8h4v-8h8v-4h-8zm0-60V0h-4v8h-8v4h8v8h4V12h8V8h-8zM12 68v-8H8v8H0v4h8v8h4v-8h8v-4h-8zM12 8V0H8v8H0v4h8v8h4V12h8V8h-8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-10 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left motion-safe:duration-700">
            <div className="space-y-6 max-w-3xl">
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-white backdrop-blur"
              >
                <Bell size={14} />
                Latest Updates Available
              </Badge>

              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Welcome to
                <span className="block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  Santa Maria
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-white/90">
                Stay connected with your municipal government. Get the latest
                news, announcements, and important updates that matter to our
                community.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/25 bg-white/10 p-6 shadow-lg backdrop-blur transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center gap-3 text-center text-white">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className="text-3xl font-semibold">{stat.value}</div>
                    <div className="text-sm uppercase tracking-wide text-white/70">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/posts">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-primary hover:bg-white/90"
                >
                  <Calendar size={20} className="mr-2 text-primary" />
                  View Latest Posts
                  <ArrowRight size={16} className="ml-2 text-primary" />
                </Button>
              </Link>

              <a href="/#about">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 hover:text-white"
                >
                  <Users size={20} className="mr-2" />
                  About Our Municipality
                </Button>
              </a>
            </div>
          </div>

          <div className="relative motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right motion-safe:duration-700 motion-safe:delay-150">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/20 shadow-2xl">
              <img
                src="https://images.pexels.com/photos/8815531/pexels-photo-8815531.jpeg?auto=compress&cs=tinysrgb&w=1000"
                alt="Santa Maria Municipality Building"
                className="h-80 w-full object-cover md:h-[26rem]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary px-3 py-2">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-white/90 text-foreground hover:bg-white">
                    Est. 1952
                  </Badge>
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  Municipal Hall
                </h3>
                <p className="text-white/80">
                  Serving our community with dedication and transparency for
                  over 70 years
                </p>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="absolute -top-8 right-6 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700 motion-safe:delay-300">
                <div className="rounded-2xl bg-white/95 p-4 shadow-2xl">
                  <Bell className="h-7 w-7 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
