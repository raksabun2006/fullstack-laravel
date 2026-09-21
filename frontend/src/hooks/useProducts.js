import { useEffect, useState } from 'react';
import { getProducts } from '../api/productApi';

export const useProducts = (params = {}) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const paramsKey = JSON.stringify(params);

    useEffect(() => {
        let isMounted = true;

        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const queryParams = paramsKey ? JSON.parse(paramsKey) : {};
                const data = await getProducts(queryParams);
                if (isMounted) {
                    setProducts(data || []);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || 'Failed to fetch products');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProducts();

        return () => {
            isMounted = false;
        };
    }, [paramsKey]);

    return {
        products,
        loading,
        error,
    };
};
