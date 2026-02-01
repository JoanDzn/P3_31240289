import { createContext, useState, useContext, useEffect } from 'react';
import { registerRequest, loginRequest } from '../api/auth';
import axios from '../api/axios';

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);

    const signup = async (user) => {
        try {
            const res = await registerRequest(user);
            // El backend retorna { status: 'success', data: { user: {...} } }
            // No retorna token en registro automáticamente según swagger (solo user), 
            // pero el usuario puede iniciar sesión después.
            // Si el backend retornara token en registro login automático, sería ideal.
            // Según swagger: /auth/register -> status success, data user. No token.
            // Así que el registro SOLO registra.
            setUser(res.data.data.user);
            setIsAuthenticated(false); // No logueado, necesita login.
            return res.data;
        } catch (error) {
            console.error(error.response?.data);
            const errData = error.response?.data;
            if (Array.isArray(errData)) {
                return setErrors(errData.map(e => e.msg));
            } else if (errData?.data && Array.isArray(errData.data)) {
                // JSend fail with validation array
                return setErrors(errData.data.map(e => e.msg));
            }
            setErrors([errData?.message || errData?.data?.message || "Error en registro"]);
        }
    };

    const signin = async (user) => {
        try {
            const res = await loginRequest(user);
            // El backend retorna { status: 'success', data: { token: '...' } }
            // Pero NO retorna datos de usuario en /auth/login, solo el token.
            // Necesitamos decodificar el token o hacer fetch del user.
            // El token suele tener payload con datos básicos (id, email).
            // O podemos hacer un request a /users/me si existiera.
            // Pero como no existe, decodificaremos el token o asumiremos login exitoso y guardaremos el token.

            const token = res.data.data.token;
            const userData = res.data.data.user; // Ahora el backend devuelve esto

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData)); // Guardar datos de usuario

            // Configurar token en axios por defecto
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Intentar obtener datos del usuario (opcional si el token no tiene data)
            // Decodificar JWT (básico) para obtener ID si es posible, o simplemente poner isAuthenticated=true
            // El backend usa JWT.

            setIsAuthenticated(true);
            setUser({ token, ...userData }); // Guardamos usuario completo en estado
            setLoading(false);
            return res.data;
        } catch (error) {
            console.error(error);
            const errData = error.response?.data;
            if (Array.isArray(errData)) {
                return setErrors(errData.map(e => e.msg));
            } else if (errData?.data && Array.isArray(errData.data)) {
                // JSend fail with validation array
                return setErrors(errData.data.map(e => e.msg));
            } else if (errData?.data?.message) {
                return setErrors([errData.data.message]);
            }
            setErrors([errData?.message || "Error en inicio de sesión"]);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        delete axios.defaults.headers.common['Authorization'];
    };

    useEffect(() => {
        async function checkLogin() {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            try {
                // Verificar si el token es válido haciendo una petición dummy a user list restringida? 
                // O mejor, asumimos válido si existe y manejamos 401 globalmente.
                // Por ahora, asumimos válido.
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setIsAuthenticated(true);

                // Intentar recuperar usuario del storage
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser({ token, ...JSON.parse(storedUser) });
                } else {
                    setUser({ token });
                }

                setLoading(false);
            } catch (error) {
                setIsAuthenticated(false);
                setLoading(false);
            }
        }
        checkLogin();
    }, []);

    // Limpiar errores después de 5 seg
    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([]);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    return (
        <AuthContext.Provider value={{
            signup,
            signin,
            logout,
            user,
            isAuthenticated,
            errors,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    )
}
