gmb = {}

gmb.draw = function(element, context){
    context = context || element.renderContext || (element.game && element.game.renderContext) || gmb.defaultContext;

    if (typeof element.draw == "function"){
        element.draw();
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
}

gmb.Application = class{

    constructor(context){
        this.context = context;
        this.gui = [];
    }

    addGUILayer(name, position = -1){
        assert(typeof name == "string");
        position = parseInt(position);

        let layer = new gmb.GUILayer(name)

        if (position = -1) {
            this.push(layer)
        }

        this.gui.splice(position, 0, layer);
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

    }
}

function assert(condition, error){
    if (!(typeof error == "string")) throw "Bad argument #1 to assert : error must be a string";
    if (!condition) throw error;
}