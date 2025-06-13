'use client'

import React, { useState, useEffect } from 'react';
import { ChevronDown, Mic, Brain, BarChart3, Eye, Zap, Target, Users, Star, ArrowRight, CheckCircle, Play, Pause } from 'lucide-react';

const EchoMentorLanding = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Real-Time Speech Analysis",
      description: "Advanced AI analyzes your speech patterns, pace, and volume in real-time for instant feedback."
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Neural Pattern Recognition",
      description: "Deep learning algorithms identify speech patterns and provide personalized improvement suggestions."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Performance Analytics",
      description: "Comprehensive metrics tracking your progress with detailed visualizations and insights."
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Visual Feedback System",
      description: "Interactive charts and real-time visual cues help you understand and improve your communication."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Executive Coach",
      content: "EchoMentor transformed how I help my clients. The AI insights are incredibly accurate and actionable.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Public Speaker",
      content: "This app helped me eliminate filler words and improve my pacing. My presentations are now much more engaging.",
      rating: 5
    },
    {
      name: "Dr. Emily Watson",
      role: "University Professor",
      content: "The neural pattern analysis is fascinating. It's like having a personal communication coach available 24/7.",
      rating: 5
    }
  ];

  const ScrollIndicator = () => (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
      <div className="flex flex-col items-center space-y-2">
        <span className="text-white/60 text-sm font-medium">Scroll to explore</span>
        <ChevronDown className="w-6 h-6 text-cyan-400" />
      </div>
    </div>
  );

  const ParallaxOrb = ({ className, delay = 0 }) => (
    <div 
      className={`absolute rounded-full blur-3xl animate-pulse ${className}`}
      style={{ 
        transform: `translateY(${scrollY * 0.1}px)`,
        animationDelay: `${delay}ms`
      }}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDgwIDAgTCAwIDAgMCA4MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
        
        {/* Parallax Orbs */}
        <ParallaxOrb className="top-20 left-20 w-72 h-72 bg-gradient-radial from-cyan-500/10 to-transparent" />
        <ParallaxOrb className="bottom-32 right-32 w-96 h-96 bg-gradient-radial from-purple-500/10 to-transparent" delay={1000} />
        <ParallaxOrb className="top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-pink-500/10 to-transparent" delay={500} />
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-300" />
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-400 rounded-full animate-pulse delay-700" />
        <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
              <span className="text-2xl">🧠</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              EchoMentor
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-white/80 hover:text-cyan-400 transition-colors font-medium">Features</a>
            <a href="#testimonials" className="text-white/80 hover:text-cyan-400 transition-colors font-medium">Reviews</a>
            <a href="#pricing" className="text-white/80 hover:text-cyan-400 transition-colors font-medium">Pricing</a>
            <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full text-white font-semibold hover:from-cyan-400 hover:to-purple-500 transition-all transform hover:scale-105">
              Try Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          {/* Creator Badge */}
          <div className="inline-flex items-center space-x-3 px-5 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-2xl backdrop-blur-sm mb-6">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-amber-200 font-semibold tracking-wide">
              Created by Narain Singaram
            </span>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-500" />
          </div>

          <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent tracking-tight leading-tight">
            Master Your<br />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Communication
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Advanced AI-powered speech analysis that transforms how you present, practice, and perfect your communication skills with real-time neural pattern recognition.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <button className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl text-white font-bold text-lg hover:from-cyan-400 hover:to-purple-500 transition-all transform hover:scale-105 shadow-2xl flex items-center space-x-3">
              <Zap className="w-6 h-6" />
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              className="group px-8 py-4 bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl text-white font-semibold text-lg hover:bg-black/40 transition-all flex items-center space-x-3"
            >
              {isVideoPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Demo Video Placeholder */}
          {isVideoPlaying && (
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto border border-white/10">
                      <Play className="w-8 h-8 text-cyan-400" />
                    </div>
                    <p className="text-white/60">Demo video would play here</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <ScrollIndicator />
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              Cutting-Edge Features
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Powered by advanced AI and machine learning algorithms to provide unprecedented insights into your communication patterns.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-8 rounded-3xl backdrop-blur-sm border transition-all duration-500 cursor-pointer ${
                  activeFeature === index
                    ? 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-400/50'
                    : 'bg-black/30 border-white/10 hover:border-cyan-400/30'
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="flex items-start space-x-6">
                  <div className={`p-4 rounded-2xl transition-all duration-300 ${
                    activeFeature === index
                      ? 'bg-gradient-to-br from-cyan-400/20 to-purple-500/20 text-cyan-400'
                      : 'bg-white/10 text-white/70 group-hover:text-cyan-400'
                  }`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-white/70 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Feature Showcase */}
          <div className="relative overflow-hidden p-1 rounded-3xl shadow-2xl border border-white/10 bg-gradient-to-br from-emerald-950/90 via-teal-950/90 to-cyan-950/90">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cG9seWdvbiBpZD0idHJpIiBwb2ludHM9IjIwLDAgNDAsNDAgMCw0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvZGVmcz48dXNlIGhyZWY9IiN0cmkiLz48L3N2Zz4=')] opacity-30" />
            <div className="relative backdrop-blur-xl bg-black/20 border border-white/10 rounded-3xl p-12">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse" />
                <h3 className="text-4xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                  Live Neural Pattern Analysis
                </h3>
              </div>
              <div className="bg-black/30 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center space-x-2">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="w-3 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 100 + 20}px`,
                            animationDelay: `${i * 100}ms`
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-white/60">Real-time speech pattern visualization</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative py-20 px-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "50K+", label: "Active Users", icon: <Users className="w-8 h-8" /> },
              { number: "98%", label: "Accuracy Rate", icon: <Target className="w-8 h-8" /> },
              { number: "4.9★", label: "User Rating", icon: <Star className="w-8 h-8" /> }
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-4 p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm">
                <div className="text-cyan-400 flex justify-center">{stat.icon}</div>
                <div className="text-5xl font-black bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-white/70 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              What Users Say
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Join thousands of professionals who've transformed their communication skills with EchoMentor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 rounded-3xl bg-gradient-to-br from-black/30 to-black/50 border border-white/10 backdrop-blur-sm hover:border-cyan-400/30 transition-all duration-300"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white/80 leading-relaxed mb-6">"{testimonial.content}"</p>
                <div>
                  <div className="text-white font-semibold">{testimonial.name}</div>
                  <div className="text-cyan-400 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-1 rounded-3xl bg-gradient-to-r from-cyan-500 to-purple-600">
            <div className="bg-gradient-to-br from-slate-950 to-purple-950 rounded-3xl p-12 backdrop-blur-sm">
              <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-6">
                Ready to Transform Your Communication?
              </h2>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Join the future of speech enhancement with AI-powered insights and real-time feedback.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl text-white font-bold text-lg hover:from-cyan-400 hover:to-purple-500 transition-all transform hover:scale-105 shadow-2xl flex items-center space-x-3">
                  <Zap className="w-6 h-6" />
                  <span>Start Your Free Trial</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="flex items-center space-x-3 text-white/60">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                <span className="text-lg">🧠</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                EchoMentor
              </span>
            </div>
            
            <div className="text-white/60 text-center">
              <p>© 2025 EchoMentor. Created by Narain Singaram.</p>
              <p className="text-sm mt-1">Transforming communication through AI-powered insights.</p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors">Privacy</a>
              <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors">Terms</a>
              <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EchoMentorLanding;