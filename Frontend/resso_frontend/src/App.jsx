import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Songlist from "./components/Songlist";
import Profile from "./components/Profile";
import SongUpload from "./components/SongUpload";
import LyricsPlayer from "./components/Lyricsplayer";
import Playbar from "./components/Playbar";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />

      {/* Protected routes */}
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Layout />}>
        
          <Route index element={<Songlist />} />
          <Route path="/profile" element={<Profile />} />
        <Route path="/lyrics" element={<LyricsPlayer />} />

          <Route path="/adminsongupload" element={<SongUpload />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
