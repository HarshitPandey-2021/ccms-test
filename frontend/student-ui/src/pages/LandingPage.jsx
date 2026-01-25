import React, { useEffect, useState } from "react";
import Navbar from "../components/common/NavBar";
import { useNavigate } from "react-router-dom";
import { FileText, Search, ShieldCheck, CheckCircle, Star, ArrowRight, Zap, TrendingUp, Users } from "lucide-react";
import { getLandingStatsApi } from "../api";

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    resolved: "1200+",
    responseTime: "24 Hrs",
    satisfaction: "95%",
    loading: true
  });

  useEffect(() => {
    document.title = "Campus Grievance Portal | University of Lucknow";
    fetchStats();
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100");
            entry.target.classList.remove("opacity-0");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((element) => {
      element.classList.add("opacity-0", "transition-opacity", "duration-700");
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getLandingStatsApi();
      setStats({
        resolved: `${data.totalResolved}+`,
        responseTime: data.avgResponseTime,
        satisfaction: `${data.satisfactionRate}%`,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats({
        resolved: "1200+",
        responseTime: "24 Hrs",
        satisfaction: "95%",
        loading: false
      });
    }
  };

  return (
    <div className="bg-gray-50">
      <Navbar />

      {/* HERO SECTION */}
      <section
        className="relative bg-cover bg-center h-[75vh] flex flex-col justify-center items-center text-center"
        style={{
          backgroundImage:
            "url('https://www.lkouniv.ac.in/site/writereaddata/HomePage/Header/H_202403191545264198.jpg')",
          marginTop: "-1px"
        }}
      >
        <div className="bg-gradient-to-b from-black/60 via-black/50 to-black/40 absolute inset-0" />
        <div className="relative z-10 text-white px-4 space-y-6 animate-on-scroll">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-2xl leading-tight">
            Campus Grievance <span className="text-yellow-400">Redressal</span> Portal
          </h1>

          <p className="text-xl md:text-2xl mb-8 font-light max-w-3xl mx-auto leading-relaxed">
            A transparent, responsive and student-centric system empowering students to raise and track concerns.
          </p>

          {/* ✅ TWO CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/login")}
              className="group bg-yellow-400 text-gray-900 px-8 py-4 text-lg font-bold rounded-full shadow-2xl hover:bg-yellow-300 hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              Report & Track Complaints
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white/20 backdrop-blur-md text-white border-2 border-white px-8 py-4 text-lg font-bold rounded-full shadow-2xl hover:bg-white/30 hover:scale-105 transition-all duration-300"
            >
              Learn How It Works ↓
            </button>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="py-8 bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
            <div className="flex items-center gap-2 text-gray-700 hover:opacity-100 transition-opacity">
              <ShieldCheck className="w-6 h-6 text-green-600" />
              <span className="font-semibold">UGC Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 hover:opacity-100 transition-opacity">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <span className="font-semibold">100% Confidential</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 hover:opacity-100 transition-opacity">
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="font-semibold">Verified Students Only</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 hover:opacity-100 transition-opacity">
              <FileText className="w-6 h-6 text-indigo-600" />
              <span className="font-semibold">Complete Audit Trail</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN FEATURES - ✅ ONLY ROUNDED CARDS */}
{/* MAIN FEATURES - FIXED GRADIENT BORDERS */}
<section className="py-16 px-6 md:px-20">
  <div className="grid md:grid-cols-3 gap-8 text-center animate-on-scroll">
    {[
      {
        title: "Lodge Complaints Effortlessly",
        desc: "Submit detailed concerns with an intuitive and student-friendly interface.",
        subdesc: "Academic • Infrastructure • Hostel • Safety",
        icon: <FileText className="mx-auto w-14 h-14 text-pink-600 mb-4" />,
        gradient: "from-fuchsia-500 via-pink-500 to-cyan-500",
      },
      {
        title: "Real-Time Status Tracking",
        desc: "Monitor your complaint status with live updates and clear timelines.",
        subdesc: "Pending • In Progress • Resolved • Archived",
        icon: <Search className="mx-auto w-14 h-14 text-teal-600 mb-4" />,
        gradient: "from-teal-500 via-cyan-500 to-purple-500",
      },
      {
        title: "Ensured Transparency",
        desc: "A fair, responsible and accountable grievance redressal process.",
        subdesc: "Anonymous Option • Audit Logs • Verified Resolution",
        icon: <ShieldCheck className="mx-auto w-14 h-14 text-blue-700 mb-4" />,
        gradient: "from-blue-500 via-teal-500 to-pink-500",
      },
    ].map((card, i) => (
      // Outer wrapper = Gradient border
      <div
        key={i}
        className={`p-[3px] rounded-3xl bg-gradient-to-r ${card.gradient} hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group`}
      >
        {/* Inner content = White background */}
        <div className="bg-white p-8 rounded-[22px] h-full">
          {card.icon}
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            {card.title}
          </h3>
          <p className="text-gray-600 leading-relaxed mb-3">{card.desc}</p>
          <p className="text-xs text-gray-400 font-medium">{card.subdesc}</p>
        </div>
      </div>
    ))}
  </div>
</section>

 {/* HOW IT WORKS + STATS - Enhanced interactive design */}
<section className="px-4 md:px-8 py-24 bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
  <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-stretch animate-on-scroll">
    
    {/* HOW IT WORKS - More interactive with 5 simple steps */}
    <div id="how-it-works" className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-50"></div>
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            How It Works
          </h2>
        </div>

        <div className="space-y-6">
          {[
            { 
              step: "01", 
              text: "Visit the portal and click 'Get Started'", 
              detail: "Open the website on any device - mobile, laptop, or computer",
              icon: FileText
            },
            { 
              step: "02", 
              text: "Create your account or login", 
              detail: "Use your college email to register - you'll get a verification code",
              icon: ShieldCheck
            },
            { 
              step: "03", 
              text: "Describe your problem in simple words", 
              detail: "Write what happened, where, and when - you can also attach photos",
              icon: FileText
            },
            { 
              step: "04", 
              text: "Submit and get a tracking number", 
              detail: "Your complaint is now registered - save your complaint number",
              icon: CheckCircle
            },
            { 
              step: "05", 
              text: "Check status anytime from your dashboard", 
              detail: "Login anytime to see if your complaint is being worked on or resolved",
              icon: Search
            }
          ].map((item, i) => (
            <div
              key={i}
              className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 cursor-pointer border border-transparent hover:border-indigo-200"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform shadow-md">
                  {item.step}
                </div>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-gray-800 group-hover:text-gray-900 font-semibold text-base leading-relaxed mb-1">
                  {item.text}
                </p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.detail}
                </p>
              </div>
              <item.icon className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0 mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* LIVE STATISTICS - Perfectly centered and aligned */}
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-10 text-white relative overflow-hidden flex flex-col justify-center">
      {/* Animated background circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-delayed"></div>
      
      <div className="relative">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-2">
            <TrendingUp className="animate-bounce" size={32} />
            Live Statistics
          </h2>
          <p className="text-white/80 text-sm">Real-time data from our platform</p>
        </div>

        {stats.loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Complaints Resolved */}
            <div className="group p-6 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-105">
              <div className="flex items-center justify-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-yellow-300" />
                <p className="text-white/90 text-sm font-medium">Complaints Resolved</p>
              </div>
              <div className="text-center">
                <span className="text-yellow-300 text-5xl font-extrabold">
                  {stats.resolved}
                </span>
              </div>
            </div>
            
            {/* Average Response Time */}
            <div className="group p-6 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-105">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-green-300" />
                <p className="text-white/90 text-sm font-medium">Average Response Time</p>
              </div>
              <div className="text-center">
                <span className="text-green-300 text-5xl font-extrabold">
                  {stats.responseTime}
                </span>
              </div>
            </div>
            
            {/* Student Satisfaction */}
            <div className="group p-6 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-105">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="w-5 h-5 text-pink-300" />
                <p className="text-white/90 text-sm font-medium">Student Satisfaction</p>
              </div>
              <div className="text-center">
                <span className="text-pink-300 text-5xl font-extrabold">
                  {stats.satisfaction}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</section>
{/* ABOUT US SECTION - Fixed spacing */}
<section className="px-4 md:px-8 py-14 bg-white">
  <div className="max-w-7xl mx-auto animate-on-scroll">
    <div className="text-center mb-12">
      <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          About Us
        </span>
      </h2>
      <p className="max-w-3xl mx-auto text-gray-700 leading-relaxed text-lg">
        The University of Lucknow's Campus Grievance Redressal Portal is dedicated to ensuring transparency, faster processing, accountability and student empowerment through a modern and fully digital platform.
      </p>
    </div>

    {/* SECURITY HIGHLIGHT */}
    <div className="max-w-4xl mx-auto mb-16">
      <div className="relative p-8 rounded-3xl bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full blur-2xl"></div>
        <div className="relative flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-xl mb-3">Your Privacy is Our Priority</h4>
            <p className="text-gray-700 leading-relaxed">
              Anonymous complaint option available for sensitive issues. 
              All submissions are encrypted and handled with strict confidentiality by authorized personnel only.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* TESTIMONIALS */}
    <div className="mb-16">
      <h3 className="text-3xl font-bold text-center mb-10">
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Student Testimonials
        </span>
      </h3>

      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
        {[
          { name: "Priya Sharma", msg: "Extremely fast response and supportive staff!" },
          { name: "Rahul Verma", msg: "My issue was resolved within a single day!" },
          { name: "Anjali Singh", msg: "Very transparent and easy to use interface." },
          { name: "Vikram Yadav", msg: "The tracking system is brilliant and simple!" },
          { name: "Neha Gupta", msg: "Finally, a system that actually listens to students!" },
        ].map((t, i) => (
          <div
            key={i}
            className="group bg-white p-6 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 border-l-4 border-yellow-400 hover:-translate-y-2 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-100 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="italic text-gray-700 mb-4 text-sm leading-relaxed">
                "{t.msg}"
              </p>
              <h4 className="font-bold text-indigo-700">– {t.name}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* TEAM SECTION */}
    <div className="pb-8">
      <h3 className="text-3xl font-bold text-center mb-10">
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Our Development Team
        </span>
      </h3>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {[
          { img: "shakti", fallback: "team1", name: "Shakti", role: "Frontend & UI Design" },
          { img: "harshit", fallback: "team2", name: "Harshit", role: "Dashboard Development" },
          { img: "somu", fallback: "team3", name: "Somesh", role: "Backend & APIs" },
          { img: "shiva", fallback: "team4", name: "Shiva", role: "Database & Integration" },
        ].map((member, idx) => (
          <div className="group flex flex-col items-center" key={idx}>
            <div className="relative mb-4">
              <div className="w-36 h-36 rounded-full overflow-hidden shadow-lg border-4 border-indigo-200 group-hover:border-indigo-500 transition-all duration-300 group-hover:scale-110 relative z-10">
                <img
                  src={`/images/${member.img}.jpeg`}
                  className="w-full h-full object-cover object-top"
                  alt={member.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `/images/${member.fallback}.jpg`;
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            </div>
            <p className="font-bold text-indigo-700 text-lg">{member.name}</p>
            <p className="text-gray-600 text-sm text-center">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* CONTACT SECTION */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-20 text-white text-center">
        <div className="animate-on-scroll">
          <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
          <p className="max-w-2xl mx-auto text-lg mb-10">
            Have a concern or need help? Our support team is here to assist you!
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl shadow-lg w-72 hover:bg-white/30 transition-all duration-300 hover:scale-105">
              <h3 className="font-semibold text-xl mb-2">📍 Main Campus</h3>
              <p className="text-sm">University Road, Babuganj, Hasanganj</p>
              <p className="text-sm">Lucknow - 226007</p>
            </div>

            <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl shadow-lg w-72 hover:bg-white/30 transition-all duration-300 hover:scale-105">
              <h3 className="font-semibold text-xl mb-2">📧 Support Email</h3>
              <p className="text-sm">General: info@lkouniv.ac.in</p>
              <p className="text-sm">Technical: lu.support@otpl.co.in</p>
            </div>

            <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl shadow-lg w-72 hover:bg-white/30 transition-all duration-300 hover:scale-105">
              <h3 className="font-semibold text-xl mb-2">📞 Helpline</h3>
              <p className="text-sm">Office: 0522-2740467</p>
              <p className="text-sm">Support: +91-7991200503</p>
            </div>
          </div>
          
          <p className="mt-7 text-white/90 text-base font-medium">
            Technical Support Available: Monday - Friday (10 AM - 6 PM)
          </p>

          {/* FINAL CTA */}
          <button
            onClick={() => navigate("/login")}
            className="mt-8 bg-white text-indigo-700 px-8 py-3 text-lg font-bold rounded-full shadow-xl hover:bg-yellow-400 hover:text-gray-900 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
          >
            Get Started Now
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-indigo-900 text-white py-6 text-center -mt-8">
        <p>© {new Date().getFullYear()} University of Lucknow | Campus Complaint Portal</p>
      </footer>
    </div>
  );
}