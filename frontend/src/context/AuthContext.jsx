import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { login, logout, refreshToken, isTokenValid } from '../api/Authentification';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const valid = await isTokenValid();
                    if (valid) {
                        const userResponse = await api.get('/users/me/');
                        setUser(userResponse.data);
                    } else {
                        const refreshed = await refreshToken();
                        if (refreshed) {
                            const userResponse = await api.get('/users/me/');
                            setUser(userResponse.data);
                        } else {
                            logout();
                            setUser(null);
                        }
                    }
                } catch (error) {
                    console.error('Erreur lors de la vérification de l\'authentification :', error);
                    logout();
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const signIn = async (credentials) => {
        try {
            const { user, tokens } = await login(credentials);
            setUser(user);
            return { user, tokens };
        } catch (error) {
            console.error('Erreur lors de la connexion :', error);
            throw error;
        }
    };

    const signOut = () => {
        logout();
        setUser(null);
    };

    const isAdmin = useMemo(() => user?.role === 'admin', [user]);

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, loading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);