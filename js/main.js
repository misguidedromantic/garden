window.onload = function(){navigation.setup()}


function menuItemClicked(){
    const data = d3.select(this).data()
    const clickedItem = data[0]
    navigation.updateNavigator(clickedItem)
    navigation.loadSelection(clickedItem)
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

    static loadSelection(clickedItem){
        if(clickedItem.constructor.name === 'subMenuItem'){
            switch(clickedItem.target.constructor.name){
                case('plan'):
                    console.log(clickedItem.target)
                    break;

                case('song'):
                    console.log('this a song')
            }
        }

    }
}












