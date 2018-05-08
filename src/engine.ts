interface RenderObject {
    update(delayTime : number)
    render(context : CanvasRenderingContext2D);
}

interface ClickObject {
    onClick(event, sender);
}
interface Point {
    x : number ;
    y : number;
}

interface Rect {
    x:number,
    y:number,
    width : number,
    height : number
}

interface Line {
    x1 : number ;
    y1 : number;
    x2 : number ;
    y2 : number;
}

class ImageObject 
{
    public Image : HTMLImageElement = undefined;
    public loaded = false;
    constructor(url:string ){
        this.Load(url);
    }
    public Load(url : string){
        var _t = this;
        this.Image = new Image();
        this.Image.src = url;
        this.Image.onload = function() {
            _t.loaded= true;
        };
    }    
}

class GameCanvas extends CanvasRenderingContext2D {
    
}
class GameRenderer
{
    protected canvas : HTMLCanvasElement = null;
    protected context : CanvasRenderingContext2D
    protected width = 0;
    protected height = 0 ;
    protected renderCollection : Array<RenderObject> = [];
    private rendering = false;
    /**
     *  init
        config : Object     */
    public init(config : Object) : boolean{
        let context = this.getParameter(config, "context");
        
        this.canvas = <HTMLCanvasElement> document.getElementById(context);
        this.context = <CanvasRenderingContext2D> this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.canvas.onmousedown = this.mouseDown.bind(this);
        this.canvas.onmousemove = this.mouseMove.bind(this);
        return true;
    }

    public getParameter(config:Object,  name : string, defaultValue : any = undefined)
    {
        if (config.hasOwnProperty(name))
            return config[name];
        return defaultValue
    }

    private start()
    {
        this.rendering = true;
        this.lastTime = Date.now();
        window.requestAnimationFrame(this.render.bind(this));
        this.then = Date.now();
    }

    private pause()
    {

    }

    protected stop()
    {
        this.rendering = false;
    }
    
    protected update(delayTime : number) {
    }

    private drawBackground()
    {
       this.context.clearRect(0,0,this.width,this.height);
    }

    private render()
    {
        var now = Date.now();
        var elapsed = now - this.lastTime;
        this.update(elapsed/1000);
        let FPS = this.getFPS(now);
        this.lastTime = now;
        this.drawBackground();
        this.renderCollection.forEach(el => {
            el.render(this.context);
        })
        
        // this.context.fillStyle = 'cornflowerblue';
        // this.context.fillText(FPS.toFixed() + " fps  " + elapsed.toFixed() + "ms" ,20,60 );
        // this.then = Date.now() - (elapsed % this.frameInterval);
       
        if (this.rendering)
            window.requestAnimationFrame(this.render.bind(this));
    }
    
    protected mouseDown (evt){
    }

    protected mouseMove(evt){

    }

    private then =0;
    private frameRate = 40;
    private frameInterval = 1000 / this.frameRate ;
    private lastTime : number = 0;
    private getFPS(now)  : number{
        return  1000/ (now - this.lastTime);
    }
}

class GameUtil {
    
    public static randomInt =  function(max:number) : number{
        return (Math.random() * max )| 0;
    }

    // Converts from degree to radian
    public static toRadians = function(degrees) {
        return degrees * Math.PI / 180;
    };

    public static getDistance(x: number , y:number) : number
    {
        return Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
    }

    public static drawTextAlongArc(context : GameCanvas, str, centerX, centerY, radius, angle) {
        var len = str.length, s;
        context.save();
        context.translate(centerX, centerY);
        var fullMeasure = context.measureText(str);
        var fullradius =  radius * 2 * Math.PI;
        context.rotate(-GameUtil.toRadians(360 * (fullMeasure.width/ fullradius))/2 );
        for(var n = 0; n < len; n++) {
            
            context.save();
            s = str[n];
            var measureS =  context.measureText(s).width
            context.fillText(s, 0, -radius);
            context.restore();
            
            context.rotate(GameUtil.toRadians(360 * ((measureS )/ fullradius)));
        }
        
        context.restore();
    }

    public static roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof stroke == 'undefined') {
          stroke = true;
        }
        if (typeof radius === 'undefined') {
          radius = 5;
        }
        if (typeof radius === 'number') {
          radius = {tl: radius, tr: radius, br: radius, bl: radius};
        } else {
          var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
          for (var side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
          }
        }
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
        if (fill) {
          ctx.fill();
        }
        if (stroke) {
          ctx.stroke();
        }
    }

    public static drawLine(context : CanvasRenderingContext2D, startX : number, startY : number , endX : number , endY , color : string ){
        context.beginPath();
        context.strokeStyle = color;
        context.moveTo(startX,startY);
        context.lineTo(endX, endY);
        context.stroke();        
    }

    
    static drawTextAlign(c: CanvasRenderingContext2D, text : string, x : number , width : number, y : number , align: string)
    {
        var measureWidth =  c.measureText(text).width;
        switch(align)
        {
            case "left":
                c.fillText(text,x,y);
            break;
            case "center" :
                c.fillText(text,x + width / 2 - measureWidth/2,y);
            break;
            case "right" :
                c.fillText(text,x + width - measureWidth,y);
            break;
        }
    }

    static drawTextRegionAlign(c: CanvasRenderingContext2D, text : string, region : Rect, align: string, lineHeight : number)
    {
        var measureFullText = c.measureText(text).width;
        var lineBreak = false;
        if (region.width < measureFullText)
            lineBreak = true;
        c.save();
        //c.translate(0,lineHeight );
        var line = Math.ceil(measureFullText /  region.width);
        var startY = ((line-1) * lineHeight) /2;
        var measureArray : Array<number> = [];
        var multiLineText : Array<string> =[];
        var textWidth = 0;
        var linebuff = 0;
        multiLineText[0] = "";
        for(var i = 0 ; i < text.length;i++)
        {
            var ch = text[i];
            var le = c.measureText(ch).width
            measureArray.push(le);
            textWidth += le;
            
            if (region.width < textWidth)
            {
                textWidth=le;
                linebuff++;
                multiLineText[linebuff] = "";
            }
            multiLineText[linebuff] +=ch;
        }

        switch(align)
        {
            case "lefttop":
            if (lineBreak)           
            {
                for(var i = 0 ; i < multiLineText.length ; i++)
                {                    
                    c.fillText(multiLineText[i],region.x,region.y+ lineHeight);      
                    c.translate(0,lineHeight);
                }
            }
            else
            {
                c.fillText(text,region.x,region.y+ lineHeight);
            }
            break;
            case "centertop":
            if (lineBreak)
            {
                for(var i = 0 ; i < multiLineText.length ; i++)
                {
                    measureFullText = c.measureText(multiLineText[i]).width;
                    c.fillText(multiLineText[i],region.x + region.width/ 2- measureFullText /2 ,region.y+ lineHeight);
                    c.translate(0,lineHeight);
                }
            }
            else
            {
                c.fillText(text,region.x + region.width/ 2- measureFullText /2 ,region.y+ lineHeight);
            }
            break;
            case "righttop":
            if (lineBreak)
            {
                for(var i = 0 ; i < multiLineText.length ; i++)
                {
                    measureFullText = c.measureText(multiLineText[i]).width;
                    c.fillText(multiLineText[i],region.x + region.width - measureFullText ,region.y+ lineHeight);
                    c.translate(0,lineHeight);
                }
            }
            else
            {
            c.fillText(text,region.x + region.width - measureFullText ,region.y+ lineHeight);
            }
            break;
            case "leftmiddle":
            
            if (lineBreak)           
            {
                for(var i = 0 ; i < multiLineText.length ; i++)
                {
                    c.fillText(multiLineText[i],region.x,region.y + region.height /2 + lineHeight * 0.3 - startY);     
                    c.translate(0,lineHeight);
                }
            }
            else
            {
                c.fillText(text,region.x,region.y + region.height /2 + lineHeight * 0.3);
            }
            break;
            case "centermiddle":
            if (lineBreak)           
            {
                for(var i = 0 ; i < multiLineText.length ; i++)
                {                    
                    measureFullText = c.measureText(multiLineText[i]).width;
                    c.fillText(multiLineText[i],region.x + region.width/ 2 - measureFullText /2 ,region.y + region.height /2  + lineHeight * 0.3 - startY);
                    c.translate(0,lineHeight);
                }
            }
            else
            {
                c.fillText(text,region.x + region.width/ 2 - measureFullText /2 ,region.y + region.height /2 + lineHeight * 0.3 -startY);
            }
            
            break;
            case "rightmiddle":
            if (lineBreak)           
            {
                for(var i = 0 ; i < multiLineText.length ; i++)
                {      
                    measureFullText = c.measureText(multiLineText[i]).width;
                    c.fillText(multiLineText[i],region.x + region.width - measureFullText ,region.y + region.height /2  + lineHeight * 0.3- startY );
                    c.translate(0,lineHeight);
                }
            }
            else
            {
                c.fillText(text,region.x + region.width - measureFullText ,region.y + region.height /2  + lineHeight * 0.3 );
            }
            break;
            case "leftbottom":
            if (lineBreak)           
            {
                for(var i = 0 ; i < multiLineText.length ; i++)
                {      
                    c.fillText(multiLineText[i],region.x,region.y + region.height - lineHeight * 0.3 - (line-1) * lineHeight);
                    c.translate(0,lineHeight);
                }
            }
            else{
                c.fillText(text,region.x,region.y + region.height - lineHeight * 0.3);
            }            
            break;
            case "centerbottom":
            if (lineBreak)           
            {
                for(var i = 0 ; i < multiLineText.length ; i++)
                {      
                    measureFullText = c.measureText(multiLineText[i]).width;
                    c.fillText(multiLineText[i],region.x + region.width/ 2 - measureFullText /2 ,region.y + region.height- lineHeight * 0.3 - (line-1) * lineHeight);
                    c.translate(0,lineHeight);
                }
            }
            else{
                c.fillText(text,region.x + region.width/ 2 - measureFullText /2 ,region.y + region.height- lineHeight * 0.3 );
            }
       
            break;
            case "rightbottom":
            if (lineBreak)           
            {
                for(var i = 0 ; i < multiLineText.length ; i++)
                {      
                    measureFullText = c.measureText(multiLineText[i]).width;
                    c.fillText(multiLineText[i],region.x + region.width - measureFullText ,region.y + region.height- lineHeight * 0.3 - (line-1) * lineHeight);
                    c.translate(0,lineHeight);
                }
            }
            else{
                c.fillText(text,region.x + region.width - measureFullText ,region.y + region.height- lineHeight * 0.3);
            }
            break;

        }
        c.restore();
    }

    public static splitText(c: CanvasRenderingContext2D, text : string, width :number, measureLength: number,) : Array<string>
    {
        var multiLineBuffer = Array<string>();
        if (width < measureLength)
        {
            var textWidth = 0 ,splitStart = 0 , lineIndex = 0;
            for(var i = 0 ; i < text.length;i++)
            {
                var ch = text[i];
                var le = c.measureText(ch).width
                textWidth += le;
                if (width < textWidth)
                {
                    textWidth=le;
                    multiLineBuffer[lineIndex++] = text.substring(splitStart,i);
                    splitStart = i;
                }
            }
            var endch = text.substring(splitStart,i);
            if (endch != " ")
                multiLineBuffer[lineIndex++] = endch;
        }
        else
        {
            multiLineBuffer = [text];
        }

        return multiLineBuffer;
    }

    public static splitWordText(c: CanvasRenderingContext2D, text : string, width :number, measureLength: number,) : Array<string>
    {
        var multiLineBuffer = Array<string>();
        var words = text.split(' ');
        var textWidth = 0 , lineCount = 0;
        multiLineBuffer[lineCount] = '';
        words.forEach(el=>{
            var ch = el + " ";
            var le = c.measureText(ch).width;
            if (width < le)
            {
                var buffer = GameUtil.splitText(c,ch,width,le);
                buffer.length;
                ch = buffer[buffer.length-1];
                le = c.measureText(ch).width;
                buffer.forEach((el,i)=>{
                    if (i == 0 &&  multiLineBuffer[lineCount] == '')
                        multiLineBuffer[lineCount] += el;
                    else
                        multiLineBuffer.push(el);
                    lineCount++;
                })
                textWidth = le;
                return;
            }
            
            textWidth += le;

            if (width < textWidth)
            {
                textWidth=le;
                multiLineBuffer[++lineCount] = el;
            }
            else
            {
                multiLineBuffer[lineCount] += ch;
            }
            
        });
        return multiLineBuffer;
    }

    public static drawTextRegion(c: CanvasRenderingContext2D, text : string, region : Rect, align: string, valign:string, lineHeight : number)
    {
        var fullLength = c.measureText(text).width;
        var lineBreak = false;
        var multiLineBuffer = GameUtil.splitWordText(c,text, region.width, fullLength);
        var y =0;
        c.save();
        switch(valign)
        {
            case "top":
                y = region.y + lineHeight;
            break;
            case "middle":
                y = region.y + region.height / 2  - ((multiLineBuffer.length-1) * lineHeight) /2 + lineHeight * 0.3 ;
            break;
            case "bottom":
                y = region.y + region.height - (multiLineBuffer.length-1)* lineHeight - lineHeight * 0.3;
            break;
        }
        
        multiLineBuffer.forEach((element,i) => {
            
            GameUtil.drawTextAlign(c, element, region.x,region.width, y,align);
            c.translate(0,lineHeight);
        });
        c.restore();
    }
}

class Button implements ClickObject, RenderObject
{
    x : number = 0;
    y : number = 0;
    width : number = 50;
    height : number = 50;
    id : number = 0;
    render(context : CanvasRenderingContext2D){};
    update(delayTime){};
    onClick(event,sender){};
}

class CircleButton implements ClickObject, RenderObject
{
    x : number = 0;
    y : number = 0;
    radius : number = 50;
    id : number = 0;
    render(context : CanvasRenderingContext2D){};
    update(delayTime){};
    onClick(event,sender){};
}


class AnimateImageObject extends ImageObject
{
    public currentIndex :number =0;
    protected rects : Rect[] = []
    private size : Point = undefined;
    private animateTime : number = 1;
    private durtime = 0;
    protected frame = 1;
    private loop : boolean = false;
    private isStart = false;
    constructor(url:string, size: Point, loop:boolean , animateTime : number = 1){
        super(url)
        this.size = size;
        this.loop = loop;
        this.animateTime = animateTime;
    }

    public Load(url : string){
        var _t = this;
        this.Image = new Image();
        this.Image.width
        this.Image.src = url;
        this.Image.onload = function() {
            _t.loaded= true;            
            
            var length = _t.Image.width / _t.size.x;
            for (var i =0 ; i < length ; i++)
            {
                _t.rects.push({x:i*_t.size.x, y:0, width:_t.size.x, height:_t.size.y})
            }

            _t.frame = length;
        };
    }    

    public update(delayTime) {
        if (!this.isStart)
            return;
        this.durtime += delayTime;
        this.currentIndex = Math.floor(this.frame * (this.durtime /  this.animateTime));
        if (this.loop)
            this.currentIndex = this.currentIndex % this.frame;
        else if (this.durtime > this.animateTime)
            this.currentIndex = this.frame-1;
    }

    public start()
    {
        this.isStart = true;
        this.durtime = 0;
    }

    public stop()
    {
        this.isStart = false;
        this.currentIndex =0;
    }

    public getCurrentImage(): Rect{
        return this.getImageRect(this.currentIndex);
    }

    public getImageRect(index:number) : Rect{
        return this.rects[index];
    }
}
