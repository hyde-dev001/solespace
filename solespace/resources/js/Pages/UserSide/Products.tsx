import React from 'react';
import { Head } from '@inertiajs/react';
import Navigation from './Navigation';

interface Props {
  // Add props from Laravel controller later
}

const Products: React.FC<Props> = () => {
  return (
    <>
      <Head title="Products" />
      <div className="min-h-screen bg-white font-outfit antialiased">
        <Navigation />

      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 py-20">
        <h1 className="text-5xl lg:text-7xl font-bold text-black mb-8 tracking-tight">
          OUR PRODUCTS
        </h1>
        <p className="text-xl text-black/70 mb-12 max-w-2xl leading-relaxed font-light">
          Discover our extensive collection of premium footwear and accessories.
        </p>
        {/* Add product grid or content here */}
        <div className="text-center">
          <p className="text-lg text-black/70">Products page content coming soon...</p>
        </div>
      </div>
      </div>
    </>
  );
};

export default Products;
