import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { createOrderRequest } from '../api/orders';
import { useForm } from 'react-hook-form';
import styles from '../style/CheckoutPage.module.css';
import { CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function CheckoutPage() {
    const { cart, totalAmount, clearCart } = useCart();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    // Redirigir si no hay nada en el carrito
    if (cart.length === 0 && !success) {
        return (
            <div className={styles.container}>
                <h2>No hay productos para pagar</h2>
                <Link to="/catalog" className={styles.homeButton}>Ir al Catálogo</Link>
            </div>
        );
    }

    const onSubmit = async (data) => {
        setLoading(true);
        setApiError(null);

        const loadingToast = toast.loading('Procesando pago con el banco...');

        try {
            const orderPayload = {
                items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
                paymentMethod: "CreditCard",
                paymentDetails: {
                    cardNumber: data.cardNumber,
                    cvv: data.cvv,
                    expMonth: data.expMonth,
                    expYear: data.expYear,
                    cardHolder: data.cardHolder,
                    currency: "USD"
                }
            };

            const res = await createOrderRequest(orderPayload);

            toast.dismiss(loadingToast);
            if (res.status === 'success') {
                toast.success('¡Pago Aprobado!');
                setSuccess(true);
                clearCart();
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error(error);
            const msg = error.response?.data?.message || "Error procesando el pago. Intente nuevamente.";
            toast.error(msg); // Toast flotante también
            setApiError(msg); // Mensaje en el UI fijo
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.container}>
                <div className={styles.success}>
                    <CheckCircle className={styles.successIcon} />
                    <h2>¡Pago Exitoso!</h2>
                    <p>Tu orden ha sido procesada correctamente.</p>
                    <Link to="/profile" className={styles.homeButton}>Ver Mis Órdenes</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Checkout Seguro</h1>

            {apiError && <div className={styles.error}>{apiError}</div>}

            <div className={styles.grid}>
                {/* Resumen de Orden */}
                <div className={styles.summary}>
                    <h3 className={styles.sectionTitle}>Resumen de Orden</h3>
                    {cart.map(item => (
                        <div key={item.id} className={styles.summaryItem}>
                            <span>{item.quantity} x {item.name}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className={styles.totalRow}>
                        <span>Total a Pagar:</span>
                        <span>${totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Formulario de Pago */}
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <h3 className={styles.sectionTitle}>Datos de Tarjeta</h3>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Titular de la Tarjeta</label>
                        <input
                            type="text"
                            placeholder="Como aparece en la tarjeta"
                            className={styles.input}
                            {...register("cardHolder", { required: true })}
                        />
                        {errors.cardHolder && <span style={{ color: 'red' }}>Requerido</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Número de Tarjeta</label>
                        <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            className={styles.input}
                            {...register("cardNumber", { required: true, minLength: 13 })}
                        />
                        {errors.cardNumber && <span style={{ color: 'red' }}>Inválido</span>}
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Mes Exp (MM)</label>
                            <input
                                type="text"
                                placeholder="12"
                                maxLength={2}
                                className={styles.input}
                                {...register("expMonth", { required: true, pattern: /^\d{2}$/ })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Año Exp (YYYY)</label>
                            <input
                                type="text"
                                placeholder="2030"
                                maxLength={4}
                                className={styles.input}
                                {...register("expYear", { required: true, pattern: /^\d{4}$/ })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>CVV</label>
                            <input
                                type="text"
                                placeholder="123"
                                maxLength={4}
                                className={styles.input}
                                {...register("cvv", { required: true })}
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.payButton} disabled={loading}>
                        {loading ? 'Procesando...' : `Pagar $${totalAmount.toFixed(2)}`}
                    </button>

                    <Link to="/cart" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', color: '#888' }}>
                        Volver al Carrito
                    </Link>
                </form>
            </div>
        </div>
    );
}

export default CheckoutPage;
