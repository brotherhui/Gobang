package funny.gobang.controller;

import static funny.gobang.AppConstants.BLACK;
import static funny.gobang.AppConstants.BOARD_SIZE;
import static funny.gobang.AppConstants.EMPTY;
import static funny.gobang.AppConstants.WHITE;

import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import funny.gobang.AppUtil;
import funny.gobang.model.AiResponse;
import funny.gobang.model.PlayerDetails;
import funny.gobang.model.Point;
import funny.gobang.service.AiService;
import funny.gobang.service.BoardService;

/**
 * Created by charlie on 2016/8/14.
 */
@RestController
public class GobangController {
	private ConcurrentHashMap<String, PlayerDetails> playerDetails = new ConcurrentHashMap();

    @Autowired
    private AiService aiService;

    @Autowired
    private BoardService boardService;

    @RequestMapping("/init/{drawNum}/{row}/{col}")
    public void init(@PathVariable int row, @PathVariable int col, @PathVariable String drawNum ) {
    	int x = row;
    	int y = col;
    	PlayerDetails details = new PlayerDetails();
        details.setBoard(x, y, details.getMoves().size() % 2 == 0 ? BLACK : WHITE);
        Point point = new Point(x, y);
        details.addMoves(point);
        playerDetails.put(drawNum, details);
    }

    @RequestMapping("/start/{drawNum}/{stone}")
    public AiResponse start(@PathVariable int stone, @PathVariable String drawNum ) {
    	PlayerDetails details = playerDetails.get(drawNum);
    	//TODO need to check details here
    	details.setAiStone(stone);
        if(stone == BLACK){
        	details.setPlayerStone(WHITE);
        }else{
        	details.setPlayerStone(BLACK);
        }
        boolean blackMove = details.getMoves().size() % 2 == 0;
        if (stone == BLACK && blackMove || stone == WHITE && !blackMove) {
            int[][] copyOfBoard = AppUtil.copyOf(details.getBoard());
            AiResponse aiResponse = aiService.play(copyOfBoard, stone);
            details.setBoard(aiResponse.getPoint().getX(), aiResponse.getPoint().getY(), stone);
            details.addMoves(aiResponse.getPoint());
            return aiResponse;
        }
        return null;
    }
    
    private boolean judgePlayerWin(int x, int y, Point point, int[][] board, int playerStone) {
		boolean win = boardService.isWin(board, point, playerStone);
        AiResponse aiResponse = new AiResponse();
        if (win) {
        	return true;
        }
        return false;
    }

    @RequestMapping("/play/{drawNum}/{row}/{col}")
    public AiResponse play(@PathVariable int row, @PathVariable int col, @PathVariable String drawNum ) {
    	//Player落子
    	int x = row;
    	int y = col;
    	PlayerDetails details = playerDetails.get(drawNum);
    	details.setBoard(x, y, details.getPlayerStone());
        Point point = new Point(x, y);
        details.addMoves(point);
        if(judgePlayerWin(x,y, point, details.getBoard(),details.getPlayerStone())){
        	AiResponse humenResponse = new AiResponse();
        	humenResponse.setPoint(point);
        	humenResponse.setWin(true);
        	humenResponse.setStone(details.getPlayerStone());
            return humenResponse;
        }else{
        	//人没赢, 看AI走
        	int[][] copyOfBoard = AppUtil.copyOf(details.getBoard());
            AiResponse aiResponse = aiService.play(copyOfBoard, details.getAiStone());
            details.setBoard(aiResponse.getPoint().getX(), aiResponse.getPoint().getY(), details.getAiStone());
            details.addMoves(aiResponse.getPoint());
            return aiResponse;
        }
    }
    

    @RequestMapping("/regret/{drawNum}")
    public void regret(@PathVariable String drawNum) {
    	PlayerDetails details = playerDetails.get(drawNum);
        if (details.getMoves().size() > 0) {
            Point p = details.getMoves().remove(details.getMoves().size() - 1);
            details.setBoard(p.getX(), p.getY(), EMPTY);
        }
        if (details.getMoves().size() > 0) {
            Point p = details.getMoves().remove(details.getMoves().size() - 1);
            details.setBoard(p.getX(), p.getY(), EMPTY);
        }
    }

    @RequestMapping("/reset/{drawNum}")
    public void reset(@PathVariable String drawNum) {
    	PlayerDetails details = playerDetails.get(drawNum);
    	if(details==null) return;
    	details.setBoard(new int[BOARD_SIZE][BOARD_SIZE]);
    	details.setPlayerStone(0);
    	details.setAiStone(0);
    	details.getMoves().clear();
    }
}
