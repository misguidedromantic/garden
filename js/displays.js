
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
            case 'songStructures':
                const content = new displayContentControl()
                const structuring = new songStructuring
                const data = structuring.getDefaultStructure()
                content.createStacks(data)
            
                //console.log(data[0].structure)
                //songSectionSquare.render(display.svg, data[0].structure)
                
                
                
                break;
            case 'songStructures1':

                //const content = new displayContentControl()
                const rendering = new displayContentRendering(display)
                const groups = rendering.renderGroups(display.svg, data)
                rendering.renderGroupLabels(groups)
                groups.data().forEach(d => {
                    const parentGroup = d3.select('g#' + d.id)
                    content.createStacks(d)
                    rendering.renderRects(parentGroup, d.structure)
                })

                display.width = 800
                display.height = 500
                const windowControl = new displayContainerControl(display)
                windowControl.resize(0,0)

                break;


            case 'songMilestones':
                //const content = new displayContentRendering(display)
                //const groups = content.renderGroups(display.svg, data)
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

    constructor(display){
        this.display = display
    }

    resize(delay, duration){
        this.display.div.transition('tSizingDIV').delay(delay).duration(duration)
            .style('width', this.display.width + 'px')
            .style('height', this.display.height + 'px')


        this.display.svg.transition('tSizingSVG').delay(delay).duration(duration)
            .style('width', this.display.width + 'px')
            .style('height', this.display.height + 'px')

    }



}

class displayContentControl {
    createStacks(structure){
        let stacks = []
        let stacksIndex = 0
        let stackIndex = 0
        //const types = this.getSectionTypes(song.structure)
        for(let i = 0; i < structure.length; i++){
            const section = structure[i]
     
            console.log(section)
            const type = this.getSectionType(section.id)
            const sequenceOfType = this.getSequenceOfType(section.id)
            const sequenceInSong = section.sequence
            const previousSectionType = sequenceInSong !== 1 ? this.getSectionType(structure[i - 1].id) : undefined
            
            if(previousSectionType === 'bridge'){
                stacksIndex = stacksIndex + 1
                stackIndex = 0
            } else {
                
            }
            
            
            stacks.splice()


    
  
        }

        console.log(stacks)
        
        
      
    }

    getSectionType(id){
        const intIndex = this.getIndexOfIdInt(id)
        return id.substring(0,intIndex)
    }   

    getSequenceOfType(id){
        const intIndex = this.getIndexOfIdInt(id)
        return id.substring(intIndex)
    }

    getIndexOfIdInt(id){
        return id.search(/\d/)
    }




    getSectionTypes(structure){
        return [...new Set(structure.map(section => section.constructor.name))]
    }
    
    getNthOccurrence(arr, property, value, n) {
        let count = 0;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] === value) {
            count++;
            if (count === n) {
              return i;
            }
          }
        }
        return -1; // If nth occurrence is not found
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
            .text(d => {
                return d.title
            })
            .attr('fill', 'white')
            .style('size', 10)
    }

    renderRects(group, data){
        group.selectAll('rect')
            .data(data)
            .join('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('y', (d, i) => d.stackNumber * 15)
            .attr('x', (d, i) => (d.positionInStack - 1) * 15)
            .attr('fill', '#A9A9A9')

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
    static numberInStack = 0
    static stackNumber = 0

    static calculateTranslate(d, i, display){

        let x = 10
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

    static getRenderedLabelWidth(g){
        return g.select('text').node().getBBox().width
    }

    static getRenderedLabelWidths(svg){
        const widths = []
        const groups = svg.selectAll('g')
        groups.each(function(){
            const elem = d3.select(this)
            widths.push(elem.select('text').node().getBBox().width)
        })
        return widths
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

    gSpacingY = 80
    gPadding = 40

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