class displayHandler {

    constructor() {
        this.displays = []
        this.#loadDisplays()
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

    getDisplay(id){
        return this.displays.find(disp => disp.id === id)
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

    createDiv(id, styles){
        return d3.select('body')
            .append('div')
            .attr('id', id + "Div")
            .style('position', styles.position)
            .style('left', styles.left + "px")
            .style('top', styles.top + "px")
            .style('width', styles.width + "px")
            .style('height', styles.height + 'px')
            .style('padding', styles.padding + 'px')
            .style('margin', styles.margin + 'px')
            //.attr('font-family', 'arial')
            //.style('z-index', '1')
    }

    createSVG(parentContainer, id){
        return parentContainer.append('svg')
            .attr('id', id + 'Svg')

    }

}


class listHandler {


    renderList(data, list){

        list.svg.selectAll('g')
            .data(data, d => d.title)
            .join(
                this.enterElements(),
                this.updateElements(),
                this.exitElements()
            )
    }

    enterElements(){

        
        let fnSelectItem = this.selectItem
        let fnGetTranslate = this.calculateTransformTranslate

        return function(enter){

            let groups = enter.append('g')
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
                .transition('tEnterText')
                .delay((d, i) => {return i * 150})
                .duration(400)
                .attr('fill', 'black')
        }
    }

    updateElements(){

        return function(update){

            if(update.empty()){
                return
            }

            let text = update.select('text')
            let width = text.node().getBBox().width

            update.transition('tUpdateG')
                .delay(0)
                .duration(400)
                    .attr("transform", (d, i) => {return getTranslateString(width / 2 + 22.5, 20 * (i + 1) + 20)})

            text.transition('tUpdateText')
                .duration(400)
                    .attr('font-weight', d => {
                        if(d.header){return 600}
                        else {return 300}
                    })

        }
    }

    exitElements(){

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


    resize (list, dimensions){
        list.div.transition("tSize").delay(100).duration(500)
            .style('width', dimensions.width + 'px')
            .style('height', dimensions.height + 'px')
    }

    reposition (list, position) {
        list.div.transition("tPosition").delay(100).duration(500)
            .style('left', position.left + 'px')
            .style('top', position.top + 'px')
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
    constructor(id){
        this.id = id
        this.styles = {
            position: 'fixed',
            left: 60,
            top: 0,
            width: 800,
            height: 800,
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


