import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles'; // Ensure you include Vuetify styles
import Home from './Home.vue'; // Adjust the import to your actual component path

frappe.provide('frappe.PosApp');


frappe.PosApp.posapp = class {
    constructor({ parent }) {
        this.$parent = $(document);
        this.page = parent.page;
        this.make_body();

    }
    make_body () {
        this.$el = this.$parent.find('.main-section');
        // Vuetify configuration
        const vuetify = createVuetify({
            components,  // Register all Vuetify components
            directives,  // Register all Vuetify directives
            theme: {
                defaultTheme: 'light',  // Set the default theme
                themes: {
                    light: {
                        dark: false,  // Set light theme to not dark mode
                        colors: {
                            background: '#FFFFFF',
                            primary: '#0097A7',
                            secondary: '#00BCD4',
                            accent: '#9575CD',
                            success: '#66BB6A',
                            info: '#2196F3',
                            warning: '#FF9800',
                            error: '#E86674',
                            orange: '#E65100',
                            golden: '#A68C59',
                            badge: '#F5528C',
                            customPrimary: '#085294',
                        },
                    },
                },
            },
            locale: {
                rtl: frappe.utils.is_rtl(),  // Use your utility function to set RTL
            },
        });

        // Vue app initialization
        const app = createApp(Home);

        // Add Vuetify to the app
        app.use(vuetify);

        app.provide('__', window.__ || ((text) => text));
        app.provide('frappe', window.frappe);
        // Mount the app to the DOM element
        app.mount(this.$el[0]);
    }

    setup_header () {

    }

};
