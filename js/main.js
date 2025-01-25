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
        const clickedItem = d3.select(this).data()[0]
        navigation.menuSelectionChange(clickedItem)
    }

    static onMenuMouseOver(){
        navigation.menuExpand()
    }
    
    static onMenuMouseOut(){
        navigation.menuContract()
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












