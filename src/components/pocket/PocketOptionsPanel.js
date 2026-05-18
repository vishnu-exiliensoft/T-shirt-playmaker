import React from "react";

/**
 * PocketOptionsPanel component displays the pocket options (Yes/No).
 * It slides in and out based on the isVisible prop.
 */
export default function PocketOptionsPanel({
  selectedPocket,
  setSelectedPocket,
  isVisible,
  onSelection,
}) {
  const pocketOptions = [
    { name: "No Pocket", key: "no", imageUrl: "/no_pocket.png" },
    { name: "With Pocket", key: "yes", imageUrl: "/pocket.png" },
  ];

  const handlePocketSelection = (pocketKey) => {
    setSelectedPocket(pocketKey);
    // Close panel after selection if callback provided
    if (onSelection) {
      onSelection();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fabric-options-container ${isVisible ? "is-visible" : ""}`}>
      <h3 className="fabric-options-title">Select Pocket Option</h3>
      <div className="fabric-list-container">
        {pocketOptions.map((pocket) => {
          const isSelected = selectedPocket === pocket.key;
          return (
            <div
              key={pocket.key}
              onClick={() => handlePocketSelection(pocket.key)}
              className={`fabric-option-item ${isSelected ? "is-selected" : ""}`}
            >
              <img
                src={pocket.imageUrl}
                alt={pocket.name}
                className="fabric-option-thumbnail"
              />
              <div className="fabric-details">
                <div className="fabric-name">{pocket.name}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
