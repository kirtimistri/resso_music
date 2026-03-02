import React, { useEffect, useMemo, useState } from "react";
import "../App.css";
import axios from "axios";
import { Heart } from "lucide-react";

const LyricsPlayer = ({ song, audioRef, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  // Initialize like state from song prop
  useEffect(() => {
    if (!song) return;
    setLiked(!!song.is_liked);
    setLikesCount(song.likes_count || 0);
  }, [song?.song_id, song?.id]);

  // -------------------------------
  // Toggle Like Function
  // -------------------------------
  const toggleLike = async () => {
  if (!song) return;

  const songId = song.id || song.song_id;
  if (!songId) return;

  try {
    setLikeLoading(true);

    const response = await axios.post(
      `http://127.0.0.1:8000/api/music/songs/${songId}/like/`,
      {},
      {
        withCredentials: true, // ✅ THIS IS THE KEY
      }
    );

    setLiked(response.data.liked);
    setLikesCount(response.data.likes_count);

  } catch (error) {
    console.error("Like toggle error:", error.response?.data || error);
  } finally {
    setLikeLoading(false);
  }
};

  // -------------------------------
  const timedLyrics = useMemo(() => {
    if (!song.lyrics || typeof song.lyrics !== "string") return [];

    const lines = song.lyrics
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return [];

    const duration =
      audioRef?.current && !isNaN(audioRef.current.duration)
        ? audioRef.current.duration
        : 100;

    const gap = duration / lines.length;

    return lines.map((text, i) => ({
      time: i * gap,
      text,
    }));
  }, [song, audioRef]);

  // -------------------------------
  // Sync with audio
  // -------------------------------
  useEffect(() => {
    if (!audioRef?.current || timedLyrics.length === 0) return;
    const audio = audioRef.current;

    const updateLyrics = () => {
      const time = audio.currentTime;
      for (let i = timedLyrics.length - 1; i >= 0; i--) {
        if (time >= timedLyrics[i].time) {
          setCurrentIndex(i);
          break;
        }
      }
    };

    audio.addEventListener("timeupdate", updateLyrics);
    return () => audio.removeEventListener("timeupdate", updateLyrics);
  }, [timedLyrics, audioRef]);

  // -------------------------------
  // Auto scroll
  // -------------------------------
  useEffect(() => {
    const el = document.getElementById(`line-${currentIndex}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentIndex]);

  const lyricsFinished =
    timedLyrics.length > 0 && currentIndex === timedLyrics.length - 1;

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="lyrics-player">
      {/* Like Button */}
      

      {song.cover_url && (
        <img src={song.cover_url} className="lyrics-cover" alt="" />
      )}

      <div className="overlay"></div>

      {/* Lyrics */}
      <div className="lyrics-container">
        {timedLyrics.length === 0 || lyricsFinished ? (
          <div className="no-lyrics">
            <svg
              className="music-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <span>Enjoy the music</span>
          </div>
        ) : (
          timedLyrics.map((line, i) => (
            <p
              key={i}
              id={`line-${i}`}
              className={`lyrics-line ${i === currentIndex ? "active" : ""}`}
            >
              {line.text}
            </p>
          ))
        )}
      </div>

      {/* Song Info */}
      <div className="lyrics-header">
        <div className="lyrics-left">
          {song.cover_url && (
            <img src={song.cover_url} className="lyrics-thumb" alt="" />
          )}
          <div className="lyrics-meta">
            <h2 className="lyrics-title">{song.title || "Unknown Song"}</h2>
            {song.language && <span className="lyrics-lang">{song.language}</span>}
            {song.description && <p className="lyrics-desc">{song.description}</p>}
          </div>
        </div>

        {/* ❤️ Right-side Like */}
        <button
          className={`lyrics-like-right ${liked ? "liked" : ""}`}
          onClick={toggleLike}
          disabled={likeLoading}
        >
          <Heart className="heart-icon" /> {likesCount}
        </button>
      </div>
    </div>
  );
};

export default LyricsPlayer;
