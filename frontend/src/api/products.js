import axios from './axios';

export const getProductsRequest = async (params = {}) => {
    // params: { search, page, price_min, price_max, brand, tags, categoryId }
    const res = await axios.get('/products', { params });
    return res.data;
};

export const getProductDetailRequest = async (id, slug) => {
    const res = await axios.get(`/p/${id}-${slug}`);
    return res.data;
};

export const getCategoriesRequest = async () => {
    // Si tienes un endpoint público de categorías, úsalo. Si no, quizá debas usar uno protegido o público.
    // Asumiré que hay uno público o que el usuario logueado lo puede ver. 
    // Revisando rutas: router.get('/', verifyToken, controller.getAll); en categories.js es protegido.
    // Necesitamos un endpoint PÚBLICO de categorías para el filtro.
    // Por ahora intentaremos llamar al protegido, si falla (401), el filtro no cargará opciones.
    // Lo ideal sería exponer categorías públicamente.
    try {
        const res = await axios.get('/categories');
        // Backend: { status: 'success', data: { categories: [...] } }
        if (res.data && res.data.data && Array.isArray(res.data.data.categories)) {
            return { categories: res.data.data.categories };
        }
        return { categories: [] };
    } catch (e) {
        console.error("Error fetching categories:", e);
        return { categories: [] };
    }
};
