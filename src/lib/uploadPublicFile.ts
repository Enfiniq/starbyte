import axios from "axios";

export async function uploadPublicFile(
  file: File,
  folder?: string
): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_CLOUDINARY_URL;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!url || !preset) {
    console.error(
      "Cloudinary env not configured: NEXT_PUBLIC_CLOUDINARY_URL / NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET"
    );
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);
  if (folder) formData.append("folder", folder);

  try {
    const res = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const secureUrl: string | undefined = res?.data?.secure_url;
    if (!secureUrl) {
      console.error("Cloudinary upload missing secure_url:", res?.data);
      return null;
    }
    return secureUrl;
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
