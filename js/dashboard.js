import supabase from 'supabaseClient';

document.addEventListener('DOMContentLoaded', async () => {
    // Protección de ruta
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        // No hay sesión, redirigir al login
        window.location.href = '/';
        return; // Detener la ejecución del resto del script
    }

    // Asegurar que exista el usuario interno mapeado a AuthUserID
    async function ensureAppUser() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: appUser, error: selErr } = await supabase
                .from('user')
                .select('UserID')
                .eq('AuthUserID', user.id)
                .maybeSingle();
            if (selErr) {
                console.warn('No se pudo consultar usuario interno:', selErr.message);
                return;
            }
            if (!appUser) {
                // Intentar enlazar por email si ya existe el usuario sin AuthUserID
                if (user.email) {
                    const { data: byEmail } = await supabase
                        .from('user')
                        .select('UserID, AuthUserID')
                        .eq('Email', user.email)
                        .maybeSingle();
                    if (byEmail && !byEmail.AuthUserID) {
                        const { error: updErr } = await supabase
                            .from('user')
                            .update({ AuthUserID: user.id })
                            .eq('UserID', byEmail.UserID);
                        if (updErr) console.warn('No se pudo actualizar AuthUserID:', updErr.message);
                        return;
                    } else if (byEmail && byEmail.AuthUserID) {
                        return; // ya enlazado por email
                    }
                }
                // Si no existe, crearlo
                const username = (user.email || user.id).split('@')[0];
                const { error: insErr } = await supabase.from('user').insert({
                    UserName: username,
                    Email: user.email || `${user.id}@example.local`,
                    FirstName: '',
                    LastName: '',
                    IsActive: 1,
                    AuthUserID: user.id,
                });
                if (insErr) console.warn('No se pudo crear usuario interno:', insErr.message);
            }
        } catch (e) {
            console.warn('ensureAppUser error:', e?.message || e);
        }
    }
    await ensureAppUser();

    const mainContent = document.getElementById('main-content');
    const pageTitle = document.getElementById('page-title');
    const logoutButton = document.getElementById('logoutButton');
    const welcomeMessage = document.querySelector('header span');
    let mustChange = false;
    try {
        const { data: appUser } = await supabase
            .from('user')
            .select('FirstName, LastName, UserName')
            .eq('AuthUserID', session.user.id)
            .maybeSingle();
        const fullName = [appUser?.FirstName, appUser?.LastName].filter(Boolean).join(' ').trim();
        const display = fullName || appUser?.UserName || session.user.email || 'Usuario';
        if (welcomeMessage) welcomeMessage.textContent = `Bienvenido, ${display}`;
        // Revisar flag de cambio de contraseña en metadata
        const { data: uinfo } = await supabase.auth.getUser();
        mustChange = !!uinfo?.user?.user_metadata?.must_change_password;
    } catch (_) {
        if (welcomeMessage && session.user.email) {
            welcomeMessage.textContent = `Bienvenido, ${session.user.email}`;
        }
    }

    // Cargar contenido dinámicamente
    window.loadContent = async (url, title) => {
        if (mustChange && url !== '/html/change-password.html') {
            // Forzar a la página de cambio de contraseña
            url = '/html/change-password.html';
            title = 'Cambiar contraseña';
        }
        try {
            if (url === '#' || !url) return;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('No se pudo cargar la página.');
            }
            const content = await response.text();
            mainContent.innerHTML = content;
            pageTitle.textContent = title;

            // Cargar script asociado con cache-busting para re-ejecutar módulos
            const scriptUrl = url.replace('.html', '.js');
            try {
                const headResp = await fetch(scriptUrl, { method: 'HEAD' });
                if (headResp.ok) {
                    await import(`${scriptUrl}?v=${Date.now()}`);
                }
            } catch (_) { /* ignore */ }

        } catch (error) {
            mainContent.innerHTML = `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong class="font-bold">Error:</strong>
                <span class="block sm:inline">${error.message}</span>
            </div>`;
        }
    };

    // Si debe cambiar contraseña, cargar la vista al inicio y bloquear clicks del sidebar
    if (mustChange) {
        window.loadContent('/html/change-password.html', 'Cambiar contraseña');
        const nav = document.getElementById('sidebar-nav');
        if (nav) {
            nav.addEventListener('click', (e) => {
                const a = e.target.closest('a');
                if (!a) return;
                e.preventDefault();
                window.loadContent('/html/change-password.html', 'Cambiar contraseña');
            });
        }
    }
    
    // Manejar cierre de sesión
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error al cerrar sesión:', error);
                alert('No se pudo cerrar la sesión.');
            } else {
                window.location.href = '/';
            }
        });
    }
});