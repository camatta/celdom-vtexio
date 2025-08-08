// /react/components/RDScript/index.jsx
import React, { useEffect } from 'react';

const RDScript = () => {
  useEffect(() => {
    if (window.RDStationAnalytics) {
      applyButtonStyles();
      return;
    }

    if (document.getElementById('rdstation-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'rdstation-script';
    script.src = 'https://d335luupugsy2.cloudfront.net/js/loader-scripts/132ca173-48d2-462f-9935-2d80332d56e0-loader.js';
    script.async = true;

    let checkInterval;

    const applyButtonStyles = () => {
      const style = document.createElement('style');
      style.innerHTML = `
        body #bricks-component-E2E3FIguYQlppo4OZUPZgw-wrapper.rdstation-popup-position-bottom_right.floating-button.floating-button--close {
          right: 12px !important;
          bottom: 57px !important;
          transition: all 0.3s ease !important;
        }
      `;
      document.head.appendChild(style);
    };

    script.onload = () => {
      checkInterval = setInterval(() => {
        if (window.RDStationAnalytics) {
          clearInterval(checkInterval);
          applyButtonStyles();
        }
      }, 500);

      setTimeout(() => {
        if (checkInterval) clearInterval(checkInterval);
        applyButtonStyles();
      }, 5000);
    };

    document.body.appendChild(script);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      const scriptElement = document.getElementById('rdstation-script');
      if (scriptElement) {
        document.body.removeChild(scriptElement);
      }
    };
  }, []);

  return null;
};

export default RDScript;