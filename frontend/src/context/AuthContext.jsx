import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const BACKEND_URL = 'http://localhost:5001';
const HAS_ENTERED_KEY = 'aura_has_entered';
const LOCAL_USER_KEY = 'aura_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return !!localStorage.getItem(LOCAL_USER_KEY);
    } catch (e) {
      return false;
    }
  });

  // Always redirect to the home page on refresh
  const [hasEntered, setHasEntered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Clear any legacy persisted hasEntered key
  useEffect(() => {
    try {
      localStorage.removeItem(HAS_ENTERED_KEY);
    } catch (e) {}
  }, []);

  // Auto-Login: Check existing JWT session cookie or token on load
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && data.user) {
            setUser(data.user);
            setIsAuthenticated(true);
            try {
              localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
            } catch (e) {}
          }
        } else {
          // Cookie expired or invalid
          setUser(null);
          setIsAuthenticated(false);
          try {
            localStorage.removeItem(LOCAL_USER_KEY);
          } catch (e) {}
        }
      } catch (err) {
        console.warn('[Auto-Login] Could not connect to auth service:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  // Sign up action
  const signup = async (name, email, password) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create account.');
    }

    setUser(data.user);
    setIsAuthenticated(true);
    setHasEntered(true);
    try {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
      localStorage.setItem(HAS_ENTERED_KEY, 'true');
    } catch (e) {}

    return data.user;
  };

  // Login action
  const login = async (email, password) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid email or password.');
    }

    setUser(data.user);
    setIsAuthenticated(true);
    setHasEntered(true);
    try {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
      localStorage.setItem(HAS_ENTERED_KEY, 'true');
    } catch (e) {}

    return data.user;
  };

  // Logout action
  const logout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
    } catch (e) {}

    setUser(null);
    setIsAuthenticated(false);
    setHasEntered(false);
    try {
      localStorage.removeItem(LOCAL_USER_KEY);
      localStorage.removeItem(HAS_ENTERED_KEY);
    } catch (e) {}
  };

  const enterExperience = () => {
    setHasEntered(true);
    try {
      localStorage.setItem(HAS_ENTERED_KEY, 'true');
    } catch (e) {}
  };

  const exitExperience = () => {
    setHasEntered(false);
    try {
      localStorage.removeItem(HAS_ENTERED_KEY);
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        hasEntered,
        signup,
        login,
        logout,
        enterExperience,
        exitExperience
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
