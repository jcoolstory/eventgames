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

    public startButton : Button = undefined;

    private isStart : boolean = true;

    private angle = 0;

    private items : any = undefined;

    private selectIndex = -1;
    
    public init(config: Object) : boolean
    {
        super.init(config);
        
        this.onStart = this.getParameter(config,"onStart", this.onStart);
        this.onEnd = this.getParameter(config,"onEnd", this.onEnd);
        this.isStart = this.getParameter(config,"isStart", this.isStart);
        var imgUrlPrefix = "./img";
        imgUrlPrefix = this.getParameter(config,"imageurl", imgUrlPrefix);
        this.diceAnimationImage = new AnimateImageObject(imgUrlPrefix + "diceanimation.png", {x:500,y:500}, true, 0.5);
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
            switch (this.status)
            {
                case DiceGameStatus.ready:
                
                case DiceGameStatus.roll:
                    // animate
                    var rect =  this.diceAnimationImage.getCurrentImage();
                    var width = 350;
                    c.save();
                    
                    c.translate(this.width/2, 20+width/2)
                    // c.rotate(this.angle);
                    c.drawImage(this.diceAnimationImage.Image,rect.x, rect.y,rect.width,rect.height, - width/2,-width/2,width,width);
                    c.restore();
                    // if (this.status == DiceGameStatus.roll)
                    // this.angle += 0.05101;
                    break;
                case DiceGameStatus.finish:
                // 당첨문구 그리기
                    var width = 350;
                    c.save();
                    c.translate(this.width/2, 20+width/2)
                    c.drawImage(this.diceFinishImage.Image, - width/2,-width/2,width,width);
                    
                    c.font ="28px Nanum Ghothic"
                    var region = {x:-90,y: -100,width:180, height:200}
                    c.fillStyle = "white"
                    GameUtil.drawTextRegion(c,this.items[this.selectIndex].title, region,"center","middle", 36);
                    c.restore();
                    break;
            }
            
        }


        if (this.isStart && this.status == DiceGameStatus.ready)
        {
            c.fillStyle = "#535353";
            c.font = "bold 28px Nanum Gothic"
            c.fillText("버튼을 눌러 주사위를 굴려주세요",300,430);
            c.font = "bold 30px Nanum Gothic"
            c.fillStyle = "#25284b"
            GameUtil.roundRect(c,350,480,300,80,35,true,false);
            c.fillStyle = "white";
            c.fillText("주사위 던지기 ",410,530);
        }
    }

    public update(delayTime){
        switch(this.status)
        {
            case DiceGameStatus.roll:
            this.diceAnimationImage.update(delayTime);
            break;
            case DiceGameStatus.finish:
            this.stop();
            break;
        }
    }

    public mouseDown(evt:MouseEvent)
    {
        if (this.isStart == false)
            return;
        if (this.status != DiceGameStatus.ready)
            return;
        
        if (evt.offsetX >= this.startButton.x && 
            evt.offsetY > this.startButton.y && 
            evt.offsetX <= this.startButton.x + this.startButton.width && 
            evt.offsetY <= this.startButton.y + this.startButton.height)
        {
            this.startButton.onClick(evt,this.startButton);
            this.canvas.style.cursor = "default";
        }
    }

    public mouseMove(evt:MouseEvent)
    {
        if (this.isStart == false)
            return;
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
        this.diceAnimationImage.stop();

        if (this.onEnd)
            this.onEnd();

        this.status = DiceGameStatus.finish;
    }
}

enum DiceGameStatus {
    ready, roll, finish
}