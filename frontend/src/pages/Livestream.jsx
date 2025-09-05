import React, { useRef, useState } from 'react';

const Livestream = () => {

  const imgRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Fehlerbehandlung: Bei Fehler nach 3 Sekunden neu versuchen
  const handleError = () => {
    setLoading(true);
    if (imgRef.current) {
      setTimeout(() => {
        imgRef.current.src = '/api/video-proxy?retry=' + Date.now();
      }, 3000);
    }
  };

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div className="livestream-page">
      <h2>Livestream</h2>
      <div style={{ maxWidth: 1000, margin: '0 auto', background: '#222', padding: 16, borderRadius: 8, position: 'relative', minHeight: 400 }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 2
          }}>
            <div className="spinner-border text-light" role="status" style={{ width: 60, height: 60 }}>
              <span className="visually-hidden">Lädt...</span>
            </div>
          </div>
        )}
        <img
          ref={imgRef}
          src="/api/video-proxy"
          alt="Livestream"
          style={{ width: '100%', minHeight: 400, borderRadius: 8, background: '#000', objectFit: 'contain', display: 'block' }}
          onError={handleError}
          onLoad={handleLoad}
        />
      </div>
    </div>
  );
};

export default Livestream;
