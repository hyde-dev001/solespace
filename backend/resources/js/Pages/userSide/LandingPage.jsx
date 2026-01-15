import React from 'react';
import { Link } from '@inertiajs/react';
import Navigation from './Navigation';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-outfit antialiased">
      <Navigation />

      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] bg-white flex items-center">
        <div className="w-full max-w-[1920px] mx-auto px-6 lg:px-12 py-20 lg:py-32">
          <div className="max-w-4xl">
            <h1 className="text-6xl lg:text-8xl xl:text-9xl font-bold text-black mb-8 leading-[0.9] tracking-tight">
              STEP INTO
              <span className="block">EXCELLENCE</span>
            </h1>
            <p className="text-xl lg:text-2xl text-black/70 mb-12 max-w-2xl leading-relaxed font-light">
              Discover premium footwear and expert repair services in one integrated platform designed for modern lifestyles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="px-10 py-4 bg-black text-white font-semibold uppercase tracking-wider text-sm hover:bg-black/80 transition-colors inline-flex items-center justify-center gap-3"
              >
                Shop Collection
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/repair"
                className="px-10 py-4 bg-white border-2 border-black text-black font-semibold uppercase tracking-wider text-sm hover:bg-black hover:text-white transition-all inline-flex items-center justify-center gap-3"
              >
                Repair Services
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full bg-black text-white py-20">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-3 gap-12 lg:gap-20 text-center">
            <div>
              <div className="text-6xl lg:text-7xl font-bold mb-4">500+</div>
              <div className="text-sm uppercase tracking-wider text-white/70">Products</div>
            </div>
            <div>
              <div className="text-6xl lg:text-7xl font-bold mb-4">10K+</div>
              <div className="text-sm uppercase tracking-wider text-white/70">Customers</div>
            </div>
            <div>
              <div className="text-6xl lg:text-7xl font-bold mb-4">98%</div>
              <div className="text-sm uppercase tracking-wider text-white/70">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-white py-24 lg:py-32">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
            <div className="text-center">
              <div className="w-20 h-20 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 uppercase tracking-wide">Quality Assured</h3>
              <p className="text-black/70 leading-relaxed">Premium materials and craftsmanship guaranteed</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 uppercase tracking-wide">Fast Delivery</h3>
              <p className="text-black/70 leading-relaxed">Quick and reliable shipping to your doorstep</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 uppercase tracking-wide">Secure Payment</h3>
              <p className="text-black/70 leading-relaxed">Safe and encrypted transaction processing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full bg-black text-white py-24 lg:py-32">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
          <div className="mb-20">
            <h2 className="text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              COMPLETE SHOE SOLUTIONS
            </h2>
            <p className="text-xl text-white/70 max-w-2xl leading-relaxed font-light">
              From retail excellence to expert repairs, we provide comprehensive footwear services tailored to your needs.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div className="bg-white text-black p-12 border-2 border-white">
              <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mb-8">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-black mb-6 uppercase tracking-wide">Premium Retail</h3>
              <p className="text-black/70 mb-8 leading-relaxed text-lg">
                Discover an extensive collection of high-quality footwear from renowned brands. Our integrated platform offers personalized recommendations, competitive pricing, and seamless shopping experiences.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-3 text-black font-semibold uppercase tracking-wider text-sm hover:opacity-70 transition-opacity border-b-2 border-black pb-1"
              >
                Explore Collection
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="bg-white text-black p-12 border-2 border-white">
              <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mb-8">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-black mb-6 uppercase tracking-wide">Expert Repairs</h3>
              <p className="text-black/70 mb-8 leading-relaxed text-lg">
                Professional shoe repair services powered by intelligent decision support systems. Get expert recommendations for the best repair options that extend the life of your favorite footwear.
              </p>
              <Link
                href="/repair"
                className="inline-flex items-center gap-3 text-black font-semibold uppercase tracking-wider text-sm hover:opacity-70 transition-opacity border-b-2 border-black pb-1"
              >
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-white py-24 lg:py-32">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-5xl lg:text-7xl font-bold text-black mb-8 tracking-tight">
            READY TO STEP INTO STYLE?
          </h2>
          <p className="text-xl text-black/70 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Join thousands of satisfied customers and discover the perfect pair today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/products"
              className="px-10 py-4 bg-black text-white font-semibold uppercase tracking-wider text-sm hover:bg-black/80 transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/repair"
              className="px-10 py-4 bg-white border-2 border-black text-black font-semibold uppercase tracking-wider text-sm hover:bg-black hover:text-white transition-all"
            >
              Book Repair
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
