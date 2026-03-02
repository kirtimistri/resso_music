import React, { useEffect, useState } from "react";

export function SongCard({ song, onPlay }) {
  const TITLE_LIMIT = 25;
  const DATE_LIMIT = 25;

  const [scrollTitle, setScrollTitle] = useState(false);
  const [scrollDate, setScrollDate] = useState(false);

  useEffect(() => {
    setScrollTitle(song.title?.length > TITLE_LIMIT);

    const dateText = song.uploaded_at
      ? `Uploaded on ${new Date(song.uploaded_at).toDateString()}`
      : "N/A";

    setScrollDate(dateText.length > DATE_LIMIT);
  }, [song.title, song.uploaded_at]);

  return (
    <div
      className="card"
      style={{ cursor: "pointer" }}
      onClick={onPlay} // ✅ just call parent function
    >
      <img
        src={
          song.cover_url?.startsWith("http")
            ? song.cover_url
            : "/src/default cover.jpg"
        }
        alt={song.title}
        className="cardimg"
      />

      {/* ▶ PLAY BUTTON */}
      <div className="play" onClick={onPlay}>
        <img src="/playoncard.svg" alt="Play" />
      </div>

      <div className="discription">
        <div className="scroll-text font-bold">
          <h2 className={scrollTitle ? "marquee" : ""}>{song.title}</h2>
        </div>

        <div className="scroll-text">
          <h3 className={scrollDate ? "marquee" : ""}>
            Uploaded on{" "}
            {song.uploaded_at
              ? new Date(song.uploaded_at).toDateString()
              : "N/A"}
          </h3>
        </div>
      </div>
    </div>
  );
}
