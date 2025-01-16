class navigatorWindow {

    constructor(){

    }

}

class navigatorWindowControl {

    #settings = {}
    #rendering = {}

    constructor(navigator, menu){
        this.#settings = new navigatorWindowSettings(navigator, menu)
        this.#rendering = new navigatorRendering(navigator)
    }

    update(data){
        console.log(data)
        switch(data.newConfigration){
            case 'main':
                this.#transitionSubToMain()
                break;
            case 'sub':
                this.#transitionMainToSub()
                break;
            case 'subSelect':
                this.#transitionSubToSubSelect()
        }
    }

    #transitionSubToMain(){
        this.#settings.setForMainMenu()
        this.#rendering.resize(0, 400)
        this.#rendering.move(0, 400)
        this.#rendering.float(100, 300)
    }

    #transitionSubToSubSelect(){
        this.#settings.setForSubSelectMenu()
        this.#rendering.resize(0, 0)
    }

    #transitionMainToSub(){
        this.#settings.setForSubMenu()
        this.#rendering.resize(0, 400)
        this.#rendering.move(0, 400)
        this.#rendering.float(100, 300)
    }

}

class navigatorRendering {

    constructor(navigator){
        this.navigator = navigator
    }

    resize(delay, duration){
        this.navigator.div.transition('tSizing').delay(delay).duration(duration)
            .style('width', this.navigator.width + 'px')
            .style('height', this.navigator.height + 'px')
    }

    float(delay, duration){
        this.navigator.div.transition('tFloat')
            .delay(delay)
            .duration(duration)
                .style('background-color', this.navigator.backgroundColour)
                .style('border-radius', this.navigator.borderRadius + 'px')
                .style('box-shadow', this.navigator.boxShadow)
    }

    move(delay, duration){
        this.navigator.div.transition('tMove')
            .delay(delay)
            .duration(duration)
            .style('left', this.navigator.left + "px")
            .style('top', this.navigator.top + "px")
    }
}

class navigatorWindowSettings{
    
    constructor(navigator, menu){
        this.navigator = navigator
        this.menu = menu
        this.sizing = new navigatorSizing(navigator, menu)
        this.positioning = new navigatorPositioning(navigator)
        this.float = new navigatorFloat(navigator)
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

    setForSubSelectMenu(){
        this.sizing.fitToContents()
    }
}

class navigatorSizing{

    constructor(navigator, menu){
        this.navigator = navigator
        this.menu = menu
    }

    fitToContents(){
        this.navigator.width = this.#setWidthToContents()
        this.navigator.height = this.#setHeightToContents()
    }

    #setWidthToContents(){
        const widestItemWidth = this.#getWidestItemWidth()
        return widestItemWidth + (this.menu.padding * 2)
    }

    #setHeightToContents(){
        const itemCount = this.menu.items.length - (this.menu.state === 'subSelect' ? 1 : 0)
        return (itemCount) * this.menu.ySpacing + (this.menu.padding * 2)
    }

    #getWidestItemWidth(){
        const groups = this.navigator.svg.selectAll('g')
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

    constructor(navigator){
        this.navigator = navigator
    }

    positionCentre(){
        const left = window.innerWidth / 2 - this.navigator.width / 2
        const top = window.innerHeight / 2 - this.navigator.height / 2
        this.set(left, top)
    }

    positionLeft(){
        const left = 20
        const top = 20
        this.set(left, top)
    }

    set(left, top){
        this.navigator.left = left
        this.navigator.top = top
    }
}

class navigatorFloat {

    constructor(navigator){
        this.navigator = navigator
    }

    floatOffBackground(){
        this.#setStyles('white', 20, '0 4px 8px rgba(0, 0, 0, 0.2)')
    }

    sinkIntoBackground(){
        this.#setStyles('lightyellow', 0, '0 0 0 rgba(0, 0, 0, 0)')
    }

    #setStyles(backgroundColour, borderRadius, boxShadow){
        this.navigator.backgroundColour = backgroundColour
        this.navigator.borderRadius = borderRadius
        this.navigator.boxShadow = boxShadow
    }
}