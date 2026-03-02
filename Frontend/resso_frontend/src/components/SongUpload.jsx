import React, { useState } from "react";

const SongUpload = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    language: "",
    lyrics: "",
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", success: true });

  const baseURL = "http://127.0.0.1:8000/api/music/upload/";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAudioChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const showPopup = (message, success = true) => {
    setPopup({ show: true, message, success });
    setTimeout(() => setPopup({ show: false, message: "", success: true }), 3000);
  };

  const uploadCoverToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "qjtb4ved"); // replace
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dokcrl0x4/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload failed", err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let coverUrl = "";
      if (coverFile) {
        const uploadedUrl = await uploadCoverToCloudinary(coverFile);
        if (!uploadedUrl) {
          showPopup("❌ Cover upload failed", false);
          setLoading(false);
          return;
        }
        coverUrl = uploadedUrl;
      }

      const payload = new FormData();
      if (audioFile) payload.append("audio_file", audioFile);
      if (coverUrl) payload.append("cover_url", coverUrl);
      if (formData.title) payload.append("title", formData.title);
      if (formData.language) payload.append("language", formData.language);
      if (formData.description) payload.append("description", formData.description);
      if (formData.lyrics) payload.append("lyrics", formData.lyrics);

      const res = await fetch(baseURL, {
        method: "POST",
        body: payload,
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) showPopup("🎵 Song uploaded successfully!", true);
      else showPopup(data.detail || "❌ Upload failed", false);
    } catch (err) {
      showPopup("❌ Network error", false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-auto flex flex-col items-center justify-center px-6 py-10 text-white bg-image-linear-gradient(to top,rgb(15, 13, 26),rgb(24, 11, 75),rgb(32, 85, 159));"
      style={{
    minHeight: "calc(100vh - 80px)", // 100% viewport height minus playbar
    backgroundImage: coverPreview ? `url(${coverPreview})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundBlendMode: "overlay",
  }}
    >
      {/* Dark overlay to improve readability */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Popup */}
      {popup.show && (
        <div className={`absolute top-6 right-6 px-6 py-3 rounded-lg shadow-lg font-semibold z-50 transition-all duration-300
          ${popup.success ? "bg-green-500" : "bg-red-500"}`}>
          {popup.message}
        </div>
      )}

      <div className="relative z-10 w-full max-w-md flex flex-col gap-4">
        <h2 className="text-3xl font-bold text-center text-indigo-300 mb-6">Upload New Song</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-medium text-indigo-100">Cover Image</label>
            <input type="file" accept="image/*" onChange={handleCoverChange}
              className="mt-1 file:text-white file:bg-indigo-700 file:border-none file:px-4 file:py-2 file:rounded-full file:cursor-pointer w-full" />
          </div>

          <div>
            <label className="font-medium text-indigo-100">Audio File</label>
            <input type="file" accept="audio/*" onChange={handleAudioChange}
              className="mt-1 file:text-white file:bg-indigo-700 file:border-none file:px-4 file:py-2 file:rounded-full file:cursor-pointer w-full" />
          </div>

          <input type="text" name="title" placeholder="Song Title" value={formData.title} onChange={handleChange}
            className="px-4 py-2 rounded-lg border border-white/30 bg-white/10 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />

          <input type="text" name="language" placeholder="Language" value={formData.language} onChange={handleChange}
            className="px-4 py-2 rounded-lg border border-white/30 bg-white/10 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />

          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} rows={2}
            className="px-4 py-2 rounded-lg border border-white/30 bg-white/10 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />

          <textarea name="lyrics" placeholder="Lyrics" value={formData.lyrics} onChange={handleChange} rows={3}
            className="px-4 py-2 rounded-lg border border-white/30 bg-white/10 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />

          <button type="submit" disabled={loading}
            className="mt-4 py-3 bg-indigo-700 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all">
            {loading ? "Uploading..." : "Upload Song"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SongUpload;
