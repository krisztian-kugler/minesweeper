import SquareComponent from "./square.component";

class BoardComponent extends HTMLElement {
  constructor(public cols: number = 10, public rows: number = 10) {
    super();
    if (this.cols < 10) this.cols = 10;
    if (this.rows < 10) this.rows = 10;
    this.create();
  }

  squares: SquareComponent[][] = [];
  template: HTMLDivElement;
  private playing = true;

  create() {
    this.template = document.createElement("div");
    this.template.classList.add("board");
    this.template.style.gridTemplate = `repeat(${this.rows}, 24px) / repeat(${this.cols}, 24px)`;

    for (let row = 0; row < this.rows; row++) {
      const arr: SquareComponent[] = [];
      for (let col = 0; col < this.cols; col++) {
        arr[col] = this.createSquare(row, col);
      }
      this.squares[row] = arr;
    }

    this.forEach(this.detectAdjacentSquares);
  }

  private forEach(callBack: Function) {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) callBack.call(this, this.squares[row][col]);
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

  clear() {
    this.squares = []
    this.template.innerHTML = "";
  }

  private detectAdjacentSquares(square: SquareComponent) {
    const startRow = square.position.row - 1,
      startCol = square.position.col - 1,
      endRow = square.position.row + 1,
      endCol = square.position.col + 1;
    for (let i = startCol; i <= endCol - 1; i++) if (this.getSquare(startRow, i)) square.addAdjacentSquare(this.squares[startRow][i]);
    for (let i = startRow; i <= endRow - 1; i++) if (this.getSquare(i, endCol)) square.addAdjacentSquare(this.squares[i][endCol]);
    for (let i = endCol; i >= startCol + 1; i--) if (this.getSquare(endRow, i)) square.addAdjacentSquare(this.squares[endRow][i]);
    for (let i = endRow; i >= startRow + 1; i--) if (this.getSquare(i, startCol)) square.addAdjacentSquare(this.squares[i][startCol]);
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

  private getClickedSquare(event: MouseEvent): SquareComponent {
    const row = parseInt((event.target as HTMLDivElement).dataset.row) - 1;
    const col = parseInt((event.target as HTMLDivElement).dataset.col) - 1;
    return this.squares[row][col];
  }

  private getSquare(row: number, col: number): SquareComponent {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols ? this.squares[row][col] : null;
  }

  private createSquare(row: number, col: number): SquareComponent {
    const square = new SquareComponent({ row, col }, Math.random() > 0.85 ? true : false);
    this.template.insertAdjacentElement("beforeend", square.template);
    return square;
  }

  private unfold(square: SquareComponent) {
    if (square.revealed) return;
    square.reveal();
    if (square.adjacentMines) return;
    square.adjacentSquares.forEach(s => this.unfold(s));
  }

  private gameOver(square: SquareComponent) {
    this.playing = false;
    square.template.classList.add("exploded");
    this.forEach((square: SquareComponent) => {
      if (square.mine) square.reveal();
    });
  }
}

customElements.define("app-board", BoardComponent)
export default BoardComponent;
