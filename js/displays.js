class navigator {

    static position = 'middle'
    static visible = false
    static width = window.innerWidth / 4
    static height = 60
    static left = 20
    static top = 20  
    static div = {}
    static svg = {}
    static yGap = 20
}

class navigatorHandler {

    static initialLoad(){
        this.#renderDiv()
        this.#renderSVG()
        this.update()
        this.reposition()
        this.resize()
        this.seepOutOfBackground()
    }

    static selectDestination(){
        const selection = d3.select(this)
        
        if(navigator.position === 'left' && selection.attr('id') === 'plans'){
            navigatorHandler.update()
            navigatorHandler.reposition(0, 400)
            navigatorHandler.resize()
            navigatorHandler.seepOutOfBackground()

        } else if(navigator.position === 'left' && selection.attr('id') !== 'plans'){
            


        } else{
            const dest = selection.data()
            const subLocations = destinationHandler.getSubLocations(dest[0].title)
            const data = [...dest, ...subLocations]
            navigatorHandler.update(data, 'left')
            navigatorHandler.reposition(0, 400)
            navigatorHandler.resize()
            navigatorHandler.seepInToBackgound()
        }
        
    }

    static update(data = destinationHandler.getDestinations(), position = 'middle'){
        navigator.position = position
        this.#render(data)
        this.setDimensions(data.length)
        this.setPosition()
    }

    static setDimensions(destinationCount){
        navigator.width = this.getWidestItem(navigator.svg) + 40
        navigator.height = destinationCount * navigator.yGap + navigator.yGap + 20
    }

    static setPosition(){
        switch(navigator.position){
            case 'middle':
                navigator.left = (window.innerWidth / 2) - (navigator.width / 2)
                break;
            
            default:
                navigator.left = 20
        }
        
        navigator.top = 20
    }
  
    static getWidestItem(svg){

        const groups = svg.selectAll('g.destination')
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


    static #render(data){

        const methodSelectItem = this.selectDestination

        navigator.svg.selectAll('g.destination')
            .data(data, d => d.title)
            .join(
                enter => {
                    const groups = enter.append('g')
                        .attr("id", d => d.title)
                        .attr("class", 'destination')
                        .attr("transform", (d, i) => {return getTranslateString(20, navigator.yGap * (i + 1) + navigator.yGap)})
                        .on("click", methodSelectItem)

                    groups.append('text')
                        .text(d => d.title)
                        .style('font-family', 'tahoma')
                        .style('font-size', 14)
                        .style('text-anchor', 'left')
                        .attr('fill', (d, i) => {
                            if(navigator.visible === true){return 'transparent'} 
                            else {return 'lightyellow'}})
                        .attr('dy', '-.4em')
                    },
                update => {
                    update.select('text').transition('tUpdateText')
                        .delay(0)
                        .duration(200)
                            .attr('font-weight', d => {
                                if(d.constructor.name === 'destination' && navigator.position === 'left'){return 600}
                                else {return 300}
                            })},
                exit => {
                    exit.selectAll('text').each(function(){
                        let text = d3.select(this)
                        text.transition('tExitText')
                            .duration(100)
                            .style('fill', 'grey')
                            .on("end", function() {
                                tweenTextRemovalAndColour(text, 100) 
                            })
                        
                    })
        
                    exit.transition('tExitG').delay(400).remove()
                }
            )
    }

    

    static reposition (delay = 0, duration = 0){
        navigator.div.transition("tPosition").delay(delay).duration(duration)
            .style('left', navigator.left + 'px')
            .style('top', navigator.top + 'px')
    }

    static resize (delay = 0, duration = 0){
        navigator.div.transition("tSize").delay(delay).duration(duration)
            .style('width', navigator.width + 'px')
            .style('height', navigator.height + 'px')
    }

    static #renderDiv(){
        navigator.div = d3.select('body')
            .append('div')
            .attr('id', 'navigatorDiv')
            .style('position', 'fixed')
            .style('left', navigator.left + "px")
            .style('top', navigator.right + "px")
            .style('width', navigator.width + "px")
            .style('height', navigator.height + 'px')
            .style('background-color', 'lightyellow')
            .style('border-radius', '0px')
            .style('box-shadow', '0 0 0 rgba(0, 0, 0, 0)')
    }

    static #renderSVG(){
        navigator.svg = navigator.div.append('svg')
            .attr('id', 'navigatorSvg')
    }

    static seepInToBackgound(){
        navigator.visible = false
        
        navigator.div.transition("tSeep").delay(0).duration(800)
            .style('background-color', 'lightyellow')
            .style('border-radius', '0px')
            .style('box-shadow', '0 0 0 rgba(0, 0, 0, 0)')

        let groups = navigator.svg.selectAll('g')
        groups.selectAll('text').transition().delay(0).duration(800).attr('fill', 'black')

    }

    static seepOutOfBackground(){
        navigator.visible = true
        
        navigator.div.transition().delay(0).duration(600)
            .style('border-radius', '20px')
            .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)')
            .style('background-color', 'white')
        
        let groups = navigator.svg.selectAll('g')
        groups.selectAll('text').transition().delay(0).duration(800).attr('fill', 'black')
    }

}



class displayHandler {

    constructor(displayID){
        this.id = displayID
    }

}




class docWindowHandler extends displayHandler {

    renderPlanWindow(htmlDoc){
        const planWindow = this.getDisplay('planWindow')
        //this.#setupContainers(planWindow)
        this.#appendHeader(htmlDoc.body, planWindow.div)
        this.#appendParagraphs(htmlDoc.body, planWindow.div)
        this.#slideIntoView(planWindow.div)
    }
   
    #appendHeader(sourceElem, targetElem){
        const header = d3.select(sourceElem).select('h1')
        targetElem.append('h1').html(header.html())
    }

    #appendParagraphs(sourceElem, targetElem){

        const paras = d3.select(sourceElem).selectAll('p')

        paras.each(function(){
            const p = d3.select(this)
    
            let pContent = true
     
            p.selectAll('span').each(function(){
                const spanHTML = d3.select(this).html()
                
                if(spanHTML === ''){
                    pContent = false
                }  
            })
    
            if (pContent === true){
                targetElem.append('p').html(p.html())
            }
            
        })

    }

    #slideIntoView(targetDiv){
        targetDiv
            .transition()
            .duration(1000)
            .style('left', '0px')
            .style('background-color', 'transparent') //#F5F5DC
    }

    #setupContainers(thisDisplay){

        const id = thisDisplay.id
        const styles = thisDisplay.styles

        switch(thisDisplay.constructor.name){

            case 'docWindow':
                thisDisplay.div = this.renderDiv(id, styles)    
                break;
            
            case 'list':
                thisDisplay.div = this.renderDiv(id, styles)
                thisDisplay.svg = this.renderSVG(thisDisplay.div, id)   
        }

    }
}



class docWindow {
    constructor(id){
        this.id = id
        this.styles = {
            position: 'absolute',
            left: 2000,
            top: 0,
            width: 800,
            height: 800,
            padding: 12,
            margin: 0,
            fontFamily: 'tahoma',
            backgroundColor: 'transparent'
        }
    }
}

