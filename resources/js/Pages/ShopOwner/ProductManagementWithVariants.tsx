import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Head } from '@inertiajs/react';
import AppLayoutShopOwner from '../../layout/AppLayout_shopOwner';
import Swal from 'sweetalert2';

// Types
type Variant = {
  id?: number;
  size: string;
  color: string;
  image: string;
  quantity: number;
  sku?: string;
  imageFile?: File | null;
  imagePreview?: string;
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
  variants?: Variant[];
};

// Icon Components  
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

export default function ProductManagement() {
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
  });
  
  // Variant Management
  const [sizes, setSizes] = useState<string[]>(['7', '8', '9', '10']);
  const [colors, setColors] = useState<string[]>(['Black', 'White']);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Generate variants when sizes or colors change
  useEffect(() => {
    if (sizes.length > 0 && colors.length > 0) {
      const newVariants: Variant[] = [];
      sizes.forEach(size => {
        colors.forEach(color => {
          // Check if variant already exists
          const existing = variants.find(v => v.size === size && v.color === color);
          if (existing) {
            newVariants.push(existing);
          } else {
            newVariants.push({
              size,
              color,
              image: '',
              quantity: 0,
              imageFile: null,
              imagePreview: '',
            });
          }
        });
      });
      setVariants(newVariants);
    } else {
      setVariants([]);
    }
  }, [sizes, colors]);

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

  const handleOpenModal = async (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        compare_at_price: product.compare_at_price?.toString() || '',
        brand: product.brand || '',
        category: product.category,
      });
      
      // Load variants for this product
      try {
        const response = await fetch(`/api/products/${product.id}/variants`, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          const loadedVariants = data.variants || [];
          
          // Extract unique sizes and colors
          const uniqueSizes = [...new Set(loadedVariants.map((v: Variant) => v.size))];
          const uniqueColors = [...new Set(loadedVariants.map((v: Variant) => v.color))];
          
          setSizes(uniqueSizes);
          setColors(uniqueColors);
          setVariants(loadedVariants.map((v: Variant) => ({
            ...v,
            imageFile: null,
            imagePreview: v.image,
          })));
        }
      } catch (error) {
        console.error('Error loading variants:', error);
      }
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        compare_at_price: '',
        brand: '',
        category: 'shoes',
      });
      setSizes(['7', '8', '9', '10']);
      setColors(['Black', 'White']);
      setVariants([]);
    }
    setIsModalOpen(true);
  };

  const handleAddSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      setSizes([...sizes, sizeInput.trim()]);
      setSizeInput('');
    }
  };

  const handleRemoveSize = (size: string) => {
    setSizes(sizes.filter(s => s !== size));
  };

  const handleAddColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]);
      setColorInput('');
    }
  };

  const handleRemoveColor = (color: string) => {
    setColors(colors.filter(c => c !== color));
  };

  const handleVariantImageChange = (size: string, color: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVariants(variants.map(v => 
          v.size === size && v.color === color
            ? { ...v, imageFile: file, imagePreview: reader.result as string }
            : v
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVariantQuantityChange = (size: string, color: string, quantity: number) => {
    setVariants(variants.map(v =>
      v.size === size && v.color === color
        ? { ...v, quantity: Math.max(0, quantity) }
        : v
    ));
  };

  const uploadVariantImages = async (): Promise<Map<string, string>> => {
    const uploadedPaths = new Map<string, string>();
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    for (const variant of variants) {
      if (variant.imageFile) {
        try {
          const uploadData = new FormData();
          uploadData.append('image', variant.imageFile);

          const response = await fetch('/api/products/upload-image', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'X-CSRF-TOKEN': csrfToken || '',
            },
            body: uploadData,
          });

          const data = await response.json();
          if (response.ok) {
            uploadedPaths.set(`${variant.size}-${variant.color}`, data.path);
          }
        } catch (error) {
          console.error(`Error uploading image for ${variant.size}-${variant.color}:`, error);
        }
      } else if (variant.imagePreview) {
        // Use existing image
        uploadedPaths.set(`${variant.size}-${variant.color}`, variant.imagePreview);
      }
    }

    return uploadedPaths;
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

    if (sizes.length === 0 || colors.length === 0) {
      Swal.fire({
        title: 'Missing Variants',
        text: 'Please add at least one size and one color',
        icon: 'warning',
        confirmButtonColor: '#000000',
      });
      return;
    }

    if (variants.every(v => v.quantity === 0)) {
      Swal.fire({
        title: 'No Stock',
        text: 'Please set quantity for at least one variant',
        icon: 'warning',
        confirmButtonColor: '#000000',
      });
      return;
    }

    try {
      setUploading(true);

      // Upload variant images
      const imagePaths = await uploadVariantImages();

      // Prepare variant data
      const variantData = variants.map(v => ({
        size: v.size,
        color: v.color,
        quantity: v.quantity,
        image: imagePaths.get(`${v.size}-${v.color}`) || '',
        sku: v.sku || null,
      }));

      // Calculate total stock
      const totalStock = variants.reduce((sum, v) => sum + v.quantity, 0);

      // Get first variant image as main image
      const mainImage = Array.from(imagePaths.values())[0] || null;
      const additionalImages = Array.from(imagePaths.values()).slice(1);

      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        brand: formData.brand || null,
        category: formData.category,
        stock_quantity: totalStock,
        sizes_available: sizes,
        colors_available: colors,
        main_image: mainImage,
        additional_images: additionalImages.length > 0 ? additionalImages : null,
        variants: variantData,
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save product');
      }

      await Swal.fire({
        title: 'Success!',
        text: `Product ${editingProduct ? 'updated' : 'created'} successfully`,
        icon: 'success',
        confirmButtonColor: '#000000',
      });

      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to save product',
        icon: 'error',
        confirmButtonColor: '#000000',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Delete Product?',
      text: 'This will also delete all product variants. This action cannot be undone',
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

  const calculateTotalStock = () => {
    return variants.reduce((sum, v) => sum + v.quantity, 0);
  };

  return (
    <>
      <AppLayoutShopOwner>
        <Head title="Product Management" />

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your shoe inventory with variant-based stock control
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No products yet. Create your first product!
                    </td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
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
      </AppLayoutShopOwner>

      {/* Add/Edit Product Modal with Variant Management */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full my-8 shadow-2xl relative">
            <div className="sticky top-0 p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure product details and manage inventory by size and color variants
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-100px)] overflow-y-auto">
              {/* Basic Information */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="e.g., Nike Air Force 1 '07"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Describe the product..."
                      required
                    />
                  </div>

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
                      placeholder="0.00"
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
                      placeholder="Original price (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Brand *
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="e.g., Nike, Adidas"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="shoes">Shoes</option>
                      <option value="accessories">Accessories</option>
                      <option value="apparel">Apparel</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Size & Color Configuration */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Sizes & Colors</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Sizes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sizes *
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={sizeInput}
                        onChange={(e) => setSizeInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                        placeholder="Enter size (e.g., 7, 8, 9)"
                      />
                      <button
                        type="button"
                        onClick={handleAddSize}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map(size => (
                        <span
                          key={size}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-sm"
                        >
                          {size}
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(size)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Colors *
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                        placeholder="Enter color (e.g., Black, White)"
                      />
                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {colors.map(color => (
                        <span
                          key={color}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-sm"
                        >
                          {color}
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(color)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Variant Inventory Table */}
              {variants.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Variant Inventory
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Stock: <span className="font-bold text-gray-900 dark:text-white">{calculateTotalStock()}</span> units
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Size</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Color</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Image</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Quantity *</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {variants.map((variant, index) => (
                          <tr key={`${variant.size}-${variant.color}`} className="hover:bg-white/50 dark:hover:bg-gray-800/50">
                            <td className="px-3 py-3 text-gray-900 dark:text-white font-medium">{variant.size}</td>
                            <td className="px-3 py-3 text-gray-900 dark:text-white">{variant.color}</td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                {variant.imagePreview ? (
                                  <img
                                    src={variant.imagePreview}
                                    alt={`${variant.color} ${variant.size}`}
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleVariantImageChange(variant.size, variant.color, e)}
                                  className="hidden"
                                  id={`variant-image-${index}`}
                                />
                                <label
                                  htmlFor={`variant-image-${index}`}
                                  className="cursor-pointer text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                  {variant.imagePreview ? 'Change' : 'Upload'}
                                </label>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <input
                                type="number"
                                value={variant.quantity}
                                onChange={(e) => handleVariantQuantityChange(variant.size, variant.color, parseInt(e.target.value) || 0)}
                                className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                min="0"
                                required
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    💡 Tip: Upload different images for each color to show customers exactly what they're buying. Each size/color combination maintains its own inventory.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
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
