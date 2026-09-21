import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await register(formData);
      navigate('/customer/dashboard', { replace: true });
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        setErrors(resp.errors);
      }
      setApiError(resp?.message || 'Registration failed. Please review your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80 text-slate-900">
      {/* Form Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
          <ShieldCheck size={26} />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Customer Account</h2>
        <p className="text-xs text-slate-500 mt-1">Join PhoneStore for warranty coverage and instant dispatch</p>
      </div>

      {apiError && (
        <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed animate-shake">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Full Name
          </label>
          <div className="relative flex items-center">
            <User size={17} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              id="name"
              type="text"
              name="name"
              placeholder="e.g. Sokha Chan"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="name"
              required
              className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/70 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 transition ${
                errors.name
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-100 bg-red-50/20'
                  : 'border-slate-200 focus:border-blue-600 focus:ring-blue-100'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-600 font-medium mt-1">
              {Array.isArray(errors.name) ? errors.name[0] : errors.name}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail size={17} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              id="email"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="email"
              required
              className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/70 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 transition ${
                errors.email
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-100 bg-red-50/20'
                  : 'border-slate-200 focus:border-blue-600 focus:ring-blue-100'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-600 font-medium mt-1">
              {Array.isArray(errors.email) ? errors.email[0] : errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Password <span className="text-slate-400 font-normal lowercase">(min 8 characters)</span>
          </label>
          <div className="relative flex items-center">
            <Lock size={17} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create strong password"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="new-password"
              required
              className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 transition ${
                errors.password
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-100 bg-red-50/20'
                  : 'border-slate-200 focus:border-blue-600 focus:ring-blue-100'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600 font-medium mt-1">
              {Array.isArray(errors.password) ? errors.password[0] : errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="password_confirmation" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Confirm Password
          </label>
          <div className="relative flex items-center">
            <Lock size={17} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              id="password_confirmation"
              type={showConfirmPassword ? 'text' : 'password'}
              name="password_confirmation"
              placeholder="Re-enter password"
              value={formData.password_confirmation}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="new-password"
              required
              className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 transition ${
                errors.password_confirmation
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-100 bg-red-50/20'
                  : 'border-slate-200 focus:border-blue-600 focus:ring-blue-100'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="text-xs text-red-600 font-medium mt-1">
              {Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md hover:shadow-lg transition duration-200 disabled:opacity-60 cursor-pointer mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <UserPlus size={18} />
              <span>Complete Registration</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="text-center mt-6 pt-5 border-t border-slate-100 text-xs text-slate-600">
        <p>
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
