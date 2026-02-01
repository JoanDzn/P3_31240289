import { useNavigate } from "react-router-dom";
import styles from "../style/ProductCard.module.css";
import { Plus } from "lucide-react";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const fallbackImages = [
        'images1.jpg', 'images2.png', 'images3.webp', 'images4.png',
        'images5.jpg', 'images6.jpg', 'images7.jpg', 'images8.png',
        'images9.jpg', 'images10.webp', 'images11.png', 'images12.png',
        'images13.png'
    ];

    // Si tiene imagen, usarla. Si no, usar una determinista basada en el ID.
    // Usamos el ID para que el mismo producto siempre tenga la misma imagen "random".
    const defaultImg = product.id
        ? `/img/products/${fallbackImages[product.id % fallbackImages.length]}`
        : `/img/products/images1.jpg`;

    const imgUrl = product.imageUrl || defaultImg;

    const handleImageError = (e) => {
        e.target.src = '/img/products/images1.jpg'; // Fallback final seguro
        e.target.onerror = null; // Prevenir loop infinito
    };

    return (
        <div className={styles.card} onClick={() => navigate(`/p/${product.id}-${product.slug}`)}>
            <div className={styles.imageContainer}>
                <img
                    src={imgUrl}
                    alt={product.name}
                    className={styles.image}
                    onError={handleImageError}
                />
                <div className={styles.badge}>{product.brand}</div>
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{product.name}</h3>
                <p className={styles.desc}>
                    {product.description?.substring(0, 50)}...
                </p>

                <div className={styles.footer}>
                    <span className={styles.price}>${product.price}</span>
                    <button
                        className={styles.btnAdd}
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                            // Podríamos poner un toast aquí
                        }}
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
