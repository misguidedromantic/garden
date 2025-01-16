class menu {

    constructor(configuration){
        this.configuration = configuration
        this.items = []
        this.observers = []
        this.ySpacing = 20
        this.padding = 20

    }
    
    update(clickedItem){ 
        this.updateItemSelections(clickedItem)
        this.updateConfiguration()
    }

    subscribe(observer){
        this.observers.push(observer)
    }

    notify(notification){
        this.observers.forEach(observer => observer.update(notification))
    }

    checkItemTypeSelection(itemType){
        return this.items.some(item => item.constructor.name === itemType && item.selected)
    }

    updateItemSelections(clickedItem){
        const selections = new menuSelections (this.items)
        this.configuration === 'main' ? selections.updateFromMain(clickedItem) : selections.updateFromSub(clickedItem)
    }

    updateConfiguration(){
        const prevConfig = this.configuration
        const newConfig = this.#determineConfiguration()
        if(newConfig !== prevConfig){
            this.configuration = newConfig
            this.notify(new notification(this.constructor.name, prevConfig, newConfig))
        }
    }

    #determineConfiguration(){
        if(!this.checkItemTypeSelection('mainMenuItem')){
            return 'main'
        }

        if(!this.checkItemTypeSelection('subMenuItem')){
            return 'sub'
        }

        return 'subSelect'
    }

}

class menuControl {

    static #menu = {}
    static #dataHandling = {}
    static #rendering = {}
    static #selections = {}
    static #subscribers = []

    static initialise (menu){
        this.#menu = menu
        this.#dataHandling = new menuDataHandling
        this.#rendering = new menuRendering
        this.#selections = new menuSelections
    }

    static getMenu (){
        return this.#menu
    }

    static loadMain (){
        this.#dataHandling.setMenuItems('main')
        this.#rendering.renderItems(menu.items)
    }



    static update(clickedItem){

        this.#selections.update('main', clickedItem)


        //make selection changes
            //data
            //render


        //transition menu
            //load/unload submenu
            //
        //transition navigator
        //load target
    }

    static notify(){
        //menu
    }

    constructor(){
        this.menuData = new menuDataHandling
        this.rendering = new menuRendering
    }

/*     update(clickedMenu, clickedItem){
        this.menuData.update(clickedMenu, clickedItem)
        this.setMenuState()
        this.rendering.renderItems(menu.items)
        this.rendering.setRenderedItemWidths()
    } */

    getRenderedItemWidth(itemTitle){
       return menu.items.find(item => item.title === itemTitle).renderedWidth
    }

    setMenuState(){
        menu.state = this.getMenuState()
    }

    getMenuState(){
        if(this.#getSubMenuItemSelectedCount() > 0){
            return 'subSelect'
        }

        if(this.#getSubMenuItemCount() > 0){
            return 'sub'
        }

        return 'main'
    }

    #getSubMenuItemCount(){
        const subMenuItems = menu.items.filter(item => item.constructor.name === 'subMenuItem')
        return subMenuItems.length
    }

    #getSubMenuItemSelectedCount(){
        const subMenuItemsSelected = menu.items.filter(item => item.constructor.name === 'subMenuItem' && item.selected)
        return subMenuItemsSelected.length
    }
}

class menuDataHandling {

    constructor(){
        //this.mainMenuItems = []
         //this.selections = new menuSelections
         //this.#setMainMenuItems()
         //this.#setSubMenuItems()
     }

    setMenuItems(menuName){
        switch (menuName){
            case 'main':
                menu.items = this.#getMainMenuItems()
        }
    }

    updateMenu(clickedItem){
        
        switch(clickedItem.constructor.name){
            case 'mainMenuItem':

                break;
        }

    }

    #getMainMenuItems(){
        return [
            new mainMenuItem ('plans'),
            new mainMenuItem ('songs'),
            new mainMenuItem ('concepts')
        ]
    }



    getSubMenuItems(mainMenuItemName){
        switch(mainMenuItemName){
            case 'plans':
                return plansDataHandling.getPlans().map(plan => new subMenuItem(plan.title, plan))
            case 'songs':
                return songsDataHandling.getTitles()
            default:
                return []
        }
        
    }




    

    /* update(clickedMenu, clickedItem){
        switch(clickedMenu){
            case 'main':
                this.#updateFromMain(clickedItem)
                break;

            case 'sub':
            case 'subSelect':
                this.#updateFromSub(clickedItem)
                break;

            default:
                this.#setToMainMenu()

        }
    } */

    #updateFromMain(clickedItem){
        if(clickedItem.subMenu.length > 0){
            this.#setToSubMenu(clickedItem)
        }
    }

    #updateFromSub(clickedItem){
        switch(clickedItem.constructor.name){
            case 'menuItem':
                this.#setToMainMenu()
                break;
            case 'subMenuItem':
                this.selections.updateSubMenuSelection(clickedItem)
        }
    }

    #setToMainMenu(){
        this.selections.deslectAllItems()
        menu.items = this.mainMenuItems
    }

    #setToSubMenu(parentItem){
        this.selections.select(parentItem)
        menu.items = [...[parentItem], ...parentItem.subMenu]
    }

    #setMainMenuItems(){
        this.mainMenuItems = [
            new menuItem ('plans'),
            new menuItem ('songs'),
            new menuItem ('concepts')
        ]
    }

    #setSubMenuItems(){
        this.mainMenuItems.forEach(item => { 
            item.subMenu = this.#getTargetItems(item.title)    
        })
    }

    #getTargetItems(itemTitle){
        switch(itemTitle){
            case 'plans':
                return plansDataHandling.getPlans().map(plan => new subMenuItem(plan.title, plan))
            case 'songs':
                return songsDataHandling.getSongs().map(song => new subMenuItem(song.title, song))
            default:
                return []
        }
    }
}

class menuSelections {

    constructor(items){
        this.items = items
    }

    updateFromMain(clickedItem){
        clickedItem.selected = true
    }
    
    updateFromSub(clickedItem){
        clickedItem.constructor.name === 'mainMenuItem' ? this.#updateMainItemOnSub() : this.#updateSubItemOnSub(clickedItem) 
    }

    #updateMainItemOnSub(){
        this.#deslectAllItems()    
    }
    
    #updateSubItemOnSub(clickedItem){
        clickedItem.selected ? clickedItem.selected = false : this.#selectExclusive(clickedItem)
    }

    #selectExclusive(itemToSelect){
        const itemsInClass = this.#getItemsInClass(itemToSelect)
        itemsInClass.forEach(item => {
            item === itemToSelect ? item.selected = true : item.selected = false
        });

    }

    #getItemsInClass(item){
        const itemClass = item.constructor.name
        return this.items.filter(item => item.constructor.name === itemClass)
    }

    #deslectAllItems(){
        this.items.forEach(item => item.selected = false)
    }
}


class menuRendering {

    constructor(svg){
        this.svg = svg
    }

    update(menu){
        this.renderItems(menu.items, menu.configuration)
    }

    renderItems(data, menuConfig){
        const enterControl = new menuItemEnter
        const updateControl = new menuItemUpdate
        const exitControl = new menuItemExit
        
        const groups = this.svg.selectAll('g')
            .data(data, d => d.title)
            .join(
                enter => enterControl.enterItems(enter),
                update => updateControl.updateItems(update),
                exit => exitControl.exitItems(exit)
            )
    }

    setRenderedItemWidths(){
        const groups = navigatorWindow.svg.selectAll('g')
        groups.each(function(){
            const elem = d3.select(this)
            const item = menu.items.find(item => item.title === elem.attr('id'))
            item.renderedWidth = elem.select('text').node().getBBox().width
        })
    }
}

class menuItemEnter {

    enterItems(selection){
        const groups = this.enterGroups(selection)
        const text = this.enterText(groups)
        this.enterTextTransitionColour(text)
        this.enterTextTransitionTween(text)
    }

    enterGroups(selection){
        return selection.append('g')
            .attr('id', d => d.title)
            .attr('transform', (d, i) => menuItemPositioning.calculateTranslate(d, i))
            .on('click', onMenuItemClick)
    }

    enterText(groups){
        return groups.append('text')
            .text(d => d.title)
            .style('font-size','14px')
            .attr('dy', '-.4em')
            .attr('fill', 'transparent')
    }

    enterTextTransitionColour(text){
        text.transition('tColour')
            .delay((d, i) => i * 100) 
            .duration(100)
            .attr('fill', 'black')
    }

    enterTextTransitionTween(text){
        text.transition('tTween')
            .delay((d, i) => i * 100)
            .duration(200)
            .textTween(d => {
            return function(t) {
                return d.title.slice(0, Math.round(t * d.title.length));
            };
        })
    }
}

class menuItemUpdate {

    updateItems(selection, menuConfig){
        const groups = this.updateGroups(selection)
        const text = this.updateText(groups, menuConfig)
    }

    updateGroups(selection){
        return selection.transition()
            .duration(400)
            .attr('transform', (d, i) => {
                return menuItemPositioning.calculateTranslate(d, i)
            })
    }

    updateText(groups){
        return groups.select('text')
            .attr('font-weight', d => d.selected ? 'bold' : 'normal')
            .attr('fill', d => d.selected && d.constructor.name === 'menuItem' && menuConfig === 'subSelect' ? 'grey' : 'black')
    }
}

class menuItemExit {

    exitItems(selection){

        const exitTween = this.exitTextTransitionTween

        selection.each(function(){
            const text = d3.select(this).select('text')
            text.transition('tTweenOut')
                .duration(100)
                .textTween(menuTextTransitions.tweenOut(text, 100))
            })
                    
            selection.remove()

        return selection
    }
}

class menuItemPositioning {

    static #parentItemWidth = {}

    static calculateTranslate(d, i){
        return menu.state === 'subSelect' ? this.#calculateSlimlineLayout(d, i) : this.#calculateStandardLayout(i) 
    }

    static #calculateStandardLayout(i){
        const x = 20
        const y = i * 20 + 40
        return this.#getTranslateString(x, y)
    }

    static #calculateSlimlineLayout(d, i){
        let x = 0
        let y = 0

        switch(d.constructor.name){
            case 'menuItem':
                this.#parentItemWidth = d.renderedWidth
                return this.#getTranslateString(20, 40)

            case 'subMenuItem':
                return this.#getTranslateString(this.#parentItemWidth + 30, i * 20 + 20)
        }

        return this.#getTranslateString(x, y)
    }

    static #getTranslateString(x, y){
        return 'translate(' + x + ',' + y + ')'
    }
}

class menuTextTransitions {
    static tweenOut(selection, duration){
        const originalText = selection.text();
        const length = originalText.length;
        
            selection.transition()
              .duration(duration)
              .textTween(function() {
                return function(t) {
                  const i = Math.floor((1 - t) * length);
                  return originalText.slice(0, i);
                };
              })
              .on("end", function() {
                d3.select(this).text("");
              });
    }

    static calculateColour(selection){
        

        return selection.transition(t).attr('fill', newColour)
    }


}









