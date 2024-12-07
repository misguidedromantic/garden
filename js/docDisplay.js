class docWindow {  
    static div = {}
    static svg = {}
    static position = 'absolute'
    static left = 2000
    static top = 200
    static width = 800
    static height = 800
    static padding = 12
    static margin = 0
    static fontFamily = 'tahoma'
    static backgroundColor = 'transparent'
    static borderTopStyle = 'solid'
}

class docWindowControl {

    constructor(){
        this.settings = new docWindowSettings
        this.rendering = new docWindowRendering
    }

    createDocWindow(){
        docWindow.div = this.rendering.createDiv()
    }

    loadDoc(doc){
        this.settings.setLoadedPosition()
        this.rendering.renderHTMLDoc(doc)
        this.rendering.slideIntoView(0, 400)
    }


}

class docWindowSettings {
    
    setLoadedPosition(){
        docWindow.left = 40
    }

}

class docWindowRendering {
    createDiv(){
        return d3.select('body')
            .append('div')
            .attr('id', 'docWindowDiv')
            .style('position', docWindow.position)
            .style('left', docWindow.left + 'px')
            .style('top', docWindow.top + 'px')
            .style('width', docWindow.width + 'px')
            .style('height', docWindow.height + 'px')
            .style('background-color', docWindow.backgroundColor)
            .style('border-top-style', docWindow.borderTopStyle)

    }

    renderHTMLDoc(htmlDoc){
        this.#appendHeader(htmlDoc.body, docWindow.div)
        this.#appendParagraphs(htmlDoc.body, docWindow.div)
    }

    #appendHeader(sourceElem, targetElem){
        console.log(targetElem)
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

    slideIntoView(delay, duration){
        docWindow.div.transition()
            .delay(delay)
            .duration(duration)
            .style('left', docWindow.left + 'px')
            .style('background-color', 'transparent') //#F5F5DC
    }

}



