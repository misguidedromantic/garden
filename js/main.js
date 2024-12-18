window.onload = async function(){
    
    await loadData()
    navigation.setup()
    contentControl.setup()
}

function loadData(){
    plansDataHandling.load()
    return songsDataHandling.load()
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

    static async setup(){
        this.#loadControllers()
        this.#loadNavigator()
    }

    static async #loadControllers(){
        this.windowControl = new navigatorWindowControl
        this.menuControl = new menuControl
    }

    static #loadNavigator(){
        this.windowControl.createNavigator()
        this.menuControl.update()
        this.windowControl.update()
    }

    static updateNavigator(clickedItem){
        console.log(clickedItem)
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
        switch(targetItem.constructor.name){
            case('plan'):
                contentControl.loadPlan(targetItem)
                break;

            case('song'):
                console.log(targetItem)
        }
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
    
    static setup(){
        this.docControl = new docWindowControl
        this.docControl.createDocWindow()
    }
    
    static update(selectedItem){
        switch(selectedItem.constructor.name){
            case('plan'):
                this.loadPlan(selectedItem)
                break;

            case('song'):
                console.log(selectedItem)
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












