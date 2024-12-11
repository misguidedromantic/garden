class menu {
    static items = []
    static state = 'main'
    static ySpacing = 20
    static padding = 20
}

class menuItem {
    constructor(title){
        this.title = title
        this.selected = false
    }
}

class subMenuItem extends menuItem {
    constructor(title, target){
        super(title)
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
        this.setMenuState()
        this.rendering.renderItems(menu.items)
        this.rendering.setRenderedItemWidths()
    }

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
        this.mainMenuItems = []
        this.selections = new menuSelections
        this.#setMainMenuItems()
        this.#setSubMenuItems()
    }

    update(clickedMenu, clickedItem){
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
            item.subMenu = this.#getTargetItems(item.title)    
        })
    }

    #setupSubMenuDataHandlers(){
        plansDataHandling.load()
        songsDataHandling.load()
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
        
        const groups = navigatorWindow.svg.selectAll('g')
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
            .on('click', menuItemClicked)
    }

    enterText(groups){
        return groups.append('text')
            .text(d => d.title)
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

    updateItems(selection){
        const groups = this.updateGroups(selection)
        const text = this.updateText(groups)
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
            .attr('fill', d => d.selected && d.constructor.name === 'menuItem' && menu.state === 'subSelect' ? 'grey' : 'black')
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









