class navigatorWindow {

    width = 0


}

class navigatorWindowControl {

    #settings = {}
    #rendering = {}

    constructor(navigator, mainMenu, subMenu){
        this.#settings = new navigatorWindowSettings(navigator, mainMenu, subMenu)
        this.#rendering = new navigatorRendering(navigator)
    }

    update(updatedMenu){
        switch(updatedMenu.constructor.name){
            case 'mainMenu':
                this.#openSubMenu()
                break;
            case 'sub':
                this.#transitionMainToSub()
                break;
            case 'subSelect':
                this.#transitionSubToSubSelect()
        }
    }

    #openSubMenu(){
        this.#settings.setForSubMenu()
        this.#rendering.resize(0, 400)
        this.#rendering.move(0, 400)
        this.#rendering.float(100, 300)
    }

    

    adjustToWindowResize(){
        this.#settings.setForMainMenu()
        this.#rendering.move(0, 200)
    }

    #transitionSubToMain(){
        this.#settings.setForMainMenu()
        this.#rendering.resize(0, 400)
        this.#rendering.move(0, 400)
        this.#rendering.float(100, 300)
    }

    transitionSubToSubExpanded(){
        this.#settings.setForSubExpanded()
        this.#rendering.resize(0, 200)
    }

    transitionSubExpandedToSub(){
        this.#settings.setForSubMenu()
        this.#rendering.resize(0, 200)
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
        this.navigator.div.transition('tSizingDIV').delay(delay).duration(duration)
            .style('width', this.navigator.divWidth + 'px')
            .style('height', this.navigator.divHeight + 'px')


        this.navigator.svg
            .attr('width', this.navigator.svgWidth)
            .attr('height', this.navigator.svgHeight)
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
            .ease(d3.easeSin)
            .delay(delay)
            .duration(duration)
            .style('left', this.navigator.left + "px")
            .style('top', this.navigator.top + "px")
    }
}

class navigatorWindowSettings{
    
    constructor(navigator, mainMenu, subMenu){
        this.navigator = navigator
        //this.mainMenu - mainMenu
        //this.subMenu = subMenu
        this.sizing = new navigatorSizing(navigator, mainMenu, subMenu)
        this.positioning = new navigatorPositioning(navigator)
        this.float = new navigatorFloat(navigator)
    }

    setForMainMenu(){
        this.sizing.fitToContents()
        this.positioning.positionCentre()
        this.float.floatOffBackground()
    }

    setForSubMenu(){
        this.sizing.fitToContents(8)
        this.positioning.positionLeft()
        this.float.sinkIntoBackground()
    }

    setForSubExpanded(){
        this.sizing.fitToContents()
    }

    setForSubSelectMenu(){
        this.sizing.fitToContents()
    }

}

class navigatorSizing{

    constructor(navigator, mainMenu, subMenu){
        this.navigator = navigator
        this.mainMenu = mainMenu
        this.subMenu = subMenu
        this.menuPadding = 20
        this.menuYspacing = 20
        this.totalWidth = 0
    }

    fitToContents(){
        this.totalWidth = this.#getWidth()
        this.#setDivDimensions()
        this.#setSVGDimensions()
    }

    #getWidth(){
        return this.#getWidestItemWidth('mainMenu') + this.#getWidestItemWidth('subMenu') + (this.menuPadding * 2)
    }

    #setDivDimensions(){
        this.navigator.divWidth = this.totalWidth
        this.navigator.divHeight = this.#getDivHeight()
    }

    #setSVGDimensions(){
        this.navigator.svgWidth = this.totalWidth
        this.navigator.svgHeight = this.#getSVGHeight()
    }

    #getDivHeight(){
        const visibleItemCount = this.#getVisibleItemCount()
        return visibleItemCount * this.menuYspacing + (this.menuPadding * 2)
    }

    #getSVGHeight(){
        const highestItemCount = this.#getHighestItemCount()
        return highestItemCount * this.menuYspacing + (this.menuPadding * 2)
    }

    #getVisibleItemCount(){
        if(this.mainMenu.expanded){
            return this.mainMenu.items.length
        } else if (this.subMenu.expanded) {
            return this.subMenu.items.length
        } else {
            return 1
        }
    }

    #getHighestItemCount(){
        return this.mainMenu.items.length > this.subMenu.items.length ?  this.mainMenu.items.length : this.subMenu.items.length 
    }

    #getWidestItemWidth(menuName){
        const groups = this.navigator.svg.selectAll('g.' + menuName + 'Item')
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
        const left = window.innerWidth / 2 - this.navigator.divWidth / 2
        const top = window.innerHeight / 2 - this.navigator.divHeight / 2
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