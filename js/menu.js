class menu {
    constructor(expanded){
        this.expanded = expanded
        this.items = []
        this.observers = []
        this.ySpacing = 20
        this.padding = 20
    }
}

class mainMenu extends menu {
    constructor(expanded){
        super(expanded)
    }
}

class subMenu extends menu {
    constructor(expanded){
        super(expanded)
        
    }
}

class menuItem {
    constructor(id, title, parentMenuItem){
        this.id = id
        this.title = title
        this.parentMenuItem = parentMenuItem
        this.selected = false
        this.renderedWidth = 0
    }
}


class menuListManagement {

    constructor(mainMenu, subMenu){
        this.mainMenu = mainMenu
        this.subMenu = subMenu
        this.observers = []
    }

    subscribe(observer){
        this.observers.push(observer)
    }

    notify(updatedMenu){
        this.observers.forEach(observer => observer.update(updatedMenu))
    }

    update(updatedMenu){
        if(updatedMenu.constructor.name === 'mainMenu'){
            
            const selectedMainMenuItem = this.#getSelectedMainMenuItem(updatedMenu.items)
            this.mainMenu.items = [selectedMainMenuItem]
            this.subMenu.items = this.#getSubMenuSourceData(selectedMainMenuItem)
        }
        this.notify(this.mainMenu)
        this.notify(this.subMenu)
    }

    #getSelectedMainMenuItem(items){
        return items.find(item => item.selected)
    }

    #getMainMenuItems(){
        return [
            new menuItem ('plans', 'plans'),
            new menuItem ('songs', 'songs'),
            new menuItem ('concepts', 'concepts')
        ]
    }

    #getSubMenuSourceData(mainMenuItem){
        switch(mainMenuItem.title){
            case 'plans':
                return this.#getPlansSubMenu()
            case 'songs':
                return this.#getSongsSubMenu(mainMenuItem)
            default:
                return []
        }
    }

    #getPlansSubMenu(){
        //plansDataHandling.getPlans().map(plan => new subMenuItem(plan.title, plan))
        return [new menuItem('tp1','test plan one'), new menuItem('tp2', 'test plan two')]
    
    }

    #getSongsSubMenu(parentMenuItem){
        const menuExpander = [new menuItem('expander', '>', parentMenuItem)]
        const allSongsItems = [new menuItem('allItems', 'all songs', parentMenuItem)]
        const songs = songsDataHandling.getTitles()
        const mappedSongs = songs.map(song => new menuItem(song.short_title, song.title, parentMenuItem))
        return [...menuExpander, ...allSongsItems, ...mappedSongs]
    }

}


class menuSelections {

    constructor(){
        this.observers = []
    }

    subscribe(observer){
        this.observers.push(observer)
    }

    notify(updatedMenu){
        this.observers.forEach(observer => observer.update(updatedMenu))
    }

    update(clickedMenu, clickedItem){
        //const dispatch = d3.dispatch('stopTextTransitions')
        //dispatch.call('stopTextTransitions', this)
        
        let updatedItems = []
        switch(clickedMenu.constructor.name){
            case 'mainMenu':
                updatedItems = this.#updateFromMain(clickedItem, clickedMenu)
                break;
            case 'subMenu':
                updatedItems = this.#updateFromSub(clickedItem, clickedMenu)
                break;

        }
        this.notify(clickedMenu)
    }

    #updateFromMain(clickedItem, clickedMenu){
        return clickedItem.selected ? this.#deslectAllSelectedItems(clickedMenu) : this.#selectExclusive(clickedItem, clickedMenu)
    }

    #updateFromSub(clickedItem, clickedMenu){
        return clickedItem.selected ? clickedItem.selected = false : this.#selectExclusive(clickedItem, clickedMenu)
    }

    #deslectAllSelectedItems(clickedMenu){
        const selectedItems = clickedMenu.items.filter(item => item.selected)
        selectedItems.forEach(item => item.selected = false)
    }

    #selectExclusive(itemToSelect, clickedMenu){
        this.#deslectAllSelectedItems(clickedMenu)
        itemToSelect.selected = true
    }

}



/* class menuConfigurationManagement {

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

} */

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

    update(updatedMenu){
        this.interruptTransitions()
        this.renderItems(updatedMenu.items, updatedMenu.constructor.name)
        this.getRenderedItemWidths(updatedMenu.items, updatedMenu.constructor.name) 
        this.notify(updatedMenu)
    }

    interruptTransitions(){
        const text = this.svg.selectAll('text')
        text.interrupt('tColour')
        text.interrupt('tWeen')
    }

    renderItems(data, menuName){
        const selectedIndex = this.#getSelectedIndex(data)
        const enterControl = new menuItemEnter(menuName, selectedIndex)
        const updateControl = new menuItemUpdate(menuName, selectedIndex)
        const exitControl = new menuItemExit(menuName, selectedIndex)
        
        const groups = this.svg.selectAll('g.' + menuName + 'Item')
            .data(data, d => d.id)
            .join(
                enter => enterControl.enterItems(enter),
                update => updateControl.updateItems(update),
                exit => exitControl.exitItems(exit)
            )
    }

    getRenderedItemWidths(items, menuName){
        const groups = this.svg.selectAll('g.' + menuName + 'Item')
        groups.each(function(){
            const elem = d3.select(this)
            const item = items.find(item => item.id === elem.attr('id'))
            item.renderedWidth = elem.select('text').node().getBBox().width
        })
        //return items
    }


    #getSelectedIndex(data){
        return data.findIndex(item => item.selected)
    }


}

class menuItemEnter {

    constructor(menuName, selectedIndex){
        this.menuName = menuName
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
            .attr('class', this.menuName + 'Item')
            .attr('id', d => d.id)
            .attr('transform', (d, i) => 
                menuItemPositioning.calculateTranslate(d, i, this.menuName, this.selectedIndex))
            .on('click', events.onMenuItemClick)
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
            //.delay((d, i) => i * 50) 
            .duration(100)
            .attr('fill', (d, i) => menuItemStyling.calculateTextColour(d, i, this.menuName, this.selectedIndex))
    }

    enterTextTransitionTween(text){
        text.transition('tTween')
            //.delay((d, i) => i * 50)
            .duration(200)
            .textTween(d => {
            return function(t) {
                return d.title.slice(0, Math.round(t * d.title.length));
            }
        })

    }
}

class menuItemUpdate {

    constructor(menuName, selectedIndex){
        this.menuName = menuName
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
                menuItemPositioning.calculateTranslate(d, i, this.menuName, this.selectedIndex))
            
    }

    updateText(groups){
        return groups.select('text')
            .attr('font-weight', d => d.selected ? 'bold' : 'normal')
            .attr('fill', (d, i) => menuItemStyling.calculateTextColour(d, i, this.menuName, this.selectedIndex))
    }

}

class menuItemExit {

    constructor(menuName, selectedIndex){
        this.menuName = menuName
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

    static calculateTranslate(d, i, menuName, selectedIndex){
        const x = this.#calculateX(d, menuName)
        const y = this.#calculateY(d, i, menuName)
        return this.#getTranslateString(x, y)
    }


    static #calculateX(d, menuName){
        if(menuName === 'mainMenu'){
            return 20
        } else if (d.id === 'expander') {
            return d.parentMenuItem.renderedWidth + 30
        } else {
            return d.parentMenuItem.renderedWidth + 45
        }
    }

    static #calculateY(d, i, menuName){
        if(menuName === 'mainMenu'){
            return i * 20 + 40
        } else if (d.id === 'expander') {
            return 40
        } else {
            return (i - 1) * 20 + 40
        }
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
        switch(menuConfig){
            case 'main':
                return 'black'
            case 'sub':
                return this.#colourOnSub(d, i, selectedIndex)
            case 'subSelect':
                return this.#colourOnSubSelect(d, i, selectedIndex)
        }
    }

    static #colourOnSub(d, i, selectedIndex){
        if(d.id === 'allItems'){
            return 'grey'
        } else {
            const colour = this.#colourForDistance(i)
            return colour
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