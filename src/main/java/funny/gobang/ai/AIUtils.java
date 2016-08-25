package funny.gobang.ai;

import funny.gobang.model.ChessBoard;
import funny.gobang.model.ChessType;
import funny.gobang.model.Point;

public class AIUtils {

	public static Point[] directons = new Point[]{new Point(1,1),new Point(-1,1),new Point(0,1),new Point(1,0)};
	
	
    public static boolean checkIfWin(ChessBoard board,Point point){
    	for (int i=0; i < directons.length ;i++){
    		if (getContinousCount(board, point, directons[i]) == 5){
    			return true;
    		}
    	}
    	return false;
    }
    
    public static int getContinousCount(ChessBoard board,Point point,Point directionDelta){
    	
    	if (board.getChessType(point) == ChessType.EMPTY){
    		return 0;
    	}
    	
      	int continousCount = 1;
    	int cap = board.getCapacity();
    	int dltX = directionDelta.getX();
    	int dltY = directionDelta.getY();
    	int chessType = board.getChessType(point);
    	
		for (int x= point.getX()+dltX ,y= point.getY()+dltY; x < cap && x >= 0 && y < cap && y>=0;x += dltX,y += dltY){
		    
			if (chessType == board.getChessType(x,y)){
				continousCount++;
			}else{
				break;
			}
		}
		
		for (int x= point.getX()-dltX ,y= point.getY()-dltY; x < cap && x >= 0 && y < cap && y>=0;x -= dltX,y -= dltY){
		    
			if (chessType == board.getChessType(x,y)){
				continousCount++;
			}else{
				break;
			}
		}
		
		return continousCount;
    	
    }
    
	
}
