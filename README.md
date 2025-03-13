
https://codesandbox.io/p/sandbox/enabling-set-filters-forked-pt26r9


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



https://plnkr.co/edit/hn5cAl9N414ozt43?open=index.tsx



![image](https://github.com/user-attachments/assets/4b13bcd4-7897-4f6f-b01f-82fa292478e3)





![image](https://github.com/user-attachments/assets/b5d5483d-d184-48eb-b4b7-92bb7784d7de)



![image](https://github.com/user-attachments/assets/4914eb00-9355-4513-9b74-d54e7712fe53)



![image](https://github.com/user-attachments/assets/1506c209-3c7a-4eed-a7bd-049ea0e3035c)




![image](https://github.com/user-attachments/assets/020986f2-c73b-4cf8-ab4d-0c164441f054)
