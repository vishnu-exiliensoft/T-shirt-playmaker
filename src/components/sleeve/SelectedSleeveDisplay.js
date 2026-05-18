import React from "react";

/**
 * SelectedSleeveDisplay component shows the current chosen sleeve's image and name.
 */
export default function SelectedSleeveDisplay({ selectedSleeve, onClick }) {
  const sleeveData = {
    half: {
      name: "Half Sleeve",
      imageUrl: "/short_sleeves.svg", // public folder path
    },
    fullSleeves: {
      name: "Full Sleeve",
      imageUrl: "/long_sleeves.svg", // public folder path
    },
  };

  const sleeve = sleeveData[selectedSleeve] || {
    name: "Select a sleeve style",
    imageUrl: "/placeholder.png",
  };

  return (
    <div className="selected-fabric-display" onClick={onClick}>
      <img
        src={sleeve.imageUrl}
        alt={sleeve.name}
        className="selected-fabric-thumbnail"
        style={{ width: 40, height: 40, marginRight: 8 }}
      />
      <div className="selected-fabric-name">{sleeve.name}</div>
    </div>
  );
}