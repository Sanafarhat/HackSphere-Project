import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

export const HomePage = () => {
  // --- PRESERVED COUNTDOWN LOGIC ---
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
  // ---------------------------------

  const { scrollYProgress } = useScroll();
  const sphereY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const features = [
    {
      title: 'AI Idea Validator',
      description: 'Get instant feedback on your hackathon idea with detailed analysis and improvement suggestions powered by Llama 3.3 70B.',
      align: 'left',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Smart Team Matching',
      description: 'Let AI recommend the perfect teammates based on skills, availability, and project compatibility.',
      align: 'right',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Progress Tracking',
      description: 'Real-time milestone tracking, standup updates, and AI-powered blocker detection to keep teams on track.',
      align: 'left',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const timeline = [
    { stage: '01. Discovery', description: 'Understand the arena.' },
    { stage: '02. Formation', description: 'AI-powered matching.' },
    { stage: '03. Validation', description: 'Stress-test your idea.' },
    { stage: '04. Building', description: 'Track milestones.' },
    { stage: '05. Submission', description: 'Ship it.' },
    { stage: '06. Legacy', description: 'Enter the Archive.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-accent selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[100vh] flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-32 pb-20 border-b-2 border-foreground">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 border-foreground/5 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10 w-full max-w-[1600px] mx-auto">
          
          {/* Typography / Left Side */}
          <div className="lg:col-span-7 flex flex-col justify-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8 inline-flex items-center gap-4"
            >
              <div className="h-[2px] w-12 bg-accent"></div>
              <span className="font-display font-bold uppercase tracking-widest text-sm text-foreground">Season 1 — Registration Open</span>
            </motion.div>

            <motion.h1 
              style={{ y: textY }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-huge font-display font-black uppercase tracking-tighter leading-[0.85] text-foreground mb-8 drop-shadow-sm"
            >
              Ideas<br/>Enter.<br/>
              <span className="text-accent">Innovation<br/>Emerges.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl font-body font-light text-mutedForeground max-w-xl mb-12 leading-relaxed"
            >
              The digital arena for student builders. Discover, team up, build boldly, and leave a legacy in the Archive.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <Link to="/register" className="btn-primary border-2 border-foreground hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(15,16,20,1)] transition-all duration-300">
                <span>Enter The Sphere &rarr;</span>
              </Link>
            </motion.div>
          </div>

          {/* Visual Motif / Right Side */}
          <div className="lg:col-span-5 relative min-h-[400px] lg:min-h-0 pointer-events-none flex items-center justify-center">
            {/* GIANT ORBITAL SYSTEM */}
            {/* Positioned absolute to the right edge of the viewport/container. 
                Using translate-x to push the majority of it outside the screen. */}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-[30%] sm:translate-x-[40%] lg:translate-x-[45%] w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] md:w-[1200px] md:h-[1200px] lg:w-[1500px] lg:h-[1500px] flex items-center justify-center z-0">
              
              {/* The 3D Sphere */}
              <motion.div 
                style={{ y: sphereY }}
                className="absolute w-[55%] h-[55%] rounded-full bg-[#0a0a0c] shadow-[0_0_120px_rgba(255,77,0,0.15)] overflow-hidden"
              >
                {/* 3D gradient mapping */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_40%,_#ff4d00_0%,_#a83200_30%,_#2a0a00_60%,_#050505_100%)] opacity-95"></div>
                {/* Volumetric shadow for spherical depth */}
                <div className="absolute inset-0 rounded-full shadow-[inset_-50px_-50px_100px_rgba(0,0,0,0.95)]"></div>
                {/* Rim light highlight */}
                <div className="absolute inset-0 rounded-full shadow-[inset_10px_20px_50px_rgba(255,180,120,0.2)]"></div>
              </motion.div>

              {/* Orbital Rings & Nodes */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
                className="absolute w-[68%] h-[68%] rounded-full border-[1px] border-foreground/30"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-accent rounded-full shadow-[0_0_15px_#ff4d00]"></div>
              </motion.div>

              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
                className="absolute w-[82%] h-[82%] rounded-full border-[2px] border-accent/20 border-dashed"
              >
                <div className="absolute bottom-[12%] left-[12%] w-5 h-5 border-2 border-foreground rounded-full bg-background"></div>
              </motion.div>

              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
                className="absolute w-[96%] h-[96%] rounded-full border-[1px] border-foreground/15"
              >
                <div className="absolute top-[25%] right-[3%] w-2 h-2 bg-foreground rounded-full"></div>
                <div className="absolute bottom-[35%] left-[1%] w-6 h-6 border-[1px] border-accent rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-accent rounded-full"></div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* 2. TYPOGRAPHIC COUNTDOWN */}
      <section className="border-b-2 border-foreground overflow-hidden bg-foreground text-background">
        <div className="w-full py-6 flex whitespace-nowrap">
          <div className="animate-marquee inline-flex gap-8 items-center font-display font-black uppercase text-4xl md:text-6xl tracking-tighter">
            <span className="text-accent">*</span>
            <span>SYSTEM LAUNCH IN</span>
            <span className="text-accent">*</span>
            <span className="w-[120px] text-center">{days.toString().padStart(2, '0')}</span> 
            <span className="text-mutedForeground text-2xl">D</span>
            <span className="w-[120px] text-center">{hours.toString().padStart(2, '0')}</span> 
            <span className="text-mutedForeground text-2xl">H</span>
            <span className="w-[120px] text-center">{minutes.toString().padStart(2, '0')}</span> 
            <span className="text-mutedForeground text-2xl">M</span>
            <span className="text-accent w-[120px] text-center">{seconds.toString().padStart(2, '0')}</span> 
            <span className="text-mutedForeground text-2xl">S</span>
            <span className="text-accent">*</span>
            <span>PREPARE TO BUILD</span>
          </div>
        </div>
      </section>

      {/* 3. EDITORIAL FEATURES */}
      <section id="features" className="py-32 px-6 md:px-12 lg:px-20 border-b-2 border-foreground bg-light-800">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-24 md:w-2/3">
            <h2 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-none mb-6">
              The Platform<br/>For <span className="text-accent">Builders</span>.
            </h2>
            <p className="text-xl md:text-3xl font-body font-light text-mutedForeground">Not just a registration form. A complete ecosystem to validate, match, and ship.</p>
          </div>

          <div className="flex flex-col gap-24">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col ${feature.align === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 lg:gap-24`}
              >
                {/* Feature Image Wrapper */}
                <div className="w-full md:w-1/2 aspect-square md:aspect-[4/3] bg-foreground border-2 border-foreground relative overflow-hidden group">
                   <img src={feature.image} alt={feature.title} className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-in-out" />
                   <div className="absolute inset-0 bg-accent/20 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-in-out mix-blend-overlay"></div>
                   <div className="absolute inset-0 flex items-center justify-center font-display font-black text-[10rem] md:text-[12rem] text-background/60 group-hover:text-background/20 group-hover:scale-110 transition-all duration-700 pointer-events-none drop-shadow-2xl">
                     0{idx + 1}
                   </div>
                </div>

                <div className="w-full md:w-1/2">
                  <div className="font-display font-bold text-accent text-2xl mb-4">0{idx + 1} //</div>
                  <h3 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter mb-6">{feature.title}</h3>
                  <p className="text-xl md:text-2xl font-light text-mutedForeground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. JOURNEY SECTION */}
      <section id="journey" className="py-32 px-6 md:px-12 lg:px-20 border-b-2 border-foreground bg-foreground text-background">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/3 sticky top-32 self-start">
              <h2 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-none mb-6">
                The<br/>Process.
              </h2>
              <div className="w-24 h-2 bg-accent mb-8"></div>
              <p className="text-xl text-muted font-light">Follow the protocol. From conception to legacy.</p>
            </div>
            
            <div className="lg:w-2/3 flex flex-col gap-0 border-l-2 border-background/20 pl-8 md:pl-16 relative">
              {timeline.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative py-12 border-b-2 border-background/10 last:border-0 group"
                >
                  <div className="absolute -left-[33px] md:-left-[65px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background group-hover:bg-accent group-hover:scale-150 transition-all duration-300"></div>
                  <h3 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight mb-2 group-hover:text-accent transition-colors duration-300">{item.stage}</h3>
                  <p className="text-xl font-light text-muted">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. ARCHIVE PREVIEW & CTA */}
      <section className="py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto text-center">
          <h2 className="text-6xl md:text-9xl font-display font-black uppercase tracking-tighter leading-none mb-12">
            Build Your <br/><span className="text-accent italic">Legacy</span>
          </h2>
          <p className="text-2xl font-light text-mutedForeground max-w-2xl mx-auto mb-16">
            Every project deployed in the Sphere is immortalized in our Archive.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link to="/register" className="btn-primary w-full sm:w-auto text-xl px-12 py-6 border-2 border-foreground hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(15,16,20,1)] transition-all duration-300">
              <span>Register Now &rarr;</span>
            </Link>
            <Link to="/gallery" className="btn-outline w-full sm:w-auto text-xl px-12 py-6">
              View Archive
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-2 border-foreground bg-foreground text-background py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-display font-black uppercase tracking-tighter">
            HackSphere &copy; {new Date().getFullYear()}
          </div>
          <div className="flex gap-8 font-display font-bold uppercase text-sm">
            <Link to="/admin-login" className="hover:text-accent transition-colors">Admin Access</Link>
            <a href="#" className="hover:text-accent transition-colors">Twitter</a>
            <a href="#" className="hover:text-accent transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
