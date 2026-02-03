import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        
        // Check if the current page is a user-side page (should not have dark mode)
        const isUserSidePage = props.initialPage.component.startsWith('UserSide/');

        // Only wrap admin and shop owner pages with ThemeProvider, not user-side pages
        if (isUserSidePage) {
            root.render(<App {...props} />);
        } else {
            root.render(
                <ThemeProvider>
                    <SidebarProvider>
                        <App {...props} />
                    </SidebarProvider>
                </ThemeProvider>
            );
        }
    },
    progress: {
        color: '#465fff',
    },
}).catch(err => console.error(err));
