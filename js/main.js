window.onload = function(){navigation.setup()}


function menuItemClicked(){
    const data = d3.select(this).data()
    navigation.updateNavigator(data[0])
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
}












