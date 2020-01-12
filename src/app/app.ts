import Board from "./board";

const appInit = () => {
  let board = new Board(40, 25);
  board.mount(".main");
  console.log(board);
};

export default appInit;
