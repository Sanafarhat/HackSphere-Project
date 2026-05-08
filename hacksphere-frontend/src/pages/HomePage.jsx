import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Users, Trophy, Sparkles, Code, Target, BarChart3 } from 'lucide-react';

export const HomePage = () => {
  const [days, setDays] = useState(45);
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev === 0) {
          setMinutes((m) => {
            if (m === 0) {
              setHours((h) => {
                if (h === 0) {
                  setDays((d) => Math.max(0, d - 1));
                  setHours(23);
                } else {
                  setHours(h - 1);
                }
                return h;
              });
              setMinutes(59);
            } else {
              setMinutes(m - 1);
            }
            return prev;
          });
          return 59;
        } else {
          return prev - 1;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <Zap size={32} />,
      title: 'AI Idea Validator',
      description: 'Get instant feedback on your hackathon idea with detailed analysis and improvement suggestions powered by Llama 3.3 70B.'
    },
    {
      icon: <Users size={32} />,
      title: 'Smart Team Matching',
      description: 'Let AI recommend the perfect teammates based on skills, availability, and project compatibility.'
    },
    {
      icon: <Target size={32} />,
      title: 'Progress Tracking',
      description: 'Real-time milestone tracking, standup updates, and AI-powered blocker detection to keep teams on track.'
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Admin Dashboard',
      description: 'Comprehensive analytics, team management, and mentor assignment tools for seamless hackathon coordination.'
    },
    {
      icon: <Trophy size={32} />,
      title: 'Leaderboard & Badges',
      description: 'Motivational leaderboard, achievement badges, and persistent project gallery for lasting recognition.'
    },
    {
      icon: <Code size={32} />,
      title: 'Project Gallery',
      description: 'Permanent showcase for every project. Share with recruiters and add to your portfolio forever.'
    }
  ];

  const timeline = [
    { stage: 'Discovery', description: 'Land on HackSphere and understand the hackathon' },
    { stage: 'Registration', description: 'Form your team with AI-powered matching' },
    { stage: 'Onboarding', description: 'Set up your team and get ready to build' },
    { stage: 'Validation', description: 'Validate your idea with AI feedback' },
    { stage: 'Building', description: 'Track progress with milestones and standups' },
    { stage: 'Submission', description: 'Submit your project before deadline' },
    { stage: 'Judging', description: 'Get evaluated on innovation and execution' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block mb-6 px-4 py-2 badge">
            <span className="text-xs uppercase tracking-wider">🚀 Season 1 — Registration Open</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
            <span className="text-white">Where College Ideas</span>
            <br />
            <span className="gradient-accent">Become Real Innovation</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            HackSphere is your campus AI-powered innovation platform — validate ideas, form dream teams, build boldly, and leave a lasting legacy in our permanent project gallery.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/register" className="btn-primary flex items-center justify-center space-x-2 text-lg">
              <span>Register Now</span>
              <ArrowRight size={20} />
            </Link>
            <button className="btn-secondary flex items-center justify-center space-x-2 text-lg">
              <span>Learn More</span>
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Countdown Timer */}
          <div className="glass rounded-2xl p-8 border border-primary-500/30 max-w-md mx-auto">
            <p className="text-gray-300 text-sm uppercase tracking-wider mb-4">Hackathon Starts In</p>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-accent-500">{days}</p>
                <p className="text-xs text-gray-400 mt-2">Days</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-accent-500">{hours.toString().padStart(2, '0')}</p>
                <p className="text-xs text-gray-400 mt-2">Hours</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-accent-500">{minutes.toString().padStart(2, '0')}</p>
                <p className="text-xs text-gray-400 mt-2">Mins</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-accent-500">{seconds.toString().padStart(2, '0')}</p>
                <p className="text-xs text-gray-400 mt-2">Secs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              <span className="text-white">Hackathon Platform</span>
              <br />
              <span className="gradient-accent">AI Tools</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Everything you need to go from idea to innovation in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-accent-500 mb-4 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section id="journey" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-dark-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              <span className="text-white">Your</span>
              <br />
              <span className="gradient-accent">HackSphere Journey</span>
            </h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary-500 to-accent-500"></div>

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className={`flex gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Timeline dot */}
                  <div className="hidden lg:flex flex-1 justify-end">
                    <div className="relative flex items-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/50">
                        {index + 1}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="card">
                      <h3 className="text-2xl font-bold text-accent-500 mb-2">
                        {item.stage}
                      </h3>
                      <p className="text-gray-300">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Mobile timeline number */}
                  <div className="lg:hidden">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Prize Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-12 border border-accent-500/50 text-center">
            <Trophy className="mx-auto text-accent-500 mb-6" size={64} />
            <h2 className="text-4xl font-display font-bold mb-4 gradient-accent">
              Amazing Prizes & Recognition
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Win prizes, earn badges, and get your project permanently showcased in our gallery. Every participant leaves with a portfolio piece and lasting recognition.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-dark-700 rounded-lg p-6">
                <p className="text-accent-500 text-4xl font-bold mb-2">1st</p>
                <p className="text-gray-300">Premium Prize Package</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-6">
                <p className="text-accent-500 text-4xl font-bold mb-2">2nd</p>
                <p className="text-gray-300">Excellence Recognition</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-6">
                <p className="text-accent-500 text-4xl font-bold mb-2">3rd</p>
                <p className="text-gray-300">Achievement Badge</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-8 gradient-text">
            Ready to innovate?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join hundreds of students transforming ideas into reality. Register today and start your journey.
          </p>
          <Link to="/register" className="btn-primary inline-flex items-center space-x-2 text-lg">
            <span>Get Started</span>
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-600 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; 2024 HackSphere. Where college ideas become real innovation.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
