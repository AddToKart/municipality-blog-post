import React, { useState } from "react";
import {
  Search,
  Menu,
  MapPin,
  Phone,
  Mail,
  Building2,
  Home,
  FileText,
  Megaphone,
  Briefcase,
  Users,
  MessageCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { cn } from "../../lib/utils";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery("");
    }
  };

  const services = [
    {
      title: "Community Services",
      description: "Programs and initiatives for our community",
      href: "/#services",
      icon: Users,
    },
    {
      title: "Online Forms",
      description: "Download and submit required documents",
      href: "/#forms",
      icon: FileText,
    },
    {
      title: "Business Permits",
      description: "Apply for business licenses and permits",
      href: "/#business",
      icon: Briefcase,
    },
    {
      title: "Contact Us",
      description: "Get in touch with our offices",
      href: "/#contact",
      icon: MessageCircle,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center text-sm py-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} />
                <span className="hidden sm:inline">
                  Santa Maria, Philippines
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1.5">
                <Phone size={14} />
                <span>+63 (555) 123-4567</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail size={14} />
              <span className="hidden sm:inline">info@santamaria.gov.ph</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="bg-primary rounded-lg p-2 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">Santa Maria</h1>
              <p className="text-xs text-muted-foreground">
                Municipality Portal
              </p>
            </div>
          </Link>

          {/* Desktop Navigation with animation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-300 animate-in fade-in slide-in-from-top"
                  style={{ animationDelay: "0.1s" }}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link
                  to="/posts"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-300 animate-in fade-in slide-in-from-top"
                  style={{ animationDelay: "0.2s" }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Posts
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link
                  to="/announcements"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-300 animate-in fade-in slide-in-from-top"
                  style={{ animationDelay: "0.3s" }}
                >
                  <Megaphone className="mr-2 h-4 w-4" />
                  Announcements
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className="bg-transparent animate-in fade-in slide-in-from-top"
                  style={{ animationDelay: "0.4s" }}
                >
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {services.map((service, idx) => (
                      <li
                        key={service.title}
                        className="animate-in fade-in slide-in-from-left"
                        style={{ animationDelay: `${0.5 + idx * 0.1}s` }}
                      >
                        <NavigationMenuLink asChild>
                          <a
                            href={service.href}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground duration-300"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <service.icon className="h-5 w-5 text-primary transition-transform group-hover:scale-110 duration-300" />
                              <div className="text-sm font-medium leading-none">
                                {service.title}
                              </div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {service.description}
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <a
                  href="/#about"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-300 animate-in fade-in slide-in-from-top"
                  style={{ animationDelay: "0.5s" }}
                >
                  About
                </a>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2">
            <form onSubmit={handleSearch} className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </form>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>
                  Access all sections of Santa Maria Municipality Portal
                </SheetDescription>
              </SheetHeader>

              <div className="mt-8 flex flex-col gap-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </form>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-2">
                  <Link
                    to="/"
                    onClick={() => setIsSheetOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                  <Link
                    to="/posts"
                    onClick={() => setIsSheetOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Posts
                  </Link>
                  <Link
                    to="/announcements"
                    onClick={() => setIsSheetOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <Megaphone className="h-4 w-4" />
                    Announcements
                  </Link>

                  <div className="my-2 border-t" />

                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold mb-3">Services</p>
                    <div className="flex flex-col gap-2">
                      {services.map((service) => (
                        <a
                          key={service.title}
                          href={service.href}
                          onClick={() => setIsSheetOpen(false)}
                          className="flex items-start gap-2 rounded-lg p-2 hover:bg-accent transition-colors"
                        >
                          <service.icon className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <div className="text-sm font-medium">
                              {service.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {service.description}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-2">
                    <a
                      href="/#about"
                      onClick={() => setIsSheetOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                    >
                      About
                    </a>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
