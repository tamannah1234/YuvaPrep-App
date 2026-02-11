import React, { useState } from "react";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    linkedin: "",
    github: "",
    resume: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProfile((prev) => ({ ...prev, resume: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Profile:", profile);
    // Add API call here
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#2E073F] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[#EBD3F8]/20 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-xl space-y-4 border border-white/20"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-4">Create Your Profile</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full p-3 rounded border border-white/20 bg-white/10 text-white placeholder-white/70"
          value={profile.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-3 rounded border border-white/20 bg-white/10 text-white placeholder-white/70"
          value={profile.email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="role"
          placeholder="Role (e.g., Frontend Developer)"
          className="w-full p-3 rounded border border-white/20 bg-white/10 text-white placeholder-white/70"
          value={profile.role}
          onChange={handleChange}
        />

        <input
          type="url"
          name="linkedin"
          placeholder="LinkedIn Profile URL"
          className="w-full p-3 rounded border border-white/20 bg-white/10 text-white placeholder-white/70"
          value={profile.linkedin}
          onChange={handleChange}
        />

        <input
          type="url"
          name="github"
          placeholder="GitHub Profile URL"
          className="w-full p-3 rounded border border-white/20 bg-white/10 text-white placeholder-white/70"
          value={profile.github}
          onChange={handleChange}
        />

        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full text-white"
        />

        <button
          type="submit"
          className="w-full bg-[#7A1CAC] hover:bg-[#AD49E1] text-white py-3 rounded font-semibold"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
