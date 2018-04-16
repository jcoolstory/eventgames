class CupmonteGame extends GameRenderer {


    public init(config: Object) : boolean
    {
        super.init(config);        

        this.renderCollection.push({
            update: ()=>{

            },
            render:(c)=>this.drawGame(c)
        });

        var cup1 = new CupItem();
        cup1.x =100;
        cup1.y = 100;
        cup1.width = 100;
        cup1.height = 200;

        var cup2 = new CupItem();
        cup2.x =400;
        cup2.y = 100;
        cup2.width = 100;
        cup2.height = 200;

        var cup3 = new CupItem();
        cup3.x =700;
        cup3.y = 100;
        cup3.width = 100;
        cup3.height = 200;
        cup3.status = CupStatus.open;

        this.renderCollection.push(cup1);
        this.renderCollection.push(cup2);
        this.renderCollection.push(cup3);
        return true;
    }

    private drawGame(c:GameCanvas) {
    }

    protected update(delayTime : number)
    {
        this.renderCollection.forEach(element => {
            element.update(delayTime);
        });
    }

    protected mouseDown(evt:MouseEvent)
    {
        this.renderCollection.forEach( (element)=>{
            
            if (element instanceof CupItem)
            {
                console.log(element)
                let el = <CupItem> element;
                if (evt.offsetX >= el.x && evt.offsetY > el.y && evt.offsetX <= el.x + el.width && evt.offsetY <= el.y + el.height)
                {
                    el.onClick(evt,el);
                }
            }
        })
    }
}

interface Action {    
    start();
    doWork(delayTime : number);
    finish();
    onFinish : Function;
    onStart : Function;
    stop();
}

class CupItem implements RenderObject{

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
    onClick (evt : MouseEvent , el : CupItem)
    {
        if (this.status == CupStatus.close)
            this.doOpen();
        else if (this.status == CupStatus.open)
            this.doMoveTo(100,100,100);
    }
    update(delayTime:number)
    {
        this.actionCollection.forEach(el=>{
            el.doWork(delayTime);
        });

    }

    public doOpen()
    {
        this.status = CupStatus.open;
    }

    public doMoveTo(x, y,velocity)
    {
        var move = <Action> {
            start: ()=>{
                
            },
            doWork : (delayTime : number) =>{
                this.x += this.velocityX *delayTime;
                this.y += this.velocityY  *delayTime;
            },
        };
        this.actionCollection.push(move);
        console.log(this.actionCollection);
        var distanceX =  x - this.x;
        var distanceY =  y - this.y
        var angle = Math.atan2(distanceY, distanceX);
        var dist = velocity;
        this.velocityX =  Math.cos(angle) * dist ;
        this.velocityY = Math.sin(angle) * dist;
        
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
                c.fillRect(0,0,this.width,this.height);                
                break;
            case CupStatus.move:
                c.fillStyle = "green"
                c.translate(this.x , this.y);
                c.fillRect(0,0,this.width,this.height);                
                break;
            case CupStatus.open:
                c.fillStyle = "blue"
                c.translate(this.x + this.width , this.y + this.height);
                c.rotate(GameUtil.toRadians(this.openRotate))
                c.translate(-this.width , -this.height);
                c.fillRect(0,0,this.width,this.height);
                break;
        }
        c.restore();
    }
}

enum CupStatus{
    move, open, close
}

enum CupmonteGameStatus {
    ready, mix, finish
}