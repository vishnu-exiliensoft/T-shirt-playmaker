import React from "react";

/**
 * SelectedCollarDisplay component shows the current chosen collar's image and name.
 */
export default function SelectedButtonDisplay({ selectedButton, onClick }) {
  const fallbackImage = "/placeholder.png";

  const imageUrl = selectedButton?.imageUrl || selectedButton?.image || fallbackImage;
  const buttonName = selectedButton?.name || "Select a Button style";

  return (
    <div className="selected-fabric-display" onClick={onClick}>
      <img
        src={imageUrl}
        alt={buttonName}
        className="selected-fabric-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallbackImage;
        }}
      />
      <div className="selected-fabric-name">{buttonName}</div>
    </div>
  );
}