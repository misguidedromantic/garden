function loadMenu(){
   //const navigator = createNavigator()
    //navigator.mainMenu = createMainMenu()
    //navigator.subMenu = createSubMenu()
    //renderMainMenu(navigator)
    //navigation.initalise(navigator) 
}



function createMainMenu(){

    function loadItems(){
        return [
            new menuItem ('plans', 'plans'),
            new menuItem ('songs', 'songs'),
            new menuItem ('concepts', 'concepts')
        ]
    }

    const menu = new mainMenu
    menu.items = loadItems()
    return menu
}

function createSubMenu(){
    return new subMenu
}

function renderMainMenu(navigator){

    function renderMainMenuItems(svg, mainMenu){

        const rendering = new menuRendering(svg)
        rendering.renderItems(mainMenu)
        rendering.getRenderedItemWidths(mainMenu.items, 'mainMenu')

    }

    function renderNavigator(navigator){
        const settings = new navigatorWindowSettings (navigator)
        const rendering = new navigatorRendering (navigator)

        settings.setToMainOnly()
        rendering.resize(0, 0)
        rendering.move(0, 0)
        rendering.float(100, 300)
    }

    renderMainMenuItems(navigator.svg, navigator.mainMenu)
    renderNavigator(navigator)
    

}



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
        rendering.renderItems(this.mainMenu)
        rendering.getRenderedItemWidths(this.mainMenu.items, 'mainMenu')
    }

    #getMainMenuItems(){
        return [
            new menuItem ('plans', 'plans'),
            new menuItem ('songs', 'songs'),
            new menuItem ('concepts', 'concepts')
        ]
    }
}

