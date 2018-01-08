package funny.gobang.controller;

import funny.gobang.AppConstants;
import funny.gobang.AppUtil;
import funny.gobang.model.AiResponse;
import funny.gobang.model.Point;
import funny.gobang.service.AiService;
import funny.gobang.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;

import java.util.ArrayList;
import java.util.List;

import static funny.gobang.AppConstants.*;

/**
 * Created by charlie on 2016/8/14.
 */
@RestController
@Scope(WebApplicationContext.SCOPE_SESSION)
public class GobangController {
	
    private int[][] board = new int[BOARD_SIZE][BOARD_SIZE];
    private List<Point> moves = new ArrayList<Point>(BOARD_SIZE * BOARD_SIZE);
    private int aiStone;
    private int playerStone;

    @Autowired
    private AiService aiService;

    @Autowired
    private BoardService boardService;

    @RequestMapping("/init/{row}/{col}")
    public void init(@PathVariable int row, @PathVariable int col) {
    	int x = row;
    	int y = col;
        board[x][y] = moves.size() % 2 == 0 ? BLACK : WHITE;
        Point point = new Point(x, y);
        moves.add(point);
    }

    @RequestMapping("/start/{stone}")
    public AiResponse start(@PathVariable int stone) {
        aiStone = stone;
        if(aiStone == BLACK){
        	playerStone = WHITE;
        }else{
        	playerStone = BLACK;
        }
        boolean blackMove = moves.size() % 2 == 0;
        if (aiStone == BLACK && blackMove || aiStone == WHITE && !blackMove) {
            int[][] copyOfBoard = AppUtil.copyOf(board);
            AiResponse aiResponse = aiService.play(copyOfBoard, aiStone);
            board[aiResponse.getPoint().getX()][aiResponse.getPoint().getY()] = aiStone;
            moves.add(aiResponse.getPoint());
            return aiResponse;
        }
        return null;
    }
    
    private boolean judge(int x, int y, Point point) {
        boolean win = boardService.isWin(board, point, playerStone);
        AiResponse aiResponse = new AiResponse();
        if (win) {
        	return true;
        }
        return false;
    }

    @RequestMapping("/play/{row}/{col}")
    public AiResponse play(@PathVariable int row, @PathVariable int col) {
    	//Player落子
    	int x = row;
    	int y = col;
        board[x][y] = playerStone;
        Point point = new Point(x, y);
        moves.add(point);
        if(judge(x,y, point)){
        	AiResponse humenResponse = new AiResponse();
        	humenResponse.setPoint(point);
        	humenResponse.setWin(true);
        	humenResponse.setStone(board[x][y]);
            return humenResponse;
        }else{
        	//人没赢, 看AI走
        	int[][] copyOfBoard = AppUtil.copyOf(board);
            AiResponse aiResponse = aiService.play(copyOfBoard, aiStone);
            board[aiResponse.getPoint().getX()][aiResponse.getPoint().getY()] = aiStone;
            moves.add(aiResponse.getPoint());
            return aiResponse;
        }
    }
    

    @RequestMapping("/regret")
    public void regret() {
        if (moves.size() > 0) {
            Point p = moves.remove(moves.size() - 1);
            board[p.getX()][p.getY()] = EMPTY;
        }
        if (moves.size() > 0) {
            Point p = moves.remove(moves.size() - 1);
            board[p.getX()][p.getY()] = EMPTY;
        }
    }

    @RequestMapping("/reset")
    public void reset() {
        board = new int[BOARD_SIZE][BOARD_SIZE];
        aiStone = 0;
        moves.clear();
    }
}
