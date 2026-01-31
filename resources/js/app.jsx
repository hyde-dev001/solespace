import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';
import { QueryProvider } from './providers/QueryProvider';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        if (name.startsWith('ERP/')) {
            const erpName = name.replace(/^ERP\//, '');
            return resolvePageComponent(`./components/ERP/${erpName}.tsx`, import.meta.glob('./components/ERP/**/*.tsx'));
        }
        return resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx'));
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        
        // Check if the current page is a user-side page (should not have dark mode)
        const isUserSidePage = props.initialPage.component.startsWith('UserSide/');

        // Always wrap with QueryProvider for global state management
        if (isUserSidePage) {
            root.render(
                <QueryProvider>
                    <ThemeProvider>
                        <App {...props} />
                    </ThemeProvider>
                </QueryProvider>
            );
        } else {
            root.render(
                <QueryProvider>
                    <ThemeProvider>
                        <SidebarProvider>
                            <App {...props} />
                        </SidebarProvider>
                    </ThemeProvider>
                </QueryProvider>
            );
        }
    },
    progress: {
        color: '#465fff',
    },
});
