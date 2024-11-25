window.onload = function(){
    navigation.setup()
}

function selectDestination(){
    const destinationName = d3.select(this).select('text').text()
    navigation.goToDestination(destinationName)
}



class navigation {

    static setup (){
        this.navigatorWindow = new navigatorWindow
        this.destinations = destinationManager.getDestinationNames()
        this.#updateContents()
        this.navigatorWindow.riseAboveBackground()
        this.reszieWindow()
        //this.repositionWindow('centre')
    }

    static goToDestination (destinationName){
        this.destinations = destinationManager.getDestinationLocations(destinationName)
        this.#updateContents()
        this.navigatorWindow.seepIntoBackground()
        this.reszieWindow()
        this.repositionWindow('left')
    }

    static repositionWindow(spot){

        let x = 20
        let y = 20

        switch(spot){
            case 'centre':
                x = window.innerWidth / 2
                y = window.innerHeight / 2
                break;

            case 'left':
                x = 20
                y = 20
        }

        this.navigatorWindow.moveTo(x, y)

    }

    static reszieWindow(){

        const padding = 20

        function getWidth(canvas){
            const widestItem = navigatorContents.getWidestItemWidth(canvas)
            return widestItem + (padding * 2)
        }

        function getHeight(itemCount){
            const ySpacing = 20
            const fontHeight = 14
            return (itemCount) * ySpacing + (padding * 2)

        }

        const width = getWidth(this.navigatorWindow.getCanvas())
        const height = getHeight(this.destinations.length)
        this.navigatorWindow.resize(width, height)
    }


    static #updateContents(){
        navigatorContents.renderDestinations(this.navigatorWindow.getCanvas(), this.destinations)
    }




}

class navigatorContents {

    static renderDestinations(canvas, destinations){
        function calculateTranslate(i){
            const x = 20
            const y = i * 20 + 40
            return 'translate(' + x + ',' + y + ')'
        }
        
        canvas.selectAll('g')
            .data(destinations, d => d)
            .join(
                enter => enter.append('g')
                    .attr('id', d => d)
                    .attr('transform', (d, i) => calculateTranslate(i))
                    .on('click', selectDestination)
                    .append('text')
                    .text(d => d)
                    .attr('dy', '-.4em'),
                
                update => update.selectAll('text').attr('font-weight', 'bold'),

                exit => exit.remove()

            )

    }

    static getWidestItemWidth(canvas){
        const groups = canvas.selectAll('g')
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

class navigatorWindow {

    #div = {}
    #svg = {}

    constructor(){
        this.#div = divManager.createDiv()
        this.#svg = canvasManager.createSVGCanvas(this.#div)
    }

    getCanvas(){
        return this.#svg
    }

    riseAboveBackground(){
        const t = d3.transition("tRise").duration(400)
        this.#div.transition(t)
            .style('border-radius', '20px')
            .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)')
            .style('background-color', 'white')
    }

    seepIntoBackground(){
        const t = d3.transition("tSeep").duration(400)
        this.#div.transition(t)
            .style('background-color', 'lightyellow')
            .style('border-radius', '0px')
            .style('box-shadow', '0 0 0 rgba(0, 0, 0, 0)')  
    }

    moveTo(top, left){
        this.#div.transition("tPosition")
            .duration(400)
            .style('left', left + "px")
            .style('top', top + "px")
    }

    resize(width, height){
        const t = d3.transition("tSize").duration(400)
        this.#div.transition(t)
            .style('width', width + 'px')
            .style('height', height + 'px')

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
        return this.#destinations
    }

    static getDestinationLocations(destinationName){
        const subLocations = this.#getSubLocations(destinationName)
        return [...[destinationName], ...subLocations]

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
    