class list {

    constructor(name, items){
        this.name = name
        this.items = items
        this.setup()
        this.update()
    }

    setup(){
        this.setupDiv()
        this.setupCanvas()
        this.rendering = new listItemRendering()
    }

    setupDiv(){
        this.div = new div (this.name)
        const dimensions = this.getDivDimensions()
        this.div.resize(dimensions.width, dimensions.height)
    }

    setupCanvas(){
        const divElement = this.div.getElement()
        const dimensions = this.getCanvasDimensions()
        this.canvas = new canvas (this.name, divElement, dimensions)
    }

    getCanvasDimensions(){
        return {
            width: '100%',
            height: this.items.length * listItem.fontSize * 2 - listItem.padding
        }
    }

    getDivDimensions(){
        return {
            width: window.innerWidth / 2,
            height: this.calculateDivHeight()
        }
    }

    calculateDivHeight(){
        const scaledWindowHeight = window.innerHeight * 0.618
        const itemCount = Math.floor(scaledWindowHeight / (listItem.fontSize * 2))
        return itemCount * listItem.fontSize * 2 + listItem.padding * 3
    }


    update(items = this.items){
        this.rendering.render(this.canvas.getElement(), items)
    }


    getSelectedItemIndex(){
        return this.items.findIndex(item => item.selected === true)
    }

    selectItem(){
        
    }


}





