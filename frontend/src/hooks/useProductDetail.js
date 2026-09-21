import { useEffect, useState } from 'react';
import { getProductById } from '../api/productApi';

export const useProductDetail = (id) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        let isMounted = true;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getProductById(id);
                if (isMounted) {
                    setProduct(data);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || 'Failed to fetch product details');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProduct();

        return () => {
            isMounted = false;
        };
    }, [id]);

    return {
        product,
        loading,
        error,
    };
};
