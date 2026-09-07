import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Github, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryProjects = async () => {
      try {
        const response = await axios.get('/api/submissions/gallery/public');
        const projects = response.data.map((submission, index) => ({
          id: submission._id || index,
          image: submission.imageUrl || 'https://picsum.photos/id/' + (Math.floor(Math.random() * 100) + 100) + '/600/400',
          title: submission.title || 'Project Showcase',
          githubUrl: submission.githubUrl || 'https://github.com/hacksphere',
          team: submission.team?.name || 'HackSphere Team',
        }));
        // If API returns fewer than 5 items, pad it so the marquee works smoothly
        if (projects.length > 0 && projects.length < 5) {
          const padded = [...projects];
          while (padded.length < 5) {
            padded.push(...projects);
          }
          setItems(padded);
        } else {
          setItems(projects.length > 0 ? projects : getPlaceholderItems());
        }
      } catch (error) {
        console.error('Failed to fetch gallery projects:', error);
        setItems(getPlaceholderItems());
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryProjects();
  }, []);

  const getPlaceholderItems = () => [
    { id: 1, image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80', title: 'EcoTrack', team: 'Green Coders', githubUrl: 'https://github.com/hacksphere' },
    { id: 2, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80', title: 'FinFlow', team: 'Data Ninjas', githubUrl: 'https://github.com/hacksphere' },
    { id: 3, image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80', title: 'HealthSync', team: 'MediHacks', githubUrl: 'https://github.com/hacksphere' },
    { id: 4, image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80', title: 'SecurNode', team: 'Cyber Defense', githubUrl: 'https://github.com/hacksphere' },
    { id: 5, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', title: 'EduLearn', team: 'EdTech Innovators', githubUrl: 'https://github.com/hacksphere' },
  ];

  const ProjectCard = ({ item }) => (
    <div className="w-[300px] sm:w-[400px] md:w-[450px] shrink-0 bg-background border-2 border-foreground rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_#ff4d00] transition-transform duration-300 hover:-translate-y-2 inline-flex flex-col mx-3">
      <div className="h-[250px] w-full overflow-hidden border-b-2 border-foreground">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
      </div>
      <div className="p-6 whitespace-normal">
        <h3 className="text-2xl font-display font-black text-foreground uppercase tracking-tight mb-2">{item.title}</h3>
        <p className="text-mutedForeground font-semibold mb-6">Team: {item.team}</p>
        <div className="flex items-center gap-4">
          {item.githubUrl && (
            <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full font-bold text-sm hover:bg-accent transition-colors">
              <Github size={16} /> GitHub
            </a>
          )}
          <a href="#" className="flex items-center gap-2 bg-light-800 text-foreground px-4 py-2 rounded-full font-bold text-sm hover:bg-light-700 transition-colors border-2 border-transparent hover:border-foreground">
            <ExternalLink size={16} /> Demo
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <section id="project-gallery" className="py-24 bg-foreground border-b-2 border-foreground/20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 mb-16 text-center">
        <div className="mb-4 inline-flex items-center gap-4">
          <div className="h-[2px] w-12 bg-accent"></div>
          <span className="font-display font-bold uppercase tracking-widest text-sm text-background">Hackathon Platform · Showcase</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-display font-black text-background uppercase tracking-tighter mb-6">
          Project <span className="text-accent italic">Gallery</span>
        </h2>
        <p className="text-xl text-muted font-light max-w-2xl mx-auto">
          {loading ? 'Loading projects...' : 'Explore a curated collection of innovative student projects from our hackathon community. Hover to interact.'}
        </p>
      </div>

      <div className="relative flex overflow-x-hidden group py-8">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap">
          {items.map((item, idx) => <ProjectCard key={`m1-${item.id}-${idx}`} item={item} />)}
        </div>
        <div className="absolute top-8 flex animate-marquee2 group-hover:[animation-play-state:paused] whitespace-nowrap">
          {items.map((item, idx) => <ProjectCard key={`m2-${item.id}-${idx}`} item={item} />)}
        </div>
      </div>
    </section>
  );
}
