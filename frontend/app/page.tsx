"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  ShieldCheck, 
  BarChart3, 
  Mail, 
  Phone, 
  MapPin, 
  Building2,
  CheckCircle2
} from "lucide-react";
import clsx from "clsx";

// --- COMPONENTS ---

function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <img 
      src="/icons/icon-192x192.png" 
      alt="DefenseBlu Logo" 
      className={clsx("object-contain rounded-xl shadow-md", className)} 
    />
  );
}

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={clsx(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-white border-b border-slate-100 shadow-sm" : "bg-white/90 backdrop-blur-sm"
    )}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Logo />
          <div className="hidden sm:block">
            <div className="text-xl font-black text-navy leading-none">DefenseBlu</div>
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Consulting Services Pvt Ltd</div>
          </div>
          <span className="text-xl font-black text-navy tracking-tight sm:hidden">
            DefenseBlu
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          {["Home", "About", "Services"].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="text-sm font-bold text-slate-500 hover:text-navy transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link 
            href="/login" 
            className="px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg text-xs sm:text-sm font-black text-navy border-2 border-navy hover:bg-navy hover:text-white transition-all uppercase tracking-wider"
          >
            Login
          </Link>
          <Link 
            href="/login?tab=register" 
            className="px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg text-xs sm:text-sm font-black text-white bg-navy hover:bg-blue-800 transition-all uppercase tracking-wider shadow-md"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section id="home" className="pt-40 pb-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl lg:text-6xl font-black text-navy leading-tight">
            Comprehensive <br className="hidden sm:block" />
            <span className="text-blue-600">Business Solutions</span> <br />
            for Your Growth.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-lg">
            DefenseBlu provides specialized staffing, accounting, and payroll management solutions. Our advanced HRMS platform streamlines your entire employee lifecycle with precision.
          </p>
          <div className="flex items-center gap-6 pt-4">
             <div className="flex items-center gap-2">
               <CheckCircle2 className="text-emerald-500" size={20} />
               <span className="text-sm font-bold text-slate-700">Staffing</span>
             </div>
             <div className="flex items-center gap-2">
               <CheckCircle2 className="text-emerald-500" size={20} />
               <span className="text-sm font-bold text-slate-700">Payroll</span>
             </div>
             <div className="flex items-center gap-2">
               <CheckCircle2 className="text-emerald-500" size={20} />
               <span className="text-sm font-bold text-slate-700">Audit</span>
             </div>
          </div>
        </div>

        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000" 
            alt="DefenseBlu Workspace" 
            className="rounded-3xl shadow-xl border border-slate-200"
          />
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="space-y-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-black text-navy uppercase tracking-tight">Overview</h2>
            <div className="h-1.5 w-20 bg-blue-600 rounded-full mx-auto" />
            <p className="text-slate-500 text-lg leading-relaxed text-center">
              DefenseBlu Private Limited is an innovative technology and research firm dedicated to engineering advanced solutions across Security, Artificial Intelligence, and highly functional utility applications. Driven by a deep commitment to technological advancement, DefenseBlu actively conducts and publishes original research, contributing extensively to the broader academic and engineering communities through published papers and books. By bridging the gap between cutting-edge AI research and robust security implementations, we deliver enterprise-grade solutions that empower organizations to operate securely and efficiently. At DefenseBlu, our mission is not just to build the next generation of digital infrastructure, but to pioneer the research that makes it possible.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
            <div className="flex items-start gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100/50">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm text-blue-600 flex items-center justify-center shrink-0 border border-slate-100">
                <MapPin size={28} />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2">Our Office</div>
                <span className="text-md font-bold text-slate-700 leading-relaxed block">
                  Global Operations<br/>
                  (Remote / Distributed)
                </span>
              </div>
            </div>
            
            <div className="flex items-start gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100/50">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm text-emerald-600 flex items-center justify-center shrink-0 border border-slate-100">
                <Mail size={28} />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2">Connect with Us</div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-md font-bold text-slate-700">contact@defenseblu.com</span>
                  <span className="text-md font-bold text-slate-700">gupthaa@defenseblu.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const services = [
    { title: "Staffing", icon: Users },
    { title: "Audit & Compliance", icon: ShieldCheck },
    { title: "Accounting", icon: BarChart3 },
    { title: "Business Consulting", icon: Building2 },
  ];

  return (
    <section id="services" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 space-y-2">
           <h2 className="text-3xl font-black text-navy uppercase">Our Offerings and Services</h2>
           <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            "End-to-End Enterprise Solutions",
            "Cybersecurity & Threat Mitigation",
            "AI Research & Engineering",
            "Custom Client-Requested Builds",
            "Academic Publishing & Tech Books",
            "Utility Application Development",
            "Website Maintenance & SRE",
            "Active Technology Research Wings"
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-start gap-4 hover:shadow-lg transition-all group">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-bold text-navy text-sm leading-snug">{s}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
           <Logo className="w-9 h-9" />
           <div className="text-left">
             <div className="text-lg font-black text-navy leading-none">DefenseBlu</div>
             <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Consulting Services Pvt Ltd</div>
           </div>
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center">
          © 2026 DefenseBlu Private Limited. All rights reserved.
        </p>
        <div className="flex gap-6 text-[10px] font-black text-navy uppercase tracking-widest">
           <Link href="#" className="hover:text-blue-600">Privacy</Link>
           <Link href="#" className="hover:text-blue-600">Terms</Link>
           <Link href="/login" className="hover:text-blue-600">Portal</Link>
        </div>
      </div>
    </footer>
  );
}

// --- MAIN PAGE ---

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Footer />
    </main>
  );
}
