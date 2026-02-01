import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import styles from './LoginPage.module.css';

function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signin, errors: signinErrors, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) navigate("/catalog");
    }, [isAuthenticated]);

    const onSubmit = handleSubmit(async (data) => {
        signin(data);
    });

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                {signinErrors.map((error, i) => (
                    <div className={styles.alert} key={i}>
                        {error}
                    </div>
                ))}

                <h1 className={styles.title}>JOAN'S FIX</h1>
                <p className={styles.subtitle}>Accede a tu cuenta de repuestos</p>

                <form onSubmit={onSubmit}>
                    <div className={styles.formGroup}>
                        <input type="email"
                            {...register("email", { required: true })}
                            className={styles.input}
                            placeholder="Email"
                        />
                        {errors.email && <p className={styles.error}>Email es requerido</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <input type="password"
                            {...register("password", { required: true })}
                            className={styles.input}
                            placeholder="Contraseña"
                        />
                        {errors.password && <p className={styles.error}>Contraseña es requerida</p>}
                    </div>

                    <button type="submit"
                        className={styles.button}
                    >
                        Iniciar Sesión
                    </button>
                </form>

                <p className={styles.linkBox}>
                    ¿No tienes cuenta? <Link to="/register" className={styles.link}>Regístrate</Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage;
