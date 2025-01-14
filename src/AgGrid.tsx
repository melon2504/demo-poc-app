import { useCallback, useContext, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ClientSideRowModelModule,
  ColDef,
  GridReadyEvent,
  ModuleRegistry,
  NumberFilterModule,
  ValidationModule,
  themeAlpine,
} from "ag-grid-community";
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  SetFilterModule,
  Theme,
} from "ag-grid-enterprise";
import { red } from "@mui/material/colors";
import Slider from "@mui/material/Slider";
import { ThemeContext } from "./App";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  SetFilterModule,
  NumberFilterModule,
  ValidationModule /* Development Only */,
]);

const myTheme = themeAlpine.withParams({
  backgroundColor: "rgb(255, 255, 255)",
  foregroundColor: "rgb(0, 0, 0)",
  headerTextColor: "#fff",
  headerBackgroundColor: "rgb(65 65 65)",
  oddRowBackgroundColor: "rgb(75 75 75 / 20%)",
  accentColor: red[500],
  rowHoverColor: "rgb(25 118 210 / 40%)",
  headerColumnResizeHandleColor: "#fff",
});

const AgGrid = () => {
  const { spacing, setSpacing } = useContext(ThemeContext);
  const containerStyle = useMemo(
    () => ({ width: "100%", height: "600px" }),
    []
  );
  const gridStyle = useMemo(() => ({ height: "600px", width: "100%" }), []);
  const [rowData, setRowData] = useState<any[]>();
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    // set filters
    { field: "athlete" },
    { field: "country" },
    // number filters
    { field: "gold" },
    { field: "silver" },
    { field: "bronze" },
  ]);
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 200,
      filter: "agSetColumnFilter",
      filterParams: {
        buttons: ["reset", "apply"],
        closeOnApply: true,
      },
      suppressHeaderMenuButton: false,
      menuTabs: ["filterMenuTab", "generalMenuTab", "columnsMenuTab"],
    };
  }, []);

  const theme = useMemo<Theme | "legacy">(() => {
    return myTheme;
  }, []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
      .then((resp) => resp.json())
      .then((data: any[]) => setRowData(data));
  }, []);

  const changeSize = useCallback((event: any) => {
    document.documentElement.style.setProperty(
      "--ag-spacing",
      `${event.target.value}px`
    );
    setSpacing(event.target.value);
  }, []);

  return (
    <div style={containerStyle}>
      <div
        style={{
          flex: "none",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        spacing ={" "}
        <span style={{ minWidth: "50px" }}>
          <span id="spacing">{spacing}</span>px
        </span>
        <Slider
          aria-label="Size"
          step={0.1}
          value={spacing}
          onChange={(event: any) => changeSize(event)}
          sx={{ width: "200px" }}
          min={0}
          max={20}
        />
      </div>
      <div style={gridStyle}>
        <AgGridReact
          theme={theme}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          columnMenu="legacy"
          suppressMenuHide={true}
        />
      </div>
    </div>
  );
};

export default AgGrid;
