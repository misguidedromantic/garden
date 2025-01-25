
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
        this.#menuSetup.renderMenuItems(this.#navigatorSetup.nav)
        this.#navigatorSetup.renderNavigator(this.#menuSetup.navMenu)
    }

    handoverToNavigation(){
        navigation.initalise(this.#navigatorSetup.nav, this.#menuSetup.navMenu) 
    }
    
}

class navigatorSetup{

    constructor(){
        this.#createNavigatorObject()
        this.#createDiv('navigatorDiv', 'fixed')
        this.#createSVGCanvas('navigatorSVG')
    }

    renderNavigator(menu){
        const settings = new navigatorWindowSettings(this.nav, menu)
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
        this.navMenu = new menu ('main')
        this.navMenu.items = this.#getMainMenuItems()
    }

    renderMenuItems(nav){
        const navMenuRendering = new menuRendering(nav.svg)
        navMenuRendering.renderItems(this.navMenu.items, this.navMenu.configuration)
    }

    #getMainMenuItems(){
        return [
            new mainMenuItem ('plans', 'plans'),
            new mainMenuItem ('songs', 'songs'),
            new mainMenuItem ('concepts', 'concepts')
        ]
    }
}

