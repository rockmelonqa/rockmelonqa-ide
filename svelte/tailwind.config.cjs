/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,svelte,ts}"],
    theme: {
        extend: {},
    },
    plugins: [require("@tailwindcss/forms")],
    safelist: [
        {
            pattern: /col-span-+/,
        },
    ],
};
