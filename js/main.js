window.onload = function(){navigation.setup()}


function selectDestination(){
    const data = d3.select(this).data()
    navigation.updateOnClick(data[0])
}

class navigation {

    static menuItems = []
    static movement = {}
    static menuManagement = {}
    static contentControl = {}

    static setup(){
        
        
        this.rendering = new navigatorRendering
        this.windowSettings = new navigatorWindowSettings
        
        this.movement = new navigatorMovement
        this.menuManagement = new navigatorMenuManagement
        this.contentControl = new navigatorContentControl

        this.rendering.createNavigator()
     
        
        
        this.loadMainMenu()
    }

    static loadMainMenu(){

        this.contentControl.loadMainMenuItems()
        this.windowSettings.setForMainMenu()




        //update window settings

        //this.menuManagement.loadMain()
        //this.contentControl.renderItems(this.menuItems)
        //this.movement.toMainMenuDisplay(this.contentControl.getWidestItemWidth(), this.menuItems.length)
    }

    
    static loadSubMenu(){

    }

    static loadSubMenuSelection(){

    }


    static updateOnClick(clickedItem){

        const itemType = clickedItem.constructor.name
        const subMenuLoaded = (navigatorWindow.div.style('left') === '20px')

        

        if(itemType === 'menuItem' && !subMenuLoaded){
            this.menuManagement.loadSub(clickedItem)
            this.contentControl.renderItems(this.menuItems)
            this.movement.toSubMenuDisplay(this.contentControl.getWidestItemWidth(), this.menuItems.length)

        }

        else if(itemType === 'menuItem' && subMenuLoaded){
            this.menuManagement.loadMain(clickedItem)
            this.contentControl.renderDestinations(this.menuItems)
            this.movement.toMainMenuDisplay(this.contentControl.getWidestItemWidth(), this.menuItems.length)

        }

        else if(itemType === 'subMenuItem'){
            clickedItem.toggleSelection()
            this.contentControl.renderDestinations(this.menuItems)
        }

    }



}

class navigatorRendering {

    createNavigator(){
        navigatorWindow.div = this.#createDiv()
        navigatorWindow.svg = this.#createSVGCanvas()
    }



    #createDiv(){
        return d3.select('body')
            .append('div')
            .attr('id', 'navigatorDiv')
            .style('position', 'fixed')
            .style('border-radius', '20px')
    }

    #createSVGCanvas(){
        return navigatorWindow.div.append('svg')
            .attr('id', 'navigatorSVG')
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

class navigatorContent {
    static menuItems = []
    static ySpacing = 20
    static padding = 20
}



class navigatorMovement {

    constructor(){
        this.positioning = new navigatorPositioning
        this.sizing = new navigatorSizing
        this.float = new navigatorFloat
    }

    toMainMenuDisplay(widestItemWidth, itemCount){
        this.sizing.fitToContents(widestItemWidth, itemCount)
        this.positioning.positionCentre(0, 0)
        this.float.floatOffBackground(0, 400) 

    }

    toSubMenuDisplay(widestItemWidth, itemCount){
        this.sizing.fitToContents(widestItemWidth, itemCount)
        this.positioning.positionLeft(0, 400)
        this.float.sinkIntoBackground(0, 400)


    }

    toSubMenuItemSelectedDisplay(){

    }


}

class navigatorMenuManagement {

    constructor(){
        this.#setMainMenuItems()
    }

    #setMainMenuItems(){
        this.mainItems = [
            new menuItem ('plans'),
            new menuItem ('songs'),
            new menuItem ('concepts')
        ]
    }


    getMainMenuItems(){
        return this.mainItems
    }

 



    updateMenuItems(menu){
        switch(menu){
            case 'subMenu':
                break;

            default:
                //get menu

        }
    }

    loadMain(clickedItem){

        navigation.menuItems = this.mainItems

        try{
            clickedItem.deselect()
        }

        catch{
            return
        }
        
    }

    loadSub(clickedItem){
        clickedItem.select()
        let subMenuItems = []

        switch(clickedItem.name){
            case 'plans':
                subMenuItems = this.#getPlansSubMenuItems()
                break;

            case 'songs':
                subMenuItems = this.#getSongsSubMenuItems()
                break;

        }

        const newArray = [...[clickedItem],...subMenuItems]
        console.log(newArray)

        navigation.menuItems = [...[clickedItem],...subMenuItems]
    }

    



    #getPlansSubMenuItems(){
        return [
            new subMenuItem ('statementofintent'),
            new subMenuItem ('woodenblocks')
        ]
    }

    #getSongsSubMenuItems(){
        return [
            new subMenuItem ('sliceofcedar'),
            new subMenuItem ('tonofnothing'),
            new subMenuItem ('intentionandtheact')
        ]
    }

    getMenuItems(){
        return navigation.menuItems.filter(item => item.constructor.name === 'menuItem')
    }
    
    getSubMenuItemCount(){
        const subMenuItems = navigation.menuItems.filter(item => item.constructor.name === 'subMenuItem')
        return subMenuItems.length
    }


}

class navigatorContentRendering {

    renderItems(data){

        console.log(data)

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
        return selection.attr('transform', (d, i) => {return this.calculateTranslate(i)})
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
                .textTween(exitTween(text, 100))
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

class navigatorContentControl {

    constructor(){
        this.menuManagement = new navigatorMenuManagement
        this.rendering = new navigatorContentRendering
    }

    loadMainMenuItems(){
        navigatorContent.items = this.menuManagement.getMainMenuItems()
        this.rendering.renderItems(navigatorContent.items)
    }

    
}

class menuItem {

    constructor(name){
        this.name = name
        this.selected = false
    }

    toggleSelection(){
        if(this.selected){
            this.deselect()
        } else {
            this.select()
        }
    }

    select(){
        this.selected = true
    }

    deselect(){
        this.selected = false
    }


}

class subMenuItem extends menuItem {

    constructor(name){
        super(name)
    }

}



class navigatorSizing{

    fitToContents(){
        navigatorWindow.width = this.#setWidthToContents()
        navigatorWindow.height = this.#setHeightToContents()
        this.resize(navigatorWindow.width, navigatorWindow.height)
    }

    #setWidthToContents(){
        const widestItemWidth = this.#getWidestItemWidth()
        return widestItemWidth + (navigatorContent.padding * 2)
    }

    #setHeightToContents(){
        const itemCount = navigatorContent.items.length
        return (itemCount) * navigatorContent.ySpacing + (navigatorContent.padding * 2)
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

    resize(width, height){
        navigatorWindow.div.transition('tSizing').duration(0).delay(0)
            .style('width', width + 'px')
            .style('height', height + 'px')

    }
}

class navigatorPositioning{

    positionCentre(delay = 0, duration = 0){
        const left = window.innerWidth / 2 - navigatorWindow.width / 2
        const top = window.innerHeight / 2 - navigatorWindow.height / 2
        this.set(left, top)
        this.move(delay, duration)
    }

    positionLeft(delay = 0, duration = 0){
        const left = 20
        const top = 20
        this.set(left, top)
        this.move(delay, duration)
    }

    set(left, top){
        navigatorWindow.left = left
        navigatorWindow.top = top
    }

    move(delay, duration){
        navigatorWindow.div.transition('tMove')
            .delay(delay)
            .duration(duration)
            .style('left', navigatorWindow.left + "px")
            .style('top', navigatorWindow.top + "px")
    }
}

class navigatorFloat {

    floatOffBackground(delay = 0, duration = 0){
        this.#setStyles('white', 20, '0 4px 8px rgba(0, 0, 0, 0.2)')
        this.#transition(delay, duration)
    }

    sinkIntoBackground(delay = 0, duration = 0){
        this.#setStyles('lightyellow', 0, '0 0 0 rgba(0, 0, 0, 0)')
        this.#transition(delay, duration)
    }

    #setStyles(backgroundColour, borderRadius, boxShadow){
        navigatorWindow.backgroundColour = backgroundColour
        navigatorWindow.borderRadius = borderRadius
        navigatorWindow.boxShadow = boxShadow

    }

    #transition(duration, delay){
        navigatorWindow.div.transition('tFloat')
            .delay(delay)
            .duration(duration)
                .style('background-color', navigatorWindow.backgroundColour)
                .style('border-radius', navigatorWindow.borderRadius + 'px')
                .style('box-shadow', navigatorWindow.boxShadow)

    }

}