//data strucutres
class card {
    backgroundColour = 'transparent'
    textFill = 'white'

    constructor(id){
        this.id = id
        this.width = Math.round(window.innerWidth / gRatio)
        this.height = Math.round(this.width * 9 / 16)
    }
}

class titleCard extends card {
    constructor(id){
        super(id)
        this.words = []
        this.fontSize = 200
    }
}

class viewTitleCard extends titleCard {
    constructor(id){
        super(id)
        this.textFill = 'yellow'
    }
}

class canvasCard extends card {
    constructor(id){
        super(id)
    }
}


class menuCard extends card {
    constructor(id){
        super(id)
        this.items = []
        this.textFill = 'yellow'
        this.fontSize = 100
        this.height = this.fontSize
    }
}

//logic, settings
class cardSizing {
    defaultDimensions(card){ 
        const w = () => {return Math.round(window.innerWidth / gRatio)}
        const h = (width, apsectRatio) => {return Math.round(width * apsectRatio)}
        
        switch(card.constructor.name){
            case 'titleCard':
            case 'viewTitleCard':
                return {
                    width: w(),
                    height: h(w(), 9 / 16)
                }
            case 'canvasCard':
                return {
                    width: w() / gRatio / 2,
                    height: window.innerHeight - h(w(), 9 / 16)
                }
        }
    }
}

class cardPositioning {
    constructor(){
        this.gap = 15
    }

    calculateCoordinates(card, adjacentCards){
        return {
            top: this.top(card, adjacentCards.above),
            left: this.left(card, adjacentCards.left)
        }
    }

    top(card, cardAbove){
        
        if(cardAbove !== null){
            console.log(cardAbove.height)
            return cardAbove.top + cardAbove.height + this.gap
        }
        return this.gap 
    }
    
    left(card, cardToLeft){
        if(cardToLeft !== null){
            return cardToLeft.left + cardToLeft.width + this.gap
        } else if (card.constructor.name === 'viewTitleCard'){
            return window.innerWidth + this.gap
        }

        return this.gap
    }
}

//operations
class cardFactory {

    createCard(id, type = undefined){
        const card = this.#createObject(id, type)
        this.#createDomElements(card)
        return card
    }

    #createObject(id, type){
        switch(type){
            case 'title':
                return new titleCard(id)
            case 'viewTitle':
                return new viewTitleCard(id)
            case 'canvas':
                return new canvasCard(id)
            case 'menu':
                return new menuCard(id)
            default:
                return new card(id)
        }
    }

    #createDomElements(card){
        this.#addDiv(card)
        this.#addSvg(card)
    }

    #addDiv(card){
        card.div = d3.select('body')
            .append('div')
            .attr('id', card.id + 'Div')
            .style('position', 'absolute')
            .style('width', '80%')
            //.style('border-radius', '10px')
            .style('background-color', card.backgroundColour)
            //.style('box-shadow', '0px 0px 0px rgba(0, 0, 0, 0)')
    }

    #addCanvas(card){
        card.canvas = card.div.append('canvas')
            .attr('id', card.id + 'Canvas')

    }

    #addSvg(card){
        card.svg = card.div.append('svg')
            .attr('id', card.id + 'Svg')
    }

}

class cardController {
    constructor(){
        this.sizing = new cardSizing
        this.positioning = new cardPositioning
    }

    applyDefaultDimensions(card){
        const {width, height} = this.sizing.defaultDimensions(card)
        card.width = width, card.height = height
        card.div.style('width', width + 'px').style('height', height + 'px')
        card.svg.attr('width', width ).attr('height', height)
    }

    applyPosition(card, adjacentCards){
        const {left, top} = this.positioning.calculateCoordinates(card, adjacentCards)
        card.left = left, card.top = top
        card.div.style('left', left + 'px').style('top', top + 'px')
    }

    applyScaledDimensions(card){
        const scale = this.getScaleFactor(card)
        card.fontSize = card.fontSize * scale, card.height = card.fontSize * 2 + 30
        this.renderSizeChange(card)
    }

    applyContent(card, content){
        switch(card.constructor.name){
            case 'titleCard':
            case 'viewTitleCard':
                card.words = content
                this.renderText(card)
                this.applyScaledDimensions(card)
                this.renderText(card)
                break;
            case 'canvasCard':
                if(content !== null){
                    this.renderSongSquares(card, content)
                }
                
        }
    }

    renderSizeChange(card){
        card.div.style('width', card.width + 'px').style('height', card.height + 'px')
        card.svg.attr('width', card.width ).attr('height', card.height)
    }

    renderText(card){
        card.svg.selectAll('text')
            .data(card.words)
            .join(
                enter => enter.append('text')
                    .text(d => d)
                    .attr('id', d => d)
                    .style('fill', 'white')
                    .style('font-size', card.fontSize)
                    .attr('y', (d, i) => i * card.fontSize + card.fontSize),
                update => update.style('font-size', card.fontSize)
                    .attr('y', (d, i) => i * card.fontSize + card.fontSize),
                exit => exit
            )
    }

    renderSongSquares(card, songs){
        const columnCount = this.getColumnCount(card.width)
        const x = (i) => {return i % columnCount * 25}
        const y = (i) => {return (card.height) + Math.floor(i / columnCount) * - 25 - 25}

        card.svg.selectAll('rect')
            .data(songs)
            .join('rect')
            .attr('id', d => d.id)
            .attr('height', 20)
            .attr('width', 20)
            .attr('x', (d, i) => x(i))
            .transition()
                .duration(200)
                .delay((d,i) => i * 15)
                .attr('fill', 'green')
                .attr('y', (d, i) => y(i))
    }

    getColumnCount(containerWidth){
        const minColumnWidth = 20;
        const columnGap = 5;

        if (containerWidth < minColumnWidth) {
            return 0;
        }

        const numColumns = Math.floor((containerWidth + columnGap) / (minColumnWidth + columnGap));
        return numColumns;
    }

    getScaleFactor(card){
        const textDimensions = this.getTextDimensions(card)
        return Math.min(
                card.width / textDimensions.width, 
                card.height / textDimensions.height
            ) * 0.9
    }

    getTextDimensions(card){
        const textElems = card.svg.selectAll('text')
        let widestWidth = 0
        let height = 0
        
        textElems.each(d => {
            const elem = d3.select('#' + d)
            const bbox = elem.node().getBBox()
            if(bbox.width > widestWidth){
                widestWidth = bbox.width
                height = bbox.height
            }
        })

        return {
            height: height,
            width: widestWidth
        }

    }
}



