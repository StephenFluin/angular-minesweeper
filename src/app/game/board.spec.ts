import { Board } from './board';

/** Builds a board whose mines are placed at the given [row, column] coordinates. */
function boardWithMines(size: number, mines: [number, number][]): Board {
  const values: number[] = [];
  for (const [y, x] of mines) {
    // getRandomCell() calls Math.random() for the row, then the column.
    values.push((y + 0.5) / size, (x + 0.5) / size);
  }
  const spy = vi.spyOn(Math, 'random').mockImplementation(() => values.shift() ?? 0);
  try {
    return new Board(size, mines.length);
  } finally {
    spy.mockRestore();
  }
}

describe('Board', () => {
  it('creates a size x size grid of unopened cells with correct coordinates', () => {
    const board = new Board(5, 3);
    expect(board.cells.length).toBe(5);
    for (let y = 0; y < 5; y++) {
      expect(board.cells[y].length).toBe(5);
      for (let x = 0; x < 5; x++) {
        const cell = board.cells[y][x];
        expect(cell.row).toBe(y);
        expect(cell.column).toBe(x);
        expect(cell.status()).toBe('open');
      }
    }
  });

  it('places mines where getRandomCell points', () => {
    const board = boardWithMines(4, [
      [0, 0],
      [3, 2],
    ]);
    const mined = board.cells.flat().filter((c) => c.mine);
    expect(mined.map((c) => [c.row, c.column])).toEqual([
      [0, 0],
      [3, 2],
    ]);
  });

  it('never places more mines than requested', () => {
    const board = new Board(10, 20);
    expect(board.cells.flat().filter((c) => c.mine).length).toBeLessThanOrEqual(20);
  });

  it('counts adjacent mines, including at edges and corners', () => {
    const board = boardWithMines(3, [
      [0, 0],
      [0, 2],
    ]);
    expect(board.cells.map((row) => row.map((c) => c.proximityMines))).toEqual([
      [0, 2, 0],
      [1, 2, 1],
      [0, 0, 0],
    ]);
  });

  describe('checkCell', () => {
    it('returns gameover and reveals everything when a mine is clicked', () => {
      const board = boardWithMines(3, [[1, 1]]);
      board.cells[2][2].status.set('flag');

      expect(board.checkCell(board.cells[1][1])).toBe('gameover');
      for (const cell of board.cells.flat()) {
        if (cell === board.cells[2][2]) {
          expect(cell.status()).toBe('flag');
        } else {
          expect(cell.status()).toBe('clear');
        }
      }
    });

    it('clears a numbered cell without cascading', () => {
      const board = boardWithMines(3, [[0, 0]]);
      expect(board.checkCell(board.cells[1][1])).toBeNull();
      expect(board.cells[1][1].status()).toBe('clear');
      const cleared = board.cells.flat().filter((c) => c.status() === 'clear');
      expect(cleared.length).toBe(1);
    });

    it('cascades through empty cells and stops at numbered borders', () => {
      const board = boardWithMines(4, [[0, 0]]);
      board.checkCell(board.cells[3][3]);
      for (const cell of board.cells.flat()) {
        expect(cell.status()).toBe(cell.mine ? 'open' : 'clear');
      }
    });

    it('returns win once every safe cell is cleared', () => {
      const board = boardWithMines(2, [[0, 0]]);
      expect(board.checkCell(board.cells[0][1])).toBeNull();
      expect(board.checkCell(board.cells[1][0])).toBeNull();
      expect(board.checkCell(board.cells[1][1])).toBe('win');
    });

    it('ignores cells that are already cleared or flagged', () => {
      const board = boardWithMines(3, [[0, 0]]);
      board.checkCell(board.cells[1][1]);
      expect(board.checkCell(board.cells[1][1])).toBeNull();

      board.cells[0][0].status.set('flag');
      expect(board.checkCell(board.cells[0][0])).toBeNull();
      expect(board.cells[0][0].status()).toBe('flag');
    });
  });
});
