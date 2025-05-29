import React from 'react';

function PlaybackControls({ onNext, onPrev, onPlayPause, playing }) {
  return (
    <div className="flex gap-2">
      <button onClick={onPrev}>⏮ Prev</button>
      <button onClick={onPlayPause}>{playing ? '⏸ Pause' : '▶ Play'}</button>
      <button onClick={onNext}>⏭ Next</button>
    </div>
  );
}

export default PlaybackControls;