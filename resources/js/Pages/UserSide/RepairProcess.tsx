import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navigation from './Navigation';
import Swal from 'sweetalert2';

const RepairProcess: React.FC = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    shoeType: '',
    brand: '',
    repairType: '',
    description: '',
    urgency: 'standard',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageUploadGroups, setImageUploadGroups] = useState<Array<{id: string; file: File | null; preview: string}>>([{id: '0', file: null, preview: ''}]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const repairTypes = [
    'Sole Replacement',
    'Heel Repair',
    'Stitching Repair',
    'Shoe Cleaning',
    'Color Restoration',
    'Zipper Replacement',
    'Stretching',
    'Other',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUploadGroups(prev => 
          prev.map(group => 
            group.id === id 
              ? {id, file, preview: reader.result as string}
              : group
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const addImageUploadBox = () => {
    const totalImages = imageUploadGroups.filter(g => g.file).length;
    if (totalImages >= 5) {
      Swal.fire({
        title: 'Too Many Images',
        text: 'You can upload a maximum of 5 images',
        icon: 'warning',
        confirmButtonColor: '#000000',
      });
      return;
    }
    const newId = Date.now().toString();
    setImageUploadGroups(prev => [...prev, {id: newId, file: null, preview: ''}]);
  };

  const removeImageBox = (id: string) => {
    setImageUploadGroups(prev => prev.filter(group => group.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customerName || !formData.email || !formData.phone) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in all required fields',
        icon: 'warning',
        confirmButtonColor: '#000000',
      });
      return;
    }

    if (images.length === 0) {
      const hasImages = imageUploadGroups.some(g => g.file);
      if (!hasImages) {
        Swal.fire({
          title: 'No Images',
          text: 'Please upload at least one image of your shoes',
          icon: 'warning',
          confirmButtonColor: '#000000',
        });
        return;
      }
    }

    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(async () => {
      setIsSubmitting(false);
      
      const result = await Swal.fire({
        title: 'Request Submitted!',
        text: 'Your repair request has been submitted successfully. We will contact you shortly.',
        icon: 'success',
        confirmButtonColor: '#000000',
      });

      if (result.isConfirmed) {
        // Reset form
        setFormData({
          customerName: '',
          email: '',
          phone: '',
          shoeType: '',
          brand: '',
          repairType: '',
          description: '',
          urgency: 'standard',
        });
        setImageUploadGroups([{id: '0', file: null, preview: ''}]);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Head title="Request Repair Service" />
      <Navigation />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto py-16 px-6">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4 text-black">Request Repair Service</h1>
            <p className="text-gray-500">Fill out the form below and upload images of your shoes to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Information */}
            <div className="border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-black mb-6 uppercase tracking-wide">Customer Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black"
                    placeholder="Juan Dela Cruz"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black"
                    placeholder="juan@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black"
                    placeholder="+63 912 345 6789"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                    Urgency
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black"
                  >
                    <option value="standard">Standard (5-7 days)</option>
                    <option value="express">Express (2-3 days)</option>
                    <option value="rush">Rush (24 hours)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Shoe Details */}
            <div className="border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-black mb-6 uppercase tracking-wide">Shoe Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                    Shoe Type
                  </label>
                  <input
                    type="text"
                    name="shoeType"
                    value={formData.shoeType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black"
                    placeholder="e.g., Sneakers, Boots, Loafers"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black"
                    placeholder="e.g., Nike, Adidas"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                    Repair Type
                  </label>
                  <select
                    name="repairType"
                    value={formData.repairType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black"
                  >
                    <option value="">Select repair type</option>
                    {repairTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none text-black resize-none"
                    placeholder="Describe the issue or repair needed..."
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-black mb-6 uppercase tracking-wide">Upload Images *</h2>
              <p className="text-sm text-gray-500 mb-6">Upload up to 5 images of your shoes (front, back, damaged areas)</p>

              <div className="grid grid-cols-4 gap-4">
                {imageUploadGroups.map((group, index) => (
                  <div key={group.id} className="relative group">
                    {group.preview ? (
                      <div className="relative inline-block w-full">
                        <img 
                          src={group.preview} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-32 object-cover border-2 border-gray-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={addImageUploadBox}
                            className="bg-black hover:bg-gray-800 text-white rounded-full p-2 transition-colors"
                            title="Add another image"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                          {imageUploadGroups.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeImageBox(group.id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors"
                              title="Remove image"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 hover:border-black rounded p-4 text-center h-32 flex flex-col items-center justify-center transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(group.id, e)}
                          className="hidden"
                          id={`image-upload-${group.id}`}
                        />
                        <label htmlFor={`image-upload-${group.id}`} className="cursor-pointer block w-full h-full flex flex-col items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-gray-600 font-medium">Upload</p>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Link
                href="/repair-services"
                className="flex-1 border-2 border-black text-black px-8 py-4 text-center font-medium text-sm tracking-wide uppercase hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 bg-black text-white px-8 py-4 font-medium text-sm tracking-wide uppercase transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="mt-32 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="text-2xl font-bold mb-6 text-black">SoleSpace</div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                Your premier destination for premium footwear and expert repair services.
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-6">Quick Links</h3>
              <nav className="flex flex-col gap-4 text-sm text-gray-700">
                <Link href="/products" className="hover:text-black transition-colors">Products</Link>
                <Link href="/repair-services" className="hover:text-black transition-colors">Repair Services</Link>
                <Link href="/my-orders" className="hover:text-black transition-colors">My Orders</Link>
              </nav>
            </div>
            <div className="flex flex-col">
              <h3 className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-6">Services</h3>
              <nav className="flex flex-col gap-4 text-sm text-gray-700">
                <a href="#" className="hover:text-black transition-colors">Shoe Repair</a>
                <a href="#" className="hover:text-black transition-colors">Custom Fitting</a>
                <a href="#" className="hover:text-black transition-colors">Maintenance</a>
              </nav>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 text-xs text-gray-400 flex items-center justify-between">
            <div>© 2026 SoleSpace. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RepairProcess;
