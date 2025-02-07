
class displayOrchestration {

    static #displays = []

    static addDisplay(displayToAdd){
        this.#displays.push(displayToAdd)
    }

    static getDisplay(displayName){
        return this.#displays.find(display => display.name === displayName)
    }

    static getZIndex(divID){
        switch(divID){
            case 'songBlockCanvasDiv':
                return 1
            case 'navigatorDiv':
                return 2
            default:
                return 99
        }
    }

    static load (displayName, data) {
        
        const display = this.getDisplay(displayName) 

        switch(displayName){
            case 'songMilestones':
                const content = new displayContentRendering(display)
                const groups = content.renderGroups(display.svg, data)
                content.renderGroupLabels(groups)
                groups.data().forEach(d => {
                    const parentGroup = d3.select('g#' + d.id)
                    content.renderRects(parentGroup, d.milestones)
                    //const subGroups = content.renderGroups(parentGroup, d.milestones)
                    //content.renderCircles(parentGroup, d.milestones)
                })

                //zoomHandling.zoomToRange(110,180)


                //renderInvisible
                //fitContainer
                //renderVisible
        }
    }

    


}


class displayFactory{
    static createDisplay(displayName){
        const newDisplay = this.#getDisplayObject(displayName)
        newDisplay.div = new container (displayName, 'div', d3.select('body'))
        newDisplay.svg = new container (displayName, 'svg', newDisplay.div)
        displayOrchestration.addDisplay(newDisplay)
    }

    static #getDisplayObject(displayName){
        switch(displayName){
            case 'songStructures':
                return new display(displayName)

            case 'songMilestones':
                return new timelinesDisplay(displayName)
        }
    }
}



class displayContainerControl {

    constructor(){

    }



}

class displayContentRendering {

    constructor(display){
        this.display = display
    }

    renderGroups(parentElem, data){
        return parentElem.selectAll('g.' + this.display.gClass)
            .data(data, data.id)
            .join(
                enter => this.enterGroups(enter, this.display.gClass),
                update => this.updateGroups(update),
                exit => this.exitGroups(exit)
            )
    }

    enterGroups(selection, classText){
        return selection.append('g')
            .attr('id', d => d.id)
            .attr('class', classText)
            .attr('transform', (d, i) => contentPositioning.calculateTranslate(d, i, this.display))
    }

    updateGroups(selection){
        return selection
    }
    exitGroups(selection){
        return selection
    }

    renderGroupLabels(groups){
        groups.append('text')
            .text(d => d.title)
    }

    renderRects(group, data){
        group.selectAll('rect')
            .data(data)
            .join('rect')
            .attr('width', 4)
            .attr('height', 10)
            .attr('x', (d, i) => contentPositioning.calculateTimelinePosition(d.date))
            .attr('y', -10)

    }

    renderCircles(group, data){
        group.selectAll('circle')
            .data(data)
            .join('circle')
            .attr('r', 4)
            .attr('cx', (d, i) => contentPositioning.calculateTimelinePosition(d.date))
            .attr('cy', - 5)
    }

    renderMilestoneCircles(groups){
        groups.append('circle')
            .attr('r', 4)
            .attr('cy', - 5)
    }

}

class contentPositioning {
    static calculateTranslate(d, i, display){

        let x = 0
        let y = 0

        switch(d.constructor.name){
            case 'song':
                y = (display.gSpacingY * i) + (display.gPadding * 2)
                break;
            case 'milestone':
                x = this.calculateTimelinePosition(d.date)
        }

        return 'translate(' + x + ',' + y + ')'
    }

    static calculateTimelinePosition(date){
        const dateObject = new Date(date)
        const year = dateObject.getFullYear()
        const month = dateObject.getMonth()
        const day = dateObject.getDate()
        return (year - 2000) * 12 + month + day + 50
    }
}

class contentSizing {
    static calculateRectWidth(d){

    
    }
}

class zoomHandling {
    
    
    static zoomToRange(xMin, xMax){
        const width = 300
        //const height = 150
        const zoom = d3.zoom().on('zoom', zoomHandling.zoomed)
        d3.select('svg').call(zoom)

            //.append('rect')
            //.attr('width', width)
            //.attr('height', height)
            //.style('fill', 'none')

        
        const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, width])
        //const xDomain = xScale.domain();
        //const xRange = xScale.range();
        const scale = width / (xMax - xMin);
        const translate = -xMin * scale;
        
        
        d3.select('svg').transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity
                .scale(width / (xScale(xMax) - xScale(xMin)))
                .transform(-xScale(xMin), 0)
        )


        //d3.select('svg').transition().delay(250).duration(250).call(zoom.scaleBy, 2)
    }

    static zoomed(event){
        const transform = event.transform
        d3.selectAll('circle')
            .attr('cx', d => transform.applyX(d.x))
            .attr('cy', d => d.y)

        //d3.selectAll('g#hurdle').attr('transform', 'translate(' + transform.x + ',60) scale(' + transform.k + ', 1)')
    }
}





class displaySizing {
    fitHeightToContents(thisDisplay){
        thisDisplay.height = thisDisplay.data.length * thisDisplay.verticalSpacing + 40
    }



}

class display {

    gSpacingY = 20
    gPadding = 20

    constructor(name){
        this.name = name
    }
}

class timelinesDisplay extends display {

    divPositionStyle = 'absolute'
    gClass = 'songTimeline'
    
    constructor(name){
        super(name)
        this.width = window.innerWidth - 40
        this.height = 40 + this.verticalSpacing
        this.left = window.innerWidth / 2 - this.width
        this.top = window.innerHeight / 2 - this.height / 2
    }


}

class menuDisplay extends display {

    gClass = 'menuItem'
}