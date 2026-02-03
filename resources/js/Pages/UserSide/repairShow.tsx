import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import Navigation from './Navigation';

// Mock repair services data for a shop
const mockRepairServices = [
  { id: 1, title: 'Sole Replacement', price: '₱450', description: 'Complete sole replacement with premium materials' },
  { id: 2, title: 'Heel Repair', price: '₱300', description: 'Professional heel repair and restoration' },
  { id: 3, title: 'Stitching & Patch', price: '₱250', description: 'Expert stitching and patching services' },
  { id: 4, title: 'Deep Clean & Condition', price: '₱200', description: 'Deep cleaning and leather conditioning' },
  { id: 5, title: 'Zipper Replacement', price: '₱350', description: 'High-quality zipper replacement' },
];

// Mock reviews data
const mockReviews = [
  {
    id: 1,
    userName: 'Sarah Chen',
    rating: 5,
    date: '2026-01-28',
    comment: 'Excellent shoe repair service! The sole replacement looks brand new. Highly professional team.',
    verified: true
  },
  {
    id: 2,
    userName: 'Mike Johnson',
    rating: 4,
    date: '2026-01-25',
    comment: 'Good quality repairs and reasonable prices. They were very helpful and finished on time.',
    verified: true
  },
  {
    id: 3,
    userName: 'Emma Rodriguez',
    rating: 5,
    date: '2026-01-22',
    comment: 'Best repair shop in the area! My shoes look better than before. Will definitely come back.',
    verified: true
  },
  {
    id: 4,
    userName: 'David Lee',
    rating: 5,
    date: '2026-01-20',
    comment: 'Outstanding craftsmanship. The attention to detail is remarkable. Worth every peso!',
    verified: true
  },
  {
    id: 5,
    userName: 'Jessica Martinez',
    rating: 4,
    date: '2026-01-18',
    comment: 'Very professional service. Reasonable turnaround time and quality work. Recommended!',
    verified: true
  }
];

const RepairShow: React.FC = () => {
  const { repair } = usePage().props as any;

  // Mock shop data (will be replaced with real data from backend)
  const shop = {
    id: 1,
    name: 'SoleHouse',
    location: 'Dasmariñas, Cavite',
    rating: 4.8,
    image: '/images/shop/shop1.jpg',
    description: 'Premium shoe repair and restoration services with over 15 years of experience. We specialize in professional repairs for all types of footwear.',
    hours: '9:00 AM - 6:00 PM',
    phone: '(046) 123-4567',
    email: 'info@solehouse.com'
  };

  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [imageUploadGroups, setImageUploadGroups] = useState<Array<{id: string; file: File | null; preview: string}>>([{id: '0', file: null, preview: ''}]);

  const handleServiceToggle = (serviceId: number) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUploadGroups(prev => 
          prev.map(group => 
            group.id === id ? {id, file, preview: reader.result as string} : group
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const addImageUploadBox = () => {
    if (imageUploadGroups.length < 5) {
      const newId = Math.random().toString(36).substr(2, 9);
      setImageUploadGroups(prev => [...prev, {id: newId, file: null, preview: ''}]);
    }
  };

  const removeImageBox = (id: string) => {
    setImageUploadGroups(prev => prev.filter(group => group.id !== id));
  };

  const handleSubmitReview = () => {
    if (!newComment.trim() || userRating === 0) {
      alert('Please provide both a rating and a comment');
      return;
    }
    // Frontend only - in production this would send to backend
    alert('Thank you for your review! (Backend integration pending)');
    setNewComment('');
    setUserRating(0);
  };

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate && onRate(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} transition-colors`}
            disabled={!interactive}
          >
            <svg
              className={`w-5 h-5 ${
                star <= (interactive ? (hoverRating || userRating) : rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 fill-gray-300'
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <Head title={shop.name} />
      <div className="min-h-screen bg-white font-outfit antialiased">
        <Navigation />

        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
          {/* Shop Image - Full Width */}
          <div className="mb-12">
            <div className="bg-gray-50 rounded-xl p-8">
              <img 
                src={shop.image} 
                alt={shop.name} 
                className="w-full h-[500px] object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/shop/shop.jpg';
                }}
              />
            </div>
          </div>

          {/* Shop Info and Rating */}
          <div className="mb-16">
            <div className="mb-12">
              <Link href={`/shop-profile/${shop.id}`} className="text-5xl font-bold mb-4 text-black hover:text-gray-700 transition-colors inline-block">
                {shop.name}
              </Link>
              <div className="flex items-center gap-2 text-gray-600 mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-lg">{shop.location}</span>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">{shop.description}</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-6 mb-10">
              {/* Shop Information */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black">Shop Information</h3>
                </div>
                <div className="space-y-4 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-black mt-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                      <div className="font-semibold text-black">Location</div>
                      <div className="text-gray-600">{shop.location}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-black mt-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <div>
                      <div className="font-semibold text-black">Hours</div>
                      <div className="text-gray-600">{shop.hours}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-black mt-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-black">Phone</div>
                      <a href={`tel:${shop.phone}`} className="text-black hover:text-gray-600 transition-colors">{shop.phone}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-black mt-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <div>
                      <div className="font-semibold text-black">Email</div>
                      <a href={`mailto:${shop.email}`} className="text-black hover:text-gray-600 transition-colors">{shop.email}</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shop Rating */}
              <div className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl p-8 border border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-black">Customer Rating</h3>
                </div>
                <div className="flex items-end gap-8">
                  <div>
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-6xl font-bold text-black">{shop.rating}</span>
                      <span className="text-3xl text-yellow-400">⭐</span>
                    </div>
                    <span className="text-sm text-gray-600">Based on {mockReviews.length} reviews</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {renderStars(shop.rating)}
                  </div>
                </div>
              </div>
            </div>

            {/* Request Service Button */}
            <Link
              href="/repair-process"
              className="block w-full bg-black text-white py-4 rounded-xl hover:bg-gray-900 active:scale-95 transition-all font-semibold text-lg shadow-lg hover:shadow-xl text-center"
            >
              Request Service
            </Link>
          </div>

          {/* Reviews and Comments Section */}
          <div className="mt-20">
            <div className="border-t pt-16">
              <div className="mb-12">
                <h2 className="text-4xl font-bold text-black mb-4">Customer Reviews</h2>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl font-bold text-black">{shop.rating}</span>
                    <div>
                      <div className="flex gap-1">
                        {renderStars(shop.rating)}
                      </div>
                      <span className="text-sm text-gray-600 block mt-1">({mockReviews.length} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Write a Review Section */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-10 mb-12 border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-bold text-black mb-8">Share Your Experience</h3>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-black mb-3">Your Rating</label>
                  {renderStars(userRating, true, setUserRating)}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-black mb-3">Your Review</label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience with this repair shop..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-black resize-none bg-white"
                    rows={5}
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-black mb-3">Photos (Optional)</label>
                  <div className="grid grid-cols-4 gap-4">
                    {imageUploadGroups.map((group) => (
                      <div key={group.id} className="relative group">
                        {group.preview ? (
                          <div className="relative">
                            <img
                              src={group.preview}
                              alt="Review photo"
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                              <button
                                onClick={addImageUploadBox}
                                className="w-10 h-10 bg-black hover:bg-gray-800 rounded-full flex items-center justify-center text-white transition-colors"
                                type="button"
                                title="Add more photos"
                              >
                                <span className="text-xl">+</span>
                              </button>
                              <button
                                onClick={() => removeImageBox(group.id)}
                                className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-colors"
                                type="button"
                                title="Remove photo"
                              >
                                <span className="text-xl">×</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50/50">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(group.id, e)}
                              className="hidden"
                              aria-label="Upload review photo"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span className="text-xs text-gray-500 mt-1">Click to upload</span>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmitReview}
                  className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-900 active:scale-95 transition-all font-semibold shadow-md hover:shadow-lg mt-6"
                  type="button"
                >
                  Submit Review
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {mockReviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-6 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity shadow-sm" onClick={() => setEnlargedImage('/images/shop/shop1.jpg')}>
                        <img
                          src="/images/shop/shop1.jpg"
                          alt={`${review.userName}'s repair photo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h4 className="font-bold text-black text-lg">{review.userName}</h4>
                          {review.verified && (
                            <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex gap-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-base">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={enlargedImage}
              alt="Enlarged review"
              className="w-full max-h-[85vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              type="button"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RepairShow;
