
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
                    const subGroups = content.renderGroups(parentGroup, d.milestones)
                    content.renderMilestoneCircles(subGroups)
                })


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
                x = this.#calculateTimelinePosition(d.date)
        }

        return 'translate(' + x + ',' + y + ')'
    }

    static #calculateTimelinePosition(date){
        const dateObject = new Date(date)
        const year = dateObject.getFullYear()
        const month = dateObject.getMonth()
        const day = dateObject.getDate()
        return (year - 2000) * 12 + month + day + 50
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