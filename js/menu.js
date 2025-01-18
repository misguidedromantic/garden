class menu {
    constructor(configuration){
        this.configuration = configuration
        this.items = []
        this.observers = []
        this.ySpacing = 20
        this.padding = 20
    }
}


class menuSelections {

    constructor(menu){
        this.menu = menu
        this.observers = []
    }

    subscribe(observer){
        this.observers.push(observer)
    }

    notify(updatedItems){
        this.observers.forEach(observer => observer.update({updatedItems: updatedItems}))
    }

    update(clickedItem, clickedMenuConfig){
        let updatedItems = []
        switch(clickedMenuConfig){
            case 'main':
                updatedItems = this.#updateFromMain(clickedItem)
                break;
            case 'sub':
                updatedItems = this.#updateFromSub(clickedItem)
                break;
            case 'subSelect':
                updatedItems = this.#updateFromSubSelect(clickedItem)
        }
        this.notify(updatedItems)
    }

    #updateFromMain(clickedItem){
        clickedItem.selected = true
        return [clickedItem]
    }

    #updateFromSub(clickedItem){
        if(clickedItem.constructor.name === 'mainMenuItem'){
            return this.#deslectAllItems() 
        } else {
            return this.#selectExclusive(clickedItem)
        }
    }

    #updateFromSubSelect(clickedItem){
        if(clickedItem.selected){
            clickedItem.selected = false
            return [clickedItem]
        } else {
            return this.#selectExclusive(clickedItem)
        }
    }

    #deslectAllItems(){
        const items = this.#getSelectedItems(this.menu.items)
        this.#deslectItems(items)
        return items
    }

    #selectExclusive(itemToSelect){
        const itemsInClass = this.#getItemsInClass(itemToSelect)
        const itemsToDeselect = this.#getSelectedItems(itemsInClass)
        this.#deslectItems(itemsToDeselect)
        itemToSelect.selected = true
        return [...[itemToSelect],...itemsToDeselect]
    }

    #deslectItems(items){
        items.forEach(item => item.selected = false)
    }

    #getItemsInClass(item){
        const itemClass = item.constructor.name
        return this.menu.items.filter(item => item.constructor.name === itemClass)
    }

    #getSelectedItems(items){
        return items.filter(item => item.selected)
    }
}

class menuListManagement {

    constructor(menu){
        this.menu = menu
        this.observers = []
    }

    subscribe(observer){
        this.observers.push(observer)
    }

    notify(data){
        data.updatedItems = this.menu.items
        this.observers.forEach(observer => observer.update(data))
    }

    async update(data){

        if(data.updatedItems.length === 1){
            const item = data.updatedItems[0]
            if(item.constructor.name === 'mainMenuItem'){
                item.selected ? this.menu.items = await this.loadSubMenu(item) : this.menu.items = this.loadMainMenu() 
            }
        }

        this.notify(data)
    }

    loadMainMenu(){
        return [
            new mainMenuItem ('plans'),
            new mainMenuItem ('songs'),
            new mainMenuItem ('concepts')
        ]
    }

    async loadSubMenu(mainMenuItem){
        const subMenuItems = await this.getSubMenuItems(mainMenuItem.title)
        return [...[mainMenuItem], ...subMenuItems]
    }

    async getSubMenuItems(mainMenuItemName){
        switch(mainMenuItemName){
            case 'plans':
                return plansDataHandling.getPlans().map(plan => new subMenuItem(plan.title, plan))
            case 'songs':
                const songTitles = await songsDataHandling.getTitles()
                return songTitles.map(songTitle => new subMenuItem(songTitle))
            default:
                return []
        }
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

class menuConfigurationManagement {

    constructor(menu){
        this.menu = menu
        this.observers = []
    }

    subscribe(observer){
        this.observers.push(observer)
    }

    notify(data, newConfig){
        data.newConfiguration = newConfig
        this.observers.forEach(observer => observer.update(data))
    }

    update(data){
        this.menu.configuration = this.#determineConfiguration()
        this.notify(data, this.menu.configuration)
    }

    #determineConfiguration(){
        const mainSelected = this.checkItemTypeSelection('mainMenuItem')
        const subSelected = this.checkItemTypeSelection('subMenuItem')

        if(subSelected && mainSelected){
            return 'subSelect'
        } else if (!mainSelected && !subSelected) {
            return 'main'
        } else if (mainSelected){
            return 'sub'
        }

    }

    checkItemTypeSelection(itemType){
        return this.menu.items.some(item => item.constructor.name === itemType && item.selected)
    }

}








class menuItem {
    constructor(title){
        this.title = title
        this.selected = false
    }
}

class mainMenuItem extends menuItem{
    constructor(title){
        super(title)
    }

}

class subMenuItem extends menuItem {
    constructor(title, target){
        super(title)
        this.target = target
    }
}

class menuRendering {

    constructor(svg){
        this.svg = svg
        this.observers = []
    }

    subscribe(observer){
        this.observers.push(observer)
    }

    notify(data){
        this.observers.forEach(observer => observer.update(data))
    }

    update(data){
        this.renderItems(data.updatedItems, data.newConfiguration)
        data.renderedWidth = this.getRenderedItemWidths(data.updatedItems) 
        this.notify(data)
    }

    renderItems(data, menuConfig){
        const enterControl = new menuItemEnter(menuConfig)
        const updateControl = new menuItemUpdate(menuConfig)
        const exitControl = new menuItemExit(menuConfig)
        
        const groups = this.svg.selectAll('g')
            .data(data, d => d.title)
            .join(
                enter => enterControl.enterItems(enter),
                update => updateControl.updateItems(update),
                exit => exitControl.exitItems(exit)
            )
    }

    getRenderedItemWidths(items){
        const groups = this.svg.selectAll('g')
        groups.each(function(){
            const elem = d3.select(this)
            const item = items.find(item => item.title === elem.attr('id'))
            item.renderedWidth = elem.select('text').node().getBBox().width
        })
    }
}

class menuItemEnter {

    constructor(menuConfig){
        this.menuConfig = menuConfig
    }

    enterItems(selection){
        const groups = this.enterGroups(selection)
        const text = this.enterText(groups)
        this.enterTextTransitionColour(text)
        this.enterTextTransitionTween(text)
    }

    enterGroups(selection){
        return selection.append('g')
            .attr('id', d => d.title)
            .attr('transform', (d, i) => menuItemPositioning.calculateTranslate(d, i, this.menuConfig))
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

    constructor(menuConfig){
        this.menuConfig = menuConfig
    }

    updateItems(selection){
        const groups = this.updateGroups(selection)
        const text = this.updateText(groups)
    }

    updateGroups(selection){
        return selection.transition()
            .duration(400)
            .attr('transform', (d, i) => {
                return menuItemPositioning.calculateTranslate(d, i, this.menuConfig)
            })
    }

    updateText(groups){
        return groups.select('text')
            .attr('font-weight', d => d.selected ? 'bold' : 'normal')
            .attr('fill', d => d.selected && d.constructor.name === 'mainMenuItem' && this.menuConfig === 'subSelect' ? 'grey' : 'black')
    }
}

class menuItemExit {

    constructor(menuConfig){
        this.menuConfig = menuConfig
    }

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

    static calculateTranslate(d, i, menuConfig){
        return menuConfig === 'subSelect' ? this.#calculateSlimlineLayout(d, i) : this.#calculateStandardLayout(i) 
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
            case 'mainMenuItem':
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









