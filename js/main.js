window.onload = function(){
    songsDataHandling.load('csv')
    navigation.initialise()
    //loadMenu()
    //events.initaliseWindowResizeHandling()
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
        navigation.menuSelectionChange(clickedItem)
    }

    static getMenuName(menuItemClass){
        const itemIndex = menuItemClass.indexOf('Item')
        return menuItemClass.substring(0, itemIndex)
    }

    static onMenuMouseOver(){
        navigation.menuExpansionChange('on')
    }
    
    static onMenuMouseOut(){
        navigation.menuExpansionChange('off')
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


class navigationOLD {

    static #navigatorControl  = {}
    static #menuSelections = {}
    static #menuListMgmt = {}
    static #menuConfigMgmt = {}
    static #menuRendering = {}
    static #songsContent = {}

    static initalise (navigator){
        this.navigator = navigator
        this.#initialiseControllers()
        this.#setupSubscriptions()
    }
/*     }

    static moveOnWindowResize(){
        navigation.#navigatorControl.adjustToWindowResize()
    }

    static menuSelectionChange(clickedItem){
        if(this.navigator.configuration === 'main'){
            this.#menuSelections.updateFromMain(clickedItem, this.navigator.mainMenu.items)
        }
    }

    static menuExpansionChange(event){
        if(this.navigator.configuration === 'sub'){
            event === 'on' ? navigation.#navigatorControl.expandMenu() : navigation.#navigatorControl.contractMenu() 
        }
    } */

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

    static #initialiseControllers(){
        this.#navigatorControl = new navigatorWindowControl(this.navigator)
        this.#menuSelections = new menuSelections
        this.#menuListMgmt = new menuListManagement(this.mainMenu, this.subMenu)
        this.#menuRendering = new menuRendering (this.navigator.svg)
        this.#songsContent = new songsContentControl ()
    }

    static #setupSubscriptions(){
        this.#menuSelections.subscribe(this.#menuListMgmt)
        this.#menuListMgmt.subscribe(this.#menuRendering)
        this.#menuListMgmt.subscribe(this.#songsContent)
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












