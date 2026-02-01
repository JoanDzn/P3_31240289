import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from '../style/CartPage.module.css';
import { Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';

function CartPage() {
    const { cart, removeFromCart, updateQuantity, clearCart, totalAmount, totalItems } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <ShoppingCart size={64} color="#555" />
                <h2>Tu carrito está vacío</h2>
                <p>¡Explora nuestro catálogo y encuentra los mejores repuestos!</p>
                <Link to="/catalog" className={styles.backButton}>Ir al Catálogo</Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link to="/catalog" className={styles.linkBack}>
                    <ArrowLeft size={18} /> Volver al Catálogo
                </Link>
                <h1>Carrito de Compras ({totalItems} items)</h1>
            </header>

            <div className={styles.grid}>
                {/* Listado de Productos */}
                <div className={styles.itemsList}>
                    {cart.map(item => (
                        <div key={item.id} className={styles.cartItem}>
                            <img
                                src={item.imageUrl || `https://via.placeholder.com/80?text=${item.brand}`}
                                alt={item.name}
                                className={styles.image}
                            />

                            <div className={styles.info}>
                                <h3>{item.name}</h3>
                                <span className={styles.brand}>{item.brand}</span>
                                <span className={styles.unitPrice}>${item.price.toFixed(2)}</span>
                            </div>

                            <div className={styles.controls}>
                                <button
                                    className={styles.qtyBtn}
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                >-</button>
                                <span className={styles.qty}>{item.quantity}</span>
                                <button
                                    className={styles.qtyBtn}
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >+</button>
                            </div>

                            <div className={styles.subtotal}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </div>

                            <button
                                className={styles.deleteBtn}
                                onClick={() => removeFromCart(item.id)}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}

                    <button className={styles.clearBtn} onClick={clearCart}>
                        Vaciar Carrito
                    </button>
                </div>

                {/* Resumen de Pago */}
                <div className={styles.summary}>
                    <h2>Resumen del Pedido</h2>
                    <div className={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Envío</span>
                        <span>Gratis</span>
                    </div>
                    <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>Total a Pagar</span>
                        <span>${totalAmount.toFixed(2)}</span>
                    </div>

                    <button
                        className={styles.checkoutBtn}
                        onClick={() => navigate('/checkout')}
                    >
                        Proceder al Pago
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CartPage;
