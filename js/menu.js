class menu {
    static items = []
    static level = 'main'
    static ySpacing = 20
    static padding = 20
}

class menuItem {
    constructor(name){
        this.name = name
        this.selected = false
    }
}

class subMenuItem extends menuItem {
    constructor(name, target){
        super(name)
        this.target = target
    }
}

class menuControl {
    constructor(){
        this.menuData = new menuDataHandling
        this.rendering = new menuRendering
    }

    update(clickedMenu, clickedItem){
        this.menuData.update(clickedMenu, clickedItem)
        this.rendering.renderItems(menu.items)
    }

    getMenuState(){
        return this.isMainMenuLoaded() ? 'main' : 'sub'
    }

    isMainMenuLoaded(){
        return this.#getSubMenuItemCount() > 0 ? false : true 
    }

    #getSubMenuItemCount(){
        const subMenuItems = menu.items.filter(item => item.constructor.name === 'subMenuItem')
        return subMenuItems.length
    }
}

class menuDataHandling {
    constructor(){
        this.mainMenuItems = []
        this.selections = new menuSelections
        this.#setMainMenuItems()
        this.#setSubMenuItems()
    }

    update(clickedMenu, clickedItem){
        switch(clickedMenu){
            case 'main':
                return this.#updateFromMain(clickedItem)

            case 'sub':
                return this.#updateFromSub(clickedItem)

            default:
                return this.#setToMainMenu()

        }
    }

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
        this.#setupSubMenuDataHandlers()
        this.mainMenuItems.forEach(item => { 
            item.subMenu = this.#getTargetItems(item.name)    
        })
    }

    #setupSubMenuDataHandlers(){
        plansDataHandling.load()
        songsDataHandling.load()
    }

    #getTargetItems(itemName){
        switch(itemName){
            case 'plans':
                return plansDataHandling.getPlans().map(plan => new subMenuItem(plan.name, plan))
            case 'songs':
                return songsDataHandling.getSongs().map(song => new subMenuItem(song.name, song))
            default:
                return []
        }
    }
}

class menuSelections {
    updateSubMenuSelection(clickedItem){
        clickedItem.selected ? this.deselect(clickedItem) : this.#selectExclusive(clickedItem)
    }

    select(item){
        item.selected = true
    }

    deselect(item){
        item.selected = false
    }

    #selectExclusive(itemToSelect){
        const itemsInClass = this.#getItemsInClass(itemToSelect)
        itemsInClass.forEach(item => {
            item === itemToSelect ? item.selected = true : item.selected = false
        });

    }

    #getItemsInClass(item){
        const itemClass = item.constructor.name
        return menu.items.filter(item => item.constructor.name === itemClass)
    }

    deslectAllItems(){
        menu.items.forEach(item => item.selected = false)
    }
}


class menuRendering {
    renderItems(data){
        const enterControl = new menuItemEnter
        const updateControl = new menuItemUpdate
        const exitControl = new menuItemExit
        
        navigatorWindow.svg.selectAll('g')
            .data(data, d => d.name)
            .join(
                enter => enterControl.enterItems(enter),
                update => updateControl.updateItems(update),
                exit => exitControl.exitItems(exit)
            )
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
            .attr('id', d => d.name)
            .attr('transform', (d, i) => menuItemPositioning.calculateTranslate(i))
            .on('click', menuItemClicked)
    }

    enterText(groups){
        return groups.append('text')
            .text(d => d.name)
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
                return d.name.slice(0, Math.round(t * d.name.length));
            };
        })
    }
}

class menuItemUpdate {

    updateItems(selection){
        const groups = this.updateGroups(selection)
        const text = this.updateText(groups)
    }

    updateGroups(selection){
        return selection.attr('transform', (d, i) => {return menuItemPositioning.calculateTranslate(i)})
    }

    updateText(groups){
        return groups.select('text')
            .attr('font-weight', d => d.selected ? 'bold' : 'normal')
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

    static calculateTranslate(i){
        const x = 20
        const y = i * 20 + 40
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

    static colourChange(selection, newColour, t){
        return selection.transition(t).attr('fill', newColour)
    }
}









