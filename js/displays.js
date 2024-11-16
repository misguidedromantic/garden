class navigatorHandler {

    static #div = {}
    static #svg = {}
    static #handler = {}
    static #width = window.innerWidth / 4
    static #height = 60
    static #left = 20
    static #top = 20

    static createNavigator(){
        this.#div = this.#createDiv()
        this.#svg = this.#createSVG()
        this.#handler = new listHandler ('navigator')
    }
    
    static async updateNavigator (data = destinationHandler.getDestinations(), position = 'middle'){
        this.#handler.renderList(data, this.#svg)
        this.repositionNavigator(position)
        this.resizeNavigator(data.length)
    }

    static selectDestination(dest){
        const subLocations = destinationHandler.getSubLocations(dest[0].title)
        const data = [...dest, ...subLocations]
        this.updateNavigator(data, 'left')
    }

    static repositionNavigator (position){

            switch(position){
                case 'middle':
                    this.#left = (window.innerWidth / 2) - (this.#width / 2)
                    break;

                case 'left':
                    this.#left = 20
            }

        
        this.#div.transition("tPosition").delay(100).duration(500)
            .style('left', this.#left + 'px')
            .style('top', this.#top + 'px')
    }


    static resizeNavigator (itemCount){

        const width = this.#handler.getWidestItem(this.#svg)
        const height = itemCount * list.yGap + list.yGap

        this.#width = width + 40
        this.#height = height + 20
        

        this.#div.transition("tSize").delay(100).duration(500)
            .style('width', this.#width + 'px')
            .style('height', this.#height + 'px')
    }

    static #createDiv(){
        return d3.select('body')
            .append('div')
            .attr('id', 'navigatorDiv')
            .style('position', 'fixed')
            .style('left', this.#left + "px")
            .style('top', this.#top + "px")
            .style('width', this.#width + "px")
            .style('height', this.#height + 'px')
            .style('border-radius', '20px')
            .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)')
            .style('background-color', 'white')
    }

    static #createSVG(){
        return this.#div.append('svg')
            .attr('id', 'navigatorSvg')
    }

    static seepInToBackgound(){
        this.#div.transition("tSeep").delay(0).duration(800)
            .style('background-color', 'lightyellow')
            .style('border-radius', '0px')
            .style('box-shadow', '0 0 0 rgba(0, 0, 0, 0)')

    }

}

class navigator {



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
                thisDisplay.div = this.createDiv(id, styles)    
                break;
            
            case 'list':
                thisDisplay.div = this.createDiv(id, styles)
                thisDisplay.svg = this.createSVG(thisDisplay.div, id)   
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