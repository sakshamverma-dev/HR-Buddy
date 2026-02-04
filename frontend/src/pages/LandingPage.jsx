import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        jobRole: '',
        dateOfJoining: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register: signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const data = await login({ email: formData.email, password: formData.password });
                if (data.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                await signup(formData);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || `${isLogin ? 'Login' : 'Signup'} failed. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Premium Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
                {/* Animated Background Shapes */}
                <div className="absolute inset-0">
                    {/* Large gradient orb - top right */}
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 rounded-full opacity-20 blur-3xl"></div>

                    {/* Medium orb - center */}
                    <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-tl from-pink-400 to-purple-400 rounded-full opacity-25 blur-2xl"></div>

                    {/* Small orb - bottom */}
                    <div className="absolute bottom-20 right-20 w-56 h-56 bg-gradient-to-tr from-blue-300 to-purple-300 rounded-full opacity-30 blur-xl"></div>

                    {/* Floating card-like shape - bottom left */}
                    <div className="absolute bottom-16 left-16 w-72 h-44 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-3xl backdrop-blur-sm border border-white/10 animate-float delay-700"></div>

                    {/* Floating card - left center */}
                    <div className="absolute top-1/3 left-12 w-48 h-48 bg-gradient-to-br from-blue-300/20 to-indigo-300/20 rounded-2xl backdrop-blur-sm border border-white/10 transform -rotate-12 animate-float delay-500"></div>
                </div>

                {/* Hero Content - Centered & Polished */}
                <div className="relative z-10 flex flex-col justify-center items-center text-center px-12 text-white w-full">
                    <div className="max-w-xl">
                        {/* Icon Badge - Premium Style */}
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-2xl border border-white/20 animate-scale-in delay-200">
                            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                            </svg>
                        </div>

                        {/* Main Heading - Bold & Beautiful */}
                        <h1 className="text-7xl font-black mb-6 tracking-tight leading-none bg-gradient-to-r from-white via-blue-50 to-white bg-clip-text text-transparent animate-slide-up delay-300"
                            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900 }}>
                            HR Buddy
                        </h1>

                        {/* Tagline */}
                        <div className="space-y-3 mb-8">
                            <p className="text-3xl font-bold text-white tracking-tight animate-slide-up delay-400">
                                Your Simple HR Assistant
                            </p>
                            <p className="text-xl text-blue-100 font-medium leading-relaxed animate-slide-up delay-500">
                                Manage leave & attendance without the chaos.
                            </p>
                        </div>

                        {/* Feature Pills - Modern Style */}
                        <div className="flex flex-wrap justify-center gap-3 mt-10 animate-fade-in delay-700">
                            <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg hover:scale-105 transition-transform duration-300">
                                <span className="text-sm font-semibold text-white">📊 Smart Reports</span>
                            </div>
                            <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg hover:scale-105 transition-transform duration-300">
                                <span className="text-sm font-semibold text-white">✅ Easy Tracking</span>
                            </div>
                            <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg hover:scale-105 transition-transform duration-300">
                                <span className="text-sm font-semibold text-white">⚡ Fast & Simple</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login/Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 lg:bg-gray-50 p-6 md:p-8 relative">
                {/* Mobile Background Decoration (Visible only on small screens) */}
                <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-600/10 to-transparent"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-48 -left-24 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
                </div>

                <div className="w-full max-w-md relative z-10">
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-8 animate-fade-in">
                        <div className="inline-block p-3 rounded-2xl bg-white shadow-lg mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                            </svg>
                        </div>
                        <h1 className="text-4xl font-black mb-2 tracking-tight bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                            HR Buddy
                        </h1>
                        <p className="text-lg text-gray-800 font-bold mb-1">Your Simple HR Assistant</p>
                        <p className="text-sm text-gray-500 font-medium">Manage leave & attendance without the chaos.</p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 animate-slide-in-right delay-200">
                        {/* Greeting */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                                {isLogin ? 'Hello!' : 'Join Us!'}
                            </h2>
                            <p className="text-gray-600 font-medium text-base">
                                {isLogin ? 'Log In to Get Started' : 'Create Your Account'}
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                                        👤 Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                                        placeholder="John Doe"
                                    />
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    📧 Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    🔒 Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium pr-10"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 max-h-full flex items-center pr-3 text-gray-500 hover:text-blue-600 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {!isLogin && (
                                <div>
                                    <label htmlFor="jobRole" className="block text-sm font-semibold text-gray-700 mb-2">
                                        💼 Job Role
                                    </label>
                                    <select
                                        id="jobRole"
                                        name="jobRole"
                                        value={formData.jobRole}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium bg-white"
                                    >
                                        <option value="">Select your role</option>
                                        <option value="Frontend Developer">Frontend Developer</option>
                                        <option value="Backend Developer">Backend Developer</option>
                                        <option value="Full Stack Developer">Full Stack Developer</option>
                                        <option value="Software Developer">Software Developer</option>
                                        <option value="HR Manager">HR Manager</option>
                                        <option value="Marketing Manager">Marketing Manager</option>
                                        <option value="Sales Executive">Sales Executive</option>
                                        <option value="Product Manager">Product Manager</option>
                                        <option value="Designer">Designer</option>
                                        <option value="Data Analyst">Data Analyst</option>
                                        <option value="Project Manager">Project Manager</option>
                                        <option value="Business Analyst">Business Analyst</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            )}

                            {!isLogin && (
                                <div>
                                    <label htmlFor="dateOfJoining" className="block text-sm font-semibold text-gray-700 mb-2">
                                        📅 Date of Joining
                                    </label>
                                    <input
                                        type="date"
                                        id="dateOfJoining"
                                        name="dateOfJoining"
                                        value={formData.dateOfJoining}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-base py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {isLogin ? 'Logging In...' : 'Creating Account...'}
                                    </span>
                                ) : (
                                    <span>{isLogin ? 'Log In' : 'Sign Up'}</span>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-600 font-medium">
                                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError('');
                                        setFormData({ email: '', password: '', fullName: '', jobRole: '', dateOfJoining: '' });
                                    }}
                                    className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
                                >
                                    {isLogin ? 'Sign Up' : 'Log In'}
                                </button>
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center space-y-2 animate-fade-in delay-500">
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                            <span>Developed By:</span>
                            <span className="font-semibold text-blue-600">Saksham Verma</span>
                            <a
                                href="https://www.linkedin.com/in/saksham-verma-3589a9329/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-5 h-5 text-blue-600 hover:text-blue-800 transition-colors"
                                aria-label="LinkedIn Profile"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                            © 2026 HR Buddy. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
