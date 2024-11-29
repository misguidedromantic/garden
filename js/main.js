window.onload = function(){initialSetup()}

function initialSetup(){
    navigation.loadNavigator()
}

function selectDestination(){
    const destinationName = d3.select(this).select('text').text()
    navigation.goToDestination(destinationName)
}

class navigation {

    static window = {}
    static positioning = {}
    static sizing = {}
    static contentControl = {}


    static loadNavigator(){
        this.#loadHandlers()
        this.loadDestinations()
        this.setupWindow()
        this.reveal()
    }

    static #loadHandlers(){
        this.window = new navigatorWindow
        this.positioning = new navigatorPositioning(this.window)
        this.sizing = new navigatorSizing(this.window)
        this.contentControl = new navigatorContentControl(this.window)
    }

    static loadDestinations(){
        const data = destinationManager.getDestinationNames()
        this.contentControl.renderDestinations(data)
    }

    static setupWindow(){  
        this.sizing.fitToContents()
        this.positioning.positionCentre(0, 0)
    }

    static reveal (){
        this.contentControl.tweenTextIn()
        this.positioning.riseAboveBackground(200, 600)
    }

    static async goToDestination (destinationName){
        const data = destinationManager.getDestinationLocations(destinationName)
        await this.contentControl.renderDestinations(data)
        this.sizing.fitToContents()
        await this.positioning.positionLeft(0, 400)
        this.contentControl.tweenTextIn()
        this.positioning.seepIntoBackground()
    }

}

class navigatorContentControl {
    
    constructor(window){
        this.window = window
        this.canvas = this.window.getCanvas()
    }

    renderDestinations(destinations){

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
        
        this.canvas.selectAll('g')
            .data(destinations, d => d.name)
            .join(
                enter => enter.append('g')
                    .attr('id', d => d.name)
                    .attr('transform', (d, i) => calculateTranslate(i))
                    .on('click', selectDestination)
                    .append('text')
                    .text(d => d.name)
                    .attr('dy', '-.4em')
                    .attr('fill', 'transparent'),
                
                update => update.selectAll('text').attr('font-weight', 'bold'),

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

        const selection = this.canvas.selectAll('g').select('text').filter(function(){
            return d3.select(this).attr('font-weight') !== 'bold'
        })
        
        selection.attr('fill', 'black').text('')
        
        const t = selection.transition('tweenIn')
            .delay(function(d, i){return i * 150})
            .duration(200)
            .textTween(d => {
                return function(t) {
                    return d.name.slice(0, Math.round(t * d.name.length));
                };
            })

        return t.end()
    }
}



class navigatorSizing{

    padding = 20

    constructor(window){
        this.window = window
        this.canvas = this.window.getCanvas()
    }

    fitToContents(){
        this.window.width = this.#setWidthToContents()
        this.window.height = this.#setHeightToContents()
        this.window.resize(this.window.width, this.window.height)
    }

    #setWidthToContents(){
        const widestItem = this.window.getWidestItemWidth()
        return widestItem + (this.padding * 2)
    }

    #setHeightToContents(){
        const itemCount = this.canvas.selectAll('g').size()
        const ySpacing = 20
        return (itemCount) * ySpacing + (this.padding * 2)
    }
}

class navigatorPositioning{

    padding = 20

    constructor(window){
        this.window = window
        this.div = this.window.getDiv()
    }

    positionCentre(delay, duration){
        const left = window.innerWidth / 2 - this.window.width / 2
        const top = window.innerHeight / 2 - this.window.height / 2
        const t = d3.transition('posCentre').delay(delay).duration(duration)
        this.window.moveTo(left, top, t)
    }

    positionLeft(delay, duration){
        const left = 20
        const top = 20
        const t = d3.transition('posLeft').delay(delay).duration(duration)
        this.window.moveTo(left, top, t)
        return t.end()
    }

    riseAboveBackground(delay, duration){
        const t = d3.transition("tRise").delay(delay).duration(duration)
        this.div.transition(t)
            .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)')
            .style('background-color', 'white')
    }

    seepIntoBackground(){
        const t = d3.transition("tSeep").duration(400)
        this.div.transition(t)
            .style('background-color', 'lightyellow')
            .style('border-radius', '0px')
            .style('box-shadow', '0 0 0 rgba(0, 0, 0, 0)')  
    }
}


class navigatorWindow {

    #div = {}
    #svg = {}

    constructor(){
        this.#div = this.#createDiv()
        this.#svg = this.#createSVGCanvas()
    }

    #createDiv(){
        return d3.select('body')
            .append('div')
            .attr('id', 'navigatorDiv')
            .style('position', 'fixed')
            .style('border-radius', '20px')
    }

    #createSVGCanvas(){
        return this.#div.append('svg')
            .attr('id', 'navigatorSVG')
    }

    getDiv(){
        return this.#div
    }

    getCanvas(){
        return this.#svg
    }

    moveTo(left, top, t){
        this.#div.transition(t)
            .style('left', left + "px")
            .style('top', top + "px")
    }

    resize(width, height, t){
        this.#div.transition(t)
            .style('width', width + 'px')
            .style('height', height + 'px')

    }

    getWidestItemWidth(){
        const groups = this.#svg.selectAll('g')
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
    