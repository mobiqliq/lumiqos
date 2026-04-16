import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user_profile');
        
        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, accessToken) => {
        setUser(userData);
        setToken(accessToken);
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('user_profile', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_profile');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
