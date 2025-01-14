import { ThemeProvider, createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";
import MuiTabs from "./MuiTabs";
import { useContext, useMemo } from "react";
import { ThemeContext } from "./App";

export default function Page() {
  const { spacing } = useContext(ThemeContext);
  const theme = useMemo(() => {
    return createTheme({
      cssVariables: true,
      palette: {
        primary: {
          main: red[500],
        },
      },
      spacing: spacing,
    });
  }, [spacing]);

  return (
    <ThemeProvider theme={theme}>
      <MuiTabs />
    </ThemeProvider>
  );
}
