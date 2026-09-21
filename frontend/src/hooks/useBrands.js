import { useEffect, useState } from 'react';
import { getBrands } from '../api/brandApi';

export const useBrands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchBrands = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getBrands();
                if (isMounted) {
                    setBrands(data || []);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || 'Failed to fetch brands');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchBrands();

        return () => {
            isMounted = false;
        };
    }, []);

    return {
        brands,
        loading,
        error,
    };
};
