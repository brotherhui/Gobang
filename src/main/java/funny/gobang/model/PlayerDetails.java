package funny.gobang.model;

import static funny.gobang.AppConstants.BOARD_SIZE;

import java.util.ArrayList;
import java.util.List;

public class PlayerDetails {
    private int[][] board = new int[BOARD_SIZE][BOARD_SIZE];
    private List<Point> moves = new ArrayList<Point>(BOARD_SIZE * BOARD_SIZE);
    private int aiStone;
    private int playerStone;
    
	public int[][] getBoard() {
		return board;
	}
	public void setBoard(int[][] board) {
		this.board = board;
	}
	
	public void setBoard(int x, int y, int value) {
		board[x][y] = value;
	}
	
	public List<Point> getMoves() {
		return moves;
	}
	public void setMoves(List<Point> moves) {
		this.moves = moves;
	}
	
	public void addMoves(Point point){
		moves.add(point);
	}
	
	public int getAiStone() {
		return aiStone;
	}
	public void setAiStone(int aiStone) {
		this.aiStone = aiStone;
	}
	public int getPlayerStone() {
		return playerStone;
	}
	public void setPlayerStone(int playerStone) {
		this.playerStone = playerStone;
	}
    
    
}
