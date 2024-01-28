import { withJsonFormsMasterListItemProps } from "@jsonforms/react";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemText from "@mui/material/ListItemText";

import { IconRenderer } from "../../utilities";

const ListWithDetailMasterItem = ({ index, childLabel, selected, handleSelect, removeItem, path }) => {
  return (
    <ListItem button selected={selected} onClick={handleSelect(index)}>
      <ListItemAvatar>
        <Avatar aria-label="Index">{index + 1}</Avatar>
      </ListItemAvatar>
      <ListItemText primary={childLabel} />
      <ListItemSecondaryAction>
        <IconButton aria-label="Delete" onClick={removeItem(path, index)} size="large">
          <IconRenderer icon="Delete" />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default withJsonFormsMasterListItemProps(ListWithDetailMasterItem);
