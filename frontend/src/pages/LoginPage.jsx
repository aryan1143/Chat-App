import React, { useState } from 'react';
import { Eye, EyeOff, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthPagePattern from '../components/AuthPagePattern';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { isLoggingIng, login } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email.trim()) return toast.error('Email is required');
    if (!formData.password.trim()) return toast.error('Password is required');
    login(formData);
  };

  return (
    <div className='grow w-screen grid grid-cols-1 lg:grid-cols-2'>
      {/* left side */}
      <div className='flex h-full flex-col gap-2 justify-center items-center px-4 py-8'>
        {/*message-icon*/}
        <div className='p-3 bg-primary/20 rounded-xl'>
          <MessageSquare className='size-8 text-primary' />
        </div>
        <h1 className='text-2xl font-bold mt-2'>Login</h1>
        <p className='text-base-content/60'>Login to start your experience</p>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5 lg:w-4/10 w-8/10 mt-5 justify-center items-center'>
          <label className="input validator">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </g>
            </svg>
            <input
              name='email'
              type="email"
              placeholder="Enter your email..."
              required
              onChange={handleChange}
              onBlur={handleChange}
            />
          </label>
          <label className="input validator">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                ></path>
                <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
              </g>
            </svg>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              minLength="8"
              name='password'
              onChange={handleChange}
              onBlur={handleChange}
            />
            <button type='button' className='cursor-pointer' onClick={() =>
              setShowPassword(!showPassword)
            }>
              {showPassword ?
                <Eye /> : <EyeOff />}
            </button>
          </label>
          <button type='submit' disabled={isLoggingIng} className="btn btn-primary w-full">{isLoggingIng ?
            <>
              Logging in <span className="loading loading-dots loading-xs"></span>
            </>
            : "Login"}
          </button>
        </form>

        <p className='text-base-content/60'>Don't have any account? <Link className='link link-primary' to={"/signup"} >Create Account</Link></p>

      </div>

      {/* right side */}
      <div className='hidden h-full flex-col gap-2 justify-center items-center border-l border-base-300/60 bg-base-200/35 lg:flex'>
        <AuthPagePattern />
      </div>
    </div>
  )
}

export default LoginPage