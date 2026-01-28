// src/pages/LandingPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  ShieldCheck,
  CheckCircle,
  Star,
  ArrowRight,
  ArrowDown,
  Zap,
  Clock,
  Shield,
  Lock,
  Sparkles,
  Play,
  ChevronRight,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Users,
  TrendingUp,
  LogIn,
  Award,
  Heart,
} from "lucide-react";
import { getLandingStatsApi } from "../api";
import { useDarkMode } from "../context/DarkModeContext";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const AnimatedCounter = ({ target, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const numericTarget = parseInt(target) || 0;
    const increment = numericTarget / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericTarget) {
        setCount(numericTarget);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
};

const AnimatedSection = ({ children, className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
    >
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const [stats, setStats] = useState({
    resolved: "1200",
    responseTime: "24",
    satisfaction: "95",
    loading: true,
  });

  useEffect(() => {
    document.title = "Campus Grievance Portal | University of Lucknow";
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getLandingStatsApi();
      setStats({
        resolved: String(data.totalResolved || 1200),
        responseTime: String(data.avgResponseTime || 24).replace(/[^0-9]/g, '') || "24",
        satisfaction: String(data.satisfactionRate || 95),
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setStats({
        resolved: "1200",
        responseTime: "24",
        satisfaction: "95",
        loading: false,
      });
    }
  };

  // Theme-based styles
  const sectionBg = {
    primary: isDark ? "bg-gray-900" : "bg-slate-50",
    secondary: isDark ? "bg-gray-800" : "bg-white",
    accent: isDark ? "bg-gray-850" : "bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/30",
  };

  return (
    <div className={`${
      isDark 
        ? "bg-gray-900 text-white" 
        : "bg-slate-50 text-gray-900"
    } overflow-x-hidden`}>
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center pt-20 pb-10 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://www.lkouniv.ac.in/site/writereaddata/HomePage/Header/H_202403191545264198.jpg"
            alt="University of Lucknow"
            className="w-full h-full object-cover"
          />
          {/* Overlay - More balanced */}
          <div className={`absolute inset-0 ${
            isDark 
              ? "bg-gradient-to-b from-gray-900/70 via-gray-900/85 to-gray-900" 
              : "bg-gradient-to-b from-slate-900/40 via-teal-900/50 to-slate-900/70"
          }`} />
        </div>

        {/* Animated Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] ${
            isDark ? "bg-indigo-500/15" : "bg-teal-400/20"
          } rounded-full blur-[120px] animate-pulse`} />
          <div
            className={`absolute bottom-1/4 right-1/4 w-[400px] h-[400px] ${
              isDark ? "bg-purple-500/15" : "bg-cyan-400/20"
            } rounded-full blur-[120px] animate-pulse`}
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 max-w-5xl mx-auto">
          {/* Live Badge */}
          <AnimatedSection>
            <div className={`inline-flex items-center gap-2 px-5 py-2.5 ${
              isDark 
                ? "bg-gray-800/80 border-gray-600" 
                : "bg-white/95 border-white/50 shadow-xl"
            } backdrop-blur-md border rounded-full mb-8`}>
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
              </div>
              <span className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-teal-800"}`}>
                🎓 Now Live for B.Tech AI Students
              </span>
            </div>
          </AnimatedSection>

          {/* Main Title */}
          <AnimatedSection delay={100}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="text-white drop-shadow-2xl">Campus Grievance</span>
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                Redressal Portal
              </span>
            </h1>
          </AnimatedSection>

          {/* Subtitle */}
          <AnimatedSection delay={200}>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              A transparent, responsive and student-centric system empowering you
              to raise and track concerns with{" "}
              <span className="font-semibold text-amber-300">
                complete privacy
              </span>.
            </p>
          </AnimatedSection>

          {/* CTA Buttons */}
          <AnimatedSection delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => navigate("/signup")}
                className="group w-full sm:w-auto bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-white px-8 py-4 text-lg font-bold rounded-full shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/journey")}
                className="group w-full sm:w-auto bg-white/20 backdrop-blur-md border-2 border-white/60 text-white px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-2 hover:bg-white/30 hover:border-white"
              >
                <Play className="w-5 h-5" />
                See the Journey
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </AnimatedSection>

          {/* Quick Stats */}
          <AnimatedSection delay={400}>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {[
                { value: "1200+", label: "Resolved" },
                { value: "24hr", label: "Response" },
                { value: "95%", label: "Satisfaction" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                    {stat.value}
                  </p>
                  <p className="text-sm text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors animate-bounce"
          >
            <span className="text-sm font-medium">Explore</span>
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TRUST BADGES - Subtle background */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className={`py-6 border-y ${
        isDark 
          ? "bg-gray-800/50 border-gray-700/50" 
          : "bg-white/80 border-slate-200"
      }`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-10">
            {[
              { icon: ShieldCheck, label: "UGC Compliant", color: isDark ? "text-green-400" : "text-green-600" },
              { icon: Lock, label: "100% Confidential", color: isDark ? "text-blue-400" : "text-teal-600" },
              { icon: Star, label: "Verified Students", color: isDark ? "text-yellow-400" : "text-amber-500" },
              { icon: Shield, label: "Audit Trail", color: isDark ? "text-purple-400" : "text-purple-600" },
            ].map((badge, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105 cursor-default ${
                  isDark 
                    ? "bg-gray-700/50 text-gray-300" 
                    : "bg-slate-100 text-gray-700"
                }`}
              >
                <badge.icon className={`w-4 h-4 ${badge.color}`} />
                <span className="font-medium text-sm">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FEATURES SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="features" className={`py-20 px-4 ${
        isDark ? "bg-gray-900" : "bg-slate-50"
      }`}>
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full text-sm font-semibold mb-4 ${
                isDark 
                  ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400" 
                  : "bg-teal-100 border-teal-200 text-teal-700"
              }`}>
                <Zap className="w-4 h-4" />
                POWERFUL FEATURES
              </span>
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Everything You Need
              </h2>
              <p className={`max-w-2xl mx-auto text-lg ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                A complete system designed to make your voice heard and issues resolved efficiently.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: FileText,
                title: "Lodge Complaints Easily",
                desc: "Submit detailed concerns with an intuitive interface. Attach photos, documents, and choose categories.",
                tags: ["Academic", "Infrastructure", "Hostel", "Safety"],
                gradient: isDark ? "from-pink-500 to-rose-600" : "from-teal-500 to-cyan-600",
              },
              {
                icon: Search,
                title: "Real-Time Tracking",
                desc: "Monitor your complaint status with live updates, timeline view, and instant notifications.",
                tags: ["Pending", "In Progress", "Resolved"],
                gradient: isDark ? "from-cyan-500 to-blue-600" : "from-cyan-500 to-blue-600",
              },
              {
                icon: Shield,
                title: "Privacy Protected",
                desc: "Anonymous complaint option for sensitive issues. Your identity is protected by design.",
                tags: ["Anonymous", "Encrypted", "Confidential"],
                gradient: isDark ? "from-purple-500 to-indigo-600" : "from-purple-500 to-pink-600",
              },
            ].map((feature, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className={`group relative h-full border-2 rounded-3xl p-8 transition-all duration-500 overflow-hidden ${
                  isDark 
                    ? "bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800" 
                    : "bg-white border-slate-200 hover:border-teal-300 shadow-sm hover:shadow-xl"
                }`}>
                  <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${feature.gradient}`} />

                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                      {feature.title}
                    </h3>

                    <p className={`mb-5 leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {feature.desc}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {feature.tags.map((tag, j) => (
                        <span
                          key={j}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            isDark 
                              ? "bg-gray-700/50 text-gray-300" 
                              : "bg-slate-100 text-gray-700 border border-slate-200"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* STATS SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className={`py-20 px-4 ${
        isDark ? "bg-gray-800/50" : "bg-white"
      }`}>
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full text-sm font-semibold mb-4 ${
                isDark 
                  ? "bg-green-500/20 border-green-500/30 text-green-400" 
                  : "bg-teal-100 border-teal-200 text-teal-700"
              }`}>
                <TrendingUp className="w-4 h-4" />
                LIVE STATISTICS
              </span>
              <h2 className={`text-3xl sm:text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Platform Performance
              </h2>
            </div>
          </AnimatedSection>

          {stats.loading ? (
            <div className="flex justify-center items-center h-32">
              <div className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${
                isDark ? "border-indigo-500" : "border-teal-500"
              }`} />
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { label: "Complaints Resolved", value: stats.resolved, suffix: "+", icon: CheckCircle, gradient: "from-green-500 to-emerald-600" },
                { label: "Avg Response Time", value: stats.responseTime, suffix: " hrs", icon: Clock, gradient: isDark ? "from-blue-500 to-cyan-600" : "from-teal-500 to-cyan-600" },
                { label: "Satisfaction Rate", value: stats.satisfaction, suffix: "%", icon: Star, gradient: "from-amber-500 to-orange-600" },
              ].map((stat, i) => (
                <AnimatedSection key={i} delay={i * 100}>
                  <div className={`group relative border-2 rounded-3xl p-8 text-center transition-all duration-300 overflow-hidden ${
                    isDark 
                      ? "bg-gray-800 border-gray-700 hover:border-gray-600" 
                      : "bg-slate-50 border-slate-200 hover:border-teal-300 hover:shadow-lg"
                  }`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    
                    <div className="relative z-10">
                      <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                        <stat.icon className="w-8 h-8 text-white" />
                      </div>
                      <p className={`text-4xl sm:text-5xl font-black mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                        <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                      </p>
                      <p className={`font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS PREVIEW */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className={`py-20 px-4 ${isDark ? "bg-gray-900" : "bg-slate-50"}`}>
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className={`border-2 rounded-3xl p-8 md:p-10 ${
              isDark 
                ? "bg-gray-800/80 border-gray-700" 
                : "bg-white border-slate-200 shadow-xl"
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                  isDark ? "from-indigo-500 to-purple-600" : "from-teal-500 to-cyan-600"
                } flex items-center justify-center shadow-lg`}>
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl sm:text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    How It Works
                  </h2>
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                    5 simple steps to resolution
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { num: "01", title: "Create Your Account", icon: Users },
                  { num: "02", title: "Describe Your Issue", icon: MessageSquare },
                  { num: "03", title: "Auto-Route to Department", icon: Zap },
                  { num: "04", title: "Track Real-Time Updates", icon: Search },
                  { num: "05", title: "Get It Resolved", icon: CheckCircle },
                ].map((step, i) => (
                  <div
                    key={i}
                    className={`group flex items-center gap-4 p-4 rounded-xl transition-all cursor-default ${
                      isDark ? "hover:bg-gray-700/50" : "hover:bg-slate-50"
                    } ${i === 4 ? "sm:col-span-2 sm:max-w-sm sm:mx-auto" : ""}`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                      isDark ? "from-indigo-500 to-purple-600" : "from-teal-500 to-cyan-600"
                    } flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>
                      {step.num}
                    </div>
                    <span className={`font-medium flex-1 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                      {step.title}
                    </span>
                    <step.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isDark ? "text-gray-500 group-hover:text-indigo-400" : "text-gray-400 group-hover:text-teal-600"
                    }`} />
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/how-it-works")}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                    isDark 
                      ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600" 
                      : "bg-slate-100 hover:bg-slate-200 text-gray-700 border border-slate-200"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Quick Overview
                </button>
                <button
                  onClick={() => navigate("/journey")}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold transition-all text-white shadow-lg hover:shadow-xl hover:scale-105 ${
                    isDark 
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600" 
                      : "bg-gradient-to-r from-teal-500 to-cyan-600"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Full Immersive Journey
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PRIVACY & SECURITY */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className={`py-20 px-4 ${isDark ? "bg-gray-800/50" : "bg-white"}`}>
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className={`border-2 rounded-3xl p-8 md:p-10 relative overflow-hidden ${
              isDark 
                ? "bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/30" 
                : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
            }`}>
              <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl ${
                isDark ? "bg-green-500/10" : "bg-green-200/50"
              }`} />

              <div className="relative flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className={`text-2xl sm:text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Your Privacy is Our Priority
                  </h3>
                  <p className={`leading-relaxed mb-6 text-lg ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Anonymous complaint option available for sensitive issues. All submissions are
                    encrypted and handled with strict confidentiality.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {["Harassment", "Ragging", "Safety", "Discrimination"].map((cat, i) => (
                      <span
                        key={i}
                        className={`px-4 py-2 border rounded-full text-sm font-medium flex items-center gap-2 ${
                          isDark 
                            ? "bg-green-500/20 border-green-500/40 text-green-300" 
                            : "bg-green-100 border-green-200 text-green-700"
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TESTIMONIALS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className={`py-20 px-4 ${isDark ? "bg-gray-900" : "bg-slate-50"}`}>
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full text-sm font-semibold mb-4 ${
                isDark 
                  ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400" 
                  : "bg-amber-100 border-amber-200 text-amber-700"
              }`}>
                <Heart className="w-4 h-4" />
                TESTIMONIALS
              </span>
              <h2 className={`text-3xl sm:text-4xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                What Students Say
              </h2>
              <p className={isDark ? "text-gray-500" : "text-gray-600"}>
                Real feedback from real students
              </p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Priya S.", role: "B.Tech AI, 3rd Year", msg: "Extremely fast response and supportive staff! My hostel issue was resolved overnight." },
              { name: "Rahul V.", role: "B.Tech AI, 2nd Year", msg: "My classroom AC issue was resolved within a single day! Impressive system." },
              { name: "Anjali S.", role: "B.Tech AI, 4th Year", msg: "Very transparent and easy to use interface. I can track everything in real-time." },
              { name: "Vikram Y.", role: "B.Tech AI, 3rd Year", msg: "The tracking system is brilliant and simple! No more running to offices." },
              { name: "Neha G.", role: "B.Tech AI, 2nd Year", msg: "Finally, a system that actually listens to students. Great initiative!" },
              { name: "Amit K.", role: "B.Tech AI, 4th Year", msg: "Anonymous option gave me confidence to report a sensitive issue safely." },
            ].map((t, i) => (
              <AnimatedSection key={i} delay={i * 50}>
                <div className={`border-2 rounded-2xl p-6 transition-all h-full flex flex-col ${
                  isDark 
                    ? "bg-gray-800/50 border-gray-700 hover:border-gray-600" 
                    : "bg-white border-slate-200 hover:border-teal-300 shadow-sm hover:shadow-lg"
                }`}>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className={`italic mb-4 flex-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    "{t.msg}"
                  </p>
                  <div>
                    <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {t.name}
                    </p>
                    <p className={`text-sm ${isDark ? "text-gray-500" : "text-teal-600"}`}>
                      {t.role}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TEAM SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className={`py-20 px-4 ${isDark ? "bg-gray-800/50" : "bg-white"}`}>
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full text-sm font-semibold mb-4 ${
                isDark 
                  ? "bg-purple-500/20 border-purple-500/30 text-purple-400" 
                  : "bg-purple-100 border-purple-200 text-purple-700"
              }`}>
                <Award className="w-4 h-4" />
                MEET THE TEAM
              </span>
              <h2 className={`text-3xl sm:text-4xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                Built By Students, For Students
              </h2>
              <p className={isDark ? "text-gray-500" : "text-gray-600"}>
                B.Tech AI Department 💙
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { img: "shakti", name: "Shakti", role: "Frontend & UI" },
              { img: "harshit", name: "Harshit", role: "Dashboard" },
              { img: "somu", name: "Somesh", role: "Backend & APIs" },
              { img: "shiva", name: "Shiva", role: "Database" },
            ].map((member, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="group flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 transition-all duration-300 group-hover:scale-105 relative z-10 shadow-xl ${
                      isDark 
                        ? "border-gray-600 group-hover:border-indigo-500" 
                        : "border-slate-200 group-hover:border-teal-400"
                    }`}>
                      <img
                        src={`/images/${member.img}.jpeg`}
                        alt={member.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${member.name}&background=0d9488&color=fff&size=128`;
                        }}
                      />
                    </div>
                    <div className={`absolute inset-0 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity ${
                      isDark 
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600" 
                        : "bg-gradient-to-br from-teal-500 to-cyan-600"
                    }`} />
                  </div>
                  <p className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                    {member.name}
                  </p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-teal-600"}`}>
                    {member.role}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FINAL CTA */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className={`py-20 px-4 relative overflow-hidden ${
        isDark 
          ? "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" 
          : "bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600"
      }`}>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Make Your Voice Heard?
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-10 text-lg">
              Join hundreds of students who are already using CCMS to resolve their campus issues quickly and transparently.
            </p>
          </AnimatedSection>

          {/* Contact Info */}
          <AnimatedSection delay={100}>
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              {[
                { icon: MapPin, title: "Campus", lines: ["University of Lucknow", "Lucknow - 226007"] },
                { icon: Mail, title: "Email", lines: ["info@lkouniv.ac.in"] },
                { icon: Phone, title: "Helpline", lines: ["0522-2740467"] },
              ].map((contact, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 hover:bg-white/20 transition-all"
                >
                  <contact.icon className="w-6 h-6 text-white/80 mx-auto mb-2" />
                  <h4 className="font-semibold text-white mb-1">{contact.title}</h4>
                  {contact.lines.map((line, j) => (
                    <p key={j} className="text-sm text-white/70">{line}</p>
                  ))}
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* CTA Buttons */}
          <AnimatedSection delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/signup")}
                className="group bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Create Free Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-white/20 backdrop-blur-md text-white border-2 border-white/50 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/30 hover:border-white/70 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Already have account? Login
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}