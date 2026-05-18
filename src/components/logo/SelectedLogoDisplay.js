import React from "react";

export default function SelectedLogoDisplay({ selectedLogoMesh, logoImageUrl, onClick }) {
  const display = {
    name: selectedLogoMesh ? selectedLogoMesh : "Select Logo Position",
    imageUrl: logoImageUrl || "/placeholder.png",
  };

  return (
    <div className="selected-fabric-display" onClick={onClick}>
      <img
        src={display.imageUrl}
        alt={display.name}
        className="selected-fabric-thumbnail"
        style={{ width: 40, height: 40, marginRight: 8 }}
      />
      <div className="selected-fabric-name">{display.name}</div>
    </div>
  );
}


