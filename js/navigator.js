class navigatorRendering {

    createDiv(){
        return d3.select('body')
            .append('div')
            .attr('id', 'navigatorDiv')
            .style('position', 'fixed')
            .style('border-radius', '20px')
    }

    createSVGCanvas(){
        return navigatorWindow.div.append('svg')
            .attr('id', 'navigatorSVG')
    }

    resize(delay, duration){
        navigatorWindow.div.transition('tSizing').delay(delay).duration(duration)
            .style('width', navigatorWindow.width + 'px')
            .style('height', navigatorWindow.height + 'px')

    }

    float(delay, duration){
        navigatorWindow.div.transition('tFloat')
            .delay(delay)
            .duration(duration)
                .style('background-color', navigatorWindow.backgroundColour)
                .style('border-radius', navigatorWindow.borderRadius + 'px')
                .style('box-shadow', navigatorWindow.boxShadow)

    }

    move(delay, duration){
        navigatorWindow.div.transition('tMove')
            .delay(delay)
            .duration(duration)
            .style('left', navigatorWindow.left + "px")
            .style('top', navigatorWindow.top + "px")
    }



}

class navigatorWindowControl {

    constructor(){
        this.settings = new navigatorWindowSettings
        this.rendering = new navigatorRendering
    }

    createNavigator(){
        navigatorWindow.div = this.rendering.createDiv()
        navigatorWindow.svg = this.rendering.createSVGCanvas()
    }

    update(clickedMenu, clickedItem){
        switch(clickedMenu){
            case 'main':
                this.updateFromMain(clickedItem)
                break;

            case 'sub':
                this.updateFromSub(clickedItem)
                break;

            default:
                this.revealAsMainMenu()
        }
    }

    updateFromMain(clickedItem){
        if (clickedItem.subMenu.length > 0){
            this.transitionMainToSub()
        }
    }

    updateFromSub(clickedItem){
        if(clickedItem.constructor.name === 'menuItem'){
            this.transitionSubToMain()
        }
    }

    revealAsMainMenu(){
        this.settings.setForMainMenu()
        this.rendering.resize(0, 0)
        this.rendering.move(0, 0)
        this.rendering.float(100, 300)
    }

    transitionSubToMain(){
        this.settings.setForMainMenu()
        this.rendering.resize(0, 400)
        this.rendering.move(0, 400)
        this.rendering.float(100, 300)

    }

    transitionMainToSub(){
        this.settings.setForSubMenu()
        this.rendering.resize(0, 400)
        this.rendering.move(0, 400)
        this.rendering.float(100, 300)
    }


}

class navigatorWindowSettings{

    constructor(){
        this.sizing = new navigatorSizing
        this.positioning = new navigatorPositioning
        this.float = new navigatorFloat
    }

    setForMainMenu(){
        this.sizing.fitToContents()
        this.positioning.positionCentre()
        this.float.floatOffBackground()
    }

    setForSubMenu(){
        this.sizing.fitToContents()
        this.positioning.positionLeft()
        this.float.sinkIntoBackground()
    }
}

class navigatorWindow {
    static div = {}
    static svg = {}
    static items = []
    static width = 0
    static height = 0
    static left = 0
    static top = 0
    static position = 'fixed'
    static borderRadius = 20
}

class navigatorSizing{

    fitToContents(){
        navigatorWindow.width = this.#setWidthToContents()
        navigatorWindow.height = this.#setHeightToContents()
    }

    #setWidthToContents(){
        const widestItemWidth = this.#getWidestItemWidth()
        return widestItemWidth + (menu.padding * 2)
    }

    #setHeightToContents(){
        const itemCount = menu.items.length
        return (itemCount) * menu.ySpacing + (menu.padding * 2)
    }

    #getWidestItemWidth(){
        const groups = navigatorWindow.svg.selectAll('g')
        let widestWidth = 0
        
        groups.each(function(){
            const textElem = d3.select(this).select('text')
            const width = textElem.node().getBBox().width
            
            if(width > widestWidth){
                widestWidth = width
            }  
        })

        return widestWidth
    }

    
}

class navigatorPositioning{

    positionCentre(){
        const left = window.innerWidth / 2 - navigatorWindow.width / 2
        const top = window.innerHeight / 2 - navigatorWindow.height / 2
        this.set(left, top)
    }

    positionLeft(){
        const left = 20
        const top = 20
        this.set(left, top)
    }

    set(left, top){
        navigatorWindow.left = left
        navigatorWindow.top = top
    }
}

class navigatorFloat {

    floatOffBackground(){
        this.#setStyles('white', 20, '0 4px 8px rgba(0, 0, 0, 0.2)')
    }

    sinkIntoBackground(){
        this.#setStyles('lightyellow', 0, '0 0 0 rgba(0, 0, 0, 0)')
    }

    #setStyles(backgroundColour, borderRadius, boxShadow){
        navigatorWindow.backgroundColour = backgroundColour
        navigatorWindow.borderRadius = borderRadius
        navigatorWindow.boxShadow = boxShadow
    }

}