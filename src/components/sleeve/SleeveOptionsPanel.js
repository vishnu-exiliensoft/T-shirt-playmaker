import React from "react";

/**
 * SleeveOptionsPanel component displays the list of available sleeve options.
 * It slides in and out based on the isVisible prop.
 */
export default function SleeveOptionsPanel({
  selectedSleeve,
  setSelectedSleeve,
  isVisible,
  onSelection,
  onPriceUpdate,
}) {
  const sleeveOptions = [
    { name: "Half Sleeve", key: "half", imageUrl: "/short_sleeves.svg", price: 0 },
    { name: "Full Sleeve", key: "fullSleeves", imageUrl: "/long_sleeves.svg", price: 50 },
  ];

  const handleSleeveSelection = (sleeveKey) => {
    setSelectedSleeve(sleeveKey);
    
    // Find the selected sleeve and update price
    const selectedSleeveOption = sleeveOptions.find(sleeve => sleeve.key === sleeveKey);
    if (selectedSleeveOption && onPriceUpdate) {
      onPriceUpdate(selectedSleeveOption.price);
    }
    
    // Close panel after selection if callback provided
    if (onSelection) {
      onSelection();
    }
  };

  return (
    <div
      className={`fabric-options-container ${isVisible ? "is-visible" : ""}`}
    >
      <h3 className="fabric-options-title">Select Sleeve Style</h3>
      <div className="fabric-list-container">
       { sleeveOptions.map((sleeve) => {
    const isSelected = selectedSleeve === sleeve.key;
    return (
      <div
        key={sleeve.key}
        onClick={() => handleSleeveSelection(sleeve.key)}
        className={`fabric-option-item ${isSelected ? "is-selected" : ""}`}
      >
        <img
          src={sleeve.imageUrl}
          alt={sleeve.name}
          className="fabric-option-thumbnail"
        />
        <div className="fabric-details">
          <div className="fabric-name">{sleeve.name}</div>
          <div className="fabric-price">
            {sleeve.price > 0 ? `SDG ${sleeve.price}` : "Included"}
          </div>
        </div>
      </div>
    );
})}
      </div>
    </div>
  );
}