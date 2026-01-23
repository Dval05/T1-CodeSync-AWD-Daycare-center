import { useState, useEffect } from 'react';
import { crudApi } from '../api/crud';

export const useGrades = () => {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadGrades = async () => {
        try {
            setLoading(true);
            const { data } = await crudApi.getAll('grade', { IsActive: 1 });
            setGrades(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGrades();
    }, []);

    return { grades, loading, error, reload: loadGrades };
};
