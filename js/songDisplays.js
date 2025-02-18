class songSectionSquare {
    static render(svg, data){

        this.#renderDefaultSquares(svg)

/*         svg.selectAll('rect.song')
            .data(data)
            .join('rect')
            .attr('class','gab')
            .attr('id', d => d.id)
            .attr('x', 50)
            .attr('y', 50)
            .attr('height', 10)
            .attr('width', 10)
            .attr('fill', 'white')
            .attr('opacity', 0.5) */
    }

    static #renderDefaultSquares(svg){
        const structuring = new songStructuring
        const data = structuring.getDefaultStructure()
        console.log(data)
        svg.selectAll('rect.template')
            .data(data)
            .join('rect')
            .attr('class','template')
            .attr('id', d => 'template' + d.id)
            .attr('x', d => {
                const sequenceOfType = d.id.substring(d.id.search(/\d/))
                console.log(d.id)
                console.log(d.sequence)
                console.log(sequenceOfType)
                console.log(d.sequence - sequenceOfType)
                if((d.sequence - sequenceOfType) < sequenceOfType){
                    return sequenceOfType * 15 + 30
                } else if ((d.sequence - sequenceOfType) === sequenceOfType) {

                }
/*                 switch(d.constructor.name){
                    case 'verse':
                        return sequenceOfType * 15 + 30
                    case 'chorus':
                        return sequenceOfType * 15 + 30
                    case 'bridge':
                        return (sequenceOfType * 15) + (d.sequence) + 30
                } */


                
                //console.log(d.sequence)
                return sequenceOfType * 15 + 30
            })
            .attr('y', d => {
                switch(d.constructor.name){
                    case 'verse':
                        return 60
                    case 'chorus':
                        return 45
                    case 'bridge':
                        return 30
                }
            })
            .attr('height', 10)
            .attr('width', 10)
            .attr('fill', 'white')
            .attr('opacity', 0.5)

    }


}

class rectRendering {
    static render(svg, data, rectClass){
        svg.selectAll('rect.' + rectClass.constructor.name)
            .data(data)
            .join('rect')
            .attr('x', rectClass.x)
            .attr('y', rectClass.y)
            .attr('height', rectClass.height)
            .attr('width', rectClass.width)
            .attr('fill', rectClass.fill)
            .attr('opacity', rectClass.opacity)


    }
}

