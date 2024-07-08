// src/App.js
import React, { useState } from 'react';
import Handler from './Handler';
import Login from './users/Login';
import SignUp from './users/SignUp';

function App() {
  const [auth, setAuth] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);

  const handleLogout = () => {
    setAuth(null);
  };

  const navigateToSignUp = () => {
    setShowSignUp(true);
  };

  const navigateToLogin = () => {
    setShowSignUp(false);
  };

  return (
    <div>
      {!auth ? (
        showSignUp ? (
          <SignUp setAuth={setAuth} navigateToLogin={navigateToLogin} />
        ) : (
          <Login setAuth={setAuth} navigateToSignUp={navigateToSignUp} />
        )
      ) : (
        <Handler
          token={auth.token}
          userId={auth.userId}
          userName={auth.userName}
          handleLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
