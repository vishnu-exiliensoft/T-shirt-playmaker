import React from "react";

/**
 * PlacketOptionsPanel component displays the list of available placket styles.
 */
export default function PlacketOptionsPanel({
  selectedPlacket,
  setSelectedPlacket,
  isVisible,
}) {
  const placketOptions = [
    {
      name: "Normal",
      key: "front",
      imageUrl: "/packlet/normal.svg",
    },
    {
      name: "Normal Thin",
      key: "NormalThin",
      imageUrl: "/packlet/normal-thin.svg",
    },
    {
      name: "Normal Long Thin",
      key: "NormalLongThin",
      imageUrl: "/packlet/long-thin.svg",
    },
  ];

  return (
    <div
      className={`fabric-options-container ${isVisible ? "is-visible" : ""}`}
    >
      <h3 className="fabric-options-title">Select Placket Style</h3>
      <div className="fabric-list-container">
        {placketOptions.map((placket) => {
          const isSelected = selectedPlacket === placket.key;
          return (
            <div
              key={placket.key}
              onClick={() => setSelectedPlacket(placket.key)}
              className={`fabric-option-item ${
                isSelected ? "is-selected" : ""
              }`}
            >
              <img
                src={placket.imageUrl}
                alt={placket.name}
                className="fabric-option-thumbnail"
              />
              <div className="fabric-details">
                <div className="fabric-name">{placket.name}</div>
                <div className="fabric-name">{placket.key}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
