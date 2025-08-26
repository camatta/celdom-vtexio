import React, { useEffect, useRef } from 'react';

const ReclameAqui = ({
  dataId = 'MjIzOTA6Y2VsZG9t',
  model = 'horizontal_1',
  targetId = 'ra-verified-seal',
  className = '',
  scale = 0.7
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const prev = document.getElementById('ra-embed-verified-seal');
    if (prev && prev.parentNode) {
      prev.parentNode.removeChild(prev);
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'ra-embed-verified-seal';
    script.src = 'https://s3.amazonaws.com/raichu-beta/ra-verified/bundle.js';
    script.async = true;
    script.setAttribute('data-id', dataId);
    script.setAttribute('data-target', targetId);
    script.setAttribute('data-model', model);

    script.onload = () => {
      setTimeout(() => {
        const widget = document.getElementById('ra-widget-verified');
        if (widget) {
          Object.assign(widget.style, {
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            display: 'inline-block'
          });
          
          // Ajusta elementos internos
          const content = document.querySelector('.ra-widget-verified-content');
          if (content) {
            Object.assign(content.style, {
              gap: '5px',
              padding: '3px 6px'
            });
            
            const images = content.querySelectorAll('img');
            if (images.length >= 2) {
              Object.assign(images[0].style, {
                width: '18px',
                height: '18px'
              });
              
              Object.assign(images[1].style, {
                width: '70px',
                height: '14px'
              });
            }
            
            const text = content.querySelector('.ra-widget-verified-text');
            if (text) {
              Object.assign(text.style, {
                fontSize: '8px',
                lineHeight: '1'
              });
            }
          }
        }
      }, 500);
    };

    container.appendChild(script);

    return () => {
      try {
        container.innerHTML = '';
      } catch {}
      const s = document.getElementById('ra-embed-verified-seal');
      if (s) s.remove();
    };
  }, [dataId, model, targetId, scale]);

  return (
    <div 
      id={targetId} 
      ref={containerRef} 
      className={className}
      style={{
        display: 'inline-block',
        height: '35px',
        marginTop:'10px',
      }}
    />
  );
};

export default ReclameAqui;