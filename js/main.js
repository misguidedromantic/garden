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
        } else if (clickedItem.constructor.name === 'menuItem' && menu.state === 'subSelect'){
            console.log('check')
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
        switch(targetItem.constructor.name){
            case('plan'):
                contentControl.loadPlan(targetItem)
                break;

            case('song'):
                console.log('this a song')
        }
    }

    static #hideSubMenuSelection(targetItem){
        switch(targetItem.constructor.name){
            case('plan'):
                contentControl.hidePlan()
                break;

            case('song'):
                console.log('this a song')
        }
    }

    static #unloadSubSelectMenu(){
        this.contentControl.unloadPlan()
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

    static hidePlan(){
        this.docControl.hideWindow()
    }

    static unloadPlan(){
        this.docControl.unloadDoc()
    }

}












