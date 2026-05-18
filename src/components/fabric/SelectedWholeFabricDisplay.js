import React from "react";

/**
 * SelectedWholeFabricDisplay component shows the currently chosen whole-shirt fabric's image and name.
 * Structure intentionally mirrors SelectedFabricDisplay for consistency.
 */
export default function SelectedWholeFabricDisplay({
  selectedWholeFabric,
  onClick,
}) {
  const fallbackImage = "/placeholder.png";

  const imageUrl = selectedWholeFabric?.imageUrl || fallbackImage;
  const fabricName = selectedWholeFabric?.name || "Select whole-shirt fabric";

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
      <div className="selected-fabric-name">T-Shirt Fabric: {fabricName}</div>
    </div>
  );
}
