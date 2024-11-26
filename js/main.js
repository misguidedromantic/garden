window.onload = function(){
    navigation.loadNavigator()
}





function selectDestination(){


    const destinationName = d3.select(this).select('text').text()
    navigation.goToDestination(destinationName)
}



class navigation {

    static navWindow = {}



    static loadNavigator(){

        this.navWindow = new navigatorWindow
        const canvas = this.navWindow.getCanvas()
        
        function loadDestinations(){
            const data = destinationManager.getDestinationNames()
            navigatorContents.renderDestinations(canvas, data)
        }

        function setupWindow(){

            let navigatorWidth = 0
            let navigatorHeight = 0

            function sizeWindow(){

                const padding = 20
                //const canvas = navWindow.getCanvas()

                function getWidth(){

                    function getWidestItemWidth(){
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

                    const widestItem = getWidestItemWidth()
                    return widestItem + (padding * 2)
                }
            
                function getHeight(){
                    const itemCount = canvas.selectAll('g').size()
                    const ySpacing = 20
                    return (itemCount) * ySpacing + (padding * 2)
                }

                navigatorWidth = getWidth()
                navigatorHeight = getHeight()

                navigation.navWindow.setDimensions(navigatorWidth, navigatorHeight)

            }

            function positionWindow(){
                const left = window.innerWidth / 2 - navigatorWidth / 2
                const top = window.innerHeight / 2 - navigatorHeight / 2
                navigation.navWindow.setPosition(left, top)
            }

            sizeWindow()
            positionWindow()

        }

        function reveal (){
            const canvas = navigation.navWindow.getCanvas()
            const t1 = d3.transition().delay(0).duration(800)
            const t2 = d3.transition().delay(200).duration(600)
            canvas.selectAll('text').transition(t1).attr('fill', 'black')
            navigation.navWindow.riseAboveBackground(t2)
        }

        //createNavWindow()
        loadDestinations()
        setupWindow()
        reveal()

    }

    static goToDestination (destinationName){

        function updateDestinations(){

        }

        const canvas = navWindow.getCanvas()
        const data = destinationManager.getDestinationLocations(destinationName)
        navigatorContents.renderDestinations(canvas, data)
 
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
        
        canvas.selectAll('g')
            .data(destinations, d => d)
            .join(
                enter => enter.append('g')
                    .attr('id', d => d)
                    .attr('transform', (d, i) => calculateTranslate(i))
                    .on('click', selectDestination)
                    .append('text')
                    .text(d => d)
                    .attr('dy', '-.4em')
                    .attr('fill', 'transparent'),
                
                update => update.selectAll('text').attr('font-weight', 'bold'),

                exit => exit.transition().duration(400).tween("textTween", tweenTextRemovalAndColour)

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
        this.#div = this.#createDiv()
        this.#svg = this.#createSVGCanvas()
    }

    setDimensions(width, height){
        const div = this.getDiv()
        div.style('width', width + 'px').style('height', height + 'px')
    }

    setPosition(left, top){
        const div = this.getDiv()
        div.style('left', left + 'px').style('top', top + 'px')
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
        return d3.select('#navigatorDiv')
    }

    getCanvas(){
        return d3.select('#navigatorSVG')
    }

    riseAboveBackground(t){
        this.#div.transition(t)
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

    positionCentre(){

    }

    positionLeft(){

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
    