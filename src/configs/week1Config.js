export const week1Config = {
  title: "Week 1 - Budgeting",
  inputCells: ["C17", "C21", "C23", "C25", "C27", "C29", "C31", "C33"],
  readonlyCells: ["C10", "D17", "D21", "D23", "D25", "D27", "D29", "D31", "D33", "D35", "C35"],
  calculatedFields: [
    { output: "D17", formula: "C10 * 0.36" },    // Rent
    { output: "D21", formula: "C10 * 0.006" },   // Electricity
    { output: "D23", formula: "C10 * 0.004" },   // Gas
    { output: "D25", formula: "C10 * 0.006" },   // Water
    { output: "D27", formula: "C10 * 0.004" },   // Sewer/Trash
    { output: "D29", formula: "C10 * 0.008" },   // Phone
    { output: "D31", formula: "C10 * 0.008" },   // Internet
    { output: "D33", formula: "C10 * 0.004" },   // Miscellaneous
    { output: "D35", formula: "SUM(D21,D23,D25,D27,D29,D31,D33)" },  // Utilities Total Recommended
    { output: "C35", formula: "SUM(C21,C23,C25,C27,C29,C31,C33)" }   // Utilities Total Entered
  ],
  requiredSheets: [
    "Week 1 B - Cost of Living Area",
    "Week 1 B - Federal Tax",
    "Week 1 B - State Tax"
  ]
}; 