# Path finder

1. Uses Dijkstra's algorithm to find the path with the lowest ABI cost
2. Tracks learned moves along the path
3. Considers both evolution and devolution paths
4. Takes evolution ABI requirements into account
5. Generates nine possible level scenarios (10 to 90) for each evolution
6. Returns the path that learns all required moves using the least ABI

The implementation works as follows:

1. Each edge cost is the ABI requirement of that evolution
2. For every evolution or de-evolution the algorithm explores 9 possible levels
   (10, 20, ..., 90) to determine ABI gain
3. Each state in the search includes:
   - Current digimon ID
   - Set of learned moves
   - Path taken to reach this state
   - Current ABI cost
4. The algorithm checks if a digimon can learn any required moves at each step
5. It explores both evolution (next) and devolution (prev) paths using Dijkstra's ordering
6. It returns the path that reaches the target digimon with all required moves using the least ABI

The algorithm returns an array of `PathStep` objects, where each step contains:
- `digimonId`: The ID of the digimon in this step
- `learnedMoves`: An array of move IDs that were learned by evolving into this digimon

For example, a path might look like:
```typescript
[
  { digimonId: "1", learnedMoves: [] },           // Starting digimon
  { digimonId: "9", learnedMoves: ["2", "3"] },   // Learned moves 2 and 3
  { digimonId: "12", learnedMoves: ["4"] },       // Learned move 4
  { digimonId: "15", learnedMoves: [] }           // Target digimon
]
```

The algorithm will return:
- The path as an array of `PathStep` objects if a valid path is found
- `null` if no valid path exists

