window.onload = function(){
    navigation.setup()
    contentControl.setup()
}




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

    static async loadSelection(clickedItem){
        if(clickedItem.constructor.name === 'subMenuItem'){
            const targetItem = clickedItem.target
            switch(targetItem.constructor.name){
                case('plan'):
                    const htmlDoc = await plansDataHandling.getPlanHTML(targetItem.name)
                    contentControl.displayDoc(htmlDoc)
                    break;

                case('song'):
                    console.log('this a song')
            }
        }

    }
}

class contentControl {

    static docControl = {}
    
    static setup(){
        this.#loadControllers()
        this.#loadDocWindow()
    }

    static #loadControllers(){
        this.docControl = new docWindowControl
    }

    static #loadDocWindow(){
        this.docControl.createDocWindow()
    }

    static displayDoc(htmlDoc){
        this.docControl.loadDoc(htmlDoc)
    }

}












