import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navigation from './Navigation';

type Product = {
  id: number;
  name: string;
  price: number;
  compare_at_price?: number | null;
  slug: string;
  main_image: string | null;
  brand: string | null;
  stock_quantity: number;
  shop_owner?: {
    id: number;
    name: string;
  };
};

interface Props {
  // will accept products from backend later
}

const Products: React.FC<Props> = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search') || '';
    setSearchQuery(search);
  }, [window.location.search]);

  useEffect(() => {
    fetchProducts();
  }, [sortBy, currentPage, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Sorting (use - prefix for descending)
      if (sortBy === 'created_at') {
        params.append('sort', '-created_at');
      } else if (sortBy === 'price') {
        params.append('sort', 'price');
      } else if (sortBy === 'popular') {
        params.append('sort', '-sales_count');
      }
      
      // Pagination
      params.append('page', currentPage.toString());
      
      // Search filter
      if (searchQuery) {
        params.append('filter[search_all]', searchQuery);
      }
      
      const response = await fetch(`/api/products/?${params.toString()}`, {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      setProducts(data.products.data || []);
      setCurrentPage(data.products.current_page || 1);
      setLastPage(data.products.last_page || 1);
      setTotal(data.products.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <Head title="Products" />
      <div className="min-h-screen bg-white font-outfit antialiased">
        <Navigation />

        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
          <div className="flex items-center justify-between mb-8">
            <div className="text-sm text-black/60">HOME / ALL SHOES</div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-black/70">Sort by:</div>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm text-black border border-gray-200 rounded px-3 py-1 bg-white appearance-none"
              >
                <option value="created_at">Date, new to old</option>
                <option value="price">Price, low to high</option>
                <option value="popular">Most popular</option>
              </select>
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4 tracking-tight">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'ALL SHOES'}
          </h1>
          <p className="text-base text-black/70 mb-8 max-w-2xl leading-relaxed font-light">
            {searchQuery 
              ? `Showing results matching "${searchQuery}"`
              : 'Browse our curated collection of shoes. Click a product to view details and select sizes.'}
          </p>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products available at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`} className="group block h-full">
                  <div className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-150 relative h-full flex flex-col">
                    {p.compare_at_price && p.compare_at_price > p.price && (
                      <div className="absolute left-4 top-4 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-semibold z-10">
                        SALE
                      </div>
                    )}
                    {p.stock_quantity === 0 && (
                      <div className="absolute left-4 top-4 bg-black text-white text-xs px-2 py-1 rounded-md font-semibold z-10">
                        Sold Out
                      </div>
                    )}

                    <div className="aspect-square bg-white flex items-center justify-center p-0 flex-shrink-0 overflow-hidden">
                      {p.main_image ? (
                        <img src={p.main_image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="text-gray-400 text-sm">No image</div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <div className="text-sm text-black/80 font-medium mb-2 line-clamp-2 min-h-[2.5rem]">{p.name}</div>
                      
                      <p className="text-xs text-gray-600 mb-3">{p.description || ''}</p>
                      
                      <div className="text-xs text-black/50 mb-3 min-h-[2.5rem]">
                        {p.brand && (
                          <div className="mb-1">{p.brand}</div>
                        )}
                        {p.shop_owner && (
                          <div>
                            Sold by <span className="underline">{p.shop_owner.name}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                        <div className="flex flex-col">
                          <div className="text-base text-black font-bold">₱{p.price.toLocaleString()}</div>
                          {p.compare_at_price && p.compare_at_price > p.price && (
                            <div className="text-xs text-gray-400 line-through">₱{p.compare_at_price.toLocaleString()}</div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.stock_quantity > 0 ? `${p.stock_quantity} in stock` : 'Out of stock'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && products.length > 0 && lastPage > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-black hover:bg-gray-50'
                }`}
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === lastPage ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-black text-white border-black'
                            : 'border-gray-300 text-black hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === lastPage}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  currentPage === lastPage
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-black hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          )}

          {/* Results info */}
          {!loading && products.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Showing {products.length} of {total} products (Page {currentPage} of {lastPage})
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Products;
