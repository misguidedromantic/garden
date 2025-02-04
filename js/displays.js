
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
                content.render(display.svg, data)

                //renderInvisible
                //fitContainer
                //renderVisible
        }
    }


}


class displayFactory{
    static createDisplay(displayName){
        let newDisplay = {}
        switch(displayName){
            case 'songMilestones':
                newDisplay = new timelinesDisplay(displayName)
                this.#setupContainerConfiguration(newDisplay)

        }
        displayOrchestration.addDisplay(newDisplay)
    }

    static #setupContainerConfiguration(newDisplay){
        newDisplay.div = new div (newDisplay.name, newDisplay.parentContainer)
        newDisplay.svg = new svg (newDisplay.name, newDisplay.div)
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

    render(svgCanvas, data){
        const groups = svgCanvas.selectAll('g.' + this.display.gClass)
            .data(data, data.id)
            .join('g')
            .attr('id', d => d.id)
            .attr('class', this.display.gClass)
            .attr('transform', (d, i) => this.calculateTranslate(d, i))

        this.renderSubElements(groups)
            
    }

    renderSubElements(groups){
        if(this.display.constructor.name === 'timelinesDisplay'){
            groups.append('text')
                .text(d => d.title)

            groups.data().forEach(d =>{
                const g = d3.select('g#' + d.id)
                g.selectAll('circle')
                    .data(d.milestones)
                    .join('circle')
                    .attr('id', d => d.id)
                    .attr('r', 3)
                    .attr('cx', d => {
                        const dateObject = new Date(d.date)
                        const year = dateObject.getFullYear()
                        const month = dateObject.getMonth()
                        const day = dateObject.getDate()
                    return (year - 2000) * 12 + month + day
                })
            })
        }
    }

    calculateTranslate(d, i){
        const x = 0
        const y = (this.display.gSpacingY * i) + (this.display.gPadding * 2)
        return 'translate(' + x + ',' + y + ')'
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