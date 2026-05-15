import React from "react";

/**
 * SelectedFabricDisplay component shows the current chosen fabric's image and name.
 * @param {object} props - The component props.
 * @param {object} props.selectedFabric - The currently selected fabric object {name, imageUrl}.
 * @param {function} props.onClick - Function to call when the display area is clicked.
 */
export default function SelectedFabricDisplay({ selectedFabric, onClick }) {
  const fallbackImage = "/placeholder.png"; // ✅ Path to a default placeholder image

  const imageUrl = selectedFabric?.imageUrl || fallbackImage;
  const fabricName = selectedFabric?.name || "Select a fabric";

  return (
    <div className="selected-fabric-display" onClick={onClick}>
      <img
        src={imageUrl}
        alt={fabricName}
        className="selected-fabric-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallbackImage;
        }}
      />
      <div className="selected-fabric-name">Collar Fabric: {fabricName}</div>
    </div>
  );
}
