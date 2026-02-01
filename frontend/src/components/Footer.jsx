import styles from '../style/Footer.module.css';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Heart } from 'lucide-react';
import logo from '../assets/logo.png'; // Importamos el logo

function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.column}>
                    <img src={logo} alt="Joan's Fix Logo" className={styles.logoImage} />
                    <h2 className={styles.logo}>JOAN'S FIX</h2>
                    <p className={styles.description}>
                        Especialistas en repuestos y accesorios de alta calidad para motocicletas.
                        Brindamos soluciones confiables para que tu moto siempre rinda al máximo.
                    </p>
                    <div className={styles.socialIcons}>
                        <a href="https://facebook.com" className={styles.socialIcon}><Facebook size={20} /></a>
                        <a href="https://instagram.com" className={styles.socialIcon}><Instagram size={20} /></a>
                        <a href="https://twitter.com" className={styles.socialIcon}><Twitter size={20} /></a>
                    </div>
                </div>

                <div className={styles.column}>
                    <h3 className={styles.heading}>Enlaces Rápidos</h3>
                    <ul className={styles.linkList}>
                        <li><a href="#catalog-section">Catálogo</a></li>
                        <li><a href="#">Sobre Nosotros</a></li>
                        <li><a href="#">Términos y Condiciones</a></li>
                        <li><a href="#">Política de Devolución</a></li>
                    </ul>
                </div>

                <div className={styles.column}>
                    <h3 className={styles.heading}>Contacto</h3>
                    <div className={styles.contactInfo}>
                        <div className={styles.infoItem}>
                            <MapPin size={18} color="#ff6b00" />
                            <span>Calle Páez, Calle Laso Marti, San Juan de los Morros, Guárico</span>
                        </div>
                        <div className={styles.infoItem}>
                            <Phone size={18} color="#ff6b00" />
                            <span>+58 (412) 865-4997</span>
                        </div>
                        <div className={styles.infoItem}>
                            <Mail size={18} color="#ff6b00" />
                            <span>contacto@joansfix.com</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.bottomBar}>
                <p>© {new Date().getFullYear()} Joan's Fix. Todos los derechos reservados.</p>
                <p style={{ marginTop: '10px' }}>
                    Hecho con <Heart size={14} className={styles.heart} fill="#ff4d4d" /> por Joan García
                </p>
            </div>
        </footer>
    );
}

export default Footer;
