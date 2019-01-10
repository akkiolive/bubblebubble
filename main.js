(function(){
    //canvas settings
    var canvas = document.getElementById("stage");
    var ctx = canvas.getContext("2d");

    var width = 1000;
    var height = 800;
    canvas.width = width;
    canvas.height = height;

    //input setting
    var button = document.getElementById("button");
    button.addEventListener("click",function(){
        console.log("add");
    },false);

    var input = document.getElementById("input");
    input.addEventListener("keydown",function(e){
        if(e.keyCode==13){
            button.dispatchEvent(new MouseEvent("click"));
        }
    },false);
    
    //bubble
    class Bubble{
        constructor(x, y, r, name, color="default"){
            this.x = x;
            this.y = y;
            this.r = r; 
            this.name = name;
            this.color = color;
            this.id = undefined;
            this.parentIDs = [];
            this.childIDs = [];
            this.velocity = 0.1;
            this.vector = {x:0, y:-1};
            this.busyCount = 0;
            this.busy = 0;  
            this.hover = 0;
        }

        setVector(ox, oy, x, y){
            var l = Math.sqrt((x-ox)*(x-ox)+(y-oy)*(y-oy));
            this.vector.x = (x-ox)/l;
            this.vector.y = (y-oy)/l;
        }
    }

    //bubbles
    class Bubbles{
        constructor(){
            this.list = [];
            this.num = 0;
            this.lastAdd = undefined;
        }

        init(){
            //load(allbubbles);
            this.num = this.list.length;
        }

        add(bubble){
            this.list.push(bubble);
            this.list[this.num].id = this.num;
            this.num++;
        }

        becomeChildOf(id){
            this.list[id]
        }

        drawLines(){

        }

        drawArcs(){
            for(var i in this.list){
                var b = this.list[i];
                ctx.beginPath();
                ctx.setLineDash([]);
                ctx.arc(b.x, b.y, b.r, 0, Math.PI*2, false);
                ctx.strokeStyle = "black";
                if(ctx.isPointInPath(lastMoved.x, lastMoved.y)){
                    b.hover = 1;
                    ctx.lineWidth = 2;
                }
                else{
                    b.hover = 0;
                    ctx.lineWidth = 1;
                }
                ctx.stroke();
            }
        }

        drawVectors(){
            for(var i in this.list){
                var b = this.list[i];
                ctx.beginPath();
                ctx.arc(b.x, b.y, 3, 0, Math.PI*2, false);
                ctx.fill();
                ctx.beginPath();
                ctx.strokeStyle = "black";
                ctx.lineTo(b.x, b.y);
                ctx.lineTo(b.x+b.vector.x*b.velocity*80, b.y+b.vector.y*b.velocity*80);
                ctx.stroke();
            }
        }

        collisionArc(x, y, r, xx, yy, rr){
            var l = Math.sqrt((x-xx)*(x-xx)+(y-yy)*(y-yy));
            if(l<r+rr){
                return true;
            }
            else return false;
        }

        collisionBubble(b1, b2){
            var x = b1.x;
            var y = b1.y;
            var r = b1.r;
            var xx = b2.x;
            var yy = b2.y;
            var rr = b2.r;
            var l = Math.sqrt((x-xx)*(x-xx)+(y-yy)*(y-yy));
            if(l<r+rr){
                return true;
            }
            else return false;
        }

        collisionWall(bubble){
            var x = bubble.x;
            var y = bubble.y;
            var r = bubble.r;
            if(x+r>width){ //migi
                bubble.x = width-r;
            }
            else if(x-r<0){ //hidari
                bubble.x = r;
            }
            if(y+r>height){ //shita
                //bubble.y = height-r;
            }
            else if(y-r<0){ //ue
                bubble.y = r;
            }
        }

        getUnitVector(ox, oy, x, y){
            var l = Math.sqrt((x-ox)*(x-ox)+(y-oy)*(y-oy));
            return {
                x: (x-ox)/l,
                y: (y-oy)/l
            };
        }

        unitVector(vector){
            var l = Math.sqrt(vector.x*vector.x + vector.y*vector.y);
            return {
                x: vector.x/l,
                y: vector.y/l
            };
        }

        addVector(v1, v2){
            var ox = v1.x;
            var oy = v1.y;
            var x = v2.x;
            var y = v2.y;
            var l = Math.sqrt((x-ox)*(x-ox)+(y-oy)*(y-oy));
            return {
                x: (x+ox)/l,
                y: (y+oy)/l
            };
        }

        collisions(){
            for(var i in this.list){
                this.collisionWall(this.list[i]);
            }
            for(var i in this.list){
                var bi = this.list[i];
                var ret = 0;
                for(var j in this.list){
                    if(i==j) continue;
                    var bj = this.list[j];
                    ret = this.collisionBubble(bi, bj);
                    if(ret){
                        bi.busy = 1;
                        bi.velocity = 1;
                        bj.velocity = 1;

                        var oriVec = bi.vector;
                        var addVec = bubbles.getUnitVector(bj.x, bj.y, bi.x, bi.y);
                        bi.vector = bubbles.addVector(oriVec.x, oriVec.y, addVec.x, addVec.y);
                        oriVec = bj.vector;
                        addVec = bubbles.getUnitVector(bi.x, bi.y, bj.x, bj.y);
                        bj.setVector(oriVec.x, oriVec.y, oriVec.x+addVec.x, oriVec.y+addVec.y);
                        
                        /*
                        bj.setVector(bi.x, bi.y, bj.x, bj.y);
                        bi.setVector(bj.x, bj.y, bi.x, bi.y);
                        */
                        
                        //bi.busyCount++;
                    }
                }
                if(!ret){
                    bi.velocity = 0.4;
                    bi.vector.x = 0;          
                    bi.vector.y = -1;
                    bi.busyCount = 0;
                    bi.busy = 0;
                }
                if(bi.busyCount>60*5){
                    bi.x = width/2;
                    bi.y = height-bi.r;
                }
            }
        }

        moveBubbles(){
            for(var i in this.list){
                var b = this.list[i];
                if(!b.busy){
                    b.x += b.velocity * b.vector.x;
                    b.y += b.velocity * b.vector.y;
                }
            }
        }

        frame(){
            //this.moveBubbles();
            //this.collisions();
            this.drawArcs();
            //this.drawVectors();
        }

        kakimazeru(){
            for(var i in this.list){
                var b = this.list[i];
                b.x = Math.random()*width;
                b.y = Math.random()*height; 
            }
        }
    }

    //instances
    var bubbles = new Bubbles();

    //click events
    bubbleMaking = {
        flag: 0,
        ox:0,
        oy:0,
        x:0,
        y:0,
        r:0
    };
    bubbleDragging = {
        flag: 0,
        ox:0,
        oy:0,
        x:0,
        y:0,
        lx:0,
        ly:0,
        bubble: null
    };
    lastClicked = {
        x: 0,
        y: 0
    }
    lastMoved = {
        x: 0,
        y: 0
    }
    function onMouseDown(e){
        x = e.clientX;
        y = e.clientY;
        lastClicked.x = x;
        lastClicked.y = y;
            
        var ret = 0;
        if(!bubbleDragging.flag){
            for(var i in bubbles.list){
                var b = bubbles.list[i];
                if(b.hover){
                    ret = 1;
                    bubbleDragging.flag = 1;
                    bubbleDragging.bubble = b;
                    bubbleDragging.ox = x;
                    bubbleDragging.oy = y;
                    bubbleDragging.lx = bubbleDragging.bubble.x - x;
                    bubbleDragging.ly = bubbleDragging.bubble.y - y;
                }
            }
        }
        if(!ret && !bubbleMaking.flag){
            bubbleMaking.flag = 1;
            bubbleMaking.ox = e.clientX;
            bubbleMaking.oy = e.clientY;
            bubbleMaking.x = e.clientX;
            bubbleMaking.y = e.clientY;
            bubbleMaking.r = 0;
        }
        
    }
    function onMouseMove(e){
        x = e.clientX;
        y = e.clientY;
        ox = bubbleMaking.ox;
        oy = bubbleMaking.oy;
            
        lastMoved.x = x;
        lastMoved.y = y;

        if(bubbleDragging.flag){
            bubbleDragging.x = x;
            bubbleDragging.y = y;
            bubbleDragging.bubble.x = x + bubbleDragging.lx;
            bubbleDragging.bubble.y = y + bubbleDragging.ly;

        }
        else if(bubbleMaking.flag){
            bubbleMaking.x = e.clientX;
            bubbleMaking.y = e.clientY;
            bubbleMaking.r = Math.sqrt((x-ox)*(x-ox) + (y-oy)*(y-oy));
        }
    }
    function onMouseUp(e){
        if(bubbleDragging.flag){
            bubbleDragging.flag = 0;
        }
        if(bubbleMaking.flag){
            bubbleMaking.flag = 0;
            bubbles.add(new Bubble(bubbleMaking.ox, bubbleMaking.oy, bubbleMaking.r, "bubble"+bubbles.num));
        }
    }

    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mousemove", onMouseMove, false);
    canvas.addEventListener("mouseup", onMouseUp, false);

    document.addEventListener("keydown", function(e){
        console.log(e.keyCode);
        if(e.keyCode == 76){
            bubbles .kakimazeru();
        }
    }, false);

    //animation
    function anime(){
        ctx.clearRect(0,0,width, height);
        bubbles.frame();
        
        if(bubbleMaking.flag){
            ctx.beginPath();
            ctx.setLineDash([8,5]);
            ctx.strokeStyle = "black";
            ctx.arc(bubbleMaking.ox, bubbleMaking.oy, bubbleMaking.r, 0, Math.PI*2., false);
            ctx.stroke();
        }
    }

    setInterval(anime, 1./60.);

})();