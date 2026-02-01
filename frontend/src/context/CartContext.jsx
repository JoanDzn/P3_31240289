import { createContext, useState, useContext, useEffect } from "react";
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

export const CartProvider = ({ children }) => {
    // Estado inicial desde localStorage
    const [cart, setCart] = useState(() => {
        try {
            const storedCart = localStorage.getItem("cart");
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            console.error("Error parsing cart from localStorage", error);
            return [];
        }
    });

    // Persistir en localStorage cada vez que cambie el carrito
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    // Agregar producto al carrito
    const addToCart = (product) => {
        toast.success('Producto añadido al carrito');

        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex((item) => item.id === product.id);

            if (existingItemIndex >= 0) {
                // Si ya existe, aumentamos la cantidad
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += 1;
                return newCart;
            } else {
                // Si no existe, lo agregamos con cantidad 1
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    // Remover producto del carrito
    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    // Actualizar cantidad manual
    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return; // Mínimo 1

        setCart((prevCart) => {
            return prevCart.map((item) =>
                item.id === productId ? { ...item, quantity: parseInt(quantity) } : item
            );
        });
    };

    // Limpiar carrito
    const clearCart = () => {
        setCart([]);
    };

    // Cálculos derivados
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalAmount
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
