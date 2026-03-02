import React, { useEffect, useState, useRef } from "react";
import '../App.css';
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";

import LyricsPlayer from "./Lyricsplayer";
import Playbar from "./Playbar";
import { SongCard } from "./SongCard";

function Leftsidebar() {
  const [isStaff, setIsStaff] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [viewMode, setViewMode] = useState("all"); // all | favorites | charts
  const [searchTerm, setSearchTerm] = useState("");

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const location = useLocation();
  const isHome = location.pathname === "/";
  const audioRef = useRef(new Audio());
  const navigate = useNavigate();
  const baseURL = "http://127.0.0.1:8000/api";

  // ------------------- Initialize history -------------------
  useEffect(() => {
    const initialState = { viewMode: "all", searchTerm: "" };
    setHistory([initialState]);
    setHistoryIndex(0);
    setViewMode("all");
    setSearchTerm("");
  }, []);

  // ---------------- Filter songs by viewMode ----------------
  const filteredSongs = (() => {
    if (viewMode === "favorites") return songs.filter(song => song.is_liked);
    if (viewMode === "charts") return [...songs].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    return songs; // all / browse
  })();

  // ---------------- Search filter ----------------
  const displayedSongs = filteredSongs.filter(song => {
    const term = searchTerm.toLowerCase();
    return (
      song.title.toLowerCase().includes(term) ||
      (song.uploaded_by_name || "unknown").toLowerCase().includes(term)
    );
  });

  // ---------------- Update viewMode + push to history ----------------
  const changeViewMode = (mode) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ viewMode: mode, searchTerm: "" });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setViewMode(mode);
    setSearchTerm("");
  };

  // ---------------- Handle search input ----------------
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Push to history if different
    if (history[historyIndex]?.searchTerm !== value) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ viewMode, searchTerm: value });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // ---------------- Logout ----------------
  const handleLogout = async () => {
    try {
      const res = await fetch(`${baseURL}/logout/`, { method: "POST", credentials: "include" });
      if (res.ok) navigate("/login");
      else alert("Logout failed");
    } catch (err) {
      console.error(err);
      alert("Network error during logout");
    }
  };

  // ---------------- Fetch Profile ----------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${baseURL}/profile/`, { method: "GET", credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        setProfileImage(data.profile_image || null);
        setIsStaff(data.is_staff);
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, []);

  // ---------------- Fetch Songs ----------------
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch(`${baseURL}/music/songs/`, { method: "GET", credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        setSongs(Array.isArray(data) ? data : data.results || []);
      } catch (err) { console.error("Failed to fetch songs:", err); }
    };
    fetchSongs();
  }, []);

  // ---------------- Audio Ended ----------------
  useEffect(() => {
    const audio = audioRef.current;
    const onEnded = () => {
      setCurrentSong(null);
      setShowLyrics(false);
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  // ---------------- Play Song ----------------
  const playSong = async (song) => {
    if (!song) return;
    const audio = audioRef.current;

    if (currentSong?.song_id === song.song_id) {
      audio.paused ? await audio.play() : audio.pause();
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.src = song.audio_url;
    audio.load();

    try {
      await audio.play();
      setCurrentSong(song);
      setShowLyrics(true);
    } catch (err) {
      console.error("Play failed:", err);
    }
  };

  // ---------------- Next / Prev ----------------
  const handleNext = () => {
    if (!currentSong) return;
    const index = songs.findIndex(s => s.song_id === currentSong.song_id);
    playSong(songs[(index + 1) % songs.length]);
  };
  const handlePrev = () => {
    if (!currentSong) return;
    const index = songs.findIndex(s => s.song_id === currentSong.song_id);
    playSong(songs[(index - 1 + songs.length) % songs.length]);
  };

  // ---------------- Heading ----------------
  const renderHeading = () => {
    if (viewMode === "favorites" && filteredSongs.length > 0) {
      return (
        <div className="favorites-heading flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-bold text-xl shadow-lg">
          <img src="/heart.svg" alt="favorites" className="w-6 h-6"/>
          <span>Your Favorite Songs</span>
        </div>
      );
    }
    if(viewMode === "charts" && filteredSongs.length > 0) {
      return (
        <div className="charts-heading flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-xl text-white font-bold text-xl shadow-lg">
          <img src="/trophy.svg" alt="charts" className="w-6 h-6"/>
          <span>Top Charts</span>
        </div>
      );
    }
    if(viewMode === "all" && filteredSongs.length > 0) {
      return (
        <div className="browse-heading flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl text-white font-bold text-xl shadow-lg">
          <img src="/browse.svg" alt="browse" className="w-6 h-6"/>
          <span>Browse Songs</span>
        </div>
      );
    }
    return null;
  };

  // ---------------- Highlight Search ----------------
  const highlightMatch = (text) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, idx) =>
      regex.test(part) ? <span key={idx} className="bg-yellow-300 text-black rounded px-1">{part}</span> : part
    );
  };

  return (
    <div className="flex flex-row">
      {/* Left Sidebar */}
      <div className="left">
        <div className="close"><span><img src="/cross-circle-svgrepo-com.svg" alt="close"/></span></div>
        <img className="logo" src="/logo.png" alt="logo"/>
        <ul className="textandicon">
          <li onClick={() => changeViewMode("all")}>
            <img src="/browse.svg" className="invert" alt="browse" />Browse
          </li>
          <li onClick={() => changeViewMode("charts")}>
            <img src="/trophy.svg" alt="charts" />Charts
          </li>
          <li onClick={() => changeViewMode("favorites")} className={viewMode==="favorites"?"active-tab":""}>
            <img src="/heart.svg" alt="heart" />Favorites
          </li>
        </ul>

        <div className="mysongs">
          <li className="headcolor flex gap-2 justify-center font-bold text-xl">My Library</li>
          <ul className="scrollbar-hide">
            {songs.length > 0 ? songs.map(song => (
              <li key={song.song_id} onClick={()=>playSong(song)} className={`flex items-center gap-2 p-2 rounded cursor-pointer ${currentSong?.song_id===song.song_id?"bg-gray-700":"hover:bg-gray-800"}`}>
                <img src="/music-note-2-svgrepo-com.svg" alt="song" className="w-6 h-6 flex-shrink-0"/>
                <div className="info flex flex-col min-w-0">
                  <span className="font-semibold truncate">{highlightMatch(song.title)}</span>
                  <span className="text-sm text-gray-400 truncate">{highlightMatch(song.uploaded_by_name || "Unknown Artist")}</span>
                </div>
                <div className="playnow ml-auto flex items-center gap-1 flex-shrink-0">
                  <span className="text-sm">Play now</span>
                  <img src="/playoncard.svg" alt="play"/>
                </div>
              </li>
            )) : <li>No songs available</li>}
          </ul>
        </div>
      </div>

      {/* Right Section */}
      <div className="right">
        <div className="searchbar flex justify-between items-center px-4 py-2">
          <div className="flex items-center gap-3">
            <img
              src="/angle-left-svgrepo-com.svg"
              alt="back"
              className={`cursor-pointer ${historyIndex <= 0 ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => {
                if(historyIndex > 0) {
                  const newIndex = historyIndex-1;
                  const {viewMode: vm, searchTerm: st} = history[newIndex];
                  setHistoryIndex(newIndex);
                  setViewMode(vm);
                  setSearchTerm(st);
                }
              }}
            />
            <img
              src="/angle-right-svgrepo-com (1).svg"
              alt="forward"
              className={`cursor-pointer ${historyIndex >= history.length-1 ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => {
                if(historyIndex < history.length-1) {
                  const newIndex = historyIndex+1;
                  const {viewMode: vm, searchTerm: st} = history[newIndex];
                  setHistoryIndex(newIndex);
                  setViewMode(vm);
                  setSearchTerm(st);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <img src="/search-svgrepo-com.svg" alt=""/>
            <input
              type="text"
              placeholder="Search songs or artists..."
              className="border px-4 py-1 rounded-3xl w-64 text-white outline-white bg-transparent"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <img src="/three-dots-vertical-svgrepo-com.svg" alt=""/>
            <Link to="/profile"><img src={profileImage || "/profile-user-account-svgrepo-com.svg"} alt="profile" className="w-15 h-15 rounded-full object-cover cursor-pointer border"/></Link>
            <Link to="/register"><button className="signupbtn cursor-pointer">Sign up</button></Link>
            {isStaff && <Link to="/adminsongupload"><button className="signupbtn cursor-pointer">Upload song</button></Link>}
            <button className="loginbtn cursor-pointer" onClick={handleLogout}>Log out</button>
          </div>
        </div>

        <div className="content-area">
          {!isHome && <Outlet context={{songs,currentSong,playSong,audioRef,handleNext,handlePrev,showLyrics,setShowLyrics}}/>}

          {isHome && (
            <>
              {showLyrics && currentSong ? (
                <LyricsPlayer song={currentSong} audioRef={audioRef} onClose={()=>setShowLyrics(false)} />
              ) : (
                <div className="container songlist">
                  {renderHeading()}
                  {displayedSongs.length > 0 ? displayedSongs.map((song, idx)=>(
                    <SongCard
                      key={song.song_id}
                      song={song}
                      rank={viewMode==="charts"?idx+1:undefined}
                      isPlaying={currentSong?.song_id===song.song_id}
                      onPlay={()=>playSong(song)}
                      searchTerm={searchTerm}
                    />
                  )) : (
                    <div className="text-center text-gray-400 mt-10">
                      {searchTerm ? "No songs match your search 🔍" : viewMode==="favorites" ? "You haven't liked any songs yet 😢" : "No songs available"}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <Playbar song={currentSong} audioRef={audioRef} onNext={handleNext} onPrev={handlePrev} onExpand={()=>setShowLyrics(true)}/>
      </div>
    </div>
  );
}

export default Leftsidebar;
