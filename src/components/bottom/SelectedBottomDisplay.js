import React from "react";

/**
 * SelectedBottomDisplay component shows the current chosen bottom's image and name.
 */
export default function SelectedBottomDisplay({ selectedBottom, onClick }) {
  const bottomData = {
    back: {
      name: "Normal Back",
      imageUrl: "/bottom/straight.svg",
    },

    SlitsBack: {
      name: "Slits Back",
      imageUrl: "/bottom/slits.svg",
    },
    LongSlitsBack: {
      name: "Long Back",
      imageUrl: "/bottom/long-back.svg",
    },
  };

  const bottom = bottomData[selectedBottom] || {
    name: "Select a bottom style",
    imageUrl: "/placeholder.png",
  };

  return (
    <div className="selected-fabric-display" onClick={onClick}>
      <img
        src={bottom.imageUrl}
        alt={bottom.name}
        className="selected-fabric-thumbnail"
        style={{ width: 40, height: 40, marginRight: 8 }}
      />
      <div className="selected-fabric-name">{bottom.name}</div>
    </div>
  );
}
