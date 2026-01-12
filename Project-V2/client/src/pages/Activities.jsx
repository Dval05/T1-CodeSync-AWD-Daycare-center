import React, { useEffect, useState } from 'react';
import { businessApi } from '../api/business';
import Layout from '../components/layout/Layout';

export default function Activities() {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        // Esta llamada es "mágica": El backend decide qué mostrar basado en el rol
        businessApi.activities.myFeed()
            .then(res => setActivities(res.data))
            .catch(console.error);
    }, []);

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Actividades</h2>
            </div>
            
            <div className="grid gap-4">
                {activities.length === 0 && <p className="text-gray-500">No hay actividades para mostrar.</p>}
                
                {activities.map(act => (
                    <div key={act.ActivityID} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-lg">{act.Name}</h3>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{act.ScheduledDate}</span>
                        </div>
                        <p className="text-gray-600 mt-1">{act.Description}</p>
                        <div className="mt-2 text-sm text-blue-600 font-semibold">
                            {act.grade?.GradeName}
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
}