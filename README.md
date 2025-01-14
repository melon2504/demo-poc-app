# Spacing (AgGrid + MUI) Theme
![Spacing_Theme](https://github.com/user-attachments/assets/2b10df88-5666-468e-bc80-9806f3ebae78)



# React + TypeScript + Vite

https://github.com/ag-grid/ag-grid/issues/9627
https://ag-grid.com/react-data-grid/theming/
https://ag-grid.com/react-data-grid/theming-compactness/

https://mui.com/material-ui/customization/density/
https://github.com/mui/material-ui/blob/master/docs/data/material/customization/density/DensityTool.js
https://github.com/mui/material-ui/blob/master/docs/src/modules/components/ThemeContext.js
https://github.com/mui/material-ui/blob/master/docs/data/material/customization/density/density.md
https://m2.material.io/design/layout/applying-density.html

https://stackoverflow.com/questions/64415444/how-dynamically-change-themeprovider-values-in-styled-components

https://www.geeksforgeeks.org/react-mui-spacing/

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```
