gmb = {}

function gmb.draw(element, context){
    context = context || element.renderContext || (element.game && element.game.renderContext) || gmb.defaultContext;

    if (typeof element.draw == "function"){
        element.draw()
    }
}