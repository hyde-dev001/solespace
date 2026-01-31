import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navigation from './Navigation';

type Product = {
  id: number;
  name: string;
  price: string;
  image: string;
  isNew?: boolean;
  soldOut?: boolean;
  shop?: {
    id: number;
    name: string;
    slug: string;
    colors?: string[];
  };
};

const shops = [
  { id: 1, name: 'SoleHouse', slug: 'solehouse', colors: ['#000000', '#ffffff', '#b91c1c'] },
  { id: 2, name: 'KickStop', slug: 'kickstop', colors: ['#0ea5e9', '#111827'] },
  { id: 3, name: 'StreetRun', slug: 'streetrun', colors: [] },
  { id: 4, name: 'UrbanStep', slug: 'urbanstep', colors: ['#ef4444'] },
];

const mockProducts: Product[] = Array.from({ length: 8 }).map((_, i) => {
  const idx = (i + 1).toString().padStart(2, '0');
  const shop = shops[i % shops.length];
  return {
    id: i + 1,
    name: [`Adidas 450`, `New Balance 450`, `New Balance 550`, `Adidas Samba`, `Adidas Samba`, `Loefers`, `Adidas Samba`, `Loefers`][i % 8],
    price: '₱1,600',
    image: `/images/product/product-${idx}.jpg`,
    isNew: i % 3 === 0,
    soldOut: i % 4 === 0 && i % 3 !== 0,
    shop: shop,
  };
});

interface Props {
  // will accept products from backend later
}

const Products: React.FC<Props> = () => {
  return (
    <>
      <Head title="Products" />
      <div className="min-h-screen bg-white font-outfit antialiased">
        <Navigation />

        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
          <div className="flex items-center justify-between mb-8">
            <div className="text-sm text-black/60">HOME / ALL SHOES</div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm text-black/70">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1h-1l-3 9v3a1 1 0 01-1 1H9a1 1 0 01-1-1v-3L5 8H4a1 1 0 01-1-1V4z" />
                </svg>
                Filters
              </button>
              <div className="text-sm text-black/70">Sort by:</div>
              <select className="text-sm text-black border border-gray-200 rounded px-3 py-1 bg-white appearance-none">
                <option>Date, new to old</option>
                <option>Price, low to high</option>
                <option>Price, high to low</option>
              </select>
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4 tracking-tight">ALL SHOES</h1>
          <p className="text-base text-black/70 mb-8 max-w-2xl leading-relaxed font-light">Browse our curated collection of shoes. Click a product to view details and select sizes.</p>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {mockProducts.map((p) => {
              const slug = `product-${String(p.id).padStart(2, '0')}`;
              return (
                <Link key={p.id} href={`/products/${slug}`} className="group block">
                  <div className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-150 relative">
                    {p.isNew && (
                      <div className="absolute left-4 top-4 bg-amber-200 text-amber-800 text-xs px-2 py-1 rounded-md font-semibold">NEW ARRIVAL</div>
                    )}
                    {p.soldOut && (
                      <div className="absolute left-4 top-4 bg-black text-white text-xs px-2 py-1 rounded-md font-semibold">Sold Out</div>
                    )}

                    <div className="aspect-square bg-gray-50 rounded-md flex items-center justify-center p-6">
                      <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                    </div>

                    <div className="text-center mt-4">
                      <div className="text-sm text-black/80 font-medium">{p.name}</div>
                      <div className="text-xs text-black/50 mt-1">Sold by <a href={`/shops/${p.shop?.slug}`} className="underline">{p.shop?.name}</a></div>
                      <div className="text-sm text-black/60 mt-1">{p.price}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
