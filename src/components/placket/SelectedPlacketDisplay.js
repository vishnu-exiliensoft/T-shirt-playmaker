import React from "react";

/**
 * SelectedPlacketDisplay component shows the current chosen placket's image and name.
 */
export default function SelectedPlacketDisplay({ selectedPlacket, onClick }) {
  const placketData = {
    front: {
      name: "Normal",
      imageUrl: "/packlet/normal.svg",
    },
    NormalLongThin: {
      name: "Normal Long Thin",
      imageUrl: "/packlet/long-thin.svg",
    },
    NormalThin: {
      name: "Normal Thin",
      imageUrl: "/packlet/normal-thin.svg",
    },
  };

  const placket = placketData[selectedPlacket] || {
    name: "Select a placket style",
    imageUrl: "/placeholder.png",
  };

  return (
    <div className="selected-fabric-display" onClick={onClick}>
      <img
        src={placket.imageUrl}
        alt={placket.name}
        className="selected-fabric-thumbnail"
        style={{ width: 40, height: 40, marginRight: 8 }}
      />
      <div className="selected-fabric-name">{placket.name}</div>
    </div>
  );
}
