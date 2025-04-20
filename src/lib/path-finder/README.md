# Path finder

1. Uses BFS to find the shortest path between digimon
2. Tracks learned moves along the path
3. Considers both evolution and devolution paths
4. Returns the shortest path that learns all required moves
5. Handles the case where no moves are required
6. Properly typed the database objects to fix TypeScript errors

The implementation works as follows:

1. If no skills are required, it uses a simpler BFS to find the shortest path
2. Otherwise, it uses a BFS that tracks both the path and learned moves
3. Each state in the BFS includes:
   - Current digimon ID
   - Set of learned moves
   - Path taken to reach this state
4. The algorithm checks if a digimon can learn any required moves at each step
5. It explores both evolution (next) and devolution (prev) paths
6. It returns the first path that reaches the target digimon with all required moves learned

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

