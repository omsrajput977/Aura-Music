import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const HAS_ENTERED_KEY = 'aura_has_entered';

export const AuthProvider = ({ children }) => {
  const [hasEntered, setHasEntered] = useState(() => {
    try {
      return localStorage.getItem(HAS_ENTERED_KEY) === 'true';
    } catch (e) {}
    return false;
  });

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
        hasEntered,
        enterExperience,
        exitExperience,
        // Kept for backward compatibility if any component references them
        token: null,
        isDemoMode: true,
        user: null,
        logout: exitExperience,
        toggleDemoMode: exitExperience
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
