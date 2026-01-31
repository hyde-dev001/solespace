import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Navigation from './Navigation';
import AddToCartButton from '../../Components/CartActions';

const ProductShow: React.FC = () => {
  const { product, auth } = usePage().props as any;
  const [selectedImage, setSelectedImage] = useState(product.primary || (product.images && product.images[0]));
  const [selectedSize, setSelectedSize] = useState<string | null>(() => {
    const sizes = product.sizes || [];
    const map: Record<string, number> = { XS: 6, S: 7, M: 8, L: 9, XL: 10, XXL: 11 };
    if (!sizes.length) return null;
    const first = sizes[0];
    if (/^\d+(?:\.\d+)?$/.test(String(first))) return String(first);
    return map[first] ? String(map[first]) : String(first);
  });
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [qty, setQty] = useState(1);
  const [showAddedModal, setShowAddedModal] = useState(false);
  const isAuthenticated = Boolean(auth && auth.user);

  useEffect(() => {
    const handler = (e: any) => {
      setShowAddedModal(true);
    };

    window.addEventListener('cart:guest:add-attempt', handler as EventListener);
    return () => window.removeEventListener('cart:guest:add-attempt', handler as EventListener);
  }, []);

  const images: string[] = (product.images && Array.isArray(product.images)) ? product.images : [];
  const currentIndex = images.findIndex((img: string) => img === selectedImage);

  const showPrev = () => {
    if (!images.length) return;
    const idx = currentIndex > -1 ? currentIndex : 0;
    const prev = (idx - 1 + images.length) % images.length;
    setSelectedImage(images[prev]);
  };

  const showNext = () => {
    if (!images.length) return;
    const idx = currentIndex > -1 ? currentIndex : 0;
    const next = (idx + 1) % images.length;
    setSelectedImage(images[next]);
  };

  return (
    <>
      <Head title={product.name} />
      <div className="min-h-screen bg-white font-outfit antialiased">
        <Navigation />

        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
          <div className="flex gap-8">
            <div className="flex-1">
              <div className="bg-gray-50 rounded-xl p-8">
                <div className="relative">
                  <img src={selectedImage} alt={product.name} className="w-full h-[640px] object-contain" />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={showPrev}
                        aria-label="Previous image"
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-black hover:opacity-90"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>

                      <button
                        onClick={showNext}
                        aria-label="Next image"
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-black hover:opacity-90"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                {product.images.map((img: string) => (
                  <button key={img} onClick={() => setSelectedImage(img)} className={`w-20 h-20 rounded border ${selectedImage === img ? 'border-black' : 'border-gray-200'} bg-white flex items-center justify-center`}>
                    <img src={img} alt="thumb" className="max-w-full max-h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            <div className="w-[420px]">
              <h1 className="text-2xl font-bold mt-0 mb-2 text-black">{product.name}</h1>
              <div className="text-xl font-semibold text-black">{product.price}</div>

              {/* Color selector removed per request */}

              <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-black">Size</div>
                  <button onClick={() => setShowSizeChart(true)} className="text-sm text-black underline" type="button">Size Chart</button>
                </div>
                <div className="flex gap-2">
                  {product.sizes && product.sizes.map((s: string) => {
                    const map: Record<string, number> = { XS: 6, S: 7, M: 8, L: 9, XL: 10, XXL: 11 };
                    const numeric = /^\d+(?:\.\d+)?$/.test(String(s)) ? String(s) : (map[s] ? String(map[s]) : String(s));

                    return (
                      <button key={s} onClick={() => setSelectedSize(numeric)} className={`px-3 py-2 border rounded ${String(selectedSize) === String(numeric) ? 'bg-black text-white' : 'bg-white text-black'}`}>
                        {numeric}
                      </button>
                    );
                  })}
                </div>
              </div>

              {showSizeChart && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowSizeChart(false)}>
                  <div className="bg-white rounded-lg max-w-2xl w-[90%] p-6 text-black" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-black">Size Chart</h3>
                      <button onClick={() => setShowSizeChart(false)} className="text-black hover:text-gray-600 text-xl" title="Close" aria-label="Close">×</button>
                    </div>

                    {/* Shoe size chart (approximate conversions). Replace with product-specific chart if available. */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse text-black">
                        <thead>
                          <tr className="text-left">
                            <th className="pb-2">US</th>
                            <th className="pb-2">UK</th>
                            <th className="pb-2">EU</th>
                            <th className="pb-2">Foot Length (cm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="py-2 text-black">5</td>
                            <td className="py-2 text-black">4.5</td>
                            <td className="py-2 text-black">37</td>
                            <td className="py-2 text-black">23.1</td>
                          </tr>
                          <tr className="border-t">
                            <td className="py-2">6</td>
                            <td className="py-2">5.5</td>
                            <td className="py-2">38</td>
                            <td className="py-2">24.1</td>
                          </tr>
                          <tr className="border-t">
                            <td className="py-2">7</td>
                            <td className="py-2">6.5</td>
                            <td className="py-2">40</td>
                            <td className="py-2">25.4</td>
                          </tr>
                          <tr className="border-t">
                            <td className="py-2">8</td>
                            <td className="py-2">7.5</td>
                            <td className="py-2">41</td>
                            <td className="py-2">26.0</td>
                          </tr>
                          <tr className="border-t">
                            <td className="py-2">9</td>
                            <td className="py-2">8.5</td>
                            <td className="py-2">42</td>
                            <td className="py-2">27.0</td>
                          </tr>
                          <tr className="border-t">
                            <td className="py-2">10</td>
                            <td className="py-2">9.5</td>
                            <td className="py-2">44</td>
                            <td className="py-2">28.0</td>
                          </tr>
                          <tr className="border-t">
                            <td className="py-2">11</td>
                            <td className="py-2">10.5</td>
                            <td className="py-2">45</td>
                            <td className="py-2">28.7</td>
                          </tr>
                          <tr className="border-t">
                            <td className="py-2">12</td>
                            <td className="py-2">11.5</td>
                            <td className="py-2">46</td>
                            <td className="py-2">29.4</td>
                          </tr>
                          <tr className="border-t">
                            <td className="py-2">13</td>
                            <td className="py-2">12.5</td>
                            <td className="py-2">47</td>
                            <td className="py-2">30.2</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className="text-sm text-black mb-2">Quantity:</div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 border rounded text-black">-</button>
                  <div className="px-4 text-black">{qty}</div>
                  <button onClick={() => setQty(qty + 1)} className="w-8 h-8 border rounded text-black">+</button>
                </div>
              </div>

              <div className="mt-6 text-sm text-red-600">Limited pieces</div>

              <div className="mt-6">
                <AddToCartButton
                  productId={product.id}
                  product={{ ...product, size: selectedSize, qty }}
                  className="w-full bg-black text-white py-3 rounded"
                  label="ADD TO CART"
                  onAdded={() => { if (!isAuthenticated) setShowAddedModal(true); }}
                />
              </div>

              {showAddedModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddedModal(false)}>
                  <div className="bg-white rounded-xl w-[900px] max-w-[95%] p-6 grid grid-cols-2 gap-6 relative" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <img src={product.primary || (product.images && product.images[0])} alt={product.name} className="w-full h-[420px] object-contain rounded" />
                      </div>

                      <div className="p-4 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold lowercase mb-2 text-black">welcome to solespace</h2>
                        <p className="text-sm text-black mb-6">We ship nationwide and offer shoe care, repairs, and exclusive drops. Be the first to know about restocks, repair offers, and everything Solespace.</p>

                      <div className="flex flex-col gap-3 mt-4">
                        <button type="button" onClick={() => router.visit('/register')} className="w-full py-3 border border-gray-200 rounded text-center text-black hover:bg-gray-50">Sign Up</button>
                        <button onClick={() => setShowAddedModal(false)} className="w-full py-3 border border-gray-200 rounded text-center text-black hover:bg-gray-50">No thanks</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 border-t pt-6">
                <div className="text-sm text-black mb-2">Sold by</div>
                <div className="text-sm font-medium mb-4"><a href={`/shops/${product.shop?.slug}`} className="underline text-black">{product.shop?.name}</a></div>

                <div className="text-base font-semibold mb-2 text-black">Description</div>
                <div className="text-sm text-black">{product.description}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductShow;
