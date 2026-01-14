import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import DataTable from '../components/common/DataTable';
import { crudApi } from '../api/crud';
import { toast } from 'react-hot-toast';
import { Link as LinkIcon, Image, Youtube } from 'lucide-react';

export default function ActivityManager() {
    const [activities, setActivities] = useState([]);
    const [view, setView] = useState('list'); // 'list' | 'media'
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [mediaList, setMediaList] = useState([]);

    useEffect(() => { loadActivities(); }, []);

    const loadActivities = () => crudApi.getAll('activity').then(res => setActivities(res.data));

    // Cargar multimedia de una actividad específica
    const loadMedia = async (activity) => {
        setSelectedActivity(activity);
        try {
            const { data } = await crudApi.getAll('activity_media', { ActivityID: activity.ActivityID });
            setMediaList(data);
            setView('media');
        } catch (e) { toast.error('Error cargando media'); }
    };

    const handleAddMedia = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {
            ActivityID: selectedActivity.ActivityID,
            MediaType: formData.get('type'),
            MediaURL: formData.get('url'),
            Description: formData.get('description')
        };
        
        try {
            await crudApi.create('activity_media', payload);
            toast.success('Recurso añadido');
            loadMedia(selectedActivity); // Recargar
            e.target.reset();
        } catch (e) { toast.error('Error guardando'); }
    };

    if (view === 'media') {
        return (
            <Layout>
                <div className="mb-4">
                    <button onClick={() => setView('list')} className="text-blue-600 hover:underline">← Volver a Actividades</button>
                </div>
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Formulario de Subida */}
                    <div className="lg:w-1/3 bg-white p-6 rounded-lg shadow h-fit">
                        <h3 className="font-bold text-lg mb-4">Añadir Recurso a: {selectedActivity.Name}</h3>
                        <form onSubmit={handleAddMedia} className="space-y-4">
                            <select name="type" className="w-full border p-2 rounded" required>
                                <option value="Image">Imagen (URL)</option>
                                <option value="Video">Video (YouTube/Vimeo)</option>
                                <option value="Document">Documento (Link)</option>
                            </select>
                            <input name="url" placeholder="https://..." className="w-full border p-2 rounded" required />
                            <input name="description" placeholder="Descripción corta" className="w-full border p-2 rounded" />
                            <button className="w-full bg-purple-600 text-white py-2 rounded font-bold">Añadir Recurso</button>
                        </form>
                    </div>

                    {/* Galería */}
                    <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {mediaList.length === 0 && <p className="text-gray-400 col-span-2 text-center py-10">No hay recursos adjuntos.</p>}
                        {mediaList.map(m => (
                            <div key={m.MediaID} className="bg-white p-4 rounded border hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-2">
                                    {m.MediaType === 'Image' && <Image className="text-blue-500" />}
                                    {m.MediaType === 'Video' && <Youtube className="text-red-500" />}
                                    {m.MediaType === 'Document' && <LinkIcon className="text-gray-500" />}
                                    <button onClick={async () => {
                                        await crudApi.remove('activity_media', m.MediaID);
                                        loadMedia(selectedActivity);
                                    }} className="text-red-400 hover:text-red-600 text-xs">Borrar</button>
                                </div>
                                <p className="font-bold text-gray-800 truncate">{m.Description || 'Sin descripción'}</p>
                                <a href={m.MediaURL} target="_blank" rel="noreferrer" className="text-xs text-blue-500 truncate block mt-1 hover:underline">
                                    {m.MediaURL}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </Layout>
        );
    }

    // Vista de Lista (Por defecto)
    const columns = [
        { header: 'Actividad', accessor: 'Name' },
        { header: 'Fecha', accessor: 'ScheduledDate', render: i => new Date(i.ScheduledDate).toLocaleDateString() },
        { header: 'Tipo', accessor: 'ActivityType' },
        { 
            header: 'Multimedia', 
            accessor: 'media',
            render: (item) => (
                <button 
                    onClick={() => loadMedia(item)}
                    className="text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-xs font-bold hover:bg-purple-100"
                >
                    Gestionar Recursos
                </button>
            )
        }
    ];

    return (
        <Layout>
            <DataTable 
                title="Gestor de Actividades"
                data={activities}
                columns={columns}
                searchPlaceholder="Buscar actividad..."
                onCreate={() => toast('Aquí modal crear actividad')}
            />
        </Layout>
    );
}