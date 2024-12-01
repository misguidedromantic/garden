window.onload = function(){

    function setupNavigator(){

        navigation.movement = new navigatorMovement
        navigation.menuManagement = new navigatorMenuManagement
        navigation.contentControl = new navigatorContentControl

        function createDiv(){
            return d3.select('body')
                .append('div')
                .attr('id', 'navigatorDiv')
                .style('position', 'fixed')
                .style('border-radius', '20px')
        }
    
        function createSVGCanvas(){
            return navigatorWindow.div.append('svg')
                .attr('id', 'navigatorSVG')
        }
        
        navigatorWindow.div = createDiv()
        navigatorWindow.svg = createSVGCanvas()
    
    }

    setupNavigator()

    navigation.loadMainMenu()


}

function initialSetup(){
    setupNavigator()
}

function selectDestination(){
    const data = d3.select(this).data()
    navigation.updateOnClick(data[0])
}

class navigation {

    static menuItems = []
    static movement = {}
    static menuManagement = {}
    static contentControl = {}

    static loadMainMenu(){
        this.menuManagement.loadMain()
        this.contentControl.renderDestinations(this.menuItems)
        this.movement.toMainMenuDisplay(this.contentControl.getWidestItemWidth(), this.menuItems.length)
        this.contentControl.tweenTextIn()
    }

    
    static loadSubMenu(){

    }

    static loadSubMenuSelection(){

    }


    static updateOnClick(clickedItem){

        const itemType = clickedItem.constructor.name
        const subMenuLoaded = (navigatorWindow.div.style('left') === '20px')

        if(itemType === 'menuItem' && !subMenuLoaded){
            
        }


        this.menuManagement.updateOnSelection(clickedItem)
        this.contentControl.renderDestinations(this.menuItems)
        this.movement.toSubMenuDisplay(this.contentControl.getWidestItemWidth(), this.menuItems.length)
        this.contentControl.tweenTextIn()
    }



    static async goToDestination (clickedItem){
        const data = this.menu.refresh(clickedItem)
        
        
        await this.contentControl.renderDestinations(data)
        this.sizing.fitToContents()
        await this.positioning.positionLeft(0, 400)
        this.contentControl.tweenTextIn()
        this.positioning.seepIntoBackground()
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
        this.positioning.positionCentre()
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
        this.mainItems = this.#getMainMenuItems()
    }

    #getMainMenuItems(){
        return [
            new menuItem ('plans', this.#getPlansSubMenuItems()),
            new menuItem ('songs', this.#getSongsSubMenuItems()),
            new menuItem ('concepts', [])
        ]
    }

    #getPlansSubMenuItems(){
        return [
            new subMenuItem ('statement of intent'),
            new subMenuItem ('wooden blocks')
        ]
    }

    #getSongsSubMenuItems(){
        return [
            new subMenuItem ('slice of cedar'),
            new subMenuItem ('ton of nothing'),
            new subMenuItem ('intention and the act')
        ]
    }

    getMenuItems(){
        return navigation.menuItems.filter(item => item.constructor.name === 'menuItem')
    }
    
    getSubMenuItemCount(){
        const subMenuItems = navigation.menuItems.filter(item => item.constructor.name === 'subMenuItem')
        return subMenuItems.length
    }


    loadMain(){
        navigation.menuItems = this.mainItems
    }

    updateOnSelection(selectedItem){

        const itemType = selectedItem.constructor.name
        const subMenuItemCount = this.getSubMenuItemCount() 

        selectedItem.select()
        
        if(itemType === 'menuItem' && subMenuItemCount === 0){
            navigation.menuItems = [...[selectedItem],...selectedItem.subMenuItems]
        }

        if(itemType === 'menuItem' && subMenuItemCount > 0){
            navigation.menuItems = this.mainItems
        }


    }
}

class navigatorContentControl {
    
    renderDestinations(menuItems){



        const transitions = []

        function calculateTranslate(i){
            const x = 20
            const y = i * 20 + 40
            return 'translate(' + x + ',' + y + ')'
        }

        function tweenTextRemovalAndColour(selection, duration) {
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
        
        navigatorWindow.svg.selectAll('g')
            .data(menuItems, d => d.name)
            .join(
                enter => enter.append('g')
                    .attr('id', d => d.name)
                    .attr('transform', (d, i) => calculateTranslate(i))
                    .on('click', selectDestination)
                    .append('text')
                    .text(d => d.name)
                    .attr('dy', '-.4em')
                    .attr('fill', 'transparent'),
                
                update => update.selectAll('text').attr('font-weight', d => {
                        if(d.constructor.name === 'menuItem' && d.selected){
                            return 'bold'
                        } else {
                            return 'normal'
                        }

        
                    }),

                exit => {
                    exit.selectAll('text').each(function(){
                        let text = d3.select(this)
                        text.transition('tTweenOut')
                            .duration(0)
                            .textTween(tweenTextRemovalAndColour(text, 100))
                    })
                    
                    const exitedGroups = exit.transition().delay(0).duration(100).remove().end()


                    transitions.push(exitedGroups)
                    return exitedGroups


                }
            )

        return Promise.all(transitions)

    }

    tweenTextIn(){
        const selection = navigatorWindow.svg.selectAll('g').select('text').filter(d => !d.selected)
        const t = selection
            .attr('fill', 'black')
            .text('')
                .transition('tweenIn')
                .delay(function(d, i){return i * 150})
                .duration(200)
                .textTween(d => {
                    return function(t) {
                        return d.name.slice(0, Math.round(t * d.name.length));
                    };
                })

        return t.end()
    }


    getWidestItemWidth(){
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

class destinationMenu {

    #destinations = []
    #plans = []
    #items = []

    constructor(){
        this.#loadItems()
    }

    refresh(clickedItem){

        if(clickedItem !== undefined){
            this.#items = this.getItemsFromClickedMenuItem(clickedItem)
            this.updateItemSelectionWithinType(this.getMenuItems(), clickedItem)
        }

        return this.#items

    }

    

    updateItemSelectionWithinType(items, clickedItem){
        items.forEach(item => {
            if(item === clickedItem){
                item.toggleSelection()
            } else{
                item.deselect()
            }
        })
    }

    



    getItems(clickedItem){
        let itemsArray = []

        try{
            itemsArray = this.getItemsArray(clickedItem)
        }

        catch {
            itemsArray = this.#items
        }

        finally {
            this.updateItems(itemsArray)
            return itemsArray
        }

    }

    updateItems(itemsArray){
        this.#items = itemsArray
    }

    getItemsArray(clickedItem){
        if(clickedItem.constructor.name === 'menuItem'){   
            return this.getItemsFromClickedMenuItem(clickedItem)
        }

        if(clickedItem.constructor.name === 'subMenuItem'){
            return this.getItemsFromClickedSubMenuItem(clickedItem)
        }
    }

    getItemsFromClickedMenuItem(clickedMenuItem){

        console.log(clickedMenuItem)

        if(!clickedMenuItem.selected){  
            return [...[clickedMenuItem], ...this.getSubMenuItems(clickedMenuItem.name)]
        } 
        
        if (clickedMenuItem.selected){
            return this.#destinations
        }
    }

    getItemsFromClickedSubMenuItem(clickedSubMenuItem){
        const parentItem = this.getItem(clickedSubMenuItem.parentItemName)
        return [...[parentItem], ...this.getSubMenuItems(parentItem.name)]
    }


    updateItemSelection(clickedItem){
        
        if(clickedItem.constructor.name === 'menuItem'){

        }
        
        
        this.#items.forEach(item => {
            if(item.name === itemName){
                item.toggleSelection()
            } else {
                item.deselect()
            }
        })
    }

    getItem(itemName){
        return this.#items.find(thisItem => thisItem.name === itemName)
    }


    getSubMenuItems(destinationName){
        switch(destinationName){
            case 'plans':
                const planNames = plansManager.getPlanNames()
                return planNames.map(thisPlanName => new subMenuItem(thisPlanName, destinationName))
            default:
                return []
        }
    }

    #loadItems(){
        this.#destinations = this.#getDestinations()
        this.#plans = this.getSubMenuItems('plans')
        this.#items = this.#destinations

    }

    #getDestinations(){
        return [
            new menuItem ('plans'),
            new menuItem ('concepts')
        ]
    }

}

class menuItem {

    constructor(name, subMenuItems){
        this.name = name
        this.subMenuItems = subMenuItems
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

    constructor(name, parentItemName){
        super(name)
        this.parentItemName = parentItemName
    }

}



class navigatorSizing{

    ySpacing = 20

    fitToContents(widestItemWidth, itemCount){
        navigatorWindow.width = this.#setWidthToContents(widestItemWidth)
        navigatorWindow.height = this.#setHeightToContents(itemCount)
        this.resize(navigatorWindow.width, navigatorWindow.height)
    }

    #setWidthToContents(widestItemWidth){
        return widestItemWidth + (navigatorWindow.padding * 2)
    }

    #setHeightToContents(itemCount){
        return (itemCount) * this.ySpacing + (navigatorWindow.padding * 2)
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





class divManager {
    static createDiv (){
        return d3.select('body')
            .append('div')
            .style('position', 'fixed')
            .style('left', window.innerWidth / 2 + 'px')
            .style('top', window.innerHeight / 2 + 'px')
    }
    
}

class canvasManager {
    static createSVGCanvas(div){
        return div.append('svg')    
    }
}


class destinationManager{

    static #destinations = ['plans','concepts']

    static getDestinationNames(){
        return this.#destinations.map(dest => new destination(dest))
    }

    static getDestinationLocations(destinationName){
        const subLocations = this.#getSubLocations(destinationName).map(dest => new destination(dest))
        return [...[new destination(destinationName)], ...subLocations]

    }

    static #getSubLocations(destinationName){

        switch(destinationName){
            
            case 'plans':
                return plansManager.getPlanNames()

            default:
                return []
        }
    }

}

class destination {
    constructor(name){
        this.name = name
        this.selected = false
    }

}

class plansManager {
    static #plans = [
        {displayName: 'my digital garden', fileName: 'myDigitalGarden.html'},
        {displayName: 'wooden blocks', fileName: 'woodenBlocks.html'}
    ]

    static getPlanNames(){
        return this.#plans.map(planData => planData.displayName)
    }
}

/* class plan {
    constructor(d){
        this.id = d.id
        this.fileName = d.fileName
        this.displayName = d.displayName
    }

} */
    