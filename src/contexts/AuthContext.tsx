
import React, { createContext, useContext, useState, ReactNode, FunctionComponent } from 'react';
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
        setUserData(Cookies.get("user"))
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
