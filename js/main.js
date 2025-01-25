
class events {

    static initaliseWindowResizeHandling(){
        const throttle = new throttler (navigation.moveOnWindowResize)
        //window.onresize = throttle.
        window.onresize = this.throttleWithFinalCall(navigation.moveOnWindowResize, 100)
    }

    static waitForWindowLoad(){
        return new Promise(resolve => {
            window.onload = resolve;
        })
    }

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

class throttler {

    constructor(func){
        this.func = func
        this.timeoutId = null
        this.lastExec = 0
        this.finalCall = false
        this.delay = 0
    }

    run(delay){

        const readyToExec = checkExecReadyState()

        return function(...args){
            const context = this;
            
        }
    }

    executeFunction(){

    }

    checkExecReadyState(){
        return Date.now() - state.lastExec >= state.delay;
    }

    


}

async function initalise(){
    await events.waitForWindowLoad()
    new setup
    events.initaliseWindowResizeHandling()
}

initalise()



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
        console.log(window.innerHeight)
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












