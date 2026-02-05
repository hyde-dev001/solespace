import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Head } from '@inertiajs/react';
import AppLayoutERP from '../../../layout/AppLayout_ERP';
import Swal from 'sweetalert2';

// Metric Card Component
type MetricCardProps = {
  title: string;
  value: number | string;
  change?: number;
  changeType?: "increase" | "decrease";
  description?: string;
  color?: "success" | "error" | "warning" | "info";
  icon: React.FC<{ className?: string }>;
};

const ArrowUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const ArrowDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);

const ShoppingCartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 6H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v15a2 2 0 01-2 2z" />
  </svg>
);

const TrendingUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  description,
}) => {
  const getColorClasses = () => {
    switch (color) {
      case "success": return "from-green-500 to-emerald-600";
      case "error": return "from-red-500 to-rose-600";
      case "warning": return "from-yellow-500 to-orange-600";
      case "info": return "from-blue-500 to-indigo-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700">
      <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses()} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center justify-center w-14 h-14 bg-gradient-to-br ${getColorClasses()} rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon className="text-white size-7 drop-shadow-sm" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
              changeType === "increase"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}>
              {changeType === "increase" ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      </div>
    </div>
  );
};

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  brand: string | null;
  category: string;
  stock_quantity: number;
  is_active: boolean;
  main_image: string | null;
  additional_images: string[] | null;
  sizes_available: string[] | null;
  colors_available: string[] | null;
  sales_count: number;
  created_at: string;
};

function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compare_at_price: '',
    brand: '',
    category: 'shoes',
    stock_quantity: '0',
    sizes_available: '',
    colors_available: '',
    main_image: '',
  });
  const [imageUploadGroups, setImageUploadGroups] = useState<Array<{id: string; file: File | null; preview: string}>>([{id: '0', file: null, preview: ''}]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products/my/products', {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to load products',
        icon: 'error',
        confirmButtonColor: '#000000',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        compare_at_price: product.compare_at_price?.toString() || '',
        brand: product.brand || '',
        category: product.category,
        stock_quantity: product.stock_quantity.toString(),
        sizes_available: product.sizes_available?.join(', ') || '',
        colors_available: product.colors_available?.join(', ') || '',
        main_image: product.main_image || '',
      });
      // Load all images: main_image + additional_images
      const allImages = [
        product.main_image,
        ...(product.additional_images || [])
      ].filter(Boolean) as string[];
      setImageUploadGroups(
        allImages.length > 0
          ? allImages.map((img, idx) => ({ id: idx.toString(), file: null, preview: img }))
          : [{id: '0', file: null, preview: ''}]
      );
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        compare_at_price: '',
        brand: '',
        category: 'shoes',
        stock_quantity: '0',
        sizes_available: '',
        colors_available: '',
        main_image: '',
      });
      setImageUploadGroups([{id: '0', file: null, preview: ''}]);
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
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
    const newId = Date.now().toString();
    setImageUploadGroups(prev => [...prev, {id: newId, file: null, preview: ''}]);
  };

  const removeImageBox = (id: string) => {
    setImageUploadGroups(prev => prev.filter(group => group.id !== id));
  };

  const uploadImages = async (): Promise<string[]> => {
    const filesToUpload = imageUploadGroups.filter(group => group.file);
    if (filesToUpload.length === 0) return formData.main_image ? [formData.main_image] : [];

    try {
      setUploading(true);
      const uploadedPaths: string[] = [];

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      // Upload each image
      for (const group of filesToUpload) {
        if (!group.file) continue;
        
        const uploadData = new FormData();
        uploadData.append('image', group.file);

        const response = await fetch('/api/products/upload-image', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'X-CSRF-TOKEN': csrfToken || '',
          },
          body: uploadData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to upload image');
        }

        uploadedPaths.push(data.path);
      }

      return uploadedPaths;
    } catch (error: any) {
      console.error('Error uploading images:', error);
      await Swal.fire({
        title: 'Upload Failed',
        text: error.message || 'Failed to upload images',
        icon: 'error',
        confirmButtonColor: '#000000',
      });
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.price) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in product name and price',
        icon: 'warning',
        confirmButtonColor: '#000000',
      });
      return;
    }

    // Check if editing and no changes were made
    if (editingProduct && imageUploadGroups.every(g => !g.file)) {
      const originalSizes = editingProduct.sizes_available?.join(', ') || '';
      const originalColors = editingProduct.colors_available?.join(', ') || '';
      
      const noChanges = 
        formData.name === editingProduct.name &&
        formData.description === (editingProduct.description || '') &&
        parseFloat(formData.price) === editingProduct.price &&
        (formData.compare_at_price ? parseFloat(formData.compare_at_price) : 0) === (editingProduct.compare_at_price || 0) &&
        formData.brand === (editingProduct.brand || '') &&
        parseInt(formData.stock_quantity) === editingProduct.stock_quantity &&
        formData.sizes_available === originalSizes &&
        formData.colors_available === originalColors;

      if (noChanges) {
        Swal.fire({
          title: 'Invalid!',
          text: 'No changes were made to the product',
          icon: 'error',
          confirmButtonColor: '#000000',
        });
        return;
      }
    }

    try {
      // Upload images if provided
      let imagePaths: string[] = [];
      const hasNewImages = imageUploadGroups.some(g => g.file);
      if (hasNewImages) {
        const uploaded = await uploadImages();
        if (uploaded.length > 0) {
          imagePaths = uploaded;
        }
      } else {
        // Use existing images from preview (when editing without new uploads)
        imagePaths = imageUploadGroups
          .filter(g => g.preview)
          .map(g => g.preview);
      }

      const mainImage = imagePaths[0] || null;
      const additionalImages = imagePaths.length > 1 ? imagePaths.slice(1) : null;

      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        brand: formData.brand || null,
        category: formData.category,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        sizes_available: formData.sizes_available 
          ? formData.sizes_available.split(',').map(s => s.trim()).filter(Boolean)
          : null,
        colors_available: formData.colors_available
          ? formData.colors_available.split(',').map(c => c.trim()).filter(Boolean)
          : null,
        main_image: mainImage,
        additional_images: additionalImages,
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products/';

      const method = editingProduct ? 'PUT' : 'POST';

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error('Failed to save product');

      await Swal.fire({
        title: 'Success!',
        text: `Product ${editingProduct ? 'updated' : 'created'} successfully`,
        icon: 'success',
        confirmButtonColor: '#000000',
      });

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to save product',
        icon: 'error',
        confirmButtonColor: '#000000',
      });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Delete Product?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
      });

      if (!response.ok) throw new Error('Failed to delete product');

      await Swal.fire({
        title: 'Deleted!',
        text: 'Product has been deleted',
        icon: 'success',
        confirmButtonColor: '#000000',
      });

      fetchProducts();
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete product',
        icon: 'error',
        confirmButtonColor: '#000000',
      });
    }
  };

  return (
    <>
      <AppLayoutERP>
        <Head title="Product Management" />

        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your shoe inventory and listings
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Add New Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Products"
            value={products.length}
            color="info"
            icon={ShoppingCartIcon}
          />
          <MetricCard
            title="Active Products"
            value={products.filter(p => p.is_active).length}
            color="success"
            icon={CheckCircleIcon}
          />
          <MetricCard
            title="Out of Stock"
            value={products.filter(p => p.stock_quantity === 0).length}
            color="error"
            icon={ExclamationIcon}
          />
          <MetricCard
            title="Total Sales"
            value={products.reduce((sum, p) => sum + p.sales_count, 0)}
            color="warning"
            icon={TrendingUpIcon}
          />
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No products yet. Click "Add New Product" to get started.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.main_image ? (
                            <img
                              src={product.main_image}
                              alt={product.name}
                              className="size-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="size-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-xs text-gray-500">No image</span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900 dark:text-white font-medium">₱{product.price.toLocaleString()}</p>
                        {product.compare_at_price && (
                          <p className="text-sm text-gray-500 line-through">₱{product.compare_at_price.toLocaleString()}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.stock_quantity === 0
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : product.stock_quantity < 10
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {product.stock_quantity} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {product.sales_count}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </AppLayoutERP>

      {/* Add/Edit Product Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full my-8 shadow-2xl relative">
            <div className="sticky top-0 p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(90vh-100px)] overflow-y-auto">
              {/* Image Upload */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product Images * <span className="text-xs text-gray-500 font-normal">({imageUploadGroups.filter(g => g.preview).length} uploaded)</span>
                  </label>
                  {imageUploadGroups.length < 10 && (
                    <button
                      type="button"
                      onClick={addImageUploadBox}
                      className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Image
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {imageUploadGroups.map((group, index) => (
                    <div key={group.id} className="relative group">
                      {group.preview ? (
                        <div className="relative inline-block w-full">
                          <img 
                            src={group.preview} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-32 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600"
                          />
                          <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {index === 0 ? 'Main' : `#${index + 1}`}
                          </div>
                          <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            {imageUploadGroups.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeImageBox(group.id)}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors"
                                title="Remove image"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors h-32 flex flex-col items-center justify-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(group.id, e)}
                            className="hidden"
                            id={`image-upload-${group.id}`}
                            required={!editingProduct && index === 0}
                          />
                          <label htmlFor={`image-upload-${group.id}`} className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Upload</p>
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Price & Compare Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Compare at Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Brand & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Sizes & Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sizes (comma-separated) *
                  </label>
                  <input
                    type="text"
                    value={formData.sizes_available}
                    onChange={(e) => setFormData({ ...formData, sizes_available: e.target.value })}
                    placeholder="7, 8, 9, 10"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Colors (comma-separated) *
                  </label>
                  <input
                    type="text"
                    value={formData.colors_available}
                    onChange={(e) => setFormData({ ...formData, colors_available: e.target.value })}
                    placeholder="Black, White, Red"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export { default } from "./ProductManagementWithVariants";
