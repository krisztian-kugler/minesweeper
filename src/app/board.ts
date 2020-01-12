import Square from "./square";
import { Position } from "./models";

class Board {
  constructor(public cols: number = 10, public rows: number = 10) {
    if (this.cols < 10) this.cols = 10;
    if (this.rows < 10) this.rows = 10;
    this.initSquares();
    this.create();
  }

  squares: Square[][];
  template: HTMLDivElement;
  private playing = true;

  initSquares() {
    this.squares = [];
    for (let i = 0; i < this.rows; i++) {
      this.squares.push([]);
    }
  }

  mount(selector: string) {
    const slot = document.querySelector(selector);
    if (slot) {
      slot.insertAdjacentElement("beforeend", this.template);
      this.addEventListeners();
    } else {
      throw new Error(`Board cannot be mounted on '${selector}'. Element doesn't exist.`);
    }
  }

  create() {
    this.template = document.createElement("div");
    this.template.classList.add("board");
    this.template.style.gridTemplate = `repeat(${this.rows}, 24px) / repeat(${this.cols}, 24px)`;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.addSquare(row, col);
      }
    }

    this.calcAdjacentMines();
  }

  private calcAdjacentMines() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (!this.squares[row][col].mine) this.detectAdjacentMines(this.squares[row][col]);
      }
    }
  }

  private detectAdjacentMines(square: Square) {
    const startRow = square.position.row - 1;
    const startCol = square.position.col - 1;
    const endRow = square.position.row + 1;
    const endCol = square.position.col + 1;

    const detectMine = (row: number, col: number) => {
      if (row >= 0 && row < this.rows && col >= 0 && col < this.cols && this.squares[row][col].mine) {
        square.adjacentMines++;
      }
    };

    for (let i = startCol; i <= endCol - 1; i++) detectMine(startRow, i);
    for (let i = startRow; i <= endRow - 1; i++) detectMine(i, endCol);
    for (let i = endCol; i >= startCol + 1; i--) detectMine(endRow, i);
    for (let i = endRow; i >= startRow + 1; i--) detectMine(i, startCol);
  }

  private gameOver(square: Square) {
    this.playing = false;
    square.template.classList.add("exploded");
    this.revealAllMines();
  }

  private revealAllMines() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.squares[row][col].mine) this.squares[row][col].reveal();
      }
    }
  }

  private addEventListeners() {
    this.template.addEventListener("click", event => this.PrimaryClickHandler(event));
    this.template.addEventListener("contextmenu", event => this.SecondaryClickHandler(event));
  }

  private PrimaryClickHandler(event: MouseEvent) {
    if (!this.playing) return;
    const square = this.getClickedSquare(event);
    if (!square.marked) {
      if (square.mine) {
        this.gameOver(square);
      } else if (square.adjacentMines > 0) {
        square.reveal();
      } else {
        this.unfold(square);
      }
    }
  }

  private SecondaryClickHandler(event: MouseEvent) {
    event.preventDefault();
    if (!this.playing) return;
    const square = this.getClickedSquare(event);
    square.toggleMark();
  }

  private getClickedSquare(event: MouseEvent): Square {
    const row = parseInt((event.target as HTMLDivElement).dataset.row) - 1;
    const col = parseInt((event.target as HTMLDivElement).dataset.col) - 1;
    return this.squares[row][col];
  }

  private addSquare(row: number, col: number) {
    const position: Position = { row, col };
    const mine = Math.random() > 0.85 ? true : false;
    const square = new Square(position, mine);
    this.squares[row][col] = square;
    this.template.insertAdjacentElement("beforeend", square.template);
  }

  unfold(square: Square) {
    if (square.revealed) return;

    square.reveal();

    if (square.adjacentMines) return;

    const top: Position = {
      row: square.position.row - 1,
      col: square.position.col
    };
    const bottom: Position = {
      row: square.position.row + 1,
      col: square.position.col
    };
    const left: Position = {
      row: square.position.row,
      col: square.position.col - 1
    };
    const right: Position = {
      row: square.position.row,
      col: square.position.col + 1
    };
    const topLeft: Position = {
      row: square.position.row - 1,
      col: square.position.col - 1
    };
    const topRight: Position = {
      row: square.position.row - 1,
      col: square.position.col + 1
    };
    const bottomLeft: Position = {
      row: square.position.row + 1,
      col: square.position.col - 1
    };
    const bottomRight: Position = {
      row: square.position.row + 1,
      col: square.position.col + 1
    };

    const detectMine = (row: number, col: number, callback: Function) => {
      if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
        callback(this.squares[row][col]);
      }
    };

    if (top.row >= 0 && top.row < this.rows && top.col >= 0 && top.col < this.cols)
      this.unfold(this.squares[top.row][top.col]);
    if (bottom.row >= 0 && bottom.row < this.rows && bottom.col >= 0 && bottom.col < this.cols)
      this.unfold(this.squares[bottom.row][bottom.col]);
    if (left.row >= 0 && left.row < this.rows && left.col >= 0 && left.col < this.cols)
      this.unfold(this.squares[left.row][left.col]);
    if (right.row >= 0 && right.row < this.rows && right.col >= 0 && right.col < this.cols)
      this.unfold(this.squares[right.row][right.col]);

    if (topLeft.row >= 0 && topLeft.row < this.rows && topLeft.col >= 0 && topLeft.col < this.cols)
      this.unfold(this.squares[topLeft.row][topLeft.col]);
    if (bottomLeft.row >= 0 && bottomLeft.row < this.rows && bottomLeft.col >= 0 && bottomLeft.col < this.cols)
      this.unfold(this.squares[bottomLeft.row][bottomLeft.col]);
    if (topRight.row >= 0 && topRight.row < this.rows && topRight.col >= 0 && topRight.col < this.cols)
      this.unfold(this.squares[topRight.row][topRight.col]);
    if (bottomRight.row >= 0 && bottomRight.row < this.rows && bottomRight.col >= 0 && bottomRight.col < this.cols)
      this.unfold(this.squares[bottomRight.row][bottomRight.col]);
  }

  clear() {
    this.initSquares();
    this.template.innerHTML = "";
  }
}

export default Board;
