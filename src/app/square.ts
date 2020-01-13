import { Position } from "./models";

class Square {
  constructor(public position: Position, public mine: boolean) {
    this.create();
  }

  template: HTMLDivElement;
  marked = false;
  revealed = false;
  adjacentMines = 0;
  adjacentSquares: Square[] = [];
  private flagHtml = `<i class="fas fa-flag"></i>`;
  private bombHtml = `<i class="fas fa-bomb"></i>`;

  addAdjacentSquare(square: Square) {
    this.adjacentSquares.push(square);
    if (square.mine) this.adjacentMines++;
  }

  reveal() {
    this.revealed = true;
    if (this.mine) {
      this.template.classList.add("mine");
      this.template.insertAdjacentHTML("afterbegin", this.bombHtml);
    } else {
      this.template.classList.add("revealed");
      this.adjacentMines ? (this.template.innerText = this.adjacentMines.toString()) : null;
    }
  }

  toggleMark() {
    if (this.revealed) return;
    if (this.marked) {
      this.marked = false;
      this.template.classList.remove("marked");
      this.template.innerHTML = "";
    } else {
      this.marked = true;
      this.template.classList.add("marked");
      this.template.insertAdjacentHTML("afterbegin", this.flagHtml);
    }
  }

  private create() {
    this.template = document.createElement("div");
    this.template.classList.add("square");
    this.template.setAttribute("data-row", `${this.position.row + 1}`);
    this.template.setAttribute("data-col", `${this.position.col + 1}`);
    this.template.style.gridArea = `${this.position.row + 1} / ${this.position.col + 1}`;
  }
}

export default Square;
