window.onload = function(){

    function loadData(){
        songsDataHandling.load('csv')
    }
    function setupNavigation(){
        new navigationSetup
    }
    function initialiseEventHandlers(){
        events.initaliseWindowResizeHandling()
    }

    loadData()
    setupNavigation()
    initialiseEventHandlers() 
}

class events {

    static initaliseWindowResizeHandling(){
        window.onresize = throttles.throttleWithFinalCall(navigation.moveOnWindowResize, 100)
    }

    static waitForWindowLoad(){
        return new Promise(resolve => {window.onload = resolve})
    }

    static onMenuItemClick(){
        const elem = d3.select(this)
        const clickedItem = elem.data()[0]
        const clickedMenu = events.getMenuName(elem.attr('class'))
        navigation.menuSelectionChange(clickedMenu, clickedItem)
    }

    static getMenuName(menuItemClass){
        const itemIndex = menuItemClass.indexOf('Item')
        return menuItemClass.substring(0, itemIndex)
    }

    static onMenuMouseOver(){
        //navigation.menuExpand()
    }
    
    static onMenuMouseOut(){
        //navigation.menuContract()
    }
    
}

class throttles {
    static throttle(func, delay){
        let lastCall = 0;
        return function (...args) {
            const now = new Date().getTime();
            if (now - lastCall < delay) {
                return;
            }
            lastCall = now;
            return func(...args);
        }
    }

    static throttleWithFinalCall(func, delay) {
        let timeoutId;
        let lastExec = 0;
        let finalCall = false;
      
        return function(...args) {
          const context = this;
          const now = Date.now();
      
          if (now - lastExec >= delay) {
            func.apply(context, args);
            lastExec = now;
            finalCall = false;
          } else {
            clearTimeout(timeoutId);
            finalCall = true;
      
            timeoutId = setTimeout(() => {
              if (finalCall) {
                func.apply(context, args);
                lastExec = now;
                finalCall = false;
              }
            }, delay);
          }
        };
      }
}


class navigation {

    static #navigatorControl  = {}
    static #menuSelections = {}
    static #menuListMgmt = {}
    static #menuConfigMgmt = {}
    static #menuRendering = {}
    static #songsContent = {}

    static initalise (navigator, mainMenu, subMenu){
        this.#assignNavigationObjects(navigator, mainMenu, subMenu)
        this.#initialiseControllers()
        this.#setupSubscriptions()
    }

    static moveOnWindowResize(){
        navigation.#navigatorControl.adjustToWindowResize()
    }

    static menuSelectionChange(clickedMenuName, clickedItem){
        if(clickedMenuName === 'mainMenu'){
            this.#menuSelections.update(this.mainMenu, clickedItem)
        } else {
            this.#menuSelections.update(this.subMenu, clickedItem)
        }
    }

    static showMenu(){}
    static hideMenu(){}
    static expandMenu(){}
    static contractMenu(){}

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

    static #assignNavigationObjects(navigator, mainMenu, subMenu){
        this.navigator = navigator
        this.mainMenu = mainMenu
        this.subMenu = subMenu
    }

    static #initialiseControllers(){
        this.#navigatorControl = new navigatorWindowControl(this.navigator, this.mainMenu, this.subMenu)
        this.#menuSelections = new menuSelections
        this.#menuListMgmt = new menuListManagement(this.mainMenu, this.subMenu)
        //this.#menuConfigMgmt = new menuConfigurationManagement
        this.#menuRendering = new menuRendering (this.navigator.svg)
        this.#songsContent = new songsContentControl ()
    }

    static #setupSubscriptions(){
        this.#menuSelections.subscribe(this.#menuListMgmt)
        this.#menuListMgmt.subscribe(this.#menuRendering)
        this.#menuListMgmt.subscribe(this.#songsContent)
        //this.#menuConfigMgmt.subscribe(this.#menuRendering)
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












