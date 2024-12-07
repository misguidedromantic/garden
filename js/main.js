window.onload = function(){
    navigation.setup()
    contentControl.setup()
}

function menuItemClicked(){
    const data = d3.select(this).data()
    const clickedItem = data[0]
    navigation.updateNavigator(clickedItem)
    navigation.toggleSelection(clickedItem)
}

class navigation {

    static windowControl = {}
    static menuControl = {}

    static setup(){
        this.#loadControllers()
        this.#loadNavigator()
    }

    static #loadControllers(){
        this.windowControl = new navigatorWindowControl
        this.menuControl = new menuControl
    }

    static #loadNavigator(){
        this.windowControl.createNavigator()
        this.menuControl.update()
        this.windowControl.update()
    }

    static updateNavigator(clickedItem){
        const clickedMenu =  this.menuControl.getMenuState()
        this.menuControl.update(clickedMenu, clickedItem)
        this.windowControl.update(clickedMenu, clickedItem)
    }

    static toggleSelection(clickedItem){
        if(clickedItem.constructor.name === 'subMenuItem'){
            this.#toggleSubMenuItemSelection(clickedItem)
        }
    }

    static #toggleSubMenuItemSelection(clickedItem){
        if(clickedItem.selected){
            this.#loadSubMenuSelection(clickedItem.target)
        } else {
            this.#unloadSubMenuSelection(clickedItem.target)
        }
    }

    static async #loadSubMenuSelection(targetItem){
        switch(targetItem.constructor.name){
            case('plan'):
                contentControl.loadPlan(targetItem)
                break;

            case('song'):
                console.log('this a song')
        }
    }

    static #unloadSubMenuSelection(targetItem){
        switch(targetItem.constructor.name){
            case('plan'):
                contentControl.hideDoc()
                break;

            case('song'):
                console.log('this a song')
        }
    }

}

class contentControl {

    static docControl = {}
    
    static setup(){
        this.docControl = new docWindowControl
        this.docControl.createDocWindow()
    }

    static async loadPlan(plan){

        if(this.docControl.checkIfLoaded(plan.fileName)){
            this.docControl.showWindow(plan.fileName)
        } else {
            plan.htmlDoc = await plansDataHandling.getPlanHTML(plan.name)
            this.docControl.loadDoc(plan)
        }
    }

    static hideDoc(){
        this.docControl.hideWindow()
    }

}












