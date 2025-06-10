import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; 
import { getMe } from '../api/user'; 

export const AuthContext = createContext({
    isLoggedIn: false,
    user: null,
    login: () => { },
    logout: () => { },
    isLoading: true,
});

export const AuthContextProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = (userData, token) => {
        localStorage.setItem('accessToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsLoggedIn(true);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        delete axios.defaults.headers.common['Authorization'];
        setIsLoggedIn(false);
        setUser(null);
    };

    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {

                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {

                    const response = await getMe();

                    if (response.status === 200) {
                        const userData = response.data;
                        setIsLoggedIn(true);
                        setUser(userData);
                    } else {

                        console.error('Risposta API non OK durante la verifica del token. Status:', response.status);
                        logout();
                    }
                } catch (error) {
                    console.error('Errore durante la verifica del token:', error);

                    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
                        console.error('Unauthorized: Esecuzione del logout.');
                    }
                    logout();
                }
            }
            setIsLoading(false);
        };

        checkLoginStatus();
    }, []);


    const contextValue = {
        isLoggedIn,
        user,
        login,
        logout,
        isLoading,
    };


    if (isLoading) {
        return null;
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
