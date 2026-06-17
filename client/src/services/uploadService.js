import API from "./api";

export const uploadImage = (file) => {
  // FormData is a special browser object built specifically for sending files
  const formData = new FormData();
  formData.append("image", file); // 'image' must match upload.single('image') on the backend

  return API.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // tells the server "this is a file, not JSON"
    },
  });
};
