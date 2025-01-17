window.onload = function(){

    function loadExternalData (){
        songsDataHandling.load()
    }
    
    function createNavigator (){

        function createDiv(id, position){
            return d3.select('body')
                .append('div')
                .attr('id', id)
                .style('position', position)
        }
    
        function createSVGCanvas(id, div){
            return div.append('svg')
            .attr('id', id)
        }
    
        const nav = new navigatorWindow
        nav.div = createDiv('navigatorDiv', 'fixed')
        nav.svg = createSVGCanvas('navigatorSVG', nav.div)
        return nav
    
    }
    
    function createMenu (){
        
        function getMainMenuItems(){
            return [
                new mainMenuItem ('plans'),
                new mainMenuItem ('songs'),
                new mainMenuItem ('concepts')
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

}

function onMenuItemClick(){
    const clickedItem = d3.select(this).data()[0]
    navigation.menuSelectionChange(clickedItem)
}

class notification {
    constructor(data, recipients){
        this.data = data
        this.recipients = recipients
        this.send()
    }

    send(){
        const message = this.compileMessage()
        console.log(this.recipients)
        this.recipients.forEach(recipient => recipient.update(data))
    }
}


class navigation {

    static #navigatorControl  = {}
    static #menuSelections = {}
    static #menuListMgmt = {}
    static #menuConfigMgmt = {}

    static #menuRendering = {}

    static initalise (navigator, menu){
        this.#assignNavigationObjects(navigator, menu)
        this.#initialiseControllers()
        this.#setupSubscriptions()
    }

    static menuSelectionChange(clickedItem){
        this.#menuSelections.update(clickedItem, this.menu.configuration)
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
    }

    static #setupSubscriptions(){
        this.#menuSelections.subscribe(this.#menuListMgmt)
        this.#menuListMgmt.subscribe(this.#menuConfigMgmt)
        this.#menuConfigMgmt.subscribe(this.#menuRendering)
        this.#menuRendering.subscribe(this.#navigatorControl)
    }




   
   
   
   
   
   
   
   
   
   
   
   
   
   
    static updateNavigator(clickedItem){
        const clickedMenu =  this.menuControl.getMenuState()
        this.menuControl.update(clickedMenu, clickedItem)
        this.windowControl.update(clickedMenu, clickedItem)
    }

    static toggleSelection(clickedItem){
        if(clickedItem.constructor.name === 'subMenuItem'){
            this.#toggleSubMenuItemSelection(clickedItem)
        } else if (clickedItem.constructor.name === 'menuItem' && menu.state === 'subSelect'){
            this.#unloadSubSelectMenu()
        }
    }

    static #toggleSubMenuItemSelection(clickedItem){
        if(clickedItem.selected){
            this.#loadSubMenuSelection(clickedItem.target)
        } else {
            this.#hideSubMenuSelection(clickedItem.target)
        }
    }

    static async #loadSubMenuSelection(targetItem){
        contentControl.update(targetItem)
    }

    static #hideSubMenuSelection(targetItem){
        switch(targetItem.constructor.name){
            case('plan'):
                contentControl.hidePlan()
                break;

            case('song'):
                console.log(targetItem)
        }
    }

    static #unloadSubSelectMenu(){
        this.contentControl.unloadPlan()
    }

}

class contentControl {

    static docControl = {}
    static songBlockControl = {}
    
    static setup(){
        this.setupDocControl()
        this.setupSongBlockControl()
    }

    static setupSongBlockControl(){
        this.songBlockControl = new songBlockControl
        this.songBlockControl.createSongBlockCanvas()
    }

    static setupDocControl(){
        this.docControl = new docWindowControl
        this.docControl.createDocWindow()
    }
    
    static update(selectedItem){
        switch(selectedItem.constructor.name){
            case('plan'):
                this.loadPlan(selectedItem)
                break;

            case('song'):
                this.songBlockControl.loadSong(selectedItem)
        }
    }


    
    static async loadPlan(plan){

        if(this.docControl.checkIfLoaded(plan.fileName)){
            this.docControl.showWindow(plan.fileName)
        } else {
            plan.htmlDoc = await plansDataHandling.getPlanHTML(plan.title)
            this.docControl.loadDoc(plan)
        }
    }

    static hidePlan(){
        this.docControl.hideWindow()
    }

    static unloadPlan(){
        this.docControl.unloadDoc()
    }

}












