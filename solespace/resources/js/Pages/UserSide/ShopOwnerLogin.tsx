import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navigation from './Navigation';
import Form from '../../components/form/Form';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import { MailIcon, LockIcon } from '../../icons';
import Swal from 'sweetalert2';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function ShopOwnerLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    
    router.post('/shop-owner/login', {
      email: formData.email,
      password: formData.password,
    }, {
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Redirecting to your shop dashboard...',
          confirmButtonColor: '#000000',
          allowOutsideClick: false,
          didOpen: () => {
            setTimeout(() => {
              router.visit('/shop-owner/dashboard');
            }, 1000);
          },
        });
      },
      onError: (errors) => {
        setIsLoading(false);
        setErrors(errors as FormErrors);
        
        // Handle specific error messages
        let errorMessage = 'Invalid credentials. Please try again.';
        if (errors.email) {
          errorMessage = errors.email;
        } else if (errors.password) {
          errorMessage = errors.password;
        } else if (errors.status) {
          errorMessage = errors.status;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: errorMessage,
          confirmButtonColor: '#ef4444',
        });
      },
      onFinish: () => {
        setIsLoading(false);
      },
    });
  };

  return (
    <>
      <Head title="Shop Owner Sign In" />
      <div className="min-h-screen bg-white font-outfit antialiased">
        <Navigation />

      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            SHOP OWNER SIGN IN
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
            Please enter your credentials to access your shop dashboard.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Status Alert */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your account must be approved by an administrator before you can log in. 
                If you just registered, please wait for approval.
              </p>
            </div>

            <Form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="relative">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-10 py-4 bg-black text-white font-semibold uppercase tracking-wider text-sm hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </Form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-600">
                Don't have a shop account?{' '}
                <Link
                  href={route("shop-owner-register")}
                  className="text-black hover:text-black/80 font-semibold uppercase tracking-wider text-sm transition-colors"
                >
                  Register Your Shop
                </Link>
              </p>
              <p className="text-gray-600">
                Are you a customer?{' '}
                <Link
                  href={route("user.login.form")}
                  className="text-blue-600 hover:text-blue-500 font-semibold uppercase tracking-wider text-sm transition-colors"
                >
                  Customer Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
