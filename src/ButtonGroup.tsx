import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Checkbox from "@mui/material/Checkbox";
import BasicSelect from "./BasicSelect";

export default function ButtonGroup() {
  return (
    <Stack spacing={2} direction="row">
      <Checkbox />
      <IconButton aria-label="delete">
        <DeleteIcon />
      </IconButton>
      <Button variant="contained">Contained</Button>
      <Button variant="outlined">Outlined</Button>
      <BasicSelect />
    </Stack>
  );
}
