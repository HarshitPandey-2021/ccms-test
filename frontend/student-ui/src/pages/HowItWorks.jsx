// src/pages/HowItWorks.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  ShieldCheck,
  CheckCircle,
  Star,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Zap,
  Users,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  Building2,
  UserCog,
  Bell,
  Clock,
  Shield,
  Layers,
  Code,
  Heart,
  Send,
  Cpu,
  Database,
  Server,
  BookOpen,
  Lightbulb,
  Workflow,
  Mail,
  Key,
  Fingerprint,
  Cloud,
  Activity,
  Sparkles,
  UserPlus,
  LogIn,
  AlertTriangle,
  FileSearch,
  X,
  TrendingUp,
  BarChart3,
  ClipboardList,
  Timer,
  MessageSquare,
  RefreshCw,
  Flag,
  Megaphone,
  Scale,
  FileCheck,
  History,
  AlertCircle,
  ChevronRight,
  Target,
  Gauge,
  CircleDot,
} from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

// ============================================
// REUSABLE COMPONENTS
// ============================================

const ExpandableSection = ({ title, icon: Icon, children, defaultOpen = false, isDark }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
      isDark 
        ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
        : 'bg-white border-teal-200 hover:border-teal-300 shadow-sm hover:shadow-md'
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 text-left transition-colors ${
          isDark ? 'hover:bg-gray-700/50' : 'hover:bg-teal-50'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isDark ? 'from-indigo-500 to-purple-600' : 'from-teal-500 to-cyan-600'} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <span className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>{title}</span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 transition-transform duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'} ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className={`p-5 pt-0 border-t ${isDark ? 'border-gray-700' : 'border-teal-100'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

const CodeBlock = ({ code, title }) => (
  <div className="rounded-xl overflow-hidden bg-gray-900 shadow-lg my-4">
    {title && (
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-gray-400 text-sm font-mono">{title}</span>
      </div>
    )}
    <pre className="p-4 overflow-x-auto text-sm">
      <code className="text-green-400 font-mono whitespace-pre-wrap">{code}</code>
    </pre>
  </div>
);

const InfoCard = ({ icon: Icon, title, description, color = "teal", isDark }) => {
  const colors = {
    teal: isDark ? "bg-teal-900/30 border-teal-500/30 text-teal-400" : "bg-teal-50 border-teal-200 text-teal-700",
    green: isDark ? "bg-green-900/30 border-green-500/30 text-green-400" : "bg-green-50 border-green-200 text-green-700",
    yellow: isDark ? "bg-yellow-900/30 border-yellow-500/30 text-yellow-400" : "bg-yellow-50 border-yellow-200 text-yellow-700",
    red: isDark ? "bg-red-900/30 border-red-500/30 text-red-400" : "bg-red-50 border-red-200 text-red-700",
    purple: isDark ? "bg-purple-900/30 border-purple-500/30 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-700",
    orange: isDark ? "bg-orange-900/30 border-orange-500/30 text-orange-400" : "bg-orange-50 border-orange-200 text-orange-700",
    blue: isDark ? "bg-blue-900/30 border-blue-500/30 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${colors[color]}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold">{title}</p>
          <p className={`text-sm mt-1 ${isDark ? 'opacity-80' : 'opacity-90'}`}>{description}</p>
        </div>
      </div>
    </div>
  );
};

const FlowStep = ({ number, title, description, icon: Icon, isLast = false, isDark }) => (
  <div className="relative">
    {!isLast && (
      <div className={`absolute left-6 top-16 w-0.5 h-full -z-10 ${isDark ? 'bg-gradient-to-b from-indigo-500 to-purple-500' : 'bg-gradient-to-b from-teal-300 to-cyan-300'}`} />
    )}
    
    <div className={`flex gap-4 p-4 rounded-2xl transition-all duration-300 ${isDark ? 'hover:bg-gray-800/50' : 'hover:bg-teal-50'}`}>
      <div className="flex-shrink-0">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${isDark ? 'from-indigo-500 to-purple-600' : 'from-teal-500 to-cyan-600'} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
          {number}
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>{title}</h4>
          <Icon className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-teal-500'}`} />
        </div>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{description}</p>
      </div>
    </div>
  </div>
);

const TabButton = ({ active, onClick, children, icon: Icon, isDark }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
      active 
        ? isDark 
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
          : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
        : isDark 
          ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' 
          : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-700'
    }`}
  >
    <Icon className="w-4 h-4" />
    {children}
  </button>
);

const ComparisonCard = ({ title, items, type, isDark }) => {
  const isGood = type === "good";
  
  return (
    <div className={`p-6 rounded-2xl ${
      isGood 
        ? isDark ? 'bg-green-900/20 border border-green-500/30' : 'bg-green-50 border border-green-200'
        : isDark ? 'bg-red-900/20 border border-red-500/30' : 'bg-red-50 border border-red-200'
    }`}>
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isGood 
            ? isDark ? 'bg-green-500/30' : 'bg-green-200'
            : isDark ? 'bg-red-500/30' : 'bg-red-200'
        }`}>
          {isGood 
            ? <CheckCircle className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            : <X className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          }
        </div>
        <h3 className={`text-lg font-bold ${
          isGood 
            ? isDark ? 'text-green-400' : 'text-green-700'
            : isDark ? 'text-red-400' : 'text-red-700'
        }`}>
          {title}
        </h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            {isGood 
              ? <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
              : <X className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
            }
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const TimelineStep = ({ step, title, description, icon: Icon, status, isLast, isDark }) => {
  const statusColors = {
    pending: isDark ? 'from-yellow-500 to-orange-500' : 'from-yellow-400 to-orange-400',
    active: isDark ? 'from-blue-500 to-cyan-500' : 'from-blue-400 to-cyan-400',
    escalated: isDark ? 'from-red-500 to-pink-500' : 'from-red-400 to-rose-400',
    complete: isDark ? 'from-green-500 to-emerald-500' : 'from-green-400 to-emerald-400',
  };

  return (
    <div className="relative">
      {!isLast && (
        <div className={`absolute left-7 top-20 w-0.5 h-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div className={`w-full h-1/2 bg-gradient-to-b ${statusColors[status]} animate-pulse`} />
        </div>
      )}
      
      <div className={`flex gap-5 p-5 rounded-2xl transition-all duration-300 group ${isDark ? 'hover:bg-gray-800/70' : 'hover:bg-white hover:shadow-lg'}`}>
        <div className="flex-shrink-0">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${statusColors[status]} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
            <Icon className="w-7 h-7" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              Step {step}
            </span>
            <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>{title}</h4>
          </div>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{description}</p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, value, label, trend, color, isDark }) => {
  const colors = {
    teal: isDark ? 'from-teal-500 to-cyan-500' : 'from-teal-400 to-cyan-400',
    purple: isDark ? 'from-purple-500 to-pink-500' : 'from-purple-400 to-pink-400',
    orange: isDark ? 'from-orange-500 to-red-500' : 'from-orange-400 to-red-400',
    green: isDark ? 'from-green-500 to-emerald-500' : 'from-green-400 to-emerald-400',
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200 shadow-lg'}`}>
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${colors[color]} opacity-20 blur-2xl`} />
      <div className="relative">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>{label}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{Math.abs(trend)}% vs manual</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function HowItWorks() {
  const { isDark } = useDarkMode();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [hoveredProblem, setHoveredProblem] = useState(null);

  useEffect(() => {
    document.title = "How It Works | CCMS";
  }, []);

  const gradientText = isDark 
    ? "from-indigo-400 via-purple-400 to-pink-400" 
    : "from-teal-500 via-cyan-500 to-blue-500";

  const buttonGradient = isDark 
    ? "from-indigo-500 to-purple-600" 
    : "from-teal-500 to-cyan-600";

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-white'}`}>
      {/* Shared Navbar */}
      <Navbar />

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <section className={`relative pt-28 pb-20 overflow-hidden ${isDark ? 'bg-gray-900' : ''}`}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-20 left-10 w-72 h-72 ${isDark ? 'bg-indigo-500/20' : 'bg-teal-400/20'} rounded-full blur-3xl animate-pulse`} />
          <div className={`absolute bottom-10 right-10 w-96 h-96 ${isDark ? 'bg-purple-500/20' : 'bg-cyan-400/20'} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${isDark ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-teal-100 border-teal-300'} border`}>
            <BookOpen className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-teal-600'}`} />
            <span className={`text-sm font-medium ${isDark ? 'text-indigo-300' : 'text-teal-700'}`}>Complete System Guide</span>
          </div>

          <h1 className={`text-4xl md:text-6xl font-extrabold mb-6 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Understand{" "}
            <span className={`bg-gradient-to-r ${gradientText} bg-clip-text text-transparent`}>
              Everything
            </span>
            <br />About CCMS
          </h1>

          <p className={`text-xl md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            From filing your first complaint to how admins resolve it — 
            explore every detail of how our system works.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              onClick={() => document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })}
              className={`bg-gradient-to-r ${buttonGradient} text-white px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2`}
            >
              Start Learning
              <ArrowDown className="w-5 h-5 animate-bounce" />
            </button>
            <Link to="/journey">
              <button className={`px-8 py-4 rounded-full font-bold transition-all duration-300 flex items-center gap-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-teal-200 text-teal-700 hover:bg-teal-50 shadow-lg'} border-2`}>
                <Sparkles className="w-5 h-5" />
                Immersive Journey
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* QUICK STATS */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <section className={`py-8 border-y ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-teal-100'}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, label: "Admin Types", value: "5", color: isDark ? "text-indigo-400" : "text-teal-600" },
              { icon: Database, label: "Collections", value: "7", color: isDark ? "text-purple-400" : "text-cyan-600" },
              { icon: Shield, label: "Privacy Levels", value: "3", color: isDark ? "text-green-400" : "text-green-600" },
              { icon: Zap, label: "API Endpoints", value: "30+", color: isDark ? "text-orange-400" : "text-orange-600" },
            ].map((stat, i) => (
              <div key={i} className={`text-center p-4 rounded-2xl transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-teal-50'}`}>
                <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB NAVIGATION */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <section id="main-content" className={`sticky top-[72px] z-40 py-4 border-b ${isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-teal-100'} backdrop-blur-md`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={Layers} isDark={isDark}>Overview</TabButton>
            <TabButton active={activeTab === "why"} onClick={() => setActiveTab("why")} icon={Lightbulb} isDark={isDark}>Why CCMS</TabButton>
            <TabButton active={activeTab === "student"} onClick={() => setActiveTab("student")} icon={Users} isDark={isDark}>Student Journey</TabButton>
            <TabButton active={activeTab === "admin"} onClick={() => setActiveTab("admin")} icon={UserCog} isDark={isDark}>Admin System</TabButton>
            <TabButton active={activeTab === "escalation"} onClick={() => setActiveTab("escalation")} icon={AlertTriangle} isDark={isDark}>Escalation</TabButton>
            <TabButton active={activeTab === "privacy"} onClick={() => setActiveTab("privacy")} icon={Shield} isDark={isDark}>Privacy</TabButton>
            <TabButton active={activeTab === "technical"} onClick={() => setActiveTab("technical")} icon={Code} isDark={isDark}>Technical</TabButton>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        
        {/* ══════════════════════════════════════════════════════════════ */}
        {/* OVERVIEW TAB */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-12">
            {/* What is CCMS */}
            <section>
              <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${buttonGradient} flex items-center justify-center`}>
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                What is CCMS?
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className={`p-8 rounded-3xl ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-teal-200 shadow-lg'} border`}>
                  <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>For Students</h3>
                  <ul className="space-y-3">
                    {[
                      "File complaints about any campus issue",
                      "Upload images and documents as evidence",
                      "Track your complaint status in real-time",
                      "Stay anonymous for sensitive issues",
                      "Get notified when resolved",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`p-8 rounded-3xl ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-teal-200 shadow-lg'} border`}>
                  <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>For Administration</h3>
                  <ul className="space-y-3">
                    {[
                      "Centralized dashboard for all complaints",
                      "Automatic routing to correct department",
                      "Assign tasks to specific staff members",
                      "Complete audit trail of all actions",
                      "Analytics for decision making",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-indigo-400' : 'text-teal-500'}`} />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* System Architecture */}
            <section>
              <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${buttonGradient} flex items-center justify-center`}>
                  <Server className="w-5 h-5 text-white" />
                </div>
                System Architecture
              </h2>

              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white overflow-hidden relative">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
                </div>

                <div className="relative grid md:grid-cols-3 gap-8">
                  {[
                    { icon: Activity, title: "Frontend", desc: "What you see", techs: ["React + Vite", "TailwindCSS", "Lucide Icons"], gradient: "from-blue-500 to-cyan-500" },
                    { icon: Server, title: "Backend", desc: "The brain", techs: ["Node.js + Express", "JWT Auth", "SendGrid"], gradient: "from-green-500 to-emerald-500" },
                    { icon: Database, title: "Database", desc: "Data storage", techs: ["MongoDB Atlas", "Cloudinary", "7 Collections"], gradient: "from-purple-500 to-pink-500" },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-xl`}>
                        <item.icon className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{item.desc}</p>
                      <div className="space-y-2">
                        {item.techs.map((tech, j) => (
                          <div key={j} className="bg-white/10 px-3 py-1.5 rounded-lg text-sm">{tech}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Journey of Complaint */}
            <section>
              <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${buttonGradient} flex items-center justify-center`}>
                  <Workflow className="w-5 h-5 text-white" />
                </div>
                Journey of a Complaint
              </h2>

              <div className={`rounded-3xl p-8 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-teal-200 shadow-lg'} border`}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {[
                    { icon: FileText, title: "Submit", desc: "Student files", color: "from-blue-500 to-cyan-500" },
                    { icon: Cpu, title: "Auto-Route", desc: "System detects", color: "from-purple-500 to-pink-500" },
                    { icon: Bell, title: "Alert", desc: "Admin notified", color: "from-orange-500 to-red-500" },
                    { icon: UserCog, title: "Assign", desc: "Task given", color: "from-green-500 to-emerald-500" },
                    { icon: Zap, title: "Resolve", desc: "Issue fixed", color: "from-teal-500 to-cyan-500" },
                    { icon: CheckCircle, title: "Complete", desc: "Student notified", color: isDark ? "from-indigo-500 to-purple-500" : "from-teal-500 to-blue-500" },
                  ].map((step, i) => (
                    <div key={i} className="text-center group">
                      <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <step.icon className="w-7 h-7 text-white" />
                      </div>
                      <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{step.title}</h4>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* WHY CCMS TAB (NEW) */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "why" && (
          <div className="space-y-12">
            {/* Hero Banner */}
            <section>
              <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 ${isDark ? 'bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30' : 'bg-gradient-to-br from-teal-500 to-cyan-600'}`}>
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                  <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      Why CCMS is Needed
                    </h2>
                  </div>
                  <p className="text-lg text-white/90 max-w-2xl">
                    Understand the challenges in existing complaint handling processes 
                    and how CCMS provides a structured, transparent, and accountable solution.
                  </p>
                </div>
              </div>
            </section>

            {/* Current Challenges */}
            <section>
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center`}>
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                Current Challenges in Campus Complaint Handling
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: MessageSquare,
                    title: "Verbal or Paper-Based Reporting",
                    problems: [
                      "Complaints made verbally to faculty or staff",
                      "No written record unless manually maintained",
                      "Details can be lost, misremembered, or disputed"
                    ],
                    color: "from-red-500 to-rose-500"
                  },
                  {
                    icon: Search,
                    title: "Lack of Tracking",
                    problems: [
                      "Students have no way to know the status",
                      "Repeated follow-ups waste time for both parties",
                      "Complaints may be forgotten without oversight"
                    ],
                    color: "from-orange-500 to-amber-500"
                  },
                  {
                    icon: Users,
                    title: "Unclear Responsibility",
                    problems: [
                      "Unclear who is responsible for resolution",
                      "Handoffs between departments cause delays",
                      "No single point of accountability"
                    ],
                    color: "from-yellow-500 to-orange-500"
                  },
                  {
                    icon: Eye,
                    title: "Limited Visibility for Administration",
                    problems: [
                      "No consolidated view of ongoing issues",
                      "Patterns go unnoticed (e.g., repeated problems)",
                      "Decision-making is reactive, not data-informed"
                    ],
                    color: "from-purple-500 to-pink-500"
                  }
                ].map((challenge, i) => (
                  <div 
                    key={i} 
                    className={`rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                      isDark 
                        ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800/70' 
                        : 'bg-white border-gray-200 shadow-md hover:shadow-xl hover:border-gray-300'
                    }`}
                    onMouseEnter={() => setHoveredProblem(i)}
                    onMouseLeave={() => setHoveredProblem(null)}
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${challenge.color} flex items-center justify-center mb-4 transition-transform duration-300 ${hoveredProblem === i ? 'scale-110' : ''}`}>
                      <challenge.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{challenge.title}</h3>
                    <ul className="space-y-2">
                      {challenge.problems.map((problem, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <X className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{problem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Before vs After Comparison */}
            <section>
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${buttonGradient} flex items-center justify-center`}>
                  <Scale className="w-5 h-5 text-white" />
                </div>
                How CCMS Addresses These Issues
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <ComparisonCard 
                  title="Current Process"
                  type="bad"
                  isDark={isDark}
                  items={[
                    "Verbal complaints with no written record",
                    "No way for students to track status",
                    "Unclear who is responsible for resolution",
                    "Repeated complaints go unnoticed",
                    "No accountability for delays",
                    "Manual coordination between departments"
                  ]}
                />
                <ComparisonCard 
                  title="With CCMS"
                  type="good"
                  isDark={isDark}
                  items={[
                    "Digital submission with timestamp and record",
                    "Real-time status visible to student",
                    "Automatic routing to correct department",
                    "Complaint history and patterns visible",
                    "Time-bound handling with escalation",
                    "Centralized dashboard for all stakeholders"
                  ]}
                />
              </div>
            </section>

            {/* Improvement Stats */}
            <section>
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center`}>
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                Expected Improvements
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Timer} value="70%" label="Faster Resolution" trend={70} color="teal" isDark={isDark} />
                <StatCard icon={FileCheck} value="100%" label="Complaint Tracking" trend={100} color="purple" isDark={isDark} />
                <StatCard icon={RefreshCw} value="0" label="Lost Complaints" trend={-100} color="green" isDark={isDark} />
                <StatCard icon={Gauge} value="Real-time" label="Status Updates" color="orange" isDark={isDark} />
              </div>
            </section>

            {/* Benefits by Stakeholder */}
            <section>
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${buttonGradient} flex items-center justify-center`}>
                  <Users className="w-5 h-5 text-white" />
                </div>
                Benefits by Stakeholder
              </h2>

              <div className="space-y-4">
                <ExpandableSection title="For Students" icon={Users} defaultOpen={true} isDark={isDark}>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    {[
                      { icon: Clock, title: "Submit Anytime", desc: "File complaints 24/7 from anywhere on campus" },
                      { icon: Search, title: "Track Progress", desc: "Real-time status updates without repeated follow-ups" },
                      { icon: EyeOff, title: "Stay Anonymous", desc: "Option to remain anonymous for sensitive issues" },
                      { icon: Bell, title: "Get Notified", desc: "Receive notifications when your complaint is resolved" },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-start gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${isDark ? 'from-indigo-500 to-purple-500' : 'from-teal-500 to-cyan-500'} flex items-center justify-center flex-shrink-0`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ExpandableSection>

                <ExpandableSection title="For Department Heads" icon={Building2} isDark={isDark}>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    {[
                      { icon: Layers, title: "Filtered View", desc: "See only complaints relevant to your department" },
                      { icon: UserCog, title: "Task Assignment", desc: "Assign tasks to specific staff members" },
                      { icon: Clock, title: "Timeline Monitoring", desc: "Track resolution timelines for accountability" },
                      { icon: MessageSquare, title: "Reduced Interruptions", desc: "Fewer verbal requests and informal complaints" },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-start gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ExpandableSection>

                <ExpandableSection title="For Principal & Administration" icon={Shield} isDark={isDark}>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    {[
                      { icon: BarChart3, title: "Consolidated View", desc: "See all campus issues in one dashboard" },
                      { icon: TrendingUp, title: "Pattern Recognition", desc: "Identify recurring problems across departments" },
                      { icon: FileSearch, title: "Audit Trail", desc: "Complete documentation for institutional accountability" },
                      { icon: Lightbulb, title: "Data-Driven Decisions", desc: "Use complaint data for infrastructure and policy decisions" },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-start gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ExpandableSection>
              </div>
            </section>

            {/* Call to Action */}
            <section>
              <div className={`rounded-3xl p-8 text-center ${isDark ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/30' : 'bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200'}`}>
                <Megaphone className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-indigo-400' : 'text-teal-600'}`} />
                <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Ready to Transform Campus Grievance Handling?
                </h3>
                <p className={`mb-6 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  CCMS provides the transparency, accountability, and efficiency that modern institutions need.
                </p>
                <button 
                  onClick={() => setActiveTab("escalation")}
                  className={`inline-flex items-center gap-2 bg-gradient-to-r ${buttonGradient} text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-all`}
                >
                  See Escalation System
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* STUDENT JOURNEY TAB */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "student" && (
          <div className="space-y-12">
            <section>
              <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${buttonGradient} flex items-center justify-center`}>
                  <Key className="w-5 h-5 text-white" />
                </div>
                Registration Process
              </h2>

              <div className={`rounded-3xl p-8 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-teal-200 shadow-lg'} border`}>
                <InfoCard 
                  icon={ShieldCheck}
                  title="Verified Students Only"
                  description="Only B.Tech AI students of University of Lucknow can register. Your roll number is verified against our whitelist."
                  color="green"
                  isDark={isDark}
                />

                <div className="mt-8 space-y-2">
                  <FlowStep number="1" title="Enter Your Roll Number" description="Type your official university roll number" icon={Fingerprint} isDark={isDark} />
                  <FlowStep number="2" title="Enter Your Email" description="Provide any email where you'll receive the OTP" icon={Mail} isDark={isDark} />
                  <FlowStep number="3" title="Receive OTP" description="A 6-digit verification code is sent to your email" icon={Lock} isDark={isDark} />
                  <FlowStep number="4" title="Verify & Create Password" description="Enter the OTP and set your account password" icon={CheckCircle} isDark={isDark} />
                  <FlowStep number="5" title="Account Created!" description="You're now registered and automatically logged in" icon={Star} isLast={true} isDark={isDark} />
                </div>
              </div>
            </section>

            {/* Filing Section */}
            <section>
              <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${buttonGradient} flex items-center justify-center`}>
                  <FileText className="w-5 h-5 text-white" />
                </div>
                Filing a Complaint
              </h2>

              <div className={`rounded-3xl p-8 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-teal-200 shadow-lg'} border`}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>What You Fill</h3>
                    <div className="space-y-3">
                      {[
                        { field: "Subject", example: "AC not working in Room 201", required: true },
                        { field: "Category", example: "Electrical, Plumbing, WiFi, etc.", required: true },
                        { field: "Location", example: "Block A, Room 201", required: true },
                        { field: "Description", example: "Detailed explanation", required: true },
                        { field: "Images", example: "Up to 5 photos", required: false },
                      ].map((item, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${item.required ? 'bg-red-500' : 'bg-gray-300'}`} />
                            <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{item.field}</span>
                          </div>
                          <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{item.example}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>What Happens Automatically</h3>
                    <div className="space-y-4">
                      <ExpandableSection title="Auto-Department Detection" icon={Cpu} isDark={isDark}>
                        <p className={`mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Based on your category, the system automatically assigns the correct department.
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { cat: "Electrical", dept: "Maintenance" },
                            { cat: "WiFi", dept: "IT Department" },
                            { cat: "Harassment", dept: "Women's Cell" },
                          ].map((item, i) => (
                            <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{item.cat}</span>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span className={isDark ? 'text-indigo-400' : 'text-teal-600'}>{item.dept}</span>
                            </div>
                          ))}
                        </div>
                      </ExpandableSection>

                      <ExpandableSection title="Auto-Anonymous Detection" icon={EyeOff} isDark={isDark}>
                        <p className={`mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Sensitive categories automatically enable anonymous mode:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {["Harassment", "Ragging", "Safety"].map((cat, i) => (
                            <span key={i} className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
                              {cat}
                            </span>
                          ))}
                        </div>
                      </ExpandableSection>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ADMIN SYSTEM TAB */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "admin" && (
          <div className="space-y-12">
            <section>
              <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${buttonGradient} flex items-center justify-center`}>
                  <UserCog className="w-5 h-5 text-white" />
                </div>
                Admin Role System
              </h2>

              <InfoCard 
                icon={Shield}
                title="Role-Based Access Control"
                description="Each admin type has specific access based on their responsibility. This ensures sensitive complaints are only visible to authorized personnel."
                color="purple"
                isDark={isDark}
              />

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {[
                  { role: "Super Admin", icon: Star, color: "from-yellow-500 to-orange-500", access: "Everything", example: "Dean, Principal" },
                  { role: "Department Admin", icon: Building2, color: "from-blue-500 to-indigo-500", access: "Their department only", example: "Maintenance Head" },
                  { role: "Women's Cell", icon: Heart, color: "from-pink-500 to-rose-500", access: "Sensitive complaints", example: "Committee Members" },
                  { role: "Academic Admin", icon: BookOpen, color: "from-green-500 to-emerald-500", access: "Academic issues", example: "Academic Coordinator" },
                  { role: "Anti-Ragging", icon: ShieldCheck, color: "from-red-500 to-orange-500", access: "Ragging complaints", example: "Committee Members" },
                ].map((admin, i) => (
                  <div key={i} className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' : 'bg-white border-teal-200 shadow-lg hover:shadow-xl'} border transition-all`}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${admin.color} flex items-center justify-center mb-4`}>
                      <admin.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{admin.role}</h3>
                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{admin.example}</p>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="font-semibold">Access:</span> {admin.access}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Admin Actions */}
            <section>
              <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${buttonGradient} flex items-center justify-center`}>
                  <Zap className="w-5 h-5 text-white" />
                </div>
                Admin Actions & Capabilities
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <ExpandableSection title="View & Filter Complaints" icon={Search} defaultOpen={true} isDark={isDark}>
                  <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      Filter by status: Pending, In Progress, Resolved
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      Filter by category and priority level
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      Search by keywords or complaint ID
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      Sort by date, urgency, or department
                    </li>
                  </ul>
                </ExpandableSection>

                <ExpandableSection title="Update Complaint Status" icon={RefreshCw} isDark={isDark}>
                  <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      Change status with a single click
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      Add resolution notes and comments
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      All actions are timestamped and logged
                    </li>
                  </ul>
                </ExpandableSection>

                <ExpandableSection title="Assign to Staff" icon={UserCog} isDark={isDark}>
                  <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      Assign specific staff members to complaints
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      Track which staff handled which issue
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      Reassign if needed
                    </li>
                  </ul>
                </ExpandableSection>

                <ExpandableSection title="View Analytics" icon={BarChart3} isDark={isDark}>
                  <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      Dashboard with complaint statistics
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      Category-wise breakdown
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                      Average resolution time tracking
                    </li>
                  </ul>
                </ExpandableSection>
              </div>
            </section>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ESCALATION TAB (NEW) */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "escalation" && (
          <div className="space-y-12">
            {/* Hero Banner */}
            <section>
              <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 ${isDark ? 'bg-gradient-to-br from-red-900/50 to-orange-900/50 border border-red-500/30' : 'bg-gradient-to-br from-red-500 to-orange-500'}`}>
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                  <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      Escalation & Accountability
                    </h2>
                  </div>
                  <p className="text-lg text-white/90 max-w-2xl">
                    CCMS ensures no complaint is ignored. Built-in safeguards enforce time-bound resolution, 
                    automatic escalation, and a complete audit trail that cannot be altered.
                  </p>
                </div>
              </div>
            </section>

            {/* Key Message */}
            <section>
              <div className={`p-6 rounded-2xl border-2 ${isDark ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${isDark ? 'bg-red-500/30' : 'bg-red-200'}`}>
                    <ShieldCheck className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-xl mb-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                      What If a Complaint Is Not Resolved?
                    </h3>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      The system automatically intervenes when complaints are not handled within the defined timeframe. 
                      This ensures accountability at every level without manual oversight.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Complaint Lifecycle */}
            <section>
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${buttonGradient} flex items-center justify-center`}>
                  <Workflow className="w-5 h-5 text-white" />
                </div>
                Complaint Lifecycle
              </h2>

              <div className={`rounded-3xl p-6 md:p-8 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-teal-200 shadow-lg'} border`}>
                <TimelineStep 
                  step={1} 
                  title="Submission" 
                  description="Student files complaint with category, location, and description. System assigns timestamp and unique ID."
                  icon={FileText}
                  status="complete"
                  isDark={isDark}
                />
                <TimelineStep 
                  step={2} 
                  title="Automatic Routing" 
                  description="System detects complaint type and routes to the appropriate department automatically."
                  icon={Cpu}
                  status="complete"
                  isDark={isDark}
                />
                <TimelineStep 
                  step={3} 
                  title="Admin Notification" 
                  description="Relevant admin receives notification about the new complaint requiring attention."
                  icon={Bell}
                  status="active"
                  isDark={isDark}
                />
                <TimelineStep 
                  step={4} 
                  title="Assignment & Action" 
                  description="Admin assigns to staff if needed. Staff takes corrective action and updates status."
                  icon={UserCog}
                  status="pending"
                  isDark={isDark}
                />
                <TimelineStep 
                  step={5} 
                  title="Resolution" 
                  description="Issue is fixed. Admin marks complaint as resolved with notes. Student is notified."
                  icon={CheckCircle}
                  status="complete"
                  isLast
                  isDark={isDark}
                />
              </div>
            </section>

            {/* Four Pillars of Accountability */}
            <section>
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center`}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
                Built-in Safeguards
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Bell,
                    title: "Automatic Reminders",
                    description: "If no action is taken within the defined time window, the assigned admin receives automated reminders at regular intervals. Reminders continue until the status is updated.",
                    points: [
                      "First reminder after 24 hours of inactivity",
                      "Repeated reminders at configured intervals",
                      "Cannot be disabled by regular admins"
                    ],
                    color: isDark ? "from-yellow-500 to-orange-500" : "from-yellow-400 to-orange-400"
                  },
                  {
                    icon: ArrowUp,
                    title: "Escalation to Higher Authority",
                    description: "Complaints unresolved beyond the threshold are automatically escalated. Escalated complaints appear in a priority view for senior administration.",
                    points: [
                      "Auto-escalation after configurable days (e.g., 7 days)",
                      "Principal/Dean receives direct notification",
                      "Escalated complaints are flagged prominently"
                    ],
                    color: isDark ? "from-red-500 to-pink-500" : "from-red-400 to-rose-400"
                  },
                  {
                    icon: Lock,
                    title: "Complaints Cannot Be Deleted",
                    description: "Once submitted, no user—including admins—can delete a complaint. This ensures a complete, unalterable record of all grievances.",
                    points: [
                      "Permanent record for institutional accountability",
                      "Protection against evidence tampering",
                      "Supports RTI compliance and audits"
                    ],
                    color: isDark ? "from-purple-500 to-indigo-500" : "from-purple-400 to-indigo-400"
                  },
                  {
                    icon: FileSearch,
                    title: "Complete Audit Trail",
                    description: "Every action is logged with timestamp and user identity. This includes status changes, assignments, notes, and escalations.",
                    points: [
                      "Who did what and when",
                      "Immutable action history",
                      "Available for review during inquiries"
                    ],
                    color: isDark ? "from-blue-500 to-cyan-500" : "from-blue-400 to-cyan-400"
                  }
                ].map((item, i) => (
                  <div key={i} className={`rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] ${isDark ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 shadow-md hover:shadow-xl'}`}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                    <ul className="space-y-2">
                      {item.points.map((point, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Role-Based Visibility */}
            <section>
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${buttonGradient} flex items-center justify-center`}>
                  <Eye className="w-5 h-5 text-white" />
                </div>
                Role-Based Visibility
              </h2>

              <div className={`rounded-2xl overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200 shadow-lg'}`}>
                <div className={`px-6 py-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Access is restricted based on role to ensure privacy and proper handling of sensitive information.
                  </p>
                </div>
                <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
                  {[
                    { role: "Student", icon: Users, access: "Only their own complaints and status updates", color: "from-blue-500 to-cyan-500" },
                    { role: "Department Admin", icon: Building2, access: "Complaints assigned to their department only", color: "from-purple-500 to-pink-500" },
                    { role: "Super Admin / Principal", icon: Star, access: "All complaints across the institution", color: "from-yellow-500 to-orange-500" },
                    { role: "Women's Cell / Anti-Ragging", icon: Shield, access: "Only complaints in their designated categories", color: "from-red-500 to-rose-500" }
                  ].map((row, i) => (
                    <div key={i} className={`flex items-center justify-between px-6 py-5 ${isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'} transition-colors`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${row.color} flex items-center justify-center`}>
                          <row.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.role}</span>
                      </div>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{row.access}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Governance Benefits */}
            <section>
              <div className={`rounded-3xl p-8 ${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200'}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${buttonGradient} flex items-center justify-center`}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Why This Matters for Governance
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: AlertCircle, text: "Reduces risk of unaddressed grievances escalating into larger issues" },
                    { icon: FileCheck, text: "Provides complete documentation for RTI requests or external audits" },
                    { icon: Heart, text: "Demonstrates institutional commitment to student welfare and accountability" },
                    { icon: Scale, text: "Supports compliance with UGC/AICTE grievance redressal guidelines" }
                  ].map((item, i) => (
                    <div key={i} className={`flex items-start gap-3 p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white shadow-sm'}`}>
                      <item.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Visual Flow */}
            <section>
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center`}>
                  <Flag className="w-5 h-5 text-white" />
                </div>
                Escalation Flow Visualization
              </h2>

              <div className={`rounded-3xl p-8 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-teal-200 shadow-lg'} border`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {[
                    { label: "Day 1-3", status: "Pending", color: isDark ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock },
                    { label: "Day 4-6", status: "Reminded", color: isDark ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-orange-100 text-orange-700 border-orange-300", icon: Bell },
                    { label: "Day 7+", status: "Escalated", color: isDark ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-red-100 text-red-700 border-red-300", icon: AlertTriangle },
                    { label: "Final", status: "Principal Review", color: isDark ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-purple-100 text-purple-700 border-purple-300", icon: Star },
                  ].map((step, i) => (
                    <React.Fragment key={i}>
                      <div className={`flex flex-col items-center p-6 rounded-2xl border-2 ${step.color} min-w-[140px]`}>
                        <step.icon className="w-8 h-8 mb-2" />
                        <span className="font-bold text-lg">{step.status}</span>
                        <span className="text-sm opacity-80">{step.label}</span>
                      </div>
                      {i < 3 && (
                        <ChevronRight className={`w-8 h-8 hidden md:block ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                
                <div className={`mt-8 p-4 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <p className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <strong>Note:</strong> Timeframes are configurable by institution administrators. 
                    The above is an example configuration. Sensitive complaints may have shorter escalation windows.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* PRIVACY TAB */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "privacy" && (
          <div className="space-y-12">
            <section>
              <div className={`rounded-3xl p-8 ${isDark ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/30' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'} border-2`}>
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Your Privacy is Protected
                    </h3>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      When you report sensitive issues, your identity is automatically protected. 
                      Regular admins cannot see who filed the complaint. Only authorized personnel 
                      in Women's Cell or Anti-Ragging committees can view identity when absolutely necessary.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Three Privacy Levels</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { level: "General", icon: Eye, color: isDark ? "border-blue-500/30 bg-blue-900/20" : "border-blue-200 bg-blue-50", desc: "Regular complaints like maintenance, infrastructure", anon: "Optional", details: "Student can choose to remain anonymous or visible" },
                  { level: "Sensitive", icon: EyeOff, color: isDark ? "border-orange-500/30 bg-orange-900/20" : "border-orange-200 bg-orange-50", desc: "Issues requiring careful handling", anon: "Recommended", details: "System suggests anonymous mode but student can override" },
                  { level: "Confidential", icon: Lock, color: isDark ? "border-red-500/30 bg-red-900/20" : "border-red-200 bg-red-50", desc: "Harassment, ragging, safety concerns", anon: "Auto-Enabled", details: "Identity is hidden even from regular admins automatically" },
                ].map((item, i) => (
                  <div key={i} className={`rounded-3xl border-2 p-6 ${item.color} transition-all duration-300 hover:scale-[1.02]`}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${isDark ? 'from-gray-700 to-gray-800' : 'from-white to-gray-100'} flex items-center justify-center mb-4 shadow-lg`}>
                      <item.icon className={`w-7 h-7 ${isDark ? 'text-white' : 'text-gray-700'}`} />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.level}</h3>
                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                    <div className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                      Anonymous Mode: {item.anon}
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{item.details}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <ExpandableSection title="How Anonymous Mode Works" icon={EyeOff} defaultOpen={true} isDark={isDark}>
                <div className="space-y-4 mt-4">
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>What Admins See:</h4>
                    <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <li className="flex items-start gap-2">
                        <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                        Complaint details, category, and location
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                        Any images or documents attached
                      </li>
                      <li className="flex items-start gap-2">
                        <X className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                        Student name, roll number, or email
                      </li>
                    </ul>
                  </div>
                  
                  <InfoCard 
                    icon={Shield}
                    title="Super Admin Access"
                    description="In exceptional cases requiring identity verification, only the Principal/Super Admin can access identity with a logged reason."
                    color="yellow"
                    isDark={isDark}
                  />
                </div>
              </ExpandableSection>
            </section>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TECHNICAL TAB */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "technical" && (
          <div className="space-y-8">
            <InfoCard 
              icon={Code}
              title="Developer Deep Dive"
              description="Technical implementation details for learning or portfolio explanation. This section is intended for those interested in the underlying architecture."
              color="purple"
              isDark={isDark}
            />

            <ExpandableSection title="Database Collections (MongoDB)" icon={Database} defaultOpen={true} isDark={isDark}>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: "Users", desc: "Student & admin accounts with role information" },
                  { name: "Complaints", desc: "All filed complaints with full history" },
                  { name: "Departments", desc: "Maintenance, IT, Academic, etc." },
                  { name: "Staff", desc: "Workers & supervisors for task assignment" },
                  { name: "AllowedStudents", desc: "Whitelist of valid roll numbers" },
                  { name: "OTPs", desc: "Verification codes with expiry" },
                  { name: "AdminLogs", desc: "Complete audit trail of all actions" },
                ].map((col, i) => (
                  <div key={i} className={`p-4 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{col.name}</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{col.desc}</p>
                  </div>
                ))}
              </div>
            </ExpandableSection>

            <ExpandableSection title="Authentication (JWT + OTP)" icon={Key} isDark={isDark}>
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Secure authentication using JSON Web Tokens with OTP-based email verification for new registrations.
              </p>
              <CodeBlock 
                title="Token Generation Example"
                code={`// JWT payload structure
const payload = { 
  userId: user._id,
  email: user.email, 
  role: user.role,
  adminType: user.adminType // for admin users
};

// Generate tokens
const accessToken = jwt.sign(payload, SECRET, { 
  expiresIn: "24h" 
});

const refreshToken = jwt.sign(payload, REFRESH_SECRET, { 
  expiresIn: "30d" 
});`}
              />
            </ExpandableSection>

            <ExpandableSection title="File Upload (Cloudinary)" icon={Cloud} isDark={isDark}>
              <p className={`mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Images and documents are securely uploaded to Cloudinary cloud storage with automatic optimization.
              </p>
              <CodeBlock 
                title="Upload Configuration"
                code={`// Cloudinary upload with optimization
const result = await cloudinary.uploader.upload(file, {
  folder: "campus-complaints/images",
  transformation: [
    { width: 1200, crop: "limit" },
    { quality: "auto:good" },
    { fetch_format: "auto" }
  ]
});

// Store secure URL in complaint
complaint.images.push({
  url: result.secure_url,
  publicId: result.public_id
});`}
              />
            </ExpandableSection>

            <ExpandableSection title="Email Notifications (SendGrid)" icon={Mail} isDark={isDark}>
              <p className={`mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Transactional emails for OTP verification, status updates, and escalation alerts.
              </p>
              <CodeBlock 
                title="Email Service"
                code={`// SendGrid email configuration
const msg = {
  to: user.email,
  from: "noreply@ccms.edu",
  subject: "Complaint Status Updated",
  html: generateStatusEmail({
    complaintId: complaint._id,
    newStatus: complaint.status,
    message: "Your complaint has been resolved."
  })
};

await sgMail.send(msg);`}
              />
            </ExpandableSection>

            <ExpandableSection title="API Architecture" icon={Server} isDark={isDark}>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {[
                  { endpoint: "POST /auth/register", desc: "Student registration with OTP" },
                  { endpoint: "POST /auth/login", desc: "Login with email/password" },
                  { endpoint: "POST /complaints", desc: "File a new complaint" },
                  { endpoint: "GET /complaints", desc: "Get complaints (filtered by role)" },
                  { endpoint: "PATCH /complaints/:id", desc: "Update complaint status" },
                  { endpoint: "GET /admin/analytics", desc: "Dashboard statistics" },
                ].map((api, i) => (
                  <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                    <code className={`text-sm font-mono ${isDark ? 'text-green-400' : 'text-green-700'}`}>{api.endpoint}</code>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{api.desc}</p>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* FINAL CTA */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <section className={`py-16 text-center ${isDark ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600' : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Now that you understand how everything works, make your voice heard!
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              onClick={() => navigate("/signup")}
              className="group bg-white text-gray-900 px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Create Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate("/login")}
              className="bg-white/20 backdrop-blur-md border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Shared Footer */}
      <Footer />

      {/* Custom Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}