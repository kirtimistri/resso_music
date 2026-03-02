import React, { useEffect, useState, useRef } from "react";

import '../App.css';
import { Outlet, Link, useNavigate } from "react-router-dom";
import LyricsPlayer from "./Lyricsplayer";

export default function Playbar({ song, onNext, onPrev, audioRef }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  useEffect(() => {
  if (!audioRef.current || !song) return;

  audioRef.current.load();
  audioRef.current.play();
}, [song]);

useEffect(() => {
  if (!audioRef?.current) return;

  const audio = audioRef.current;

  const handleTimeUpdate = () => setProgress(audio.currentTime);
  const handleLoaded = () => setDuration(audio.duration);
  const handleEnded = () => {
    setIsPlaying(false);
    onNext?.();
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  audio.addEventListener("timeupdate", handleTimeUpdate);
  audio.addEventListener("loadedmetadata", handleLoaded);
  audio.addEventListener("ended", handleEnded);
  audio.addEventListener("play", handlePlay);
  audio.addEventListener("pause", handlePause);

  return () => {
    audio.removeEventListener("timeupdate", handleTimeUpdate);
    audio.removeEventListener("loadedmetadata", handleLoaded);
    audio.removeEventListener("ended", handleEnded);
    audio.removeEventListener("play", handlePlay);
    audio.removeEventListener("pause", handlePause);
  };
}, [audioRef, onNext]);

  const togglePlay = async () => {
  if (!audioRef.current) return;

  try {
    if (audioRef.current.paused) {
      await audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  } catch (err) {
    console.error("Play failed:", err);
  }
};


  const seek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    audioRef.current.currentTime = percent * duration;
  };

  const formatTime = (t) => `${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2,'0')}`;

  return (
    <div className="playbar">
      <div className="seekbar" onClick={seek}>
        <div className="progress" style={{width: duration ? `${(progress/duration)*100}%` : "0%"}} />
        <div className="circle" style={{left: duration ? `${(progress/duration)*100}%` : "0%"}} />
      </div>

      <div className="buttonaligncenter">
        <div className="songinfo">{song?.title || "Select a song"}</div>
        <span className="btn">
          <img src="/play-previous-svgrepo-com.svg" onClick={onPrev} />
          <img src={isPlaying ? "/pause.svg" : "/play.svg"} onClick={togglePlay} />
          <img src="/play-next-svgrepo-com.svg" onClick={onNext} />
        </span>
        <div className="time">{formatTime(progress)} / {formatTime(duration)}</div>
      </div>
    </div>
  );
}
