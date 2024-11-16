class navigator {

    static position = 'middle'
    static visible = false
    static width = window.innerWidth / 4
    static height = 60
    static left = 20
    static top = 20  
    static div = {}
    static svg = {}
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

        } else {
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
        navigator.height = destinationCount * list.yGap + list.yGap + 20
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
                        .attr("transform", (d, i) => {return getTranslateString(20, list.yGap * (i + 1) + list.yGap)})
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


class listHandler extends displayHandler {

    constructor(displayID){
        super(displayID)
        this.transitionPromises = []
    }

    getWidestItem(svg){

        const groups = svg.selectAll('g.listItem')
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

    async renderList(data, svg){

        let enterSelection = {}
        
        svg.selectAll('g.listItem')
            .data(data, d => d.title)
            .join(
                enter => {
                    enterSelection = this.#enterElements(enter)
                },
                this.#updateElements(),
                this.#exitElements()
            )

        const enterPromise = enterSelection.selectAll('text').transition()
            .delay((d, i) => {return i * 150})
            .duration(300)
            .attr('fill', 'black')
            .end()

        

        return Promise.all([enterPromise])
        
    }

    #enterElements(enter){

        let fnSelectItem = this.selectItem
        let fnGetTranslate = this.calculateTransformTranslate

            const groups = enter.append('g')
                .attr("id", d => d.title)
                .attr("class", 'listItem')
                .attr("transform", (d, i) => {return fnGetTranslate(d, i)})
                .on("click", fnSelectItem)
            
            groups.append('text')
                .text(d => d.title)
                .style('font-family', 'tahoma')
                .style('font-size', 14)
                .style('text-anchor', 'left')
                .attr('fill', 'white')
                .attr('dy', '-.4em')

            return groups
    }

    #updateElements(){

        const updatePromises = []
        this.transitionPromises.push(updatePromises)


        return function(update){

            if(update.empty()){
                updatePromises.push(Promise.resolve())
                return
            }

            const text = update.select('text')

            updatePromises.push(
                text.transition('tUpdateText')
                .delay(400)
                .duration(400)
                    .attr('font-weight', d => {
                        if(d.constructor.name === 'destination'){return 600}
                        else {return 300}
                    })
                    .end()

            )

        }
    }

    #exitElements(){

        return function(exit){
            
            exit.selectAll('text').each(function(){
                let text = d3.select(this)
                text.transition('tExitText')
                    .duration(100)
                    .style('fill', 'grey')
                    .on("end", function() {
                        tweenTextRemovalAndColour(text, 200)
                    })
                
            })

            exit.transition('tExitG').delay(400).remove()
        }

    }

    calculateTransformTranslate(d, i){
        let x = 0
        if(!d.header){x = list.yGap}
        const y = list.yGap * (i + 1) + list.yGap
        return getTranslateString(x, y)
    }

    seepInToBackgound(div){
        div.transition("tSeep").delay(0).duration(800)
            .style('background-color', 'lightyellow')
            .style('border-radius', '0px')
            .style('box-shadow', '0 0 0 rgba(0, 0, 0, 0)')

    }

    selectItem(){   
        
        navigatorHandler.selectDestination(d3.select(this).data())
        


        //let data = mainNavigator.getData().filter(item => item.title === id)
       //if(data[0].constructor.name === 'destination'){
            //data = [...data, ...getPlans()]
            //mainNavigator.top = 50
            //mainNavigator.left = 15
            //renderMainNavigator(data, 0, 400)
            //mainNavigator.seepInToBackgound()


        //} else {
    
            //loadPlan('myDigitalGarden')
       //}
    
        
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

class list {

    static yGap = 20

    static getStyles () {
        return {
            position: 'fixed',
            left: 10,
            top: 10,
            width: 0,
            height: 0,
            padding: 12,
            margin: 0,
            fontFamily: 'tahoma',
            backgroundColor: 'white',
            borderRadius: 20,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',    
        }
    }

    constructor(id){
        this.id = id
       
    }
}