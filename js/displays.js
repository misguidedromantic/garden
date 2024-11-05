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
    }

    #slideIntoView(targetDiv){
        targetDiv
            .transition()
            .duration(1000)
            .style('left', '0px')
            .style('background-color', 'transparent') //#F5F5DC
    }
    
    renderDocWindow(htmlDoc, targetElem = this.displays[1].div){
        this.#appendHeader(htmlDoc.body, targetElem)
        this.#appendParagraphs(htmlDoc.body, targetElem)
        this.#slideIntoView(targetElem)
    }

    renderNavigator(data, targetDisplay = this.displays[0]){
        const svgHndlr = new svgHandler(data, targetDisplay)
        
        
        
    }

}

class display {

    constructor(id){
        this.id = id
        //this.#createDiv()
    }

    #createDiv(){
        this.div = d3.select('body')
            .append('div')
            .attr('id', this.id + "Div")
            .style('position', 'absolute')
            .style('left', '2000px')
            .style('top', '0px')
            .style('width', '800px')
            .style('height', '800px')
            .style('padding', '12px')
            .style('margin', '0px')
            .attr('font-family', 'arial')
            .style('z-index', '1')
    }


}

class docWindow extends display {

    constructor(id){
        super(id)
        this.position = 'absolute'
        this.left = 2000
        this.top = 0
        this.width = 800
        this.height = 800
        this.padding = 12
        this.margin = 0
        this.fontFamily = 'arial'
        this.backgroundColor = 'transparent'
        this.#setupDiv()
    }

    #setupDiv(){
        const divHandler = new containerHandler 
        this.div = divHandler.createDiv(this.id)
    }

}

class list extends display {
    
    constructor(id){
        super(id)
        this.position = 'fixed'
        this.left = 2000
        this.top = 0
        this.width = 800
        this.height = 800
        this.padding = 12
        this.margin = 0
        this.fontFamily = 'tahoma'
        this.backgroundColor = 'white'
        this.borderRadius = 20
        this.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'
        this.#setupDiv()
        this.#setupSVG()
    }

    #setupDiv(){
        const divHandler = new containerHandler 
        this.div = divHandler.createDiv(this.id)
    }

    #setupSVG(){
        const svgHandler = new containerHandler 
        this.svg = svgHandler.createSVG(this.id, this.div)
    }

}

class containerHandler {

    constructor(){
        this.containers = []
    }

    createDiv(id, parentContainer = d3.select('body')){
        return parentContainer.append('div').attr('id', id + "div")
    }

    createSVG(id, parentContainer = d3.select('body')){
        return parentContainer.append('svg').attr('id', id + "div")
    }

    setDivStyles(){

    }

}

class svgHandler {
    
    renderList(data, targetDisplay){


        
        .selectAll('g.')
            .data(data, d => d.title)
            .join(
                enterElements(),
                updateElements(),
                exitElements()
            )
    }

    enterElements(){

        return function(enter){
            let groups = enter.append('g')
                .attr("id", d => d.title)
                .attr("class", classText)
                .attr("transform", (d, i) => {return calculateTransformTranslate(d, i)})
                .on("click", selectItem)
            
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

    seepInToBackgound(){
        this.div.transition("tSeep").delay(0).duration(800)
            .style('background-color', 'lightyellow')
            .style('border-radius', '0px')
            .style('box-shadow', '0 0 0 rgba(0, 0, 0, 0)')

    }

}

class div extends container {

    setStyles(display){

    }

}



class svg extends container {}