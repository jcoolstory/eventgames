var slot :Array<Point> = [ { x:80, y:50} , {x:360, y:50},{x:640, y:50}];

class DiceStartButton {
    enable : boolean = true;
    bounds : Rect = undefined;
}

class CupmonteGame extends GameRenderer {

    /**
     * game status
     */
    status : CupmonteGameStatus = CupmonteGameStatus.ready;

    /**
     * cup item array
     */
    cups : Array<CupItem> = new Array<CupItem>();
    /**
     * cup 믹스할때 반복 수행하는 시간 변수
     */
    mixLoopDuration = 0;
    /**
     * cup 믹스하는 전체 수행 시간
     */
    mixDuration = 0;
    /**
     * 시작버튼
     */
    startButton  = new DiceStartButton();
    /**
     * 꽝 이미지 리소스
     */
    cup_missImage : ImageObject  = undefined;
    /**
     * 유저가 선택한 컵 
     */
    openItemIndex = -1;
    /**
     * 최종 당첨 메세지
     */
    finishMessage = undefined;

    /**
     * 게임 시작 여부
     */
    isStart = false;
    
    //#region events
    /**
     *  start event (start button click ) 
     */
    public onStart : Function  = ()=>{};
    /**
     * end event (when rotate stop)
     */
    public onEnd : Function = ()=>{};

    /**
     * login button click event
     */    
    public onLogin : Function = ()=>{};
    //#endregion

    private items = [];

    private selectIndex = -1;

    public init(config: Object) : boolean
    {
        super.init(config);
        var imgUrlPrefix = "./img/";
        
        this.onStart = this.getParameter(config, "onStart", this.onStart);
        this.onEnd = this.getParameter(config, "onEnd", this.onEnd);
        imgUrlPrefix = this.getParameter(config,"imageurl", imgUrlPrefix);
        this.isStart = this.getParameter(config, "isStart", true); 
        
        var defaultItem = [
            "꽝!",
            "적립금 10,000P",
            "할인쿠폰 3,000원",
    ]
        this.items = this.getParameter(config,"items", defaultItem);        
        var cupImage = new ImageObject(imgUrlPrefix + "cup_image.png");
        this.cup_missImage = new ImageObject(imgUrlPrefix + "cup_missicon.png");
        
        this.renderCollection.push({
            update: ()=>{

            },
            render:(c)=>this.drawGame(c)
        });

        // cup 3개 init
        var cup1 = new CupItem();
        cup1.x = slot[0].x;
        cup1.y = slot[0].y;
        cup1.width = 268;
        cup1.height = 257;
        cup1.position = 0;
        cup1.index = 0;
        cup1.image = cupImage;

        var cup2 = new CupItem();
        cup2.x = slot[1].x;
        cup2.y = slot[1].y;
        cup2.width = 268;
        cup2.height = 257;
        cup2.position = 1;
        cup2.index = 1;
        cup2.image = cupImage;

        var cup3 = new CupItem();
        cup3.x =slot[2].x;
        cup3.y = slot[2].y;
        cup3.width = 268;
        cup3.height = 257;
        cup3.position = 2;
        cup3.index = 2;
        cup3.image = cupImage;

        this.cups.push(cup1);
        this.cups.push(cup2);
        this.cups.push(cup3);

        // start button init
        this.startButton.bounds = { x:350,y:450,width:300,height:80};
        return true;
    }

    /**
     * 전체 게임 그리는 root render
     * @param c canvas context
     */
    private drawGame(c:GameCanvas) {

        if (this.status == CupmonteGameStatus.ready ||
            this.status == CupmonteGameStatus.mix   ||
            this.status == CupmonteGameStatus.select
        ){
            // 시작버튼 및 알림문구 그리기
            this.drawPopup(c);
        }
        else 
        {
            // 최종 확인 장면 그리기
            c.font = "bold 38px Nanum Gothic"
            c.fillStyle ="black";
            GameUtil.drawTextAlign(c,this.finishMessage,0,this.width,400,"center");
        }

        // cup draw
        this.cups.forEach(element => {
            element.render(c);
        });
       
    }

    /**
     * 시작버튼 및 안내문구 그리기
     * @param c canvas context
     */
    private drawPopup(c:GameCanvas)
    {
        if (this.isStart) {
            if (this.status == CupmonteGameStatus.select) {
                c.beginPath();
                c.font = "bold 30px Nanum Gothic"
                c.fillStyle ="#535353";
                c.fillText("행운이 들어있는 컵을 클릭해주세요",300,400);
            }
            else if (this.status == CupmonteGameStatus.mix)
            {
            }
            else
            {
                c.beginPath();
                c.font = "bold 30px Nanum Gothic"
                c.fillStyle ="#535353";
                c.fillText("시작버튼을 눌러주세요",350,400);
            }
            
            c.font = "bold 38px Nanum Gothic"
            
            c.fillStyle = this.startButton.enable ? "#25284b" : "#959595";
            GameUtil.roundRect(c,350,450,300,80,35,true,false);
            c.fillStyle = "white";
            c.fillText("시작 ",465,500);
        } else {
            
            
            c.beginPath();
            c.font = "bold 30px Nanum Gothic"
            c.fillStyle ="#535353";
            c.fillText("이벤트 참여를 원하시면, 로그인을 해주세요",270,400);
            
            
            c.font = "bold 38px Nanum Gothic"
            
            c.fillStyle = this.startButton.enable ? "#25284b" : "#959595";
            GameUtil.roundRect(c,350,450,300,80,35,true,false);
            c.fillStyle = "white";
            c.fillText("LOGIN ",450,500);
        }
    }

    public setIndex(index)
    {
        this.selectIndex = index;
        this.finishMessage = this.items[index];;
    }

    /**
     * game frame update
     * @param delayTime frame delay time
     */
    protected update(delayTime : number)
    {
        this.cups.forEach(element => {
            element.update(delayTime);
        });

        if (this.status == CupmonteGameStatus.mix)
        {
            this.mixLoopDuration += delayTime;
            this.mixDuration += delayTime;
            if (this.mixLoopDuration > 0.25)
            {
                this.mixCard();
                this.mixLoopDuration = 0;
            }

            if (this.mixDuration > 3)
            {
                this.status = CupmonteGameStatus.select;
            }
        }
    }

    /**
     * 배열을 랜덤하게 섞음
     * @param a array
     */
    public shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
    }

    /**
     * 임의의 카드 중에 하나를 다른카드와 섞기
     */
    private mixCard()
    {
        let cupA = this.cups[GameUtil.randomInt(3)];

        var aPos = cupA.position;
        var bPos = undefined;        
        
        do{
            bPos =  GameUtil.randomInt(3);
        }while( bPos == cupA.position) // 중복 방지를위해 loop


        // 이동할 위치에 있는 다른카드 찾기
        var cupB : CupItem= undefined;
        for (var j = 0 ;  j < this.cups.length ; j++)
            if (this.cups[j].position == bPos)
            {
                cupB = this.cups[j];
                break;
            }
        

        // card swap
        cupA.doMoveTo(slot[bPos].x, slot[bPos].y,0.3);
        cupA.position = bPos;

        cupB.doMoveTo(slot[aPos].x, slot[aPos].y,0.3);
        cupB.position = aPos;

    }
    
    protected mouseDown(evt:MouseEvent)
    {
        if (this.status == CupmonteGameStatus.ready)
        {
            // start button event
            if (!this.startButton.enable)
            {
                return;
            }
            var el = this.startButton.bounds;
            if (evt.offsetX >= el.x && evt.offsetY > el.y && evt.offsetX <= el.x + el.width && evt.offsetY <= el.y + el.height)
            {
                if (this.isStart)
                {
                    this.status = CupmonteGameStatus.mix;
                    this.startButton.enable = false;
                    this.onStart();
                    this.canvas.style.cursor = "default";
                }
                else
                {
                    this.onLogin();
                }
            }
        }
        else if (this.status ==  CupmonteGameStatus.select)
        {
            // select cup item event
            for ( var i = 0 ; i < this.cups.length; i++)
            {
                let el = <CupItem> this.cups[i];
                if (evt.offsetX >= el.x && evt.offsetY > el.y && evt.offsetX <= el.x + el.width && evt.offsetY <= el.y + el.height)
                {
                    el.doOpen();
                    this.openItemIndex = el.position;
                    this.status = CupmonteGameStatus.finish;
                    this.onEnd(this.selectIndex,this.items);
                    this.canvas.style.cursor = "default";
                    this.stop();
                    break;
                }
            }
        }
    }

    public mouseMove(evt:MouseEvent)
    {
        if (this.status == CupmonteGameStatus.ready)
        {
            // start button event
            if (!this.startButton.enable)
            {
                return;
            }
            var el = this.startButton.bounds;
            if (evt.offsetX >= el.x && evt.offsetY > el.y && evt.offsetX <= el.x + el.width && evt.offsetY <= el.y + el.height)
            {
                this.canvas.style.cursor = "pointer";
            }else
            {
                this.canvas.style.cursor = "default";
            }
        }
        else if (this.status ==  CupmonteGameStatus.select)
        {
            var isOver = false;
            // select cup item event
            for ( var i = 0 ; i < this.cups.length; i++)
            {
                let el = <CupItem> this.cups[i];
                if (evt.offsetX >= el.x && evt.offsetY > el.y && evt.offsetX <= el.x + el.width && evt.offsetY <= el.y + el.height)
                {
                    isOver=true;
                }
            }

            if (isOver)
            {
                this.canvas.style.cursor = "pointer";
            }else
            {
                this.canvas.style.cursor = "default";
            }

        }
    }
}

interface Action {
    duration,
    start();
    doWork(delayTime : number) : boolean;
    finish();
    onFinish : Function;
    onStart : Function;
    stop();
    finished :boolean;
}


class CupItem implements RenderObject{
    /**
     * cup의 status
     */
    status : CupStatus = CupStatus.close;
    /**
     * logical position (0,1,2)
     */
    position : number;

    //#region bounds    
    x:number;
    y:number;
    width : number;
    height : number;
    //#endregion

    //#region move velocity
    velocityX : number =0;
    velocityY : number = 0;
    //#endregion

    /**
     * open 시 rotate 될 각도
     */
    openRotate : number = 30;
    
    /**
     * animate action collection (현재 move 하나만 사용하고있다)
     */
    actionCollection : Array<Action> = new Array<Action>();
    image : ImageObject = undefined;
    index = 0;
    onClick (evt : MouseEvent , el : CupItem) {}

    update(delayTime:number)
    {
        // action collection processing
        this.actionCollection.forEach(el=>{
            var conti = el.doWork(delayTime);
            el.finished =!conti;
            // 종료된 action이면 finish event call
            if (el.finished)
                el.finish();
        });

        // finish 된 action 정리
        this.actionCollection = this.actionCollection.filter(el=>{
            return !el.finished;
        })
    }

    public doOpen()
    {
        this.status = CupStatus.open;
    }

    /**
     * 특정 위치로 특정 시간안에 이동시키기
     * @param x destination x position
     * @param y destination y position
     * @param duration  duration time (unit: sec)
     */
    public doMoveTo(x, y, duration)
    {
        var currentTime = 0;

        // move action 생성
        var move = <Action> {
            doWork : (delayTime : number) =>{
                currentTime += delayTime;
                if (currentTime > duration)
                    return false;
                this.x += this.velocityX * delayTime;
                this.y += this.velocityY * delayTime;
                return true;
            },
            finish : () =>{
                this.x = x;
                this.y = y;
            }
        };
        this.actionCollection = [move];
        this.velocityX =  ( x - this.x) * 1/ duration
        this.velocityY =  ( y - this.y) * 1/duration
        this.status = CupStatus.move;
    }

    /**
     * cup draw
     * @param c canvas context
     */
    render(c:GameCanvas)
    {
        c.save();
        switch(this.status)
        {
            case CupStatus.close:
                c.translate(this.x , this.y);
                c.drawImage(this.image.Image,0,0);
                break;
            case CupStatus.move:
                c.translate(this.x , this.y);
                c.drawImage(this.image.Image,0,0);
                break;
            case CupStatus.open:
                c.translate(this.x + 228 , this.y +212);
                c.rotate(GameUtil.toRadians(this.openRotate))
                c.translate(-228 ,-212);
                c.drawImage(this.image.Image,0,0);
                break;
        }
        c.restore();
    }
}

enum CupStatus{
    move, open, close
}

enum CupmonteGameStatus {
    ready, mix, select,finish, 
}