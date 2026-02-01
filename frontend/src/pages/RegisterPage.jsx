import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import styles from './LoginPage.module.css'; // Reutilizamos estilos

function RegisterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signup, isAuthenticated, errors: registerErrors } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) navigate("/profile");
    }, [isAuthenticated]);

    const onSubmit = handleSubmit(async (data) => {
        const res = await signup(data);
        if (res && res.status === 'success') {
            // Si el registro es exitoso pero no loguea (backend actual), redirigir a login
            navigate("/login");
        }
    });

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                {registerErrors && registerErrors.map((error, i) => (
                    <div className={styles.alert} key={i}>
                        {error}
                    </div>
                ))}

                <h1 className={styles.title}>JOAN'S FIX</h1>
                <p className={styles.subtitle}>Crea tu cuenta nueva</p>

                <form onSubmit={onSubmit}>
                    <div className={styles.formGroup}>
                        <input type="text"
                            {...register("fullName", { required: true })}
                            className={styles.input}
                            placeholder="Nombre Completo"
                        />
                        {errors.fullName && <p className={styles.error}>Nombre es requerido</p>}
                    </div>

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
                            {...register("password", { required: true, minLength: 6 })}
                            className={styles.input}
                            placeholder="Contraseña"
                        />
                        {errors.password && <p className={styles.error}>Contraseña requerida (min 6 caracteres)</p>}
                    </div>

                    <button type="submit" className={styles.button}>
                        Registrarse
                    </button>
                </form>

                <p className={styles.linkBox}>
                    ¿Ya tienes cuenta? <Link to="/login" className={styles.link}>Inicia Sesión</Link>
                </p>
            </div>
        </div>
    )
}

export default RegisterPage;
