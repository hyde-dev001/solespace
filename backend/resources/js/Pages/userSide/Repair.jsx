import React from 'react';
import Navigation from './Navigation';

const Repair = () => {
  return (
    <div className="min-h-screen bg-white font-outfit antialiased">
      <Navigation />

      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 py-20">
        <h1 className="text-5xl lg:text-7xl font-bold text-black mb-8 tracking-tight">
          REPAIR SERVICES
        </h1>
        <p className="text-xl text-black/70 mb-12 max-w-2xl leading-relaxed font-light">
          Professional shoe repair services powered by intelligent decision support systems.
        </p>
        {/* Add repair content here */}
        <div className="text-center">
          <p className="text-lg text-black/70">Repair services page content coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Repair;
