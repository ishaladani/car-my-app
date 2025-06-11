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
import axios from "axios";

const EditProfileModal = ({
  open,
  onClose,
  onSave,
  currentName,
  currentImage,
}) => {
  const [name, setName] = useState("");
  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    setName(currentName || "");
    setPreview(currentImage || "");
    setImageFile(null); // Reset image on open
  }, [currentName, currentImage, open]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // store the file for uploading
      setPreview(URL.createObjectURL(file)); // preview only
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (imageFile) {
        formData.append("profileImage", imageFile);
      }

      const response = await axios.post(
        "https://profileapi-yisj.onrender.com/api/profile/update",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updated = {
        name: response.data?.name || name,
        image: response.data?.image || preview,
      };

      localStorage.setItem("garageName", updated.name);
      localStorage.setItem("garageLogo", updated.image);
      localStorage.setItem("profileUpdated", "true"); // 👈 Add this flag

      onSave(updated);
      onClose();
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      alert("Update failed. Please check console.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent sx={{ textAlign: "center" }}>
        <Box sx={{ position: "relative", display: "inline-block" }}>
          <Avatar
            src={preview}
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
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;