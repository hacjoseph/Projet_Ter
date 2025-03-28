// 


import api from './axios';

export const login = async (credentials) => {
    try {
        const response = await api.post('/token/', credentials);
        const { access, refresh } = response.data;

        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);

        const userResponse = await api.get('/users/me/');
        const user = userResponse.data;

        return { user, tokens: { access, refresh } };
    } catch (error) {
        // Nettoyage en cas d'erreur
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Redirection immédiate
    window.location.href = '/login';
};

export const refreshToken = async () => {
    try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token');

        const response = await api.post('/token/refresh/', { refresh });
        return response.data;
    } catch (error) {
        logout(); // Déconnexion si le refresh échoue
        throw error;
    }
};

// Vérifie si le token est expiré (optionnel)
export const isTokenValid = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};