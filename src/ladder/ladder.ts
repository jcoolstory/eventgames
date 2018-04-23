
enum LadderGameStatus{
    prepare, ready, pathdraw , finished
}
class StartButton extends Button
{
    isOver : boolean = false;
}

class LadderGame  extends GameRenderer {

    private status : LadderGameStatus = LadderGameStatus.prepare;
    private screenWidth = 750;
    private horizontalBar = 6;
    private verticalBar = 9;
    private paddingX = 137;
    private paddingY = 60;
    private selectedNumber = -1;
    private buttons : Array<Button> = [];
    private crossPoints = Object();
    private selectedPath :Array<Point>;
    private playtime = 0; 
    private prepareTime = 0.2;
    private lineLength = 0;
    private horizontalBarMargin = 150;
    private verticalBarMargin =50;
    private barHeight = 500;
    private pathVelocity = 300;
    private receiveIndex = -1;
    private debug = false;
    private startButton : StartButton;
    /**
     *  start event (start button click ) 
     */
    public onStart : Function  = ()=>{};
    /**
     * end event (when rotate stop)
     */
    public onEnd : Function = ()=>{};
    private items : Array<any> = undefined;
    private isStart = true;
    private checkedIcon : ImageObject;
    public init(config: Object) : boolean
    {
        super.init(config);

        let drawBaseLine = true;
        var imgUrlPrefix = "./img/";

        var defaultItem = [
            {"title":"적립금 10,000P" ,        "color" : "#25284b"},  //0
            {"title":"할인쿠폰 3,000원" ,      "color" : "#25284b"},   //1
            {"title":"할인쿠폰 5,000원" ,      "color" : "#25284b"},   //2
            {"title":"꽝!",                   "color" : "#d34100"},    //3
            {"title":"적립금 500P" ,           "color" : "#25284b"}, //4
            {"title":"적립금 1,000P" ,         "color" : "#25284b"}, //5
        ]
        var isStart = false; 

        this.items = this.getParameter(config,"items", defaultItem);        
        this.onStart = this.getParameter(config, "onStart", this.onStart);
        this.onEnd = this.getParameter(config, "onEnd", this.onEnd);
        imgUrlPrefix = this.getParameter(config,"imageurl", imgUrlPrefix);
        this.isStart = this.getParameter(config, "isStart", isStart); 
        this.horizontalBar = this.items.length;
        
        this.checkedIcon = new ImageObject(imgUrlPrefix +"ladder_checked.png");

        var baseCrossPoint = this.initBasePoint(this.horizontalBar,this.verticalBar);
        this.crossPoints = this.initCrossPoint(this.horizontalBar,this.verticalBar);
        this.horizontalBarMargin = this.screenWidth / (this.horizontalBar-1);
        
        this.renderCollection.push({           
            update(delayTime){

            },
            render : (c)=>{this.draw(c)}
        })

        for(var i = 0 ; i < this.horizontalBar ; i++)
        {
            var button = new Button();
            button.id = i;
            button.x = 80 + this.horizontalBarMargin * i;
            button.y = 10;
            button.width = 110;
            button.height = 110;
            button.onClick = (evt, sender) =>{
                this.selectNumber(sender)
            };
            this.buttons.push(button);
        }
        var startButton = new StartButton();
        startButton.id = 100, 
        startButton.x = 330, 
        startButton.y = 350;
        startButton.width = 300
        startButton.height = 80;
        startButton.onClick = (evt, sender) =>{
            this.startFindPath();
        }
        this.startButton = startButton;
        this.buttons.push(startButton);

        //this.paths =  this.pathCreate();
        return true;
    }

    draw(c: CanvasRenderingContext2D) {
        if (this.status == LadderGameStatus.prepare)
        {
            c.font = "bold 1px Nanum Gothic";
            c.measureText("fontload");
        }
        c.lineCap = "round";
        c.lineJoin = "round";
        c.save();
        // ladder draw
        c.save();
        c.translate(this.paddingX, this.paddingY+ 50);
        
        c.lineWidth = 14;
        
        // vertical bar draw
        for ( var i = 0 ; i < this.horizontalBar ; i++)  {
            GameUtil.drawLine(c,  i * this.horizontalBarMargin , 0,  i * this.horizontalBarMargin,  this.barHeight, "#a2a6cc");
        }

        if (this.status != LadderGameStatus.prepare)
        {
            // path draw
            for (var num in this.crossPoints)
            {
                for ( var j =0 ; j < this.crossPoints[num].length ; j++) {
                    var line : Line =  this.crossPoints[num][j];
                    GameUtil.drawLine(c, line.x1 * this.horizontalBarMargin , line.y1 * this.verticalBarMargin ,
                        line.x2 * this.horizontalBarMargin, line.y2*this.verticalBarMargin , "#a2a6cc");
                }
            }
        }

        // select path draw
        if (this.isStart && this.status == LadderGameStatus.pathdraw || this.status == LadderGameStatus.finished)
        {
            c.strokeStyle = "#7d1a27";
            var path :Array<Point> = this.getCurrentPath(c,this.selectedPath);
            c.beginPath();
            c.moveTo(path[0].x, path[0].y);
            for (var i = 1 ; i < path.length ; i++)
            {
                var point : Point = path[i];
                c.lineTo(point.x,point.y);
            }
            c.stroke();
        }

        c.restore();
        
        // draw ui
        this.drawButtons(c);
        if (this.isStart && this.status == LadderGameStatus.ready)
        {
            this.drawReadyPopup(c);
        }
        c.restore();
    }

    private drawReadyPopup(c:GameCanvas)
    {
        if (this.debug)
            return;
        
        c.fillStyle = "white";
        c.strokeStyle = "#a2a6cc";
        c.lineWidth = 8;
        GameUtil.roundRect(c,81,180,840,300,15,true,true);

        c.fillStyle = "#25284b";
        c.font = "bold 38px Nanum Gothic"
        c.fillText("마음에 드는 번호를 클릭한 후 ",270,260);

        c.font = "bold 30px Nanum Gothic"
        c.fillStyle ="#535353";
        c.fillText("아래 버튼을  눌러주세요 ",330,320);
        
        // draw start button
        c.fillStyle = this.startButton.isOver ? "red" : "#25284b";
        GameUtil.roundRect(c,350,350,300,80,35,true,false);
        c.fillStyle = "white";
        c.fillText("시작하기 ",440,400);
    }

    private drawButtons(c:GameCanvas)
    {
         // top buttons draw
         c.save();
         c.translate(97,60);
         
         c.font = "40px arial";
         c.lineWidth = 2;
         for(var i = 0 ; i < this.horizontalBar ; i++)
         {
            var checked :boolean = this.selectedNumber == i;
             this.drawCircleButton(c,i+1, checked,this.checkedIcon);
             c.translate(this.horizontalBarMargin,0);        
         }
         //
         c.restore();
         if (this.isStart && this.status != LadderGameStatus.prepare)
         {
            // bottom buttons draw
            c.save();
            c.translate(137,this.barHeight+this.paddingY+this.paddingY+ 40);
            var region = {x:-60,y:-40,width:120,height:100};

            // 당첨된 내용 draw
            if (this.status == LadderGameStatus.finished)
            {
                c.font = "bold 25px Nanum Gothic";
                for(var i = 0 ; i < this.horizontalBar ; i++)
                {
                    c.fillStyle = this.items[i].color;
                    if (this.items[i].title)
                    {
                        GameUtil.drawTextRegion(c,this.items[i].title, region,"center","top", 36);
                    }

                    c.translate(this.horizontalBarMargin,0);
                }
            }
            else
            {
                c.fillStyle = "#25284b";
                c.font = "bold 72px Nanum Gothic";
                for(var i = 0 ; i < this.horizontalBar ; i++)
                {
                    c.fillText("?",-25,30);
                    c.translate(this.horizontalBarMargin,0);
                }
            }
            c.restore();
        }
    }
    
    private getCurrentPath(c:GameCanvas, selectPath : Array<Point>){

        var totalLength = 0;
        var resultPoints : Array<Point> = [];
        var drawPath : Array<Point> = selectPath.map( el =>{
            return {x: el.x * this.horizontalBarMargin,y:el.y  * this.verticalBarMargin}
        })
        drawPath.reduce((pre,el)=>{
            totalLength += Math.sqrt(Math.pow(pre.x - el.x,2) + Math.pow(pre.y - el.y,2));
            return el;
        })
        
        
        var lastPoint = {x :drawPath[0].x,  y:drawPath[0].y};
        var willLength = 0;
        var currentLength = 0;;
        
        for (var i = 0 ; i < drawPath.length;i++){

            var element = drawPath[i];                
            willLength += Math.sqrt(Math.pow(lastPoint.x - element.x,2) + Math.pow(lastPoint.y - element.y,2));
                   
            if (this.debug)
            {
                resultPoints.push(element);      
            }
            else{
                
                // 현재 진행된 line 길이가 전체 길이를 넘지않을경우
                if (this.lineLength > willLength)
                {
                    resultPoints.push(element);      
                    currentLength = willLength;
                }
                else
                {
                    // 최종 endpoint 
                    resultPoints.push(this.getEndpoint(lastPoint, element, currentLength) );
                    break;                
                }
            }
            lastPoint = element;
        }

        // 최정 목적지 도착했을경우 finish
        if (totalLength < this.lineLength && this.status != LadderGameStatus.finished)
        {
            // 최종 선택 item 과 위치가 선정된후 나머지 아이템은 랜덤하게 배치된다.
            var goalIndex = this.selectedPath[this.selectedPath.length-1].x;
            var ch_item = this.items.splice(this.receiveIndex,1);
            this.shuffle(this.items);
            this.items.splice(goalIndex,0,ch_item[0]);
            this.status = LadderGameStatus.finished;
            if (this.onEnd)
            {
                this.onEnd(goalIndex,this.items)
            }
            this.stop();
        }

        return resultPoints;    
    }

    /**
     * 배열 섞기
     * @param a array
     */
    shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
    }

    private getEndpoint(lastPoint:Point, element:Point, currentLength : number):Point
    {
        //끝점구하기 진행되었던 마지막코너와 도착할 다음코너와의 중간지점
        var distanceX =  lastPoint.x - element.x;
        var distanceY =  lastPoint.y - element.y
        var angle = Math.atan2(distanceY, distanceX);
        var dist = this.lineLength - currentLength;
        var point =  {x:lastPoint.x - Math.cos(angle) * dist ,y:lastPoint.y -  Math.sin(angle) * dist};
        return point;
    }

    private setIndex(index : number)
    {
        if (index <0 ||index >= this.items.length )
            console.log("falied");
        this.receiveIndex = index;
    }
    
    private drawCircleButton(c: GameCanvas, index:number , checked : boolean ,checkedIcon : ImageObject){
        c.strokeStyle = "white";
        
        c.fillStyle = checked ? "#7d1a27" : "#25284b";
        c.beginPath();
        c.arc(40,0,50,0,360);
        c.fill();
        
        c.beginPath();
        c.arc(40,0,40,0,360);
        c.stroke();
        c.fillStyle = checked ? "#be5a5d" : "white";
        c.fillText(index.toString(),28,15);
        if (checked)
            c.drawImage(checkedIcon.Image, 8, -30, 64,64);
    }

    protected update(delayTime){
        
        switch(this.status)
        {
            case LadderGameStatus.prepare:
                // loading time delay
                this.playtime = this.playtime + delayTime;
                if (this.playtime > this.prepareTime)
                    this.status = LadderGameStatus.ready;
            break;
            case LadderGameStatus.ready:
            
            break;
            case LadderGameStatus.pathdraw:
                
                this.lineLength+= this.pathVelocity * delayTime;
            break;
            case LadderGameStatus.finished:
            break;
        }
    }

    /**
     * deprecaited
     */
    pathCreate() {
        
        var path : Array<Array<Point>> = new Array<Array<Point>>();
        for( var i = 0 ; i < this.horizontalBar; i++)
        {
            path.push(this.generatePath(i));
        }
        return path;
    }

    generatePath(index:number) :Array<Point>
    {
        var path = new Array<Point>();
        var currentPoint : Point;
        var startPoint = {
            x:index,
            y:0
        };
        currentPoint = startPoint;
        path.push(currentPoint);

        // 최종목적지까지 path find
        while(true){
            var fixLeft = this.crossPoints[currentPoint.x-1] ;
            var fixRight = this.crossPoints[currentPoint.x];
            var left : Line = undefined;
            var right : Line = undefined;
            if (fixRight) 
            {
                for (var j = 0 ; j <fixRight.length ; j++){
                    if (fixRight[j].y1 > currentPoint.y)
                    {
                        right =  fixRight[j];                        
                        break;
                    }
                }
            }

            if (fixLeft)
            {
                for (var j = 0 ; j <fixLeft.length ; j++){
                    if (fixLeft[j].y2 > currentPoint.y)
                    {
                        left = fixLeft[j];
                        break;
                    }
                }
            }
            var cur : Point = undefined;
            if (left == undefined && right == undefined)
            {
                path.push({
                            x:currentPoint.x,
                            y:this.verticalBar+1
                        })
                break;
            }

            if (left && right)
            {
                // left
                if (left.y2 < right.y1)
                {
                    cur = {
                        x:currentPoint.x,
                        y:left.y2
                    }
                    path.push(cur);
                    cur = {
                        x:left.x1,
                        y:left.y1
                    }

                    currentPoint = cur;
                    path.push(cur);
                }
                else // right
                {
                    cur = {
                        x:currentPoint.x,
                        y:right.y1
                    }
                    path.push(cur);
                    cur = {
                        x:right.x2,
                        y:right.y2
                    }
                    currentPoint = cur;
                    path.push(cur);
                }
            } // right
            else if (left == undefined)
            {
                cur = {
                    x:currentPoint.x,
                    y:right.y1
                }
                path.push(cur);
                cur = {
                    x:right.x2,
                    y:right.y2
                }
                currentPoint = cur;
                path.push(cur);
            }
            else {
                cur = {
                    x:currentPoint.x,
                    y:left.y2
                }
                path.push(cur);
                cur = {
                    x:left.x1,
                    y:left.y1
                }

                currentPoint = cur;
                path.push(cur);
            }
        }
        return path;
    }

    selectNumber(index : Button){
        if (this.debug)
        {
            this.selectedNumber = index.id;
            this.selectedPath =  this.generatePath(this.selectedNumber);
            var selectPath : Array<Point> =  this.selectedPath.map( el =>{
                return {x: el.x * this.horizontalBarMargin,y:el.y  * this.verticalBarMargin +  20}
            });
            var totalLength = 0;
            selectPath.reduce((pre,el)=>{
                totalLength += Math.abs(pre.x - el.x + pre.y - el.y);
                return el;
            })
            this.lineLength = 0;
            this.status = LadderGameStatus.pathdraw;
            return;
        }
        if (this.status == LadderGameStatus.ready)
        {
            this.selectedNumber = index.id;
            this.selectedPath =  this.generatePath(this.selectedNumber);
            
            this.lineLength = 0;
        }
    }

    startFindPath()
    {
        if (this.status == LadderGameStatus.ready)
        {
            if (this.selectedNumber != -1)
            {
                this.status = LadderGameStatus.pathdraw;
                if (this.onStart)   
                    this.onStart();
            }
        }
    }

    mouseDown(evt: MouseEvent) {
        if (this.isStart == false)
            return;
        this.buttons.forEach( el=>{
            if (evt.offsetX >= el.x && evt.offsetY > el.y && evt.offsetX <= el.x + el.width && evt.offsetY <= el.y + el.height)
            {
                el.onClick(evt,el);
            }
        });
    }

    mouseMove(evt : MouseEvent){
        if (this.isStart == false)
            return;
        var isOver = false;
        this.buttons.forEach( el=>{
            if (evt.offsetX >= el.x && evt.offsetY > el.y && evt.offsetX <= el.x + el.width && evt.offsetY <= el.y + el.height)
            {
                isOver = true;
            }
        });
        if (isOver)
        {
            this.canvas.style.cursor = "pointer";
        }
        else
        {
            this.canvas.style.cursor = "default";
        }
    }

    /**
     * 사다리 교차점 셋
     * @param fixX 가로 바 갯수
     * @param fixY 세로바 전체 갯수
     */
    initCrossPoint(fixX : number, fixY : number) : Object
    {
        var crossPoint : Object = {};
        for(var i = 0 ; i < fixX-1 ; i++)
        {
            crossPoint[i] = [];
        }
        
        for (var i = 0 ; i < fixX-1 ; i++) {
            var arraybuffer = new Array<Line>();
            var vertCount = 0;
            var loopCount = 0;
            // 가로바 3개까지 생성
            while (vertCount <3) {
                loopCount++;
                if (loopCount > 25)
                    break;
                // 시작점 y
                let y1 = 1+GameUtil.randomInt(fixY);                
                // 끝점 y (20% 확률로 대각선을 그린다 - 대각선 범위는 2칸)
                let y2 = Math.random() < 0.2 ? y1+ GameUtil.randomInt(4)-2: y1;
                var ignore = false;
                
                // 대각선이 게임 범위를 넘었을때
                if (y2 < 1 || y2 >fixY)
                {
                    ignore = true;
                    continue;
                }

                for ( var x = 0 ; x < crossPoint[i].length; x++) {                
                    
                    // 세로 범위가 좁은 경우 방지
                    if (Math.abs(y1 - crossPoint[i][x].y1) < 2)
                    {
                        ignore = true;
                        break;
                    }

                    // 같은 세로바에서 중복 라인 방지
                    if (y1 == crossPoint[i][x].y1)
                    {
                        ignore = true;
                        break;
                    }

                    // 끝점중에 중복 라인방지 
                    if (y2 == crossPoint[i][x].y2)
                    {
                        ignore = true;
                        break;
                    }

                    if (y2 != y1)
                    {
                        // 대각선일경우 x 크로스 방지를 위해
                        if (y1 > y2 && crossPoint[i][x].y2 > y2)
                        {
                            ignore = true;
                            break;
                        }
                        if (y1 < y2 && crossPoint[i][x].y2 < y2)
                        {
                            ignore = true;
                            break;
                        }
                    }
                }

                if ( i > 0)
                {
                    // 왼쪽 지난 세로바에서 생성된 가로바와 새로생성된 가로바위치가 중복인경우
                    for ( var x = 0 ; x < crossPoint[i-1].length; x++) {                
                        if (crossPoint[i-1][x].y2 == y1)
                        {
                            ignore = true;
                            break;
                        }
                    }
                }

                if (!ignore)
                {
                    crossPoint[i].push({
                        x1 : i,
                        y1 : y1,
                        x2 : i+1,
                        y2 :y2
                    });
                }
                else{
                    continue;
                }
                vertCount++;
            }
            var arrayBuffer : Array<Line> =  crossPoint[i];
            crossPoint[i] = arrayBuffer.sort( (a,b)=>{
                if (a.y2 < b.y2)
                    return -1;
                return 1;
            })
        }
        return crossPoint;
    }

    initBasePoint(fixX : number, fixY : number) :  Array<Array<number>>
    {
        var baseCrossPoint : Array<Array<number>> = new Array<Array<number>>();
        for ( var i = 0 ; i < fixX ; i++) {
            baseCrossPoint.push([]);
        }

        for (var i = 0 ; i < fixX-1 ; i++) {            
            for (var j = 0 ; j <fixY; j++) {
                baseCrossPoint[i].push(j);
            }
        }

        for ( var i = 0 ; i < fixX ; i ++) {
            var points = new Array<Point>();
            points.push({x:i, y : 0});
        }
        return baseCrossPoint;
    }

}