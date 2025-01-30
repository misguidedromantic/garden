class navigation {

    static window = {}

    static initialise (){
        this.window = new navigatorWindow
        this.mainMenu = new mainMenu (this.window)
        this.subMenu = new subMenu (this.window)
        //createContainers
            //createWindow
            //createMenuContainers
        //loadMenuData
        //renderMenus

    }

}

class navigatorWindow {
    constructor(){
        this.div = createDiv ('navigator', 'fixed')
        return this.div
    }
}



function createNavigator(){
    return createDiv ('navigator', 'fixed')
}

function createMenus(){
    


}

function createMenu(name, parentContainer, items){

}

function createMainMenu(window){
    
    
    function loadItems(){
        return [
            new menuItem ('plans', 'plans'),
            new menuItem ('songs', 'songs'),
            new menuItem ('concepts', 'concepts')
        ]
    }

    const menu = new mainMenu
    

    menu.div = createDiv ('mainMenu', 'absolute', window)
    menu.svg = createSVGCanvas ('mainMenu', div)
    menu.items = loadItems()
    return menu
}



class navigationEvents {}
class navigationMenuContainers {}





class navigatorWindowControl {
    
    #mainMenu = {}
    #subMenu = {}
    #settings = {}
    #rendering = {}


    constructor(navigator, mainMenu, subMenu){
        this.#mainMenu = mainMenu
        this.#subMenu = subMenu
        this.#settings = new navigatorWindowSettings(navigator, mainMenu, subMenu)
        this.#rendering = new navigatorRendering(navigator)
    }

    update(updatedMenu){
        console.log(updatedMenu)
        switch(updatedMenu.constructor.name){
            case 'mainMenu':
                this.#openSubMenu()
                break;
            case 'subMenu':
                this.#openSubMenu()
                break;
            case 'subSelect':
                //this.#transitionSubToSubSelect()
        }
    }

    expandMenu(){
        this.#settings.setForSubExpanded()
        this.#rendering.resize(0, 200)
    }

    contractMenu(){
        this.#settings.setForSubContracted()
        this.#rendering.resize(0, 200)
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

}

class navigatorRendering {

    constructor(navigator){
        this.navigator = navigator
    }

    resize(delay, duration){
        this.navigator.div.transition('tSizingDIV').delay(delay).duration(duration)
            .style('width', this.navigator.div.width + 'px')
            .style('height', this.navigator.div.height + 'px')


        this.navigator.svg
            .attr('width', this.navigator.svg.width)
            .attr('height', this.navigator.svg.height)
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
    
    constructor(navigator){
        this.navigator = navigator
        this.sizing = new navigatorSizing(navigator)
        this.positioning = new navigatorPositioning(navigator)
        this.float = new navigatorFloat(navigator)
    }

    setToMainOnly(){
        this.sizing.fitToMainMenu(this.navigator.mainMenu.items)
        this.positioning.positionCentre()
        this.float.floatOffBackground()
        this.navigator.configuration = 'main'
    }

    setToSubContracted(){
        this.sizing.fitToSubMenuContracted(this.navigator.mainMenu.items, this.navigator.subMenu.items)
        this.positioning.positionLeft()
        this.float.sinkIntoBackground()
        this.navigator.configuration = 'sub'
    }

    setToSubExpanded(){
        this.sizing.fitToSubMenuExpanded(this.navigator.mainMenu.items, this.navigator.subMenu.items)
        this.positioning.positionLeft()
        this.float.sinkIntoBackground()
        this.navigator.configuration = 'sub'
    }

}

class navigatorSizing{

    constructor(navigator){
        this.navigator = navigator
    }

    fitToMainMenu(items){
        const width = this.getWidestItemWidth(items) + 40
        const height = items.length > 1 ? items.length * 20 + 40: 20
        this.setDivDimensions(width, height)
        this.setSVGDimensions(width, height)
    }

    fitToSubMenuContracted(mainMenuItems, subMenuItems){
        const width = getWidestItemWidth(mainMenuItems) + getWidestItemWidth(subMenuItems) + 40
        this.setDivDimensions(width, 20)
        this.setSVGDimensions(width, subMenuItems.length * 20)
    }

    fitToSubMenuExpanded(mainMenuItems, subMenuItems){
        const width = getWidestItemWidth(mainMenuItems) + getWidestItemWidth(subMenuItems) + 40
        this.setDivDimensions(width, 7 * 20)
        this.setSVGDimensions(width, subMenuItems.length * 20)
    }

    getWidestItemWidth(menuItems){
        return menuItems.length > 0 ? Math.max(...menuItems.map(item => item.renderedWidth)) : 0
    }

    setDivDimensions(width, height){
        this.navigator.div.width = width
        this.navigator.div.height = height
    }

    setSVGDimensions(width, height){
        this.navigator.svg.width = width
        this.navigator.svg.height = height
    }

    


}

class navigatorPositioning{

    constructor(navigator){
        this.navigator = navigator
    }

    positionCentre(){
        const left = window.innerWidth / 2 - this.navigator.div.width / 2
        const top = window.innerHeight / 2 - this.navigator.div.height / 2
        this.set(left, top)
    }

    positionLeft(){
        const left = 20
        const top = 0
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