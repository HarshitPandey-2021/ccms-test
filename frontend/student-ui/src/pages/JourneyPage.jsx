// src/pages/JourneyPage.jsx
// ═══════════════════════════════════════════════════════════════════════════
// THE JOURNEY OF A COMPLAINT - An Immersive Scroll Experience
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowDown,
  ChevronDown,
  FileText,
  Send,
  Bell,
  Users,
  CheckCircle,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Database,
  Server,
  Smartphone,
  Clock,
  Zap,
  Star,
  Code,
  Cpu,
  Heart,
  Play,
  X,
} from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

// ═══════════════════════════════════════════════════════════════════════════
// STORY DATA
// ═══════════════════════════════════════════════════════════════════════════

const STORY = {
  student: "Priya",
  issue: "AC not working",
  location: "Room 301, Block A",
  category: "Electrical",
  department: "Maintenance",
  staff: "Suresh Kumar",
  complaintId: "CMP00042",
  timeline: {
    filed: "2:30 PM",
    assigned: "2:45 PM",
    started: "3:00 PM",
    resolved: "4:30 PM",
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const ScrollProgress = ({ progress, isDark }) => (
  <div className={`fixed top-0 left-0 right-0 h-1 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} z-[60]`}>
    <div
      className={`h-full transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' 
          : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500'
      }`}
      style={{ width: `${progress}%` }}
    />
  </div>
);

const Section = ({ children, className = "", id, isDark }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={`min-h-screen flex items-center justify-center px-4 py-16 md:py-20 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"} ${className}`}
    >
      {children}
    </section>
  );
};

const TechPeek = ({ isOpen, onClose, title, children, isDark }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isDark ? 'from-indigo-500 to-purple-600' : 'from-teal-500 to-cyan-600'} flex items-center justify-center`}>
              <Code className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const CodeBlock = ({ code, language = "javascript" }) => (
  <div className="bg-gray-950 rounded-xl overflow-hidden my-4">
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
      <div className="w-3 h-3 rounded-full bg-red-500" />
      <div className="w-3 h-3 rounded-full bg-yellow-500" />
      <div className="w-3 h-3 rounded-full bg-green-500" />
      <span className="ml-2 text-xs text-gray-400 font-mono">{language}</span>
    </div>
    <pre className="p-4 overflow-x-auto text-sm">
      <code className="text-green-400 font-mono whitespace-pre-wrap">{code}</code>
    </pre>
  </div>
);

const PeekButton = ({ onClick, isDark }) => (
  <button
    onClick={onClick}
    className={`group inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all mt-4 ${
      isDark 
        ? 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-gray-400 hover:text-white' 
        : 'bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 hover:text-teal-900'
    }`}
  >
    <Eye className="w-4 h-4" />
    <span>What's happening?</span>
    <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
  </button>
);

const StatusBadge = ({ status, animate = false }) => {
  const colors = {
    Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    Assigned: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    "In Progress": "bg-purple-500/20 text-purple-400 border-purple-500/50",
    Resolved: "bg-green-500/20 text-green-400 border-green-500/50",
    Rejected: "bg-red-500/20 text-red-400 border-red-500/50",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${colors[status]} ${
        animate ? "animate-pulse" : ""
      }`}
    >
      {status === "Resolved" && <CheckCircle className="w-4 h-4" />}
      {status}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function JourneyPage() {
  const { isDark } = useDarkMode();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activePeek, setActivePeek] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("Pending");

  useEffect(() => {
    document.title = "The Journey | CCMS";
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const statuses = ["Pending", "Assigned", "In Progress", "Resolved"];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % statuses.length;
      setCurrentStatus(statuses[index]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const gradientText = isDark 
    ? "from-indigo-400 via-purple-400 to-pink-400" 
    : "from-teal-500 via-cyan-500 to-blue-500";

  const buttonGradient = isDark 
    ? "from-indigo-500 to-purple-600" 
    : "from-teal-500 to-cyan-600";

  return (
    <div className={`${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} overflow-x-hidden`}>
      {/* Scroll Progress */}
      <ScrollProgress progress={scrollProgress} isDark={isDark} />

      {/* Shared Navbar */}
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SCENE 0: HERO */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className={`min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-10 relative overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50'}`}>
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${isDark ? 'bg-indigo-600/20' : 'bg-teal-400/20'} rounded-full blur-3xl`} />
          <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${isDark ? 'bg-purple-600/20' : 'bg-cyan-400/20'} rounded-full blur-3xl`} />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${isDark ? 'bg-pink-600/10' : 'bg-blue-400/10'} rounded-full blur-3xl`} />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-teal-200 shadow-lg'} border rounded-full mb-8 backdrop-blur-sm`}>
            <Play className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-teal-600'}`} />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-teal-800'}`}>Interactive Experience</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight">
            Follow the{" "}
            <span className={`bg-gradient-to-r ${gradientText} bg-clip-text text-transparent`}>
              Journey
            </span>
            <br />
            of a Complaint
          </h1>

          <p className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            From the moment a student files a complaint to when it's resolved —
            scroll down to experience the entire journey.
          </p>

          {/* Animated Status Preview */}
          <div className="flex justify-center mb-10">
            <StatusBadge status={currentStatus} animate />
          </div>

          {/* Scroll CTA */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => {
                document.getElementById("scene-1")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`group flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${buttonGradient} rounded-full font-bold text-lg text-white hover:scale-105 transition-transform shadow-lg`}
            >
              Begin the Journey
              <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </button>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Scroll or click to explore</p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className={`w-6 h-10 rounded-full border-2 ${isDark ? 'border-gray-600' : 'border-teal-300'} flex items-start justify-center p-2`}>
            <div className={`w-1 h-2 ${isDark ? 'bg-gray-400' : 'bg-teal-500'} rounded-full animate-scroll`} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SCENE 1: THE PROBLEM */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Section id="scene-1" isDark={isDark}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-2xl font-black text-white mb-8">
            1
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            It's <span className="text-orange-400">2 PM</span> in Room 301
          </h2>

          <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-orange-50 border-orange-200'} border rounded-2xl p-6 sm:p-8 md:p-10 max-w-2xl mx-auto mb-8`}>
            <div className="text-6xl mb-6">🥵</div>
            <p className={`text-lg sm:text-xl leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{STORY.student}</span> is sitting in class.
              The <span className="text-red-500 font-semibold">AC hasn't worked in 3 days</span>.
              <br /><br />
              Everyone's sweating. Concentration is impossible.
              <br /><br />
              <span className={`italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                "Someone should do something about this..."
              </span>
            </p>
          </div>

          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Instead of just complaining to friends, {STORY.student} decides to take action.
          </p>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SCENE 2: THE DECISION */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Section id="scene-2" className={isDark ? "bg-gray-950" : "bg-gradient-to-br from-teal-50 to-cyan-50"} isDark={isDark}>
        <div className="max-w-4xl mx-auto text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${isDark ? 'from-blue-500 to-indigo-600' : 'from-teal-500 to-cyan-600'} text-2xl font-black text-white mb-8`}>
            2
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            She opens the <span className={isDark ? 'text-indigo-400' : 'text-teal-600'}>CCMS Portal</span>
          </h2>

          {/* Phone Mockup */}
          <div className="relative mx-auto w-64 sm:w-72 mb-8">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-900'} rounded-[3rem] p-3 border-4 ${isDark ? 'border-gray-700' : 'border-gray-800'} shadow-2xl`}>
              <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-950'} rounded-[2.5rem] overflow-hidden`}>
                <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-900'} px-6 py-2 flex justify-between items-center text-xs text-gray-400`}>
                  <span>{STORY.timeline.filed}</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-2 bg-green-500 rounded-sm" />
                    <span>100%</span>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${buttonGradient} flex items-center justify-center`}>
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-bold text-white text-sm">CCMS</p>
                    <p className="text-xs text-gray-400">Campus Complaint Portal</p>
                  </div>
                  <button className={`w-full py-3 bg-gradient-to-r ${buttonGradient} rounded-xl text-white font-semibold text-sm`}>
                    + New Complaint
                  </button>
                  <div className="space-y-2">
                    <div className={`h-3 ${isDark ? 'bg-gray-800' : 'bg-gray-800'} rounded w-full`} />
                    <div className={`h-3 ${isDark ? 'bg-gray-800' : 'bg-gray-800'} rounded w-3/4`} />
                    <div className={`h-3 ${isDark ? 'bg-gray-800' : 'bg-gray-800'} rounded w-1/2`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className={`text-lg max-w-xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            With a few taps, she can report the issue and track it until it's fixed.
          </p>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SCENE 3: FILING THE COMPLAINT */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Section id="scene-3" isDark={isDark}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-2xl font-black text-white mb-8">
              3
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Filling the <span className="text-green-500">Complaint Form</span>
            </h2>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              She describes the problem. The system does the rest.
            </p>
          </div>

          {/* Form Preview */}
          <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-green-200 shadow-lg'} border rounded-2xl p-4 sm:p-6 max-w-2xl mx-auto`}>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Subject</label>
                <div className={`${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-lg px-4 py-3`}>
                  {STORY.issue} in {STORY.location}
                </div>
              </div>

              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Category</label>
                <div className={`flex items-center gap-3 ${isDark ? 'bg-gray-900 border-green-500/50' : 'bg-green-50 border-green-300'} border rounded-lg px-4 py-3`}>
                  <span className="text-2xl">⚡</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{STORY.category}</span>
                  <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                </div>
              </div>

              <div className={`${isDark ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-teal-50 border-teal-300'} border rounded-lg p-4 flex items-start gap-3`}>
                <Cpu className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-indigo-400' : 'text-teal-600'}`} />
                <div>
                  <p className={`font-semibold text-sm ${isDark ? 'text-indigo-300' : 'text-teal-700'}`}>Auto-Detection Active</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-indigo-400/80' : 'text-teal-600'}`}>
                    Category "{STORY.category}" → Routing to <strong>{STORY.department}</strong> department
                  </p>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <Send className="w-5 h-5" />
                Submit Complaint
              </button>
            </div>
          </div>

          <div className="text-center">
            <PeekButton onClick={() => setActivePeek("filing")} isDark={isDark} />
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SCENE 4: THE MAGIC (Data Flow) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Section id="scene-4" className={isDark ? "bg-gray-950" : "bg-gradient-to-br from-purple-50 to-pink-50"} isDark={isDark}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-2xl font-black text-white mb-8">
            4
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            The <span className="text-purple-500">Magic</span> Happens
          </h2>
          <p className={`max-w-xl mx-auto mb-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            In milliseconds, her complaint travels through the system.
          </p>

          {/* Data Flow Animation */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-10">
            {[
              { icon: Smartphone, label: "Student App", gradient: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/30" },
              { icon: Server, label: "Backend Server", gradient: "from-green-500 to-emerald-500", shadow: "shadow-green-500/30", pulse: true },
              { icon: Database, label: "MongoDB", gradient: "from-purple-500 to-pink-500", shadow: "shadow-purple-500/30" },
              { icon: Bell, label: "Admin Alert", gradient: "from-orange-500 to-red-500", shadow: "shadow-orange-500/30" },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg ${step.shadow} ${step.pulse ? 'animate-pulse' : ''}`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{step.label}</p>
                </div>
                {i < 3 && <ArrowRight className={`w-8 h-8 rotate-90 md:rotate-0 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Complaint ID */}
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-200 shadow-lg'} border`}>
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Complaint ID:</span>
            <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{STORY.complaintId}</span>
          </div>

          <div className="text-center mt-6">
            <PeekButton onClick={() => setActivePeek("dataflow")} isDark={isDark} />
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SCENE 5: ADMIN RECEIVES */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Section id="scene-5" isDark={isDark}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-2xl font-black text-white mb-8">
              5
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              The <span className="text-orange-500">Right Person</span> Gets It
            </h2>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Ramesh from Maintenance sees a new complaint in his dashboard.
            </p>
          </div>

          {/* Admin Dashboard Preview */}
          <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-xl'} border rounded-2xl overflow-hidden max-w-3xl mx-auto`}>
            <div className={`bg-gradient-to-r ${isDark ? 'from-indigo-600 to-purple-600' : 'from-teal-600 to-cyan-600'} px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Admin Dashboard</p>
                  <p className="text-sm text-white/70">Maintenance Department</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
                <Bell className="w-4 h-4 text-white" />
                <span className="text-white font-bold text-sm">1 New</span>
              </div>
            </div>

            <div className="p-4">
              <div className={`${isDark ? 'bg-gray-900/50 border-yellow-500/30' : 'bg-yellow-50 border-yellow-300'} border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-mono text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{STORY.complaintId}</span>
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-600 rounded text-xs font-semibold">
                      NEW
                    </span>
                  </div>
                  <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {STORY.issue} in {STORY.location}
                  </p>
                  <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {STORY.timeline.filed}
                    </span>
                    <StatusBadge status="Pending" />
                  </div>
                </div>
                <button className={`px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors ${isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-teal-600 hover:bg-teal-700'}`}>
                  Assign Staff →
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <PeekButton onClick={() => setActivePeek("admin")} isDark={isDark} />
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SCENE 6: ASSIGNMENT */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Section id="scene-6" className={isDark ? "bg-gray-950" : "bg-gradient-to-br from-teal-50 to-cyan-50"} isDark={isDark}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-2xl font-black text-white mb-8">
            6
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-teal-500">{STORY.staff}</span> Gets the Task
          </h2>
          <p className={`max-w-xl mx-auto mb-10 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            The complaint is assigned to the right staff member.
          </p>

          {/* Assignment Visual */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
            <div className="flex flex-col items-center">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${isDark ? 'from-indigo-500 to-purple-600' : 'from-teal-500 to-cyan-600'} flex items-center justify-center text-4xl shadow-xl`}>
                👨‍💼
              </div>
              <p className={`mt-3 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Ramesh</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Admin</p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <ArrowRight className="w-12 h-12 text-teal-500 rotate-90 md:rotate-0" />
              <span className="text-sm text-teal-500 font-semibold">Assigns to</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center text-4xl shadow-xl">
                👷
              </div>
              <p className={`mt-3 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{STORY.staff}</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Electrician</p>
            </div>
          </div>

          {/* Status Change */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <StatusBadge status="Pending" />
            <ArrowRight className={`w-5 h-5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <StatusBadge status="Assigned" />
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SCENE 7: RESOLUTION */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Section id="scene-7" isDark={isDark}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-2xl font-black text-white mb-8">
            7
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-green-500">Problem Solved!</span>
          </h2>
          <p className={`max-w-xl mx-auto mb-10 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            2 hours later, the AC is fixed. {STORY.student} gets notified.
          </p>

          {/* Success Animation */}
          <div className="relative w-48 h-48 mx-auto mb-10">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <div className="absolute inset-4 bg-green-500/30 rounded-full animate-pulse" />
            <div className="absolute inset-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Timeline */}
          <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-green-200 shadow-lg'} border rounded-2xl p-6 max-w-md mx-auto`}>
            <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Complaint Timeline</h3>
            <div className="space-y-4">
              {[
                { time: STORY.timeline.filed, status: "Filed", icon: FileText },
                { time: STORY.timeline.assigned, status: "Assigned", icon: Users },
                { time: STORY.timeline.started, status: "Work Started", icon: Zap },
                { time: STORY.timeline.resolved, status: "Resolved", icon: CheckCircle, highlight: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.highlight
                        ? "bg-green-500 text-white"
                        : isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-semibold ${item.highlight ? "text-green-500" : isDark ? "text-white" : "text-gray-900"}`}>
                      {item.status}
                    </p>
                  </div>
                  <span className={`text-sm font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Happy Ending */}
          <div className="mt-10 flex flex-col items-center">
            <div className="text-6xl mb-4">😊❄️</div>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {STORY.student} walks into a <span className="text-cyan-500 font-semibold">cool classroom</span> the next day.
            </p>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SCENE 8: PRIVACY */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Section id="scene-8" className={isDark ? "bg-black" : "bg-gradient-to-br from-purple-50 to-pink-50"} isDark={isDark}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white mb-8">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            But What If It's <span className="text-purple-500">Sensitive?</span>
          </h2>
          <p className={`max-w-xl mx-auto mb-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Some issues need extra protection. We've got you covered.
          </p>

          {/* Privacy Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {[
              {
                icon: EyeOff,
                title: "Automatic Anonymity",
                desc: "Sensitive categories auto-hide your identity",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Shield,
                title: "Restricted Access",
                desc: "Only authorized committee members can view",
                color: "from-blue-500 to-indigo-500",
              },
              {
                icon: Lock,
                title: "Audit Trail",
                desc: "Every action is logged for accountability",
                color: "from-green-500 to-emerald-500",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`${isDark ? 'bg-gray-900/50 border-gray-800 hover:border-gray-700' : 'bg-white border-purple-200 shadow-lg hover:shadow-xl'} border rounded-2xl p-6 transition-all`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Sensitive Categories */}
          <div className={`${isDark ? 'bg-purple-900/20 border-purple-500/30' : 'bg-purple-100 border-purple-300'} border rounded-2xl p-6 max-w-xl mx-auto`}>
            <p className={`text-sm font-semibold mb-4 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
              These categories are automatically protected:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Harassment", "Ragging", "Eve Teasing", "Safety", "Discrimination"].map((cat, i) => (
                <span
                  key={i}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${isDark ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-purple-200 border-purple-400 text-purple-800'} border`}
                >
                  <Lock className="w-3 h-3" />
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="text-center mt-6">
            <PeekButton onClick={() => setActivePeek("privacy")} isDark={isDark} />
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SCENE 9: FINAL CTA */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className={`min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600' : 'bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600'}`}>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto text-white">
          <div className="text-6xl mb-8">🎯</div>

          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6">
            Your Voice Matters
          </h2>

          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Now you know the journey. From problem to solution.
            <br />
            Ready to make your campus better?
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <button className={`group px-8 py-4 bg-white rounded-full font-bold text-lg shadow-2xl hover:scale-105 transition-all flex items-center gap-2 ${isDark ? 'text-indigo-700' : 'text-teal-700'}`}>
                Create Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/login">
              <button className="px-8 py-4 bg-white/20 backdrop-blur-md text-white border-2 border-white rounded-full font-bold text-lg hover:bg-white/30 transition-all">
                Login
              </button>
            </Link>
          </div>

          <p className="mt-10 text-white/60 text-sm flex items-center justify-center gap-1">
            Built with <Heart className="w-4 h-4 text-red-400 fill-current" /> by B.Tech AI Students, University of Lucknow
          </p>
        </div>
      </section>

      {/* Shared Footer */}
      <Footer />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TECHNICAL PEEK MODALS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <TechPeek
        isOpen={activePeek === "filing"}
        onClose={() => setActivePeek(null)}
        title="What Happens When You Submit"
        isDark={isDark}
      >
        <div className={`space-y-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          <p>When you click "Submit", here's what happens in the code:</p>
          <CodeBlock
            code={`// 1. Form data is collected
const formData = new FormData();
formData.append("subject", "AC not working");
formData.append("category", "Electrical");

// 2. Auto-routing kicks in
if (category === "Electrical") {
  department = "Maintenance";
}

// 3. Saved to MongoDB
await Complaints.insertOne({
  complaintId: "CMP00042",
  subject, category, department,
  status: "Pending"
});`}
          />
        </div>
      </TechPeek>

      <TechPeek
        isOpen={activePeek === "dataflow"}
        onClose={() => setActivePeek(null)}
        title="The Technical Journey"
        isDark={isDark}
      >
        <div className={`space-y-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          <p>Here's exactly how data flows through the system:</p>
          <CodeBlock
            code={`// 1. Frontend sends POST request
fetch("/api/complaints", {
  method: "POST",
  headers: { "Authorization": "Bearer <token>" },
  body: formData
});

// 2. Backend processes & saves
app.post("/api/complaints", auth, async (req, res) => {
  // Validate → Upload files → Save → Respond
});

// 3. Response: { success: true, complaintId: "CMP00042" }`}
          />
        </div>
      </TechPeek>

      <TechPeek
        isOpen={activePeek === "admin"}
        onClose={() => setActivePeek(null)}
        title="How Admin Filtering Works"
        isDark={isDark}
      >
        <div className={`space-y-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          <p>Not all admins see the same complaints:</p>
          <CodeBlock
            code={`if (adminType === "super") {
  filter = {};  // Sees EVERYTHING
}
else if (adminType === "department") {
  filter = { department: admin.department };
}
else if (adminType === "womens_cell") {
  filter = { category: /harassment|safety/i };
}`}
          />
        </div>
      </TechPeek>

      <TechPeek
        isOpen={activePeek === "privacy"}
        onClose={() => setActivePeek(null)}
        title="How Anonymous Protection Works"
        isDark={isDark}
      >
        <div className={`space-y-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          <p>When you file a sensitive complaint:</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm mb-2 font-semibold">What's STORED:</p>
              <CodeBlock code={`{
  userId: "your_id",
  submittedBy: "Your Name",
  isAnonymous: true
}`} />
            </div>
            <div>
              <p className="text-sm mb-2 font-semibold">What ADMIN sees:</p>
              <CodeBlock code={`{
  submittedBy: "Anonymous 🕵️",
  email: "Hidden",
  isAnonymous: true
}`} />
            </div>
          </div>
        </div>
      </TechPeek>

      {/* Custom Styles */}
      <style>{`
        @keyframes scroll {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(6px); opacity: 0.5; }
        }
        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}