
class navigationSetup {

    #navigatorSetup = {}
    #menuSetup = {}

    constructor(){
        this.loadControllers()
        this.loadAndRenderMainMenu()
        this.handoverToNavigation()
    }

    loadControllers(){
        this.#navigatorSetup = new navigatorSetup
        this.#menuSetup = new menuSetup
    }

    loadAndRenderMainMenu(){
        this.#menuSetup.renderMainMenuItems(this.#navigatorSetup.nav)
        this.#navigatorSetup.renderNavigator(this.#menuSetup.mainMenu, this.#menuSetup.subMenu)
    }

    handoverToNavigation(){
        navigation.initalise(this.#navigatorSetup.nav, this.#menuSetup.mainMenu, this.#menuSetup.subMenu) 
    }
    
}

class navigatorSetup{

    constructor(){
        this.#createNavigatorObject()
        this.#createDiv('navigatorDiv', 'fixed')
        this.#createSVGCanvas('navigatorSVG')
    }

    renderNavigator(mainMenu, subMenu){
        const settings = new navigatorWindowSettings(this.nav, mainMenu, subMenu)
        const rendering = new navigatorRendering(this.nav)

        settings.setForMainMenu()
        rendering.resize(0, 0)
        rendering.move(0, 0)
        rendering.float(100, 300)

    }

    #createNavigatorObject(){
        this.nav = new navigatorWindow
    }

    #createDiv(id, position){
        this.nav.div = d3.select('body')
            .append('div')
            .attr('id', id)
            .style('position', position)
            .style('z-index', displays.getZIndex('navigator'))
    }

    #createSVGCanvas(id){
        this.nav.svg = this.nav.div.append('svg')
            .attr('id', id)
            .on('mouseover', events.onMenuMouseOver)
            .on('mouseout', events.onMenuMouseOut)
    }

}


class menuSetup{
    constructor(){
        this.#setupMainMenu()
        this.#setupSubMenu()
    }

    #setupMainMenu(){
        this.mainMenu = new mainMenu (true)
        this.mainMenu.items = this.#getMainMenuItems()
    }

    #setupSubMenu(){
        this.subMenu = new subMenu (false)
    }

    renderMainMenuItems(nav){
        const rendering = new menuRendering(nav.svg)
        rendering.renderItems(this.mainMenu.items, this.mainMenu.constructor.name)
    }

    #getMainMenuItems(){
        return [
            new menuItem ('plans', 'plans'),
            new menuItem ('songs', 'songs'),
            new menuItem ('concepts', 'concepts')
        ]
    }
}

