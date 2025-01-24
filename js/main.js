window.onload = function(){

    function loadExternalData (){
        songsDataHandling.load('csv')
    }
    
    function createNavigator (){

        function createDiv(id, position){
            return d3.select('body')
                .append('div')
                .attr('id', id)
                .style('position', position)
                .style('z-index', displays.getZIndex('navigator'))
        }
    
        function createSVGCanvas(id, div){
            return div.append('svg')
                .attr('id', id)
                .on('mouseover', onMenuMouseOver)
                .on('mouseout', onMenuMouseOut)
        }
    
        const nav = new navigatorWindow
        nav.div = createDiv('navigatorDiv', 'fixed')
        nav.svg = createSVGCanvas('navigatorSVG', nav.div)
        return nav
    
    }
    
    function createMenu (){
        
        function getMainMenuItems(){
            return [
                new mainMenuItem ('plans', 'plans'),
                new mainMenuItem ('songs', 'songs'),
                new mainMenuItem ('concepts', 'concepts')
            ]
        }
       
        const navMenu = new menu ('main')
        navMenu.items = getMainMenuItems()
        return navMenu
    }
    
    function loadMenuInNavigator (navigator, navigatorMenu){
        
        function renderMenuItems(){
            const navMenuRendering = new menuRendering(navigator.svg)
            navMenuRendering.renderItems(navigatorMenu.items, navigatorMenu.configuration)
        }
    
        function renderNavigator(){
            const settings = new navigatorWindowSettings(navigator, navigatorMenu)
            const rendering = new navigatorRendering(navigator)
    
            settings.setForMainMenu()
            rendering.resize(0, 0)
            rendering.move(0, 0)
            rendering.float(100, 300)
    
        }
    
        renderMenuItems()
        renderNavigator()
    
    }

    function handoverControl(navigator, menu){
        navigation.initalise(navigator, menu)
        
    }

    loadExternalData()
    const navigator = createNavigator()
    const navigatorMenu = createMenu()
    loadMenuInNavigator(navigator, navigatorMenu)
    handoverControl(navigator, navigatorMenu)
    const throttledResize = throttle(navigation.moveOnWindowResize, 50)
    window.onresize = throttledResize


}

function throttle(func, delay){
    let lastCall = 0;
    return function (...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return func(...args);
    };
}


function onMenuItemClick(){
    const clickedItem = d3.select(this).data()[0]
    navigation.menuSelectionChange(clickedItem)
}

function onMenuMouseOver(){
    navigation.menuExpand()
}

function onMenuMouseOut(){
    navigation.menuContract()
}



class navigation {

    static #navigatorControl  = {}
    static #menuSelections = {}
    static #menuListMgmt = {}
    static #menuConfigMgmt = {}
    static #menuRendering = {}
    static #songsContent = {}

    static initalise (navigator, menu){
        this.#assignNavigationObjects(navigator, menu)
        this.#initialiseControllers()
        this.#setupSubscriptions()
    }

    static moveOnWindowResize(){
        navigation.#navigatorControl.adjustToWindowResize()
    }

    static menuSelectionChange(clickedItem){
        this.#menuSelections.update(clickedItem, this.menu.configuration)
    }

    static menuExpand(){
        if(this.menu.configuration === 'sub'){
            this.#navigatorControl.transitionSubToSubExpanded()
        }
    }

    static menuContract(){
        if(this.menu.configuration === 'sub'){
            this.#navigatorControl.transitionSubExpandedToSub()
        }
    }

    static #assignNavigationObjects(navigator, menu){
        this.navigator = navigator
        this.menu = menu
    }

    static #initialiseControllers(){
        this.#navigatorControl = new navigatorWindowControl(this.navigator, this.menu)
        this.#menuSelections = new menuSelections(this.menu)
        this.#menuListMgmt = new menuListManagement (this.menu)
        this.#menuConfigMgmt = new menuConfigurationManagement(this.menu)
        this.#menuRendering = new menuRendering (this.navigator.svg)
        this.#songsContent = new songsContentControl ()
    }

    static #setupSubscriptions(){
        this.#menuSelections.subscribe(this.#menuListMgmt)
        this.#menuListMgmt.subscribe(this.#menuConfigMgmt)
        this.#menuListMgmt.subscribe(this.#songsContent)
        this.#menuConfigMgmt.subscribe(this.#menuRendering)
        this.#menuRendering.subscribe(this.#navigatorControl)
    }
}



class displays {
    static getZIndex(divID){
        switch(divID){
            case 'songBlockCanvasDiv':
                return 1
            case 'navigatorDiv':
                return 2
            default:
                return 99
        }
    }
}












