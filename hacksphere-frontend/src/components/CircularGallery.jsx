import React from 'react';
import './CircularGallery.css';

export default function CircularGallery({ items = [] }) {
  const gallery = items && items.length ? items : [
    { image: `https://picsum.photos/seed/1/800/600`, text: 'Bridge' },
    { image: `https://picsum.photos/seed/2/800/600`, text: 'Desk Setup' },
    { image: `https://picsum.photos/seed/3/800/600`, text: 'Waterfall' },
    { image: `https://picsum.photos/seed/4/800/600`, text: 'Strawberries' },
    { image: `https://picsum.photos/seed/5/800/600`, text: 'Deep Diving' },
  ];

  return (
    <div className="gallery-grid">
      {gallery.map((it, i) => (
        <div key={i} className="gallery-card">
          <img src={it.image} alt={it.text} />
          <div className="gallery-caption">{it.text}</div>
        </div>
      ))}
    </div>
  );
}
