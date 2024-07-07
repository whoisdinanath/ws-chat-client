import React from 'react';
import Handler from './Handler';
import Login from './users/Login';

function App() {
  const [auth, setAuth] = React.useState(null);

  const handleLogout = () => {
    setAuth(null);
  };

  return (
    <div>
      {!auth ? (
        <Login setAuth={setAuth} />
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
