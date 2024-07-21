// src/users/SignUp.js
import React, { useState } from 'react';
import {jwtDecode} from 'jwt-decode';

const SignUp = ({ setAuth, navigateToLogin }) => {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (password1 !== password2) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('https://electrocord.onrender.com/api/v1/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, fullname, email, dob, password1, password2 }),
      });
      // const response = await fetch('http://localhost:5000/api/v1/auth/signup', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ username, fullname, email, dob, password1, password2 }),
      // });

      const result = await response.json();

      if (result.success) {
        const token = result.data.token;
        const decoded = jwtDecode(token);

        if (!token || !decoded.user_id) {
          throw new Error('No token or userId received');
        }

        setAuth({
          token,
          userId: decoded.user_id,
          userName: decoded.username,
          isAdmin: decoded.is_admin,
        });

        // Redirect to another page if needed, or show a success message
        // For example, navigate to login page:
        navigateToLogin();

      } else {
        throw new Error(result.message);
      }

    } catch (err) {
      console.error('Sign up error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSignUp}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            id="username"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            id="fullname"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />
        </div>
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
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            id="dob"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password1" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password2" className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            id="password2"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Sign Up
        </button>
        <div className="mt-4 text-sm text-center">
          Already have an account?{' '}
          <button onClick={navigateToLogin} className="text-blue-500 hover:underline">
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
