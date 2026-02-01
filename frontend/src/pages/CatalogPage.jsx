import { useState, useEffect } from "react";
import { getProductsRequest, getCategoriesRequest } from "../api/products";
import ProductCard from "../components/ProductCard";
import styles from "../style/CatalogPage.module.css";
import { Search, Filter, ShoppingCart, LogOut, ChevronDown, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from 'react-router-dom';
import Footer from "../components/Footer";
import logo from "../assets/logo.png";
import backgroundVideo from "../assets/video.mp4";

function CatalogPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: "",
        minPrice: "",
        maxPrice: "",
        categoryId: "", /* Cambiado de brand a categoryId */
        page: 1
    });

    const { totalItems } = useCart();
    const { logout } = useAuth(); // Obtener logout del contexto
    const navigate = useNavigate();

    // ... (rest of code) ...

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Cargar Categorías
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await getCategoriesRequest();
                if (res.categories) {
                    setCategories(res.categories);
                }
            } catch (error) {
                console.error("Error loading categories", error);
            }
        };
        loadCategories();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await getProductsRequest({
                search: filters.search,
                price_min: filters.minPrice,
                price_max: filters.maxPrice,
                category: filters.categoryId, /* Pasamos categoryId como 'category' para el backend */
                page: filters.page
            });

            if (res.status === 'success') {
                setProducts(res.data.products || []);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
    };



    const scrollToCatalog = () => {
        const element = document.getElementById('catalog-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className={styles.container}>
            {/* Botón de Cerrar Sesión (Flotante Arriba Derecha) */}
            <button onClick={handleLogout} className={styles.logoutFixed} title="Cerrar Sesión">
                <LogOut size={20} />
            </button>

            {/* Botón de Perfil (Flotante, izquierda de Logout) */}
            <Link to="/profile" className={styles.profileFab} title="Mi Perfil">
                <User size={20} />
            </Link>

            {/* --- HERO SECTION (Landing Page con Video) --- */}
            <header className={styles.hero}>

                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={styles.videoBg}
                    poster="https://images.unsplash.com/photo-1558981806-ec527fa84f3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                >
                    <source src={backgroundVideo} type="video/mp4" />
                    Tu navegador no soporta videos HTML5.
                </video>

                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContent}>
                    <img src={logo} alt="Joan's Fix Logo" className={styles.heroLogo} />
                    <h1 className={styles.heroTitle}>JOAN'S FIX</h1>
                    <h2 className={styles.heroSubtitle}>Potencia tu pasión con los mejores repuestos</h2>
                    <button className={styles.heroButton} onClick={scrollToCatalog}>
                        Explorar Catálogo <ChevronDown size={20} style={{ marginLeft: '10px', verticalAlign: 'middle' }} />
                    </button>
                </div>
            </header>

            {/* --- CONTENIDO PRINCIPAL (Sidebar + Grid) --- */}
            <div className={styles.contentWrapper} id="catalog-section">

                {/* Sidebar de Filtros */}
                <aside className={styles.sidebar}>
                    <div className={styles.logoArea}>
                        <img src={logo} alt="Logo" className={styles.logoImage} />
                        <h2 className={styles.logo} style={{ fontSize: '1.2rem' }}>JOAN'S FIX</h2>
                        <p className={styles.tagline}>Filtrar y Buscar</p>
                    </div>

                    <div className={styles.filterGroup}>
                        <label><Search size={16} /> Buscar</label>
                        <input
                            type="text"
                            name="search"
                            placeholder="Nombre del repuesto..."
                            value={filters.search}
                            onChange={handleFilterChange}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label><Filter size={16} /> Precio</label>
                        <div className={styles.row}>
                            <input
                                type="number"
                                name="minPrice"
                                placeholder="Min"
                                value={filters.minPrice}
                                onChange={handleFilterChange}
                                className={styles.miniInput}
                            />
                            <input
                                type="number"
                                name="maxPrice"
                                placeholder="Max"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                                className={styles.miniInput}
                            />
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Categoría</label>
                        <select
                            name="categoryId"
                            value={filters.categoryId}
                            onChange={handleFilterChange}
                            className={styles.select}
                        >
                            <option value="">Todas</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </aside>

                {/* Grid de Productos */}
                <main className={styles.main}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                            <div className="spinner"></div>
                            <p style={{ marginTop: '20px', color: '#888' }}>Cargando catálogo...</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.grid}>
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            {products.length === 0 && (
                                <div className={styles.empty}>
                                    <p>No se encontraron productos con estos filtros.</p>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* --- FOOTER --- */}
            <Footer />

            {/* Botón Flotante del Carrito */}
            {totalItems > 0 && (
                <Link to="/cart" className={styles.cartFab}>
                    <ShoppingCart size={24} />
                    <span className={styles.badge}>{totalItems}</span>
                </Link>
            )}
        </div>
    );
}

export default CatalogPage;
