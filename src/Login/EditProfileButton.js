import { IconButton, Tooltip, Avatar } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

const EditProfileButton = () => {
  return (
    <Tooltip title="Edit Profile">
      <IconButton
        sx={{
          bgcolor: "primary.main",
          color: "white",
          width: 48,
          height: 48,
          "&:hover": {
            bgcolor: "primary.dark",
          },
        }}
      >
        <EditIcon />
      </IconButton>
    </Tooltip>
  );
};

export default EditProfileButton;
