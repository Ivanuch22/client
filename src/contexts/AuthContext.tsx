import React, { createContext, useContext, useState, useEffect, ReactNode, FunctionComponent } from 'react';
import Cookies from "js-cookie";

interface AuthContextType {
    isLogin: boolean;
    userData: any;
    updateUser: () => void;
    logout: () => void;
    login: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: FunctionComponent<AuthProviderProps> = ({ children }) => {
    const [isLogin, setIsLogin] = useState<boolean>(!!Cookies.get('userToken'));
    const [userData, setUserData] = useState(Cookies.get("user"));

    // Оновлення авторизаційного статусу при зміні куків
    useEffect(() => {
        const checkAuthStatus = () => {
            const token = Cookies.get('userToken');
            if (!token) {
                setIsLogin(false);
            } else {
                setIsLogin(true);
            }
        };

        // Перевірка на зміни в куках кожного разу, коли компонент рендериться
        const interval = setInterval(() => {
            checkAuthStatus();
        }, 1000); // Перевіряти кожну секунду (можна налаштувати цей час)

        return () => clearInterval(interval); // Очищення інтервалу при розмонтуванні компонента
    }, []);

    // Відслідковування змін через подію storage (якщо куки змінюються в іншій вкладці)
    useEffect(() => {
        const handleStorageChange = () => {
            const token = Cookies.get('userToken');
            if (!token) {
                setIsLogin(false);
            } else {
                setIsLogin(true);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    function logout() {
        Cookies.remove('userName');
        Cookies.remove('userToken');
        Cookies.remove('user');
        setIsLogin(false);
    };

    function login() {
        setIsLogin(true);
    }

    function updateUser() {
        setUserData(Cookies.get("user"));
    }

    return (
        <AuthContext.Provider value={{ isLogin, userData, logout, login, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
