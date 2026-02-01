import axios from './axios';

export const createOrderRequest = async (orderData) => {
    // orderData: { items, paymentMethod, paymentDetails }
    const res = await axios.post('/orders', orderData);
    return res.data;
};

export const getMyOrdersRequest = async () => {
    const res = await axios.get('/orders');
    return res.data;
};
