// EditProfileModal.js
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  IconButton,
  Box,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

const EditProfileModal = ({
  open,
  onClose,
  onSave,
  currentName,
  currentImage,
}) => {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    setName(currentName || "");
    setImage(currentImage || "");
  }, [currentName, currentImage, open]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave({ name, image });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent sx={{ textAlign: "center" }}>
        <Box sx={{ position: "relative", display: "inline-block" }}>
          <Avatar
            src={image}
            sx={{ width: 100, height: 100, margin: "auto", mb: 2 }}
          />
          <IconButton
            component="label"
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: "#fff",
            }}
          >
            <PhotoCamera />
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </IconButton>
        </Box>
        <TextField
          fullWidth
          label="Garage Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;
