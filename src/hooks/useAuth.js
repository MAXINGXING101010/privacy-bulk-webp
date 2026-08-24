import { useState, useEffect, useCallback } from 'react';

// ── Local mock store for dev environment ──
// In production, these calls go to Vercel serverless functions.
// Locally we simulate the backend with in-memory storage.

const MOCK_USERS_KEY = '__pbw_mock_users__';
const MOCK_SESSION_KEY = '__pbw_mock_session__';

function getMockUsers() {
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveMockUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function getMockSession() {
  try {
    return JSON.parse(localStorage.getItem(MOCK_SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveMockSession(session) {
  if (session) {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(MOCK_SESSION_KEY);
  }
}

// Simple hash (not bcrypt, just for local dev)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + str.length;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Auto-seed admin account for local dev
const ADMIN_EMAIL = 'admin@privacybulkwebp.com';
const ADMIN_PASSWORD = 'admin123456';

function seedAdminUser() {
  const users = getMockUsers();
  if (!users.find(u => u.email === ADMIN_EMAIL)) {
    users.push({
      id: 'admin_seed',
      email: ADMIN_EMAIL,
      passwordHash: simpleHash(ADMIN_PASSWORD),
      tier: 'pro',
      createdAt: new Date().toISOString(),
    });
    saveMockUsers(users);
  }
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [tier, setTier] = useState('free');
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    seedAdminUser();
    try {
      // Try real API first
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setTier(data.tier || 'free');
        setSubscription(data.subscription || null);
        return;
      }
    } catch {
      // API not available (local dev), fall through to mock
    }

    // Fallback: check mock session
    const session = getMockSession();
    if (session) {
      setUser(session.user);
      setTier(session.tier || 'free');
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    // Try real API first
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setTier(data.tier || 'free');
        return data;
      }
      const data = await res.json();
      throw new Error(data.error || 'Login failed');
    } catch (err) {
      // Fall back to mock for any API failure (network error, JSON parse error, etc.)
      if (err.name === 'TypeError' || err.name === 'SyntaxError' || err.message.includes('fetch')) {
        return mockLogin(email, password);
      }
      throw err;
    }
  };

  const register = async (email, password) => {
    // Try real API first
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setTier(data.tier || 'free');
        return data;
      }
      const data = await res.json();
      throw new Error(data.error || 'Registration failed');
    } catch (err) {
      // Fall back to mock for any API failure (network error, JSON parse error, etc.)
      if (err.name === 'TypeError' || err.name === 'SyntaxError' || err.message.includes('fetch')) {
        return mockRegister(email, password);
      }
      throw err;
    }
  };

  const mockLogin = (email, password) => {
    const users = getMockUsers();
    const found = users.find(u => u.email === email);
    if (!found) throw new Error('Email not registered');
    if (found.passwordHash !== simpleHash(password)) throw new Error('Wrong password');

    const session = { user: { id: found.id, email: found.email }, tier: found.tier || 'free' };
    saveMockSession(session);
    setUser(session.user);
    setTier(session.tier);
    return session;
  };

  const mockRegister = (email, password) => {
    const users = getMockUsers();
    if (users.find(u => u.email === email)) throw new Error('Email already registered');

    const newUser = {
      id: 'mock_' + Date.now(),
      email,
      passwordHash: simpleHash(password),
      tier: 'free',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveMockUsers(users);

    const session = { user: { id: newUser.id, email: newUser.email }, tier: 'free' };
    saveMockSession(session);
    setUser(session.user);
    setTier('free');
    return session;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    saveMockSession(null);
    setUser(null);
    setTier('free');
    setSubscription(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    // Try real API first
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) return;
      const data = await res.json();
      throw new Error(data.error || 'Failed to change password');
    } catch (err) {
      if (err.name === 'TypeError' || err.name === 'SyntaxError' || err.message.includes('fetch')) {
        return mockChangePassword(currentPassword, newPassword);
      }
      throw err;
    }
  };

  const mockChangePassword = (currentPassword, newPassword) => {
    const users = getMockUsers();
    const session = getMockSession();
    if (!session) throw new Error('Not logged in');

    const found = users.find(u => u.email === session.user.email);
    if (!found) throw new Error('User not found');
    if (found.passwordHash !== simpleHash(currentPassword)) throw new Error('Current password is incorrect');
    if (newPassword.length < 8) throw new Error('New password must be at least 8 characters');

    found.passwordHash = simpleHash(newPassword);
    saveMockUsers(users);
  };

  const refreshSubscription = async () => {
    try {
      const res = await fetch('/api/subscription/status', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTier(data.tier || 'free');
        setSubscription(data);
      }
    } catch (err) {
      console.error('Subscription refresh failed:', err);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.email === 'admin@privacybulkwebp.com';
  const isFree = tier === 'free';
  const isPersonal = tier === 'personal';
  const isPro = tier === 'pro';
  const showAds = isFree;

  const getAllUsers = () => {
    return getMockUsers().map(u => ({
      id: u.id,
      email: u.email,
      tier: u.tier || 'free',
      createdAt: u.createdAt || null,
      subscriptionStart: u.subscriptionStart || null,
      subscriptionEnd: u.subscriptionEnd || null,
    }));
  };

  return {
    user,
    tier,
    subscription,
    loading,
    isAuthenticated,
    isAdmin,
    isFree,
    isPersonal,
    isPro,
    showAds,
    login,
    register,
    logout,
    changePassword,
    checkAuth,
    refreshSubscription,
    getAllUsers,
  };
}
