/**
 * RouletteGame
 * ver : 0.5
 */
class RouletteGame  extends GameRenderer {
    
    /**
     * game status
     */
    private status : RouletteGameStatus = RouletteGameStatus.ready;
    /**
     * current angle
     */
    private angle =0;
    /**
     * rotate velocity
     */
    private angleVelocity = 0;

    //#region  game config
    /**
     * item count (default 6)
     */
    private itemCount = 6;
    /**
     * item list
     */
    private items = undefined;
    /**
     * game enable
     */
    private isStart =false;
    //#endregion
    
    //#region select item
    /**
     * 
     */
    private selectIndex = 0;
    private selected = false;
    private stopMaxAngle = 0;
    private stopAngle = 0;
    //#endregion
        
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

    //#region debug property
    /**
     * debug text draw flag
     */
    private debug = false;
    private rotateStartTime = 0;
    //#endregion
    
    private startButtonRadius = 93;
    private scale = 1;
   
    /**
     * initialize game
     * @param config game config
     * @returns init success
     */
    public init(config: Object) : boolean
    {
        super.init(config);
        const defaultSize = 900;
        
        var imgUrlPrefix = "./img/";
        var startbuttonOnUrl = "roulette_button_start.png";
        var startButtonOffUrl = "roulette_button_empty.png";
        var itemTitleFont ="bold 28px Nanum Gothic";

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
        this.onStart = this.getParameter(config, "onStart", this.onStart);
        this.onEnd = this.getParameter(config, "onEnd", this.onEnd);
        imgUrlPrefix = this.getParameter(config,"imageurl", imgUrlPrefix);
        startbuttonOnUrl = this.getParameter(config, "buttonon", startbuttonOnUrl)
        startButtonOffUrl = this.getParameter(config, "buttonoff", startButtonOffUrl)
        this.isStart = this.getParameter(config, "isStart", this.isStart);

        // image resouce init
        var rouletteBase = new ImageObject(imgUrlPrefix +"roulette_base.png");
        var startButtonReady = new ImageObject(imgUrlPrefix + startbuttonOnUrl);
        var startButtonEmpty = new ImageObject(imgUrlPrefix + startButtonOffUrl);
        var pinIcon = new ImageObject(imgUrlPrefix +"roulette_pin.png");

        var checkLoadedImage =  this.getLoadedCheckFunc([rouletteBase,startButtonReady,startButtonEmpty, pinIcon]);

        this.itemCount = this.items.length;
        
        var itemAngle = 360 / this.itemCount;
        var itemRadian = GameUtil.toRadians(itemAngle);

        this.angle = GameUtil.randomInt(360);

        //create offscreen
        var offscreenBuffer =  document.createElement('canvas');
        offscreenBuffer.width = defaultSize;
        offscreenBuffer.height = defaultSize;
        var offContext = offscreenBuffer.getContext('2d');
        var raito = this.width / defaultSize;
        this.scale = raito;
        
        var bufferImage = undefined;
        function draw(c: CanvasRenderingContext2D) {
            if (checkLoadedImage() == false)
            {
                c.fillStyle = "black";
                var message = "Loading...";
                c.fillText(message, this.width / 2 -c.measureText(message).width  /2 , this.height / 2);
                return;
            }
            else
             {
                if (bufferImage == undefined)
                {
                    bufferImage = createBuffer(offContext,this.items, defaultSize,defaultSize);
                }
            }

            c.save();
            c.translate(this.width/ 2 , this.height /2)

            // draw buffer
            c.save();
            c.rotate(GameUtil.toRadians(this.angle));
            c.drawImage(offscreenBuffer,-this.width/2, -this.height / 2,this.width,this.height);
            c.restore();

            c.scale( raito,  raito);
            // roulette boder
            c.drawImage(rouletteBase.Image,-420,-420,840,840);
            c.drawImage(pinIcon.Image, -30,-440, 66,90);

            // status 에 따른 가운드 버튼 그리기
            if (this.isStart && this.status == RouletteGameStatus.ready)
                c.drawImage(startButtonReady.Image,-145,-145,290,290);            
            else 
                c.drawImage(startButtonEmpty.Image,-145,-145,290,290);            
                
            c.restore();
            
            if (this.debug)
            {
                // debug log
                c.strokeText( ( (this.angle ) % 360 /  (360 / this.itemCount)) + " index ", 110,140);
                c.strokeText(this.angle, 110,125);
                c.strokeText(this.delayTime +"ms", 110,110)
                c.strokeText(this.angleVelocity + "dgree", 110,150);

                // draw guid line
                c.strokeStyle = "red";
                c.beginPath();
                c.moveTo(this.width /2, 0);
                c.lineTo(this.width /2, this.height);
                c.stroke();
                c.beginPath();
                c.moveTo(0, this.height/2);
                c.lineTo(this.width, this.height/2);
                c.stroke();
            }
        }
        
        this.renderCollection.push({
            update : this.update.bind(this),
            render : draw.bind(this)
        })

        function createBuffer (c: CanvasRenderingContext2D, item, width, height)
        {
            c.save();
            c.translate(width/ 2 , height /2)
            c.save();
            // 0 도가 좌측 수평선 부터 시작하기때문에 보정함
            c.rotate(-GameUtil.toRadians(90 + itemAngle))

            // item region draw (color background)
            for (var i = 0 ; i < item.length; i++)
            {
                c.fillStyle = item[i].bgColor;
                c.strokeStyle =item[i].bgColor;
                c.beginPath();
                c.moveTo(0,0);                
                c.arc(0,0,400,0, itemRadian);
                c.fill()
                c.rotate(-itemRadian);
            }
            c.restore();

            // arc border
            c.save();
            c.fillStyle = "white";
            for (var i = 0 ; i < item.length; i++)
            {
                c.fillRect(-3,-400,6,400);
                c.rotate(-itemRadian);
            }
            c.restore();

            // arc item text
            c.save();
            c.rotate(GameUtil.toRadians( - itemAngle /2  ));
            
            c.fillStyle = "white";
            // item draw [icon,text]
            for (var i = 0 ; i < item.length; i++)
            {
                var top = item[i].title;
                c.font = itemTitleFont;
                GameUtil.drawTextAlongArc(c,top,0,0,260, 1 );
                c.rotate(-itemRadian)
            }

            c.restore();
            c.restore();
            
            return 1;
        }

        return true;
    }
    
    /**
     * 
     * @param resources 로딩할 image objects
     * @returns checking function
     */
    getLoadedCheckFunc(resources : Array<ImageObject>) : Function
    {
        var loadAll = false;
        return ()=> {
            if (loadAll)
                return true;
            var loaded = true;            
            resources.forEach(el=>{
                loaded = loaded && el.loaded;
            })
            loadAll = loaded;
            return loadAll;
        };
    }
    
    /**
     * item을 설정함
     * @param index set item number
     */
    public setIndex(index : number){
        this.selected = true;
        this.selectIndex = index;
        this.stopAngle =  360 / 6 * index + 1 + GameUtil.randomInt(360 / 6  * 0.8);
        this.stopMaxAngle = 360 / 6 * index + 360 / 6;
    }

    /**
     * game fame processing 
     * @param delayTime frame delay time
     */
    update(delayTime : number)
    {
        if (this.status == RouletteGameStatus.rotate)
        {
            if (this.angleVelocity <= 0)
            {
                this.angleVelocity = 0;
                this.status = RouletteGameStatus.finished;
                this.stop();
            }
            else if (this.angleVelocity <200)
            {
                var currentDrgree = this.angle % 360;

                // 현재 각도가 선택 아이템 범위에 위치한다면 rotate stop
                 if (this.stopAngle < currentDrgree && currentDrgree <this.stopMaxAngle ) 
                 {
                    this.angleVelocity = 0;
                    this.status = RouletteGameStatus.finished;
                    
                    if (this.onEnd)
                        this.onEnd( this.selectIndex, this.items);
                    
                    if (this.debug)
                        if ( this.selectIndex != Math.floor( (this.angle ) % 360 /  (360 / this.itemCount))) 
                            console.log("exception " ,this.selectIndex , Math.floor( (this.angle ) % 360 /  (360 / this.itemCount)) )

                    this.stop();
                 }
                 this.angle += (this.angleVelocity * delayTime);
            }
            else 
            {
                // item이 지정되었다면 속도를 줄인다
                if (this.selected)
                    this.angleVelocity += (-this.angleVelocity / 2*  delayTime);
                this.angle += (this.angleVelocity * delayTime);
            }
        }
    }

    /**
     * roulette rotate start
     */
    startRoulette()
    {
        this.status = RouletteGameStatus.rotate;
        this.angleVelocity = 2000;
        this.rotateStartTime = Date.now();
        if (this.onStart)
            this.onStart();
    }

    mouseDown(evt: MouseEvent) {
        if (this.isStart == false)
            return;
        var x = evt.offsetX - this.width / 2  ;
        var y = evt.offsetY - this.height / 2;        
        var distance = GameUtil.getDistance(x,y);
        if ( (this.startButtonRadius * this.scale) > distance)
        {
            if (this.status == RouletteGameStatus.ready)
            {
                this.startRoulette();
                
                this.canvas.style.cursor = "default";
            }
        }
    }

    mouseMove(evt : MouseEvent){
        if (!this.isStart || this.status != RouletteGameStatus.ready)
        {
            return;
        }
            
        var x = evt.offsetX - this.width / 2  ;
        var y = evt.offsetY - this.height / 2;        
        var distance = GameUtil.getDistance(x,y);
        if ( (this.startButtonRadius * this.scale) > distance)
        {
            this.canvas.style.cursor = "pointer";
        }
        else
        {
            this.canvas.style.cursor = "default";
        }
    }
}

enum RouletteGameStatus {
    ready,
    rotate,
    finished
}