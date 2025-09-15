export const week2Config = {
  title: "Week 2 - Savings",
  inputCells: [
    // Emergency Fund
    "C39", "C41", "C43",
    // Short-term Savings
    "C51", "C53", "C55", "C57", "C59",
    // Long-term Savings
    "C71", "C73", "C75", "C77", "C79", "C81", "C83", "C85"
  ],
  readonlyCells: [
    // Emergency Fund
    "D39", "D41", "D43", "C45", "D45",
    // Short-term Savings
    "D51", "D53", "D55", "D57", "D59", "C61", "D61",
    // Long-term Savings
    "D71", "D73", "D75", "D77", "D79", "D81", "D83", "D85", "C87", "D87"
  ],
  calculatedFields: [
    // Emergency Fund
    { output: "D39", formula: "E37 * 0.5" },
    { output: "D41", formula: "E37 * 0.3" },
    { output: "D43", formula: "E37 * 0.2" },
    { output: "C45", formula: "SUM(C39:C43)" },
    { output: "D45", formula: "SUM(D39:D43)" },
    // Short-term Savings
    { output: "D51", formula: "E49 * 0.4" },
    { output: "D53", formula: "E49 * 0.25" },
    { output: "D55", formula: "E49 * 0.15" },
    { output: "D57", formula: "E49 * 0.1" },
    { output: "D59", formula: "E49 * 0.1" },
    { output: "C61", formula: "SUM(C51:C59)" },
    { output: "D61", formula: "SUM(D51:D59)" },
    // Long-term Savings
    { output: "D71", formula: "E69 * 0.3" },
    { output: "D73", formula: "E69 * 0.2" },
    { output: "D75", formula: "E69 * 0.15" },
    { output: "D77", formula: "E69 * 0.1" },
    { output: "D79", formula: "E69 * 0.1" },
    { output: "D81", formula: "E69 * 0.05" },
    { output: "D83", formula: "E69 * 0.05" },
    { output: "D85", formula: "E69 * 0.05" },
    { output: "C87", formula: "SUM(C71:C85)" },
    { output: "D87", formula: "SUM(D71:D85)" }
  ],
  requiredSheets: [
    "Week 2 - Emergency Fund",
    "Week 2 - Short-term Savings",
    "Week 2 - Long-term Savings"
  ]
};
