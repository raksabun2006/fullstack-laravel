import { useEffect, useState } from 'react';
import { AuthContext } from './authContextDef';
import { getMe, loginUser, logoutUser, registerUser } from '../api/authApi';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem('auth_token')));

  // Restore authenticated session on app start
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    let isMounted = true;

    getMe()
      .then((userData) => {
        if (isMounted) {
          setUser(userData);
        }
      })
      .catch(() => {
        if (isMounted) {
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    if (data?.token) {
      localStorage.setItem('auth_token', data.token);
    }
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  const register = async (formData) => {
    const data = await registerUser(formData);
    if (data?.token) {
      localStorage.setItem('auth_token', data.token);
    }
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Clear local state even if server token deletion fails
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
