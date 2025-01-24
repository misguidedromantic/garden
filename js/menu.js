class menu {
    constructor(configuration){
        this.configuration = configuration
        this.items = []
        this.observers = []
        this.ySpacing = 20
        this.padding = 20
    }
}

class menuItem {
    constructor(id, title){
        this.id = id
        this.title = title
        this.selected = false
    }
}

class mainMenuItem extends menuItem{
    constructor(id, title){
        super(id, title)
    }

}

class subMenuItem extends menuItem {
    constructor(id, title, target){
        super(id, title)
        this.target = target
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
        
        const dispatch = d3.dispatch('stopTextTransitions')
        dispatch.call('stopTextTransitions', this)
        
        
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

    update(data){

        if(data.updatedItems.length === 1){
            const item = data.updatedItems[0]
            if(item.constructor.name === 'mainMenuItem'){
                item.selected ? this.menu.items = this.#getSubMenuItems(item) : this.menu.items = this.#getMainMenuItems() 
            }
        }

        this.notify(data)
    }

    #getMainMenuItems(){
        return [
            new mainMenuItem ('plans', 'plans'),
            new mainMenuItem ('songs', 'songs'),
            new mainMenuItem ('concepts', 'concepts')
        ]
    }

    #getSubMenuItems(mainMenuItem){
        const subMenuItems = this.#getSubMenuSourceData(mainMenuItem.title)
        return [...[mainMenuItem], ...subMenuItems]
    }

    #getSubMenuSourceData(mainMenuItemName){
        switch(mainMenuItemName){
            case 'plans':
                return this.#getPlansSubMenu()
            case 'songs':
                return this.#getSongsSubMenu()
            default:
                return []
        }
    }

    #getPlansSubMenu(){
        //plansDataHandling.getPlans().map(plan => new subMenuItem(plan.title, plan))
        return [new subMenuItem('tp1','test plan one'), new subMenuItem('tp2', 'test plan two')]
    
    }

    #getSongsSubMenu(){
        const songs = songsDataHandling.getTitles()
        return songs.map(song => new subMenuItem(song.short_title, song.title))
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
        this.interruptTransitions()
        this.renderItems(data.updatedItems, data.newConfiguration)
        data.renderedWidth = this.getRenderedItemWidths(data.updatedItems) 
        this.notify(data)
    }

    interruptTransitions(){
        const text = this.svg.selectAll('text')
        text.interrupt('tColour')
        text.interrupt('tWeen')
    }

    renderItems(data, menuConfig){
        const selectedIndex = this.#getSelectedIndex(data, menuConfig)
        const enterControl = new menuItemEnter(menuConfig, selectedIndex)
        const updateControl = new menuItemUpdate(menuConfig, selectedIndex)
        const exitControl = new menuItemExit(menuConfig, selectedIndex)
        
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
            const item = items.find(item => item.id === elem.attr('id'))
            item.renderedWidth = elem.select('text').node().getBBox().width
        })
    }

    #getSelectedIndex(data, menuConfig){
        return menuConfig === 'subSelect' ?
            data.findIndex(item => 
                item.constructor.name === 'subMenuItem' && 
                item.selected) 
            :
            undefined
    }
}

class menuItemEnter {

    constructor(menuConfig, selectedIndex){
        this.menuConfig = menuConfig
        this.selectedIndex = selectedIndex
    }

    enterItems(selection){
        const groups = this.enterGroups(selection)
        const text = this.enterText(groups)
        this.enterTextTransitionColour(text)
        this.enterTextTransitionTween(text)
    }

    enterGroups(selection){
        return selection.append('g')
            .attr('id', d => d.id)
            .attr('transform', (d, i) => 
                menuItemPositioning.calculateTranslate(d, i, this.menuConfig, this.selectedIndex))
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
            .delay((d, i) => i * 50) 
            .duration(100)
            .attr('fill', (d, i) => menuItemStyling.calculateTextColour(d, i, this.menuConfig, this.selectedIndex))
    }

    enterTextTransitionTween(text){
        text.transition('tTween')
            .delay((d, i) => i * 50)
            .duration(200)
            .textTween(d => {
            return function(t) {
                return d.title.slice(0, Math.round(t * d.title.length));
            }
        })

    }
}

class menuItemUpdate {

    constructor(menuConfig, selectedIndex){
        this.menuConfig = menuConfig
        this.selectedIndex = selectedIndex
    }


    updateItems(selection){
        const groups = this.updateGroups(selection)
        const text = this.updateText(groups)
    }

    updateGroups(selection){
        return selection.transition()
            .duration(400)
            .attr('transform', (d, i) => 
                menuItemPositioning.calculateTranslate(d, i, this.menuConfig, this.selectedIndex))
            
    }

    updateText(groups){
        return groups.select('text')
            .attr('font-weight', d => d.selected ? 'bold' : 'normal')
            .attr('fill', (d, i) => menuItemStyling.calculateTextColour(d, i, this.menuConfig, this.selectedIndex))
    }

}

class menuItemExit {

    constructor(menuConfig, selectedIndex){
        this.menuConfig = menuConfig
        this.selectedIndex = selectedIndex
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

    static calculateTranslate(d, i, menuConfig, selectedIndex){
        return menuConfig === 'subSelect' ? this.#calculateSlimlineLayout(d, i, selectedIndex) : this.#calculateStandardLayout(i) 
    }

    static #calculateStandardLayout(i){
        const x = 20
        const y = i * 20 + 40
        return this.#getTranslateString(x, y)
    }

    static #calculateSlimlineLayout(d, i, selectedIndex){
        let x = 0
        let y = 0

        switch(d.constructor.name){
            case 'mainMenuItem':
                this.#parentItemWidth = d.renderedWidth
                return this.#getTranslateString(20, 40)

            case 'subMenuItem':
                const distanceFromSelected = i - selectedIndex + 1
                return this.#getTranslateString(this.#parentItemWidth + 30, distanceFromSelected * 20 + 20)
        }

        return this.#getTranslateString(x, y)
    }

    static #getTranslateString(x, y){
        return 'translate(' + x + ',' + y + ')'
    }
}

class menuItemStyling {
    static calculateTextColour(d, i, menuConfig, selectedIndex){
        if(menuConfig === 'subSelect'){
            return this.#colourOnSubSelect(d, i, selectedIndex)
        } else {
            return 'black'
        }
    }

    static #colourOnSubSelect(d, i, selectedIndex){
        if(d.constructor.name === 'mainMenuItem'){
            return 'grey'
        } else {
            const colour = this.#colourForDistance(i - selectedIndex)
            return colour
        }
    }

    static #colourForDistance(distanceFromSelected){
        switch(Math.abs(distanceFromSelected)){
            case 0:
                return 'black'
            case 1:
                return 'darkgrey'
            case 2:
                return 'lightgrey'
            default:
                return 'lightyellow'
        }
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