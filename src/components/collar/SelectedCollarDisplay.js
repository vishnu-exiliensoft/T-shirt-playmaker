import React from "react";

/**
 * SelectedCollarDisplay component shows the current chosen collar's image and name.
 */
export default function SelectedCollarDisplay({ selectedCollar, onClick }) {
  const fallbackImage = "/placeholder.png";

  const imageUrl = selectedCollar?.imageUrl || fallbackImage;
  const collarName = selectedCollar?.name || "Select a collar style";

  return (
    <div className="selected-fabric-display" onClick={onClick}>
      <img
        src={imageUrl}
        alt={collarName}
        className="selected-fabric-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallbackImage;
        }}
      />
      <div className="selected-fabric-name">{collarName}</div>
    </div>
  );
}
