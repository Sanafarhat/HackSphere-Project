import React from 'react';
import CircularGallery from '../components/CircularGallery';
import '../components/CircularGallery.css';

const GALLERY_ITEMS = [
  { image: 'https://picsum.photos/id/1015/900/700', text: 'Outdoor Build' },
  { image: 'https://picsum.photos/id/1025/900/700', text: 'Team Session' },
  { image: 'https://picsum.photos/id/1035/900/700', text: 'Prototype Lab' },
  { image: 'https://picsum.photos/id/1045/900/700', text: 'Launch Day' },
  { image: 'https://picsum.photos/id/1055/900/700', text: 'Showcase' },
];

export default function ProjectGallery() {
  return (
    <section id="project-gallery" className="project-gallery-section">
      <div className="section-inner max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="project-gallery-copy">
          <div className="project-gallery-kicker">
            <span className="project-gallery-dot" aria-hidden="true" />
            <span>Hackathon Platform · Gallery</span>
          </div>
          <h2 className="project-gallery-title">Project <em>Gallery</em></h2>
          <p className="project-gallery-subtitle">Explore a curated collection of innovative student projects from our hackathon community — a circular, immersive display of ideas brought to life.</p>
        </div>

        <div className="project-gallery-wrapper">
          <div className="project-gallery-frame">
            <CircularGallery
              items={GALLERY_ITEMS}
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
