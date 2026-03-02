import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { SongCard } from "./SongCard";
import Playbar from "./Playbar";
import LyricsPlayer from "./Lyricsplayer";
import { useOutletContext } from "react-router-dom";

export default function Songlist() {
  const {
    songs,
    currentSong,
    playSong,
    audioRef,
    handleNext,
    handlePrev,
    showLyrics,
    setShowLyrics
  } = useOutletContext();

  return (
    <>
      {showLyrics && currentSong ? (
        <LyricsPlayer
          song={currentSong}
          audioRef={audioRef}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={() => setShowLyrics(false)}
        />
      ) : (
        <div className="cardcontainer songlist">
          {songs.map(song => (
            <SongCard
              key={song.song_id}
              song={song}
              isPlaying={currentSong?.song_id === song.song_id}
              onPlay={() => playSong(song)}
            />
          ))}
        </div>

      )}
      
    </>
  );
}
