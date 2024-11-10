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
        this.#handler = new listHandler
    }
    
    static async updateNavigator (data){
        
        await this.#handler.renderList(data, this.#svg)
        this.repositionNavigator('middle')
        this.resizeNavigator(data.length)
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


    static resizeNavigator (itemCount, widestItem){

        const width = this.#handler.getWidestItem(this.#svg)
        console.log(width)

        this.#width = width + 40

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

    

    

}





class displayManager {

    static displays = {}

    static createDisplay(name, type){
        
        switch(type){
            case 'docWindow':
                this.#createDocWindowDisplay(name)
                break;
            
            case 'list':
                this.#createListDisplay(name)  
        }
    }

    static #createListDisplay(name){
        const handler = new listHandler ()
        handler.createDiv()
        handler.createSVG()
        this.displays[name]
    }

    static #createDocWindowDisplay(name){
        this.displays[name] = new docWindow  
    }

    static #getHandler(displayType){
    
        
    }

    static get (displayName){

        switch(displayName){

            case 'navigator':
                return new listHandler  

            case 'list':
                return new docWindowHandler

        
        }
    }

    static #loadDisplay(displayName){

        switch(displayName){

            case 'navigator':
                thisDisplay.div = this.createDiv(id, styles)    
                break;
            
            case 'list':
                thisDisplay.div = this.createDiv(id, styles)
                thisDisplay.svg = this.createSVG(thisDisplay.div, id)   
        }


        this.displays[displayName]
    }

    static #getType (displayName){
        return this.displays[displayName].constructor.name  
    }


    static setup(display){
        
        const id = display.id
        const styles = display.styles

        switch(display.constructor.name){

            case 'docWindow':
                thisDisplay.div = this.createDiv(id, styles)    
                break;
            
            case 'list':
                thisDisplay.div = this.createDiv(id, styles)
                thisDisplay.svg = this.createSVG(thisDisplay.div, id)   
        }

    }

    static renderDisplay(displayName, data){

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


    #loadDisplays(){
        this.displays = [
            new list ('navigator'),
            new docWindow ('planWindow')
        ]

        const mainNavigator = this.getDisplay('navigator')
        this.#setupContainers(mainNavigator)
    }




    #slideIntoView(targetDiv){
        targetDiv
            .transition()
            .duration(1000)
            .style('left', '0px')
            .style('background-color', 'transparent') //#F5F5DC
    }
    
    renderPlanWindow(htmlDoc){
        const planWindow = this.getDisplay('planWindow')
        this.#setupContainers(planWindow)
        this.#appendHeader(htmlDoc.body, planWindow.div)
        this.#appendParagraphs(htmlDoc.body, planWindow.div)
        this.#slideIntoView(planWindow.div)
    }

    renderNavigator(data){
        const mainNavigator = this.getDisplay('navigator')
        const handler = new listHandler

        handler.renderList(data, mainNavigator)

        let pos = {left: 50, top: 50}
        let dim = {width: 300, height: 300}

        handler.reposition(mainNavigator, pos)
        handler.resize(mainNavigator, dim)


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

class displayHandler {

    

    
}


class docWindowHandler extends displayHandler {}


class listHandler extends displayHandler {

    constructor(){
        super()
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

    createDiv(id, styles){

        return d3.select('body')
            .append('div')
            .attr('id', id + "Div")
            .style('position', list.position)
            .style('left', list.left + "px")
            .style('top', list.top + "px")
            .style('width', styles.width + "px")
            .style('height', styles.height + 'px')
            .style('padding', styles.padding + 'px')
            .style('margin', styles.margin + 'px')
            .style('border-radius', styles.borderRadius + "px")
            .style('box-shadow', styles.boxShadow)
            .style('background-color', styles.backgroundColor)
            //.attr('font-family', 'arial')
            //.style('z-index', '1')
    }

    render(displayName, data){
        this.renderList(data, displayHandler.displays[displayName])    
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


        const text = enterSelection.selectAll('text')

        

        
        
        

        const enterPromise = text.transition()
            .delay((d, i) => {return i * 150})
            .duration(300)
            .attr('fill', 'black')
            .end()

        

        //console.log(this.transitionPromises)         
   
        

        //const updatePromise

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
                .style('text-anchor', d => {
                    if(d.header){return 'middle'}
                    else{return 'left'}
                    })
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
            const width = text.node().getBBox().width

            updatePromises.push(
                update.transition('tUpdateG')
                .delay(0)
                .duration(400)
                    .attr("transform", (d, i) => {return getTranslateString(width / 2 + 22.5, 20 * (i + 1) + 20)})
                    .end()
            )

            updatePromises.push(
                text.transition('tUpdateText')
                .duration(400)
                    .attr('font-weight', d => {
                        if(d.header){return 600}
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

        const gap = 20
        let x = 200

        if(!d.header){
            x = gap
        }
        const y = gap * (i + 1) + gap
        return getTranslateString(x, y)
        
    }


    


    seepInToBackgound(div){
        div.transition("tSeep").delay(0).duration(800)
            .style('background-color', 'lightyellow')
            .style('border-radius', '0px')
            .style('box-shadow', '0 0 0 rgba(0, 0, 0, 0)')

    }

    selectItem(){   
        const id = d3.select(this).attr('id')
        displayPlansSubMenu()
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
        this.styles = {
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
}

class svgHandler {
    
    
}

class containerHandler {


}

class container {

    createDiv(){
        this.div = d3.select('body')
            .append('div')
            .attr('id', this.id + "div")
            .style('position', 'fixed')
            .style('background-color', 'white')
            .style('border-radius', '20px')
            .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)')
            //.style('overflow-y', 'auto')
            .style('z-index', getDivCount() + 1)
            //.style('scrollbar-width', 'none')

    }

    createSVG(){
        this.svg = this.div.append('svg').attr('id', this.id + 'svg')
        //.attr('height', 200).attr('width', 200)
    }

    resize (width, height, delay, duration){
        this.div.transition("tSize").delay(delay).duration(duration)
            .style('width', width + 'px')
            .style('height', height + 'px')
    }

    reposition (left, top, delay, duration) {
        this.div.transition("tPosition").delay(delay).duration(duration)
            .style('left', left + 'px')
            .style('top', top + 'px')
    }

    renderSize(delay, duration){
        this.div.transition("tSize").delay(delay).duration(duration)
            .style('width', this.width + 'px')
            .style('height', this.height + 'px')
    }

    renderPosition(delay, duration){
        this.div.transition("tPosition").delay(delay).duration(duration)
            .style('left', this.left + 'px')
            .style('top', this.top + 'px')
    }

    

}


