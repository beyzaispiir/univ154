# ML Research: Graph Theory and Machine Learning for Domination Number Prediction

## Overview

This research project explores the intersection of graph theory and machine learning by investigating different approaches to predict the **domination number** of graphs. The domination number is a fundamental concept in graph theory that represents the minimum number of vertices needed to dominate all other vertices in a graph.

## Research Objective

The main goal is to compare the effectiveness of different machine learning approaches against classical algorithms for solving the domination number problem:

- **Convolutional Neural Networks (CNN)**
- **Graph Neural Networks (GNN)** 
- **Classical Graph Algorithms (GraphCalc)**

## Project Files

### Main Research File
- **`CNN_Combinatorial_Graph_Properties.ipynb`** - This is the main original research file containing the core CNN implementation for predicting combinatorial graph properties, including the domination number. This notebook serves as the foundation for the entire research project.

### Comparative Analysis Files
- **`domination number CNN vs graphcalc.ipynb`** - Compares CNN performance against classical graph algorithms for domination number prediction
- **`domination number GNN vs CNN.ipynb`** - Compares Graph Neural Networks vs Convolutional Neural Networks approaches
- **`domination number GNN vs graphcalc.ipynb`** - Compares GNN performance against classical graph algorithms

### Results and Visualizations
- **`domination_number_prediction_comparison.png`** - Visualization comparing prediction accuracy across different approaches
- **`domination_number_prediction_comparison_test_set.png`** - Test set results and performance metrics visualization

## Methodology

### 1. CNN Approach
- Uses Convolutional Neural Networks to learn graph representations
- Processes graph adjacency matrices as 2D images
- Learns to predict domination numbers from graph structural features

### 2. GNN Approach  
- Employs Graph Neural Networks specifically designed for graph data
- Leverages graph convolutional layers to capture node relationships
- Processes graph structure directly without flattening to 2D

### 3. Classical Algorithm (GraphCalc)
- Implements traditional graph algorithms for domination number calculation
- Serves as the baseline for comparison with ML approaches

### Current Graph Types
- **Erdos-Renyi Random Graphs**: Current research focuses on these classical random graph models
- **Graph Properties**: Various sizes and edge probabilities to test model robustness

## Key Findings

The research investigates:
- Which ML approach (CNN vs GNN) performs better for graph theory problems
- How ML methods compare to classical algorithms in terms of accuracy and efficiency
- The trade-offs between different approaches for combinatorial graph property prediction

## Technical Details

- **Language**: Python
- **Main Libraries**: TensorFlow/PyTorch, NetworkX, NumPy, Matplotlib
- **Data**: Synthetic graph datasets with known domination numbers
- **Evaluation Metrics**: Accuracy, Precision, Recall, F1-Score

## Usage

1. Start with the main file: `CNN_Combinatorial_Graph_Properties.ipynb`
2. Run the comparative analysis notebooks to see performance comparisons
3. Review the visualization files for results interpretation

## Research Significance

This project contributes to the growing field of applying machine learning to combinatorial optimization problems, specifically in graph theory. It provides insights into whether modern ML techniques can effectively solve classical graph theory problems and which approaches are most suitable for different types of graph structures.

## Future Work

Potential extensions include:
- **Graph Type Expansion**: Extending the research beyond Erdos-Renyi random graphs to include scale-free graphs (like social networks, biological networks, and the internet) which have power-law degree distributions and would provide more realistic test cases for real-world applications.
- Testing on larger and more complex graph datasets
- Exploring other graph properties beyond domination number
- Investigating hybrid approaches combining ML and classical algorithms
- Performance optimization for real-world applications
- Comparative analysis of model performance across different graph topologies

---

*This research demonstrates the potential of machine learning in solving classical graph theory problems and provides a foundation for further exploration in this interdisciplinary field.* 