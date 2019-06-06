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
    }

    start(){
        setInterval(loopCallback, 16, this)
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

}

function assert(condition, error){
    if (!(typeof error == "string")) throw "Bad argument #2 to assert : error must be a string";
    if (!condition) throw error;
}

gmb.cssColor = function(color){
    assert(typeof color == "number", "Bad argument #1 to cssColor : color must be a number.");
    return '#' + color.toString(16).padStart(6, "0")
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
        if (typeof context.drawImage == "function" && this.img.loaded){
            context.drawImage(this.img, this.x, this.y);
        }
    }
}
