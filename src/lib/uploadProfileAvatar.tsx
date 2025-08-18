import axios from "axios";

export async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  );
  formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!);
  try {
    const res = await axios.post(
      process.env.NEXT_PUBLIC_CLOUDINARY_URL!,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (res.data && res.data.secure_url) {
      return res.data.secure_url;
    } else {
      console.error("Cloudinary upload failed:", res.data);
      return null;
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "Cloudinary upload error:",
        err.response?.data || err.message
      );
    } else {
      console.error("Cloudinary upload error:", err);
    }
    return null;
  }
}
