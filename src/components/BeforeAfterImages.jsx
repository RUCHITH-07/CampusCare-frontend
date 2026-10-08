import React from 'react';
import { Camera, CheckCircle } from 'lucide-react';

const BeforeAfterImages = ({ beforeImage, afterImage }) => {
  return (
    <div className="image-comparison-grid">
      <div className="image-card">
        <header style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626' }}>
          <Camera size={18} />
          <span>BEFORE (Reported Issue)</span>
        </header>
        {beforeImage ? (
          <img src={beforeImage} alt="Before complaint issue" />
        ) : (
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', color: '#94A3B8' }}>
            No before photo uploaded
          </div>
        )}
      </div>

      <div className="image-card">
        <header style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16A34A' }}>
          <CheckCircle size={18} />
          <span>AFTER (Fixed Resolution)</span>
        </header>
        {afterImage ? (
          <img src={afterImage} alt="After complaint resolution" />
        ) : (
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', color: '#94A3B8' }}>
            Awaiting admin resolution photo
          </div>
        )}
      </div>
    </div>
  );
};

export default BeforeAfterImages;
