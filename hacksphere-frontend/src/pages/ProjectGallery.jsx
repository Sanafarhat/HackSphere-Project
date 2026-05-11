import React, { useState, useEffect } from 'react';
import CircularGallery from '../components/CircularGallery';
import '../components/CircularGallery.css';
import axios from 'axios';

export default function ProjectGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryProjects = async () => {
      try {
        const response = await axios.get('/api/submissions/gallery/public');
        const projects = response.data.map((submission) => ({
          image: 'https://picsum.photos/id/' + Math.floor(Math.random() * 100) + '/900/700',
          text: submission.title || 'Project Showcase',
          url: submission.githubUrl,
          team: submission.team?.name,
        }));
        setItems(projects.length > 0 ? projects : getPlaceholderItems());
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
    { image: 'https://picsum.photos/id/1015/900/700', text: 'Outdoor Build' },
    { image: 'https://picsum.photos/id/1025/900/700', text: 'Team Session' },
    { image: 'https://picsum.photos/id/1035/900/700', text: 'Prototype Lab' },
    { image: 'https://picsum.photos/id/1045/900/700', text: 'Launch Day' },
    { image: 'https://picsum.photos/id/1055/900/700', text: 'Showcase' },
  ];

  return (
    <section id="project-gallery" className="project-gallery-section">
      <div className="section-inner max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="project-gallery-copy">
          <div className="project-gallery-kicker">
            <span className="project-gallery-dot" aria-hidden="true" />
            <span>Hackathon Platform · Gallery</span>
          </div>
          <h2 className="project-gallery-title">Project <em>Gallery</em></h2>
          <p className="project-gallery-subtitle">
            {loading ? 'Loading projects...' : 'Explore a curated collection of innovative student projects from our hackathon community — a circular, immersive display of ideas brought to life.'}
          </p>
        </div>

        <div className="project-gallery-wrapper">
          <div className="project-gallery-frame">
            <CircularGallery
              items={items}
              bend={3}
              textColor="#ffffff"
              borderRadius={0.05}
              scrollEase={0.02}
              scrollSpeed={2.4}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
