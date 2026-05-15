import React from "react";

/**
 * BottomOptionsPanel component displays the list of available bottom styles.
 */
export default function BottomOptionsPanel({
  selectedBottom,
  setSelectedBottom,
  isVisible,
}) {
  const bottomOptions = [
    { name: "Normal Back", key: "back", imageUrl: "bottom/straight.svg" },
    { name: "Slits Back", key: "SlitsBack", imageUrl: "/bottom/slits.svg" },
    { name: "Long Back", key: "LongSlitsBack", imageUrl: "/bottom/long-back.svg" },
  ];

  return (
    <div
      className={`fabric-options-container ${isVisible ? "is-visible" : ""}`}
    >
      <h3 className="fabric-options-title">Select Bottom Style</h3>
      <div className="fabric-list-container">
        {bottomOptions.map((bottom) => {
          const isSelected = selectedBottom === bottom.key;
          return (
            <div
              key={bottom.key}
              onClick={() => setSelectedBottom(bottom.key)}
              className={`fabric-option-item ${
                isSelected ? "is-selected" : ""
              }`}
            >
              <img
                src={bottom.imageUrl}
                alt={bottom.name}
                className="fabric-option-thumbnail"
              />
              <div className="fabric-details">
                <div className="fabric-name">{bottom.name}</div>
                <div className="fabric-name">{bottom.key}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
