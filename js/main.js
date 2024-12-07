window.onload = function(){navigation.setup()}


function selectDestination(){
    const data = d3.select(this).data()
    navigation.updateNavigator(data[0])
}


class navigation {

    static windowControl = {}
    static contentControl = {}

    static setup(){
        this.#loadControllers()
        this.#loadNavigator()
    }

    static #loadControllers(){
        this.windowControl = new navigatorWindowControl
        this.contentControl = new navigatorContentControl
    }

    static #loadNavigator(){
        this.windowControl.createNavigator()
        this.contentControl.update()
        this.windowControl.update()
    }

    static updateNavigator(clickedItem){
        const clickedMenu =  this.contentControl.getMenuState()
        this.contentControl.update(clickedMenu, clickedItem)
        this.windowControl.update(clickedMenu, clickedItem)
    }
}

class navigatorRendering {

    createDiv(){
        return d3.select('body')
            .append('div')
            .attr('id', 'navigatorDiv')
            .style('position', 'fixed')
            .style('border-radius', '20px')
    }

    createSVGCanvas(){
        return navigatorWindow.div.append('svg')
            .attr('id', 'navigatorSVG')
    }

    resize(delay, duration){
        navigatorWindow.div.transition('tSizing').delay(delay).duration(duration)
            .style('width', navigatorWindow.width + 'px')
            .style('height', navigatorWindow.height + 'px')

    }

    float(delay, duration){
        navigatorWindow.div.transition('tFloat')
            .delay(delay)
            .duration(duration)
                .style('background-color', navigatorWindow.backgroundColour)
                .style('border-radius', navigatorWindow.borderRadius + 'px')
                .style('box-shadow', navigatorWindow.boxShadow)

    }

    move(delay, duration){
        navigatorWindow.div.transition('tMove')
            .delay(delay)
            .duration(duration)
            .style('left', navigatorWindow.left + "px")
            .style('top', navigatorWindow.top + "px")
    }



}

class navigatorContentControl {

    constructor(){
        this.menuData = new menuDataHandling
        this.rendering = new navigatorMenuRendering
    }

    update(clickedMenu, clickedItem){
        this.menuData.update(clickedMenu, clickedItem)
        this.rendering.renderItems(navigatorMenu.items)
    }

    getMenuState(){
        return this.isMainMenuLoaded() ? 'main' : 'sub'
    }

    isMainMenuLoaded(){
        return this.#getSubMenuItemCount() > 0 ? false : true 
    }

    #getSubMenuItemCount(){
        const subMenuItems = navigatorMenu.items.filter(item => item.constructor.name === 'subMenuItem')
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
        navigatorMenu.items = this.mainMenuItems
    }

    #setToSubMenu(parentItem){
        this.selections.select(parentItem)
        navigatorMenu.items = [...[parentItem], ...parentItem.subMenu]
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
            let targetItems = []
            const functionName = 'get' + item.name.charAt(0).toUpperCase() + item.name.slice(1)
            try{
                targetItems = window[functionName]()
                targetItems = targetItems.map(item => new subMenuItem(item.name, item))   
            }
            catch{
                targetItems = []
            }
            finally{
                item.subMenu = targetItems
            }
        })

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
        return navigatorMenu.items.filter(item => item.constructor.name === itemClass)
    }

    deslectAllItems(){
        navigatorMenu.items.forEach(item => item.selected = false)
    }

}



class navigatorWindowControl {

    constructor(){
        this.settings = new navigatorWindowSettings
        this.rendering = new navigatorRendering
    }

    createNavigator(){
        navigatorWindow.div = this.rendering.createDiv()
        navigatorWindow.svg = this.rendering.createSVGCanvas()
    }

    update(clickedMenu, clickedItem){
        switch(clickedMenu){
            case 'main':
                this.updateFromMain(clickedItem)
                break;

            case 'sub':
                this.updateFromSub(clickedItem)
                break;

            default:
                this.revealAsMainMenu()
        }
    }

    updateFromMain(clickedItem){
        if (clickedItem.subMenu.length > 0){
            this.transitionMainToSub()
        }
    }

    updateFromSub(clickedItem){
        if(clickedItem.constructor.name === 'menuItem'){
            this.transitionSubToMain()
        }
    }

    revealAsMainMenu(){
        this.settings.setForMainMenu()
        this.rendering.resize(0, 0)
        this.rendering.move(0, 0)
        this.rendering.float(100, 300)
    }

    transitionSubToMain(){
        this.settings.setForMainMenu()
        this.rendering.resize(0, 400)
        this.rendering.move(0, 400)
        this.rendering.float(100, 300)

    }

    transitionMainToSub(){
        this.settings.setForSubMenu()
        this.rendering.resize(0, 400)
        this.rendering.move(0, 400)
        this.rendering.float(100, 300)
    }


}

class navigatorWindowSettings{

    constructor(){
        this.sizing = new navigatorSizing
        this.positioning = new navigatorPositioning
        this.float = new navigatorFloat
    }

    setForMainMenu(){
        this.sizing.fitToContents()
        this.positioning.positionCentre()
        this.float.floatOffBackground()
    }

    setForSubMenu(){
        this.sizing.fitToContents()
        this.positioning.positionLeft()
        this.float.sinkIntoBackground()
    }
}

class navigatorWindow {
    static div = {}
    static svg = {}
    static items = []
    static width = 0
    static height = 0
    static left = 0
    static top = 0
    static position = 'fixed'
    static borderRadius = 20
}

class navigatorMenu {
    static items = []
    static level = 'main'
    static ySpacing = 20
    static padding = 20
}


class navigatorMenuRendering {

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
            .on('click', selectDestination)
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
                .textTween(textTransitions.tweenOut(text, 100))
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

class textTransitions {

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



class navigatorSizing{

    fitToContents(){
        navigatorWindow.width = this.#setWidthToContents()
        navigatorWindow.height = this.#setHeightToContents()
    }

    #setWidthToContents(){
        const widestItemWidth = this.#getWidestItemWidth()
        return widestItemWidth + (navigatorMenu.padding * 2)
    }

    #setHeightToContents(){
        const itemCount = navigatorMenu.items.length
        return (itemCount) * navigatorMenu.ySpacing + (navigatorMenu.padding * 2)
    }

    #getWidestItemWidth(){
        const groups = navigatorWindow.svg.selectAll('g')
        let widestWidth = 0
        
        groups.each(function(){
            const textElem = d3.select(this).select('text')
            const width = textElem.node().getBBox().width
            
            if(width > widestWidth){
                widestWidth = width
            }  
        })

        return widestWidth
    }

    
}

class navigatorPositioning{

    positionCentre(){
        const left = window.innerWidth / 2 - navigatorWindow.width / 2
        const top = window.innerHeight / 2 - navigatorWindow.height / 2
        this.set(left, top)
    }

    positionLeft(){
        const left = 20
        const top = 20
        this.set(left, top)
    }

    set(left, top){
        navigatorWindow.left = left
        navigatorWindow.top = top
    }
}

class navigatorFloat {

    floatOffBackground(){
        this.#setStyles('white', 20, '0 4px 8px rgba(0, 0, 0, 0.2)')
    }

    sinkIntoBackground(){
        this.#setStyles('lightyellow', 0, '0 0 0 rgba(0, 0, 0, 0)')
    }

    #setStyles(backgroundColour, borderRadius, boxShadow){
        navigatorWindow.backgroundColour = backgroundColour
        navigatorWindow.borderRadius = borderRadius
        navigatorWindow.boxShadow = boxShadow
    }

}