export const week1Config = {
  title: "Week 1 - Budgeting",
  inputCells: [
    // Food
    "C39", "C41", "C43", "C45",
    // Transportation
    "C51", "C53", "C55", "C57", "C59", "C61", "C63", "C65",
    // Insurance/Health
    "C71", "C73", "C75", "C77", "C79", "C81", "C83", "C85", "C87"
  ],
  readonlyCells: [
    // Food
    "D39", "D41", "D43", "D45", "C47", "D47",
    // Transportation
    "D51", "D53", "D55", "D57", "D59", "D61", "D63", "D65", "C67", "D67",
    // Insurance/Health
    "D71", "D73", "D75", "D77", "D79", "D81", "D83", "D85", "D87", "C89", "D89"
  ],
  calculatedFields: [
    // Food
    { output: "D39", formula: "E37 * 0.6" },
    { output: "D41", formula: "E37 * 0.25" },
    { output: "D43", formula: "E37 * 0.1" },
    { output: "D45", formula: "E37 * 0.05" },
    { output: "C47", formula: "SUM(C39:C45)" },
    { output: "D47", formula: "SUM(D39:D45)" },
    // Transportation
    { output: "D51", formula: "E49 * 0.5" },
    { output: "D53", formula: "E49 * 0.2" },
    { output: "D55", formula: "E49 * 0.1" },
    { output: "D57", formula: "E49 * 0.1" },
    { output: "D59", formula: "E49 * 0.025" },
    { output: "D61", formula: "E49 * 0.025" },
    { output: "D63", formula: "E49 * 0.025" },
    { output: "D65", formula: "E49 * 0.025" },
    { output: "C67", formula: "SUM(C51:C65)" },
    { output: "D67", formula: "SUM(D51:D65)" },
    // Insurance/Health
    { output: "D71", formula: "E69 * 0.35" },
    { output: "D73", formula: "E69 * 0.05" },
    { output: "D75", formula: "E69 * 0.15" },
    { output: "D77", formula: "E69 * 0.05" },
    { output: "D79", formula: "E69 * 0.05" },
    { output: "D81", formula: "E69 * 0.05" },
    { output: "D83", formula: "E69 * 0.1" },
    { output: "D85", formula: "E69 * 0.1" },
    { output: "D87", formula: "E69 * 0.1" },
    { output: "C89", formula: "SUM(C71:C87)" },
    { output: "D89", formula: "SUM(D71:D87)" }
  ],
  requiredSheets: [
    "Week 1 B - Cost of Living Area",
    "Week 1 B - Federal Tax",
    "Week 1 B - State Tax"
  ]
}; 