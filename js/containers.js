class SVGcanvas{

    constructor(id, div){
        this.id = id
        this.div = div
        this.#createSVG()
    }

    #createSVG(){
        
        function convertDivDimension(str){
            const index = str.indexOf("px");
            const number = parseInt(str.slice(0, index))
            console.log(str)
            console.log(number)
            return number
        }
    
        this.element = this.div.append('svg')
            .attr('id', this.id)
            .attr('width', convertDivDimension(this.div.style('width')))
            .attr('height', convertDivDimension(this.div.style('height')))

    }

}