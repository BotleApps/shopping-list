/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2563eb', // blue-600
                    dark: '#1d4ed8', // blue-700
                },
                secondary: {
                    DEFAULT: '#475569', // slate-600
                    dark: '#334155', // slate-700
                }
            }
        },
    },
    plugins: [],
    darkMode: 'class', // or 'media'
}
