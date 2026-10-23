// Own PostCSS config: without it Vite walks up to the monorepo root and
// picks its Tailwind 4 setup, so none of this template's Tailwind 3
// utilities were generated.
export default {
  plugins: {
    tailwindcss: {},
  },
};
