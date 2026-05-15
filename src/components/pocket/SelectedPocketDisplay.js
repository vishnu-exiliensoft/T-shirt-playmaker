import React from "react";

export default function SelectedPocketDisplay({ selectedPocket, onClick }) {
  const getPocketDisplayName = (pocketKey) => {
    switch (pocketKey) {
      case "yes":
        return "With Pocket";
      case "no":
        return "No Pocket";
      default:
        return "Select Pocket";
    }
  };

  const getPocketDisplayImage = (pocketKey) => {
    switch (pocketKey) {
      case "yes":
        return "/pocket.png"; // You can replace with actual pocket image
      case "no":
        return "/no_pocket.png"; // You can replace with actual no-pocket image
      default:
        return "/no_pocket.png";
    }
  };

  return (
    <div className="selected-fabric-display" onClick={onClick}>
      <img
        src={getPocketDisplayImage(selectedPocket)}
        alt={getPocketDisplayName(selectedPocket)}
        className="fabric-thumbnail"
        style={{ width: 40, height: 40, marginRight: 8 }}
      />
      <div className="selected-fabric-name">
        
        {getPocketDisplayName(selectedPocket)}
      </div>
    </div>
  );
}
