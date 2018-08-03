class VAnimateImageObject extends  AnimateImageObject {

    onLoad : Function= ()=>{};
    constructor(url:string, size: Point, loop:boolean , animateTime : number = 1, rects: Rect[] ) {

        super(url,size,loop,animateTime);
        this.rects = rects;
    }
    public Load(url : string){
        var _t = this;
        this.Image = new Image();
        this.Image.width
        this.Image.src = url;
        this.Image.onload = function() {
            _t.loaded= true;
            _t.frame = _t.rects.length;
        };
    }
}


class DiceGame extends GameRenderer {

    private status : DiceGameStatus = DiceGameStatus.ready;
    private diceAnimationImage : AnimateImageObject;
    private diceFinishImage : ImageObject;
    /**
     *  start event (start button click ) 
     */
    public onStart : Function  = ()=>{};
    /**
     * end event (when rotate stop)
     */
    public onEnd : Function = ()=>{};

    public onLogin : Function = ()=>{};

    public startButton : Button = undefined;

    private isStart : boolean = true;

    private finishedEvent : boolean = false;

    private angle = 0;

    private items : any = undefined;

    private selectIndex = -1;
    
    private diceFrameCount = 36;

    public init(config: Object) : boolean
    {
        super.init(config);
        
        this.onStart = this.getParameter(config,"onStart", this.onStart);
        this.onEnd = this.getParameter(config,"onEnd", this.onEnd);
        this.isStart = this.getParameter(config,"isStart", this.isStart);
        var imgUrlPrefix = "./img";
        imgUrlPrefix = this.getParameter(config,"imageurl", imgUrlPrefix);
        this.finishedEvent = this.getParameter(config, "finishedEvent", false);
        if (this.finishedEvent) {
            // this.status = DiceGameStatus.finish;
        }
        var rects: Rect[] = [];
        var imageWidth = 500;
        for ( var i = 0 ; i < this.diceFrameCount ; i ++) {
            rects.push({x:imageWidth * (i+ 1), y:0, width:imageWidth, height:imageWidth})
        }
        this.diceAnimationImage = new VAnimateImageObject(imgUrlPrefix + "diceanimation.png",
            {x:imageWidth,y:imageWidth}, true, 1.5, rects);
        this.diceFinishImage = new ImageObject(imgUrlPrefix + "dice_finish.png");

        // defulat items
        const defaultItem =
        [
            {"title":"적립금 10,000P",         "bgColor" : "blue"},
            {"title":"할인쿠폰 3,000원",       "bgColor" : "#f07c25"},
            {"title":"할인쿠폰 5,000원",       "bgColor" : "#a21d21"},
            {"title":"꽝!",                   "bgColor" : "#1f7dbd"},
            {"title":"적립금 500P",            "bgColor" : "#72b6e4"},
            {"title":"적립금 1,000P",          "bgColor" : "#feebb9"},
        ]
        
        // set config
        this.items = this.getParameter(config,"items", defaultItem);        
        
        this.renderCollection.push({
            update: ()=>{

            },
            render:(c)=>this.drawGame(c)
        })

        var startButton = new Button();
        startButton.id = 100, 
        startButton.x = 350, 
        startButton.y = 480;
        startButton.width = 300
        startButton.height = 80;
        startButton.onClick = (evt, sender) =>{
            this.rollDice();
        }

        this.startButton = startButton;
        return true;
    }

    private drawGame(c:GameCanvas) {
        if (this.diceAnimationImage.loaded)
        {
            var width = 330;
            switch (this.status)
            {
                case DiceGameStatus.ready:
                    var rect =  {x:0, y: 0, width : 500, height : 500}
                    c.save();
                    
                    c.translate(this.width/2, 20+width/2);
                    c.drawImage(this.diceAnimationImage.Image,rect.x, rect.y,rect.width,rect.height, - width/2, -width/2, width, width);
                    
                    c.restore();
                    
                    break;
                case DiceGameStatus.roll:
                    // animate
                    var rect =  this.diceAnimationImage.getCurrentImage();
                    c.save();
                    
                    c.translate(this.width/2, 20+width/2)
                    c.drawImage(this.diceAnimationImage.Image,rect.x, rect.y,rect.width,rect.height, - width/2, -width/2, width, width);
                    c.restore();

                    this.drawItems(c);
                    break;
                case DiceGameStatus.finish:                    
                
                    // 당첨문구 그리기
                    var rect =  this.diceAnimationImage.getCurrentImage();
                    c.save();
                    
                    c.translate(this.width/2, 20+width/2);
                    c.drawImage(this.diceAnimationImage.Image,rect.x, rect.y,rect.width,rect.height, - width/2, -width/2, width, width);
                    c.restore();
                    this.drawItems(c);
                    break;
            }
        }

        if ( this.status == DiceGameStatus.ready)
        {
            if (this.finishedEvent)
                return;
            if (this.isStart)
            { 
                c.fillStyle = "#535353";
                c.font = "bold 28px Nanum Gothic"
                c.fillText("버튼을 눌러 주사위를 굴려주세요",300,430);
                c.font = "bold 30px Nanum Gothic"
                c.fillStyle = "#25284b"
                GameUtil.roundRect(c,355,480,300,80,35,true,false);
                c.fillStyle = "white";
                c.fillText("주사위 던지기 ",410,530);
            }
            else
            {
                c.fillStyle = "#535353";
                c.font = "bold 28px Nanum Gothic";
                c.fillText("이벤트 참여를 원하시면, 로그인을 해주세요",265,430);
                c.font = "bold 30px Nanum Gothic";
                c.fillStyle = "#25284b";
                GameUtil.roundRect(c,355,480,300,80,35,true,false);
                c.fillStyle = "white";
                c.fillText("LOGIN",455,530);
            }
        }
    }

    private drawItems(c:GameCanvas) {
        c.save();
        var horizontalBarMargin = this.width / 7;
        c.translate(horizontalBarMargin,400);
        c.font = "bold 25px Nanum Gothic";
        c.fillStyle = "#25284b";
        var region = {x:-60,y:-40,width:120,height:100};
        let width = 80;
        for(var i = 0 ; i < 6 ; i++)
        {
            c.fillStyle = this.items[i].color;
            var rect = this.diceAnimationImage.getImageRect(i * this.diceFrameCount/6);
            c.drawImage(this.diceAnimationImage.Image,rect.x, rect.y,rect.width,rect.height, - width/2,-width/2,width,width);
            c.save();
            c.translate(0,80);
            if (this.items[i].title)
            {
                GameUtil.drawTextRegion(c,this.items[i].title, region,"center","top", 36);
            }
            c.restore();
            c.translate(horizontalBarMargin,0);
        }
        c.restore();
    }
    public update(delayTime){
        switch(this.status)
        {
            case DiceGameStatus.roll:
                this.diceAnimationImage.update(delayTime);
                if ( this.selectIndex >= 0 && this.diceAnimationImage.currentIndex / (this.diceFrameCount/6) === this.selectIndex) {
                    this.status = DiceGameStatus.finish;
                    
                if (this.onEnd)
                    this.onEnd(this.selectIndex, this.items);
                }
                break;
            case DiceGameStatus.finish:
                this.stop();
                break;
        }
    }

    public mouseDown(evt:MouseEvent)
    {
        if (this.status != DiceGameStatus.ready)
            return;
        
        if (evt.offsetX >= this.startButton.x && 
            evt.offsetY > this.startButton.y && 
            evt.offsetX <= this.startButton.x + this.startButton.width && 
            evt.offsetY <= this.startButton.y + this.startButton.height)
        {
            if (this.isStart)
            {
                this.startButton.onClick(evt,this.startButton);
            }
            else 
            {
                this.onLogin();
            }
            this.canvas.style.cursor = "default";
        }
    }

    public mouseMove(evt:MouseEvent)
    {
        if (this.status != DiceGameStatus.ready)
            return;
        
        if (evt.offsetX >= this.startButton.x && 
            evt.offsetY > this.startButton.y && 
            evt.offsetX <= this.startButton.x + this.startButton.width && 
            evt.offsetY <= this.startButton.y + this.startButton.height)
        {
            this.canvas.style.cursor = "pointer";
        }else
        {
            this.canvas.style.cursor = "default";
        }
    }

    /**
     * 주사위 굴리기
     */
    public rollDice()
    {
        this.diceAnimationImage.start();
        if (this.onStart)
            this.onStart();
        this.status = DiceGameStatus.roll;
    }

    public setIndex(index:number)
    {
        this.selectIndex = index;

    }
}

enum DiceGameStatus {
    ready, roll, finish
}