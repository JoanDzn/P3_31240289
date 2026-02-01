import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyOrdersRequest } from "../api/orders";
import styles from "../style/ProfilePage.module.css";
import { Link } from "react-router-dom";
import { Package, Clock } from "lucide-react";

function ProfilePage() {
    const { logout, user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadOrders() {
            try {
                const res = await getMyOrdersRequest();
                if (res.status === 'success') {
                    // La API devuelve { data: { orders: [...] } }
                    setOrders(res.data.orders);
                }
            } catch (error) {
                console.error("Error cargando historial:", error);
            } finally {
                setLoading(false);
            }
        }
        loadOrders();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Hola, {user ? user.fullName : 'Usuario'}</h1>
                    <p style={{ color: '#666', marginTop: '5px' }}>Gestiona tu cuenta y pedidos</p>
                </div>
                <div className={styles.userInfo}>
                    <Link to="/catalog" style={{ color: '#ff6b00', textDecoration: 'none', fontWeight: 'bold' }}>
                        Ir al Catálogo &rarr;
                    </Link>
                </div>
            </header>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <Package size={20} style={{ marginRight: '10px', verticalAlign: 'bottom' }} />
                    Historial de Pedidos
                </h2>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#888' }}>Cargando pedidos...</div>
                ) : orders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No has realizado ninguna compra aún.</p>
                        <Link to="/catalog" style={{ color: '#ff6b00' }}>¡Empieza a comprar ahora!</Link>
                    </div>
                ) : (
                    <div className={styles.orderList}>
                        {orders.map(order => (
                            <div key={order.id} className={styles.orderCard}>
                                <div className={styles.orderHeader}>
                                    <span className={styles.orderId}>Orden #{order.id}</span>
                                    <span className={styles.orderDate}>
                                        <Clock size={14} style={{ marginRight: '5px', verticalAlign: 'text-bottom' }} />
                                        {formatDate(order.createdAt)}
                                    </span>
                                </div>

                                <div className={styles.itemsContainer}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className={styles.itemRow}>
                                            {/* Manejamos item.product que puede ser null si se borró */}
                                            <span>{item.quantity} x {item.product ? item.product.name : 'Producto Desconocido'}</span>
                                            <span>${item.unitPrice}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.orderInfo}>
                                    <span className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
                                        {order.status}
                                    </span>
                                    <span className={styles.total}>
                                        Total: ${order.totalAmount}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;
