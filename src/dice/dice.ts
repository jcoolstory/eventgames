class DiceGame extends GameRenderer {

    private status : DiceGameStatus = DiceGameStatus.ready;
    private diceAnimationImage : AnimateImageObject;
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

    public init(config: Object) : boolean
    {
        super.init(config);
        this.diceAnimationImage = new AnimateImageObject("./img/diceanimation.png", {x:500,y:500}, true, 0.5);
        this.onStart = this.getParameter(config,"onStart", this.onStart);
        this.onEnd = this.getParameter(config,"onEnd", this.onEnd);
        this.isStart = this.getParameter(config,"isStart", this.isStart);
        
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
            var rect =  this.diceAnimationImage.getCurrentImage();
            var width = 350;
            c.save();
            c.translate(this.width/2, 20+width/2)
            //c.rotate(this.angle);
            c.drawImage(this.diceAnimationImage.Image,rect.x, rect.y,rect.width,rect.height, - width/2,-width/2,width,width);
            c.restore();
        }

        this.angle += 0.05101;

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
        this.diceAnimationImage.update(delayTime);
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
        }
    }

    public rollDice()
    {
        this.diceAnimationImage.start();
        if (this.onStart)
            this.onStart();
        this.status = DiceGameStatus.roll;
    }

    public setIndex(index:number)
    {
        this.diceAnimationImage.stop();

        if (this.onEnd)
            this.onEnd();

        this.status = DiceGameStatus.finish;
    }
}

enum DiceGameStatus {
    ready, roll, finish
}