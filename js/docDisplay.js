class docWindow {  
    static div = {}
    static svg = {}
    static position = 'absolute'
    static left = 0
    static top = 0
    static width = 800
    static height = 800
    static padding = 12
    static margin = 0
    static fontFamily = 'tahoma'
    static backgroundColor = 'transparent'
    static borderTopStyle = 'solid'
    static loadedFileName = ''
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
        this.rendering.renderHTMLDoc(doc.htmlDoc)
        this.showWindow(doc.fileName)
    }

    unloadDoc(){
        //this.hideWindow()
        this.rendering.wipeHtml()
    }

    showWindow(fileName){
        this.settings.setToLoaded(fileName)
        this.rendering.slide(0, 400)
    }

    checkIfLoaded(fileName){
        return docWindow.loadedFileName === fileName ? true : false
    }


    hideWindow(){
        this.settings.setToHidden()
        this.rendering.slide(0, 400)
    }

}

class docWindowSettings {

    constructor(){
        this.setStartingPosition()
    }

    setToLoaded(fileName){
        this.#setFileName(fileName)
        this.#setLoadedPosition()
    }

    setToHidden(){
        docWindow.left = 2000
    }

    #setFileName(fileName){
        docWindow.loadedFileName = fileName
    }

    setStartingPosition(){
        docWindow.top = 20
        docWindow.left = 2000
    }
    
    #setLoadedPosition(){
        docWindow.top = navigatorWindow.height + navigatorWindow.top
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

    wipeHtml(){
        docWindow.div.innerHTML = ''
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

    slide(delay, duration){
        docWindow.div.style('top', docWindow.top + 'px')
            .transition()
            .delay(delay)
            .duration(duration)
            .style('left', docWindow.left + 'px')
            .style('background-color', 'transparent') //#F5F5DC
    }

}



