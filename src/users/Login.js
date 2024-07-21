import React, { useState } from 'react';
import {jwtDecode} from 'jwt-decode';
import '../styles/Spinner.css';  // Make sure to import the spinner styles


const Spinner = () => (
  <div className="spinner">
    <div className="double-bounce1"></div>
    <div className="double-bounce2"></div>
  </div>
);

const Login = ({ setAuth, navigateToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('https://electrocord.onrender.com/api/v1/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      // const response = await fetch('http://localhost:5000/api/v1/auth/signin', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ email, password }),
      //   credentials: 'include',
      // });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const result = await response.json();
      console.log('Login result:', result);
      console.log('Cookie: ', document.cookie);
      const token = result.data.token;
      const decoded = jwtDecode(token);
            
      if (!token || !decoded.user_id) {
        throw new Error('No token or userId received');
      }

      setAuth({ token, userId: decoded.user_id, userName: decoded.username, isAdmin: decoded.is_admin });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isLoading ? <Spinner /> : 'Login'}
        </button>
        <div className="mt-4 text-sm text-center">
          Don't have an account?{' '}
          <button onClick={navigateToSignUp} className="text-blue-500 hover:underline">
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
