import axios from './axios';

export const registerRequest = (user) => axios.post('/auth/register', user);

export const loginRequest = (user) => axios.post('/auth/login', user);

export const verifyTokenRequest = () => axios.get('/auth/verify'); // Si existiera, pero no existe. Usaremos persistencia local por ahora
// Si el backend tuviera `/auth/profile` que retorna usuario autenticado, lo usaría aquí para Check Auth.
// Como no, el auth es stateless (el cliente guarda el token), así que el "Check Auth" es solo verificar que el token es válido con alguna petición protegida (ej: /users/profile o /users/me).
// El backend tiene /users/id protected. Podría usar /users/my-id si supiera el ID.
// Pero el login devuelve el User completo. Así que guardaré User + Token.
