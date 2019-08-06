var gmb = {}

gmb.draw = function(element, context){
    context = context || element.context || (element.application && element.application.context) || gmb.defaultContext;

    if (typeof element.draw == "function"){
        element.draw(context);
    }
}

gmb.GUILayer = class{
    constructor(name){
        this.name = name;
        this.elements = [];
    }

    getElements(){
        return this.elements;
    }

    draw(context){
        for (let i = 0; i < this.elements.length; i++){
            gmb.draw(this.elements[i], context)
        }
    }

    onLeftClick(){
        for (let i = 0; i < this.elements.length; i++){
            if (this.elements[i].onLeftClick) this.elements[i].onLeftClick();
        }  
    }

    add(element){
        return this.elements.splice(0, 0, element);
    }

    sendElementToPosition(element, sendIndex){
        let index = null
        if (typeof element != "number"){
            for (let i = 0; i < this.elements.length; i++){
                if (this.elements[i] == element){
                    index = i;
                }
            }
            if (index === null){
                return false
            }
        } else {
            index = element;
            if (index >= this.elements.length || sendIndex >= this.elements.length){
                return false;
            }
        }

        element = this.elements[i];
        this.elements.splice(index, 1)
        this.elements.splice(sendIndex, 0, element)
        return sendIndex;
    }

    sendElementToBottom(element){
        sendElementToPosition(element, 0)
    }

}

let loopCallback = function(app){
    app.draw()
}

gmb.Application = class{

    constructor(a, b, c){
        this.isApplication = true;
        
        if (typeof a == "number" && typeof b == "number"){
            let canvas = document.createElement("canvas");
            canvas.width = a;
            canvas.height = b;
            this.context = canvas.getContext("2d");
            if (!c) document.body.appendChild(canvas);
        } else if (typeof a == "object"){
            this.context = a;
        }

        this.gui = [];
        this.config = {
            strictLayers: false,
            clearColor: "#000000"
        };

        this.mouseX = 0;
        this.mouseY = 0;    }

    start(){
        setInterval(loopCallback, 16.66, this)
        if (this.context){
            this.context.canvas.addEventListener("mousemove", (evt) => this.__onMouseMoved(evt));
            this.context.canvas.addEventListener("click", (evt) => this.__onClick(evt))
        }
    }

    addGUILayer(name, position = -1){
        assert(typeof name == "string", "Bad argument #1 to addGUILayer : name must be a string.");
        position = parseInt(position);

        let layer = new gmb.GUILayer(name);

        if (position = -1) {
            this.gui.push(layer);
            return layer;
        }

        this.gui.splice(position, 0, layer);
        return layer;
    }

    delGUILayer(position){
        if (typeof position == "string"){
            return this.gui.splice(this.getGUILayer(position), 1);
        }
        return this.gui.splice(position, 1);
    }

    getGUILayer(name, mode = 0){
        for (let i = 0; i < this.gui.length; i++){
            if (name == this.gui[i].name) return mode == 0 ? this.gui[i].elements : mode == 1 ? this.gui[i] : i;
        }
        return null;
    }

    draw(context){
        context = context || this.context;

        if (!context) return false;

        if (this.config.clearColor != "none" && context.fillRect){
            context.fillStyle = this.config.clearColor;
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        }

        for (let i = 0; i < this.gui.length; i++){
            this.gui[i].draw(context);
        }
    }

    onLeftClick(){
        for (let i = 0; i < this.gui.length; i++){
            this.gui[i].onLeftClick();
        }
    }

    getContext(){
        return this.context;
    }

    setContext(context){
        this.context = context
    }

    setStrictGUILayers(mode){
        this.config.strictLayers = mode;
    }

    setClearColor(color){
        if (typeof color == "number") {
            if (color < 0) {
                color = "none"
            } else {
            color = gmb.cssColor(color);
            }
        }
        this.config.clearColor = color;
    }

    //NATIVE EVENTS
    __onMouseMoved(evt){
        if (!this.context) return false;
        let rect = this.context.canvas.getBoundingClientRect(), // abs. size of element
        scaleX = this.context.canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = this.context.canvas.height / rect.height;  // relationship bitmap vs. element for Y
        this.mouseX = (evt.clientX - rect.left) * scaleX;
        this.mouseY = (evt.clientY - rect.top) * scaleY;
    }

    __onClick(evt){
        switch (evt.button) {
            case 0:
                this.onLeftClick();
                break;
        }
    }
}

function assert(condition, error){
    if (!(typeof error == "string")) throw "Bad argument #2 to assert : error must be a string";
    if (!condition) throw error;
}

gmb.cssColor = function(color){
    assert(typeof color == "number", "Bad argument #1 to cssColor : color must be a number.");
    return '#' + color.toString(16).padStart(6, "0")
}

gmb.isHovered = function(x, y, w, h, mx, my){

    if (mx && mx.isApplication){
        my = mx.mouseY;
        mx = mx.mouseX;
    }

    document.getElementById('test').innerText = mx + ", " + my

    return mx >= x && my >= y && mx <= x + w && my <= y + h;

}

gmb.loadImage = function(application, url, callback){
    assert(typeof url == "string", "Bad argument #2 to loadImage : url must be a string");

    let img = new Image();
    img.onload = function(event){
        let img = event.target
        if (typeof callback == "function") callback(img);
        if (application && typeof application.onload == "function"){
            application.onload(img);
        } 
        img.loaded = true;
    };
    img.src = url;
    img.loaded = false;
    
    return img;
}

gmb.voidFunction = function(){};

gmb.GUIElement = class{
    constructor(application, layerName, x, y){
        this.isGMBGUIElement = true;

        if (application && application.isApplication && typeof layerName == "string") {
            let layer = application.getGUILayer(layerName, 1)
            if ( layer == null){
                if (application.config.strictLayers){
                    throw "The specified GUI layer doesn't exist"
                } else {
                    layer = application.addGUILayer(layerName);
                }
            }

            layer.add(this)
        }

        this.x = x;
        this.y = y;
        this.application = application;
    }
}


gmb.StaticImage = class extends gmb.GUIElement {
    constructor(application, layerName, x, y, img, w, h){
        if (!img) {
            this.img = {loaded: false}
            return false;
        }
        if (typeof img == "string"){
            img = gmb.loadImage(application, img);
        }
        super(application, layerName, x, y);
        this.w = w;
        this.h = h;
        this.img = img;
    }

    draw(context){
        if (typeof context.drawImage == "function"){
            let w = this.w || this.img.w;
            let h = this.h || this.img.h;
            if (w && h){
                context.drawImage(this.img, this.x, this.y, w, h);
            } else {
                context.drawImage(this.img, this.x, this.y);
            }
        }
    }
}

gmb.Button = class extends gmb.GUIElement {
    constructor(application, layerName, x, y, properties){
        let draw, hover, click, leftClick, rightclick, w, h;

        super(application, layerName, x, y)

        if (typeof properties == "object"){
            draw = properties.draw || properties.hovered;
            hover = properties.hover || properties.hovered;
            click = properties.click;
            leftClick = properties.leftClick;
            rightclick = properties.rightclick;
            w = properties.w;
            h = properties.h;
            this.alwaysViewUnhovered = properties.alwaysViewUnhovered;
        } else {
            return true;
        }

        this.w = w;
        this.h = h;

        if (!leftClick){
            leftClick = click;
        }

        this.leftClick = leftClick;
        this.rightclick = rightclick;

        this.unhovered = {}
        if (typeof draw == "function"){
            this.drawType == "function";
            this.unhovered.toDraw = draw;
        } else if (typeof draw == "string"){
            this.unhovered.toDraw = gmb.loadImage(application, draw, (img) => this.imageLoadCallback);
            this.drawType = "image";
        } else if (typeof draw == "object"){
            if (draw.toDraw || draw.img){
                draw.toDraw = draw.img || draw.toDraw;
                if (typeof draw.toDraw == "string"){
                    draw.toDraw = gmb.loadImage(application, draw.toDraw, (img) => this.imageLoadCallback);
                    this.drawType = "image";
                }

                if (typeof draw.toDraw == "function"){
                    this.drawType = "function";
                }

                this.unhovered.toDraw = draw.toDraw;
                this.unhovered.w = draw.w;
                this.unhovered.h = draw.h;
                this.unhovered.x = draw.x;
                this.unhovered.y = draw.y;
            } else {
                this.unhovered.toDraw = draw;
                this.drawType = "image"
            }
        }

        this.hovered = {}
        if (typeof hover == "function"){
            this.hoverType == "function";
            this.hovered.toDraw = hover;
        } else if (typeof hover == "string"){
            this.hovered.toDraw = gmb.loadImage(application, draw, (img) => this.imageLoadCallback(img));
            this.hoverType = "image";
        } else if (typeof hover == "object"){
            if (hover.toDraw || hover.img){
                hover.toDraw = hover.img || hover.toDraw;
                if (typeof hover.toDraw == "string"){
                    hover.toDraw = gmb.loadImage(application, hover.toDraw, (img) => this.imageLoadCallback);
                    this.hoverType = "image";
                }

                if (typeof hover.toDraw == "function"){
                    this.hoverType = "function";
                }

                this.hovered.toDraw = hover.toDraw;
                this.hovered.w = hover.w;
                this.hovered.h = hover.h;
                this.hovered.x = hover.x;
                this.hovered.y = hover.y;
            } else {
                this.hovered.toDraw = hover;
                this.hoverType = "image"
            }
        }

        if (this.unhovered.toDraw) this.w_ = this.unhovered.toDraw.width;
        if (this.unhovered.toDraw) this.h_ = this.unhovered.toDraw.height;
        this.x_ = this.x || this.unhovered.x || 0;
        this.y_ = this.y || this.unhovered.y || 0;
        this.w_ = this.w || this.unhovered.w || this.w_ || 0;
        this.h_ = this.h || this.unhovered.h || this.h_ || 0;
    }

    imageLoadCallback(img){
        this.w_ = this.w_ || img.width;
        this.h_ = this.h_ || img.height;
    }

    draw(context){
        let hover = this.isHovered()
        if (!hover || this.alwaysViewUnhovered){
            let x, y, w, h;
            switch(this.drawType){
                case "image" :
                    x = this.unhovered.x || this.x;
                    y = this.unhovered.y || this.y;
                    w = this.unhovered.w || this.w;
                    h = this.unhovered.h || this.h;
                    if (context.drawImage){
                        if (w && h){
                            context.drawImage(this.unhovered.toDraw, x, y, w, h);
                        } else {
                            context.drawImage(this.unhovered.toDraw, x, y);
                        }
                    }
                    this.x_ = x || this.x || 0;
                    this.y_ = y || this.y_ || 0;
                    this.w_ = w || this.unhovered.toDraw.width || this.w_;
                    this.h_ = h || this.unhovered.toDraw.height || this.h_;
                    break;
                case "function":
                    x = this.unhovered.x || this.x;
                    y = this.unhovered.y || this.y;
                    w = this.unhovered.w || this.w;
                    h = this.unhovered.h || this.h;
                    
                    let res = this.unhovered.toDraw(x, y, w, h).bind(this)

                    if (typeof res == "object"){
                        x = res.x || x;
                        y = res.y || y;
                        w = res.w || w;
                        h = res.h || h;
                    }
                    this.x_ = x || this.x_ || 0;
                    this.y_ = y || this.y_ || 0;
                    this.w_ = w || this.w_ || 0;
                    this.h_ = h || this.h_ || 0;
            }
        }
        if (hover){
            let x, y, w, h;
            switch(this.hoverType){
                case "image" :
                    x = this.hovered.x || this.x;
                    y = this.hovered.y || this.y;
                    w = this.hovered.w || this.w;
                    h = this.hovered.h || this.h;
                    if (context.drawImage){
                        if (w && h){
                            context.drawImage(this.hovered.toDraw, x, y, w, h);
                        } else {
                            context.drawImage(this.hovered.toDraw, x, y);
                        }
                    }
                    this.x_ = x || this.x_ || 0;
                    this.y_ = y || this.y_ || 0;
                    this.w_ = w || this.hovered.toDraw.width || this.w_;
                    this.h_ = h || this.hovered.toDraw.height || this.h_;
                    break;
                case "function":
                    x = this.hovered.x || this.x;
                    y = this.hovered.y || this.y;
                    w = this.hovered.w || this.w;
                    h = this.hovered.h || this.h;
                    
                    let res = this.hovered.toDraw(x, y, w, h).bind(this)

                    if (typeof res == "object"){
                        x = res.x || x;
                        y = res.y || y;
                        w = res.w || w;
                        h = res.h || h;
                    }
                    this.x_ = x || this.x_ || 0;
                    this.y_ = y || this.y_ || 0;
                    this.w_ = w || this.w_ || 0;
                    this.h_ = h || this.h_ || 0;
            }
        }
    }

    onLeftClick(){
        if (this.isHovered() && typeof this.leftClick == "function"){
            return this.leftClick();
        }
    }

    isHovered(){
        return gmb.isHovered(this.x_, this.y_, this.w_, this.h_, this.application)
    }

}