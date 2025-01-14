import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  StrictMode,
  createContext,
} from "react";
import { createRoot } from "react-dom/client";
import { AgGridReact } from "ag-grid-react";
import {
  ClientSideRowModelModule,
  ColDef,
  ColGroupDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ModuleRegistry,
  NumberFilterModule,
  ValidationModule,
  createGrid,
  themeAlpine,
} from "ag-grid-community";
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  SetFilterModule,
} from "ag-grid-enterprise";
import MuiTabs from "./MuiTabs";
// import { any } from "./interfaces";

import Page from "./Page";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  SetFilterModule,
  NumberFilterModule,
  ValidationModule /* Development Only */,
]);

export const ThemeContext = createContext<any>({});

export const App = () => {
  const [spacing, setSpacing] = useState<number>(8);

  return (
    <ThemeContext.Provider value={{ spacing, setSpacing }}>
      <Page />
    </ThemeContext.Provider>
  );
};
