var slot :Array<Point> = [ { x:80, y:50} , {x:360, y:50},{x:640, y:50}];

class StartButton {
    enable : boolean = true;
    bounds : Rect = undefined;
}

class CupmonteGame extends GameRenderer {

    status : CupmonteGameStatus = CupmonteGameStatus.ready;
    cups : Array<CupItem> = new Array<CupItem>();
    mixLoopDuration = 0;
    mixDuration = 0;
    startButton  = new StartButton();
    cup_missImage : ImageObject  = undefined;
    openItemIndex = -1;
    failed = false;
    finishMessage = undefined;
    //#region events
    /**
     *  start event (start button click ) 
     */
    public onStart : Function  = ()=>{};
    /**
     * end event (when rotate stop)
     */
    public onEnd : Function = ()=>{};
    //#endregion

    isStart = false;
    public init(config: Object) : boolean
    {
        super.init(config);
        var imgUrlPrefix = "./img/";
        
        this.onStart = this.getParameter(config, "onStart", this.onStart);
        this.onEnd = this.getParameter(config, "onEnd", this.onEnd);
        imgUrlPrefix = this.getParameter(config,"imageurl", imgUrlPrefix);
        this.isStart = this.getParameter(config, "isStart", true); 

        var cupImage = new ImageObject(imgUrlPrefix + "cup_image.png");
        this.cup_missImage = new ImageObject(imgUrlPrefix + "cup_missicon.png");

        this.renderCollection.push({
            update: ()=>{

            },
            render:(c)=>this.drawGame(c)
        });

        var cup1 = new CupItem();
        cup1.x = slot[0].x;
        cup1.y = slot[0].y;
        cup1.width = 268;
        cup1.height = 257;
        cup1.position = 0;
        cup1.image = cupImage;

        var cup2 = new CupItem();
        cup2.x = slot[1].x;
        cup2.y = slot[1].y;
        cup2.width = 268;
        cup2.height = 257;
        cup2.position = 1;
        cup2.image = cupImage;

        var cup3 = new CupItem();
        cup3.x =slot[2].x;
        cup3.y = slot[2].y;
        cup3.width = 268;
        cup3.height = 257;
        cup3.position = 2;
        cup3.image = cupImage;

        this.cups.push(cup1);
        this.cups.push(cup2);
        this.cups.push(cup3);
        this.startButton.bounds = { x:350,y:450,width:300,height:80};
        this.startButton.enable = this.isStart;
        return true;
    }

    private drawGame(c:GameCanvas) {

        if (this.status == CupmonteGameStatus.ready ||
            this.status == CupmonteGameStatus.mix   ||
            this.status == CupmonteGameStatus.select
        ){
            
            this.drawPopup(c);
        }
        else 
        {
            if (this.failed)
            {
                c.save();
                c.translate(30,120);
                c.drawImage(this.cup_missImage.Image,slot[this.openItemIndex].x,slot[this.openItemIndex].y);
                c.restore();
            }
            else{
                //GameUtil.drawTextRegionAlign(c,"sdfasdf", {x: 100, y:100, width: 200, height:300,})
                c.font = "bold 38px Nanum Gothic"
                c.fillStyle ="black";
                //c.fillText(this.finishMessage,20,50);
                GameUtil.drawTextAlign(c,this.finishMessage,0,this.width,400,"center");
            }
        }

        this.cups.forEach(element => {
            element.render(c);
        });
       
    }

    public setItem(failed :boolean, message : string)
    {
        this.failed = failed;
        this.finishMessage = message;
        console.log(this.failed, this.finishMessage)
    }

    private drawPopup(c:GameCanvas)
    {
        if (this.status == CupmonteGameStatus.select)
        {
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
        c.fillText("시작 ",470,500);
    }

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

    public shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
    }

    private mixCard()
    {
        var i = movePos =  GameUtil.randomInt(3);
        let el = this.cups[i];
        
        var movePos = undefined;
        do{
            movePos =  GameUtil.randomInt(3);
        }while( movePos == el.position)

        var curpos = el.position;
        var changeCup : CupItem= undefined;
        for (var j = 0 ;  j < this.cups.length ; j++)
            if (this.cups[j].position == movePos)
            {
                changeCup = this.cups[j];
                break;
            }
        el.doMoveTo(slot[movePos].x, slot[movePos].y,100,0.3);
        el.position = movePos;
        changeCup.doMoveTo(slot[curpos].x, slot[curpos].y,100,0.3);
        changeCup.position = curpos;

    }
    
    protected mouseDown(evt:MouseEvent)
    {
        if (this.status == CupmonteGameStatus.ready)
        {
            if (!this.startButton.enable)
            {
                return;
            }
            var el = this.startButton.bounds;
            if (evt.offsetX >= el.x && evt.offsetY > el.y && evt.offsetX <= el.x + el.width && evt.offsetY <= el.y + el.height)
            {
                this.status = CupmonteGameStatus.mix;
                this.startButton.enable = false;
                this.onStart();
            }
        }
        else if (this.status ==  CupmonteGameStatus.select)
        {
            for ( var i = 0 ; i < this.cups.length; i++)
            {
                let el = <CupItem> this.cups[i];
                if (evt.offsetX >= el.x && evt.offsetY > el.y && evt.offsetX <= el.x + el.width && evt.offsetY <= el.y + el.height)
                {
                    el.doOpen();
                    this.openItemIndex = el.position;
                    this.status = CupmonteGameStatus.finish;
                    this.onEnd(this.finishMessage);
                    break;
                }
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

    position : number;
    width : number;
    height : number;
    x:number;
    y:number;
    moveTo : Point;
    velocityX : number =0;
    velocityY : number = 0;
    openRotate : number = 30;
    status : CupStatus = CupStatus.close;
    actionCollection : Array<Action> = new Array<Action>();
    image : ImageObject = undefined;
    onClick (evt : MouseEvent , el : CupItem)
    {
        
    }
    update(delayTime:number)
    {
        this.actionCollection.forEach(el=>{
            var conti = el.doWork(delayTime);
            el.finished =!conti;
            if (el.finished)
                el.finish();
        });

        this.actionCollection = this.actionCollection.filter(el=>{
            return !el.finished;
        })

        // if(this.actionCollection.length == 0 && this.status == CupStatus.move)
        // {
        //     var movePosition = GameUtil.randomInt(3);
        //     this.doMoveTo(slot[movePosition].x, slot[movePosition].y,100,0.3);
        // }
    }

    public doOpen()
    {
        this.status = CupStatus.open;
    }

    public doMoveTo(x, y,velocity, duration)
    {
        var currentTime = 0;
        
        var move = <Action> {
            start: ()=>{
                
            },
            doWork : (delayTime : number) =>{
                currentTime += delayTime;
                if (currentTime > duration)
                    return false;
                this.x += this.velocityX *delayTime;
                this.y += this.velocityY  *delayTime;
                return true;
            },
            finish : () =>{
                this.x = x;
                this.y = y;
            }
        };
        this.actionCollection = [];
        this.actionCollection.push(move);
        var distanceX =  x - this.x;
        var distanceY =  y - this.y
        var angle = Math.atan2(distanceY, distanceX);
        var dist = velocity;
        this.velocityX =  Math.cos(angle) * dist ;
        this.velocityY = Math.sin(angle) * dist;
        this.velocityX =  ( x - this.x) * 1/ duration
        this.velocityY =  ( y - this.y) * 1/duration
        this.status = CupStatus.move;
    }

    render(c:GameCanvas)
    {
        c.save();
        switch(this.status)
        {
            case CupStatus.close:
                c.fillStyle = "red"
                c.translate(this.x , this.y);
                c.drawImage(this.image.Image,0,0);
                break;
            case CupStatus.move:
                c.fillStyle = "green"
                c.translate(this.x , this.y);
                c.drawImage(this.image.Image,0,0);
                break;
            case CupStatus.open:
                c.fillStyle = "blue"
                c.translate(this.x + 228 , this.y +212);
                c.rotate(GameUtil.toRadians(this.openRotate))
                c.translate(-228 , -212);
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