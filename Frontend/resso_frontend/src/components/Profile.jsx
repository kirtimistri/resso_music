import React, { useEffect, useState } from "react";

const Profile = () => {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    bio: "",
  });

  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/profile/", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        setFormData({
          username: data.username || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          bio: data.bio || "",
        });
        setPreviewUrl(data.profile_image || "");
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    if (profileFile) data.append("profile_image", profileFile);

    await fetch("http://127.0.0.1:8000/api/profile/update/", {
      method: "PUT",
      credentials: "include",
      body: data,
    });

    setLoading(false);
  };
return (
  <div className="w-full min-h-[calc(100vh-80px)]  px-12 py-10 flex justify-center text-white overflow-y-auto pb-28">
    
    {/* MAIN COLUMN */}
    <div className="w-full max-w-2xl flex flex-col items-center">

      {/* TITLE */}
      <h1 className="text-3xl font-semibold tracking-wide mb-12 text-center">
        Your Profile
      </h1>

      {/* PROFILE IMAGE */}
      {/* PROFILE IMAGE */}
<div className="flex items-center justify-center mb-14">
  <label className="relative group cursor-pointer">

    {/* Glow ring */}
    <div className="profile-ring"></div>

    {/* Image */}
    <div className="w-40 h-40 rounded-full overflow-hidden border border-white/20 relative z-10">
      {previewUrl ? (
        <img
          src={previewUrl}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="h-full flex items-center justify-center opacity-60">
          No Image
        </div>
      )}
    </div>

    {/* Overlay (appears on hover / click) */}
    <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition z-20">
      Change photo
    </div>

    {/* Hidden file input */}
    <input
      type="file"
      hidden
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        if (!file) return;
        setProfileFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }}
    />
  </label>
</div>

      {/* FORM */}
      <form className="w-full max-w-xl flex flex-col gap-8" onSubmit={handleSubmit}>

        <div className="field">
          <label>Username</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="px-4 py-2 rounded-lg border border-white/30 bg-white/10 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex gap-8">
          <div className="field flex-1">
            <label>First name</label>
            <input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="px-4 py-2 rounded-lg border border-white/30 bg-white/10 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="field flex-1">
            <label>Last name</label>
            <input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="px-4 py-2 rounded-lg border border-white/30 bg-white/10 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        <div className="field">
          <label>Bio</label>
          <textarea
            name="bio"
            // rows="3"
            value={formData.bio}
            onChange={handleChange}
            className="px-48 py-1 rounded-lg border border-white/30 bg-white/10 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition "
          />
        </div>

        <button type="submit" className="save-btn ">
          {loading ? "Saving..." : "Save changes"}
        </button>

      </form>
    </div>
  </div>
);

};

export default Profile;
