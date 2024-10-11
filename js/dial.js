class dial {

    constructor(SVGcontainer, id, items){
        this.SVGcontainer = SVGcontainer
        this.id = id
        this.items = items
        this.#createG()
        this.#renderItems()

    }

    #createG(){
        this.g = this.SVGcontainer
            .append('g')
            .attr('class', 'dial')
            .attr('id', this.id)
            .on('click', this.onClick)
    }

    setPosition(x, y){
        this.g.attr("transform", getTranslateString(x, y))
    }

    alignRight(){
        this.g.selectAll('text')
            .attr('x', this.getWidestPoint() + 3)
            .attr("text-anchor", "end") 
    }

    getWidestPoint(){
        const textElements = this.g.selectAll('text')
        const widths = []         

        textElements.each(function() {
            const rawWidth = d3.select(this).node().getBBox().width
            const cleanWidth = parseInt(Math.round(rawWidth))
            widths.push(cleanWidth)
        });

        return d3.max(widths)
    }

    getSelectedItemIndex(){
        
        const index = this.items.findIndex(item => item.selected === true);

        console.log(index)

        if(index === -1){
            throw new error
        }

        return index
    }

    #renderItems(){

        let selectedIndex = undefined
        
        try {
            selectedIndex = this.getSelectedItemIndex();
        
        } catch {
            const firstTitle = this.items[0].title
            this.selectItem(firstTitle)
            return
        }
        
        function calculatePosition(d, i){

            let x = 0
            let y = 15

            if(i > selectedIndex){
                y = y + (i - selectedIndex) * 20
            } else if(i < selectedIndex){
                y = y + (selectedIndex - i) * -20
            }

            return getTranslateString(x, y)
        }

        function calculateFontWeight(d){
            if(d.selected){
                return 'bold'
            }else{
                return 'lighter'
            }
        }

        function enterElements(selection){
            selection.attr("id", d => d.title)
                .attr("transform", calculatePosition)

            selection.append('text')
                .text(d => d.title)
                .style('font-family', 'tahoma')
                .style('font-size', '14px')
                .style('font-weight', calculateFontWeight)
                .attr('y', 14 / 2)
        }

        function updateElements(selection){

            selection.transition()
                .duration(750)
                    .attr("transform", calculatePosition)

            selection.selectAll('text')
                .transition()
                .duration(750)
                    .style('font-weight', calculateFontWeight)
        }
        
        this.g.selectAll('g.' + this.id)
            .data(this.items)
            .join(
                enter => enter.append('g').call(enterElements),
                update => update.call(updateElements),
                exit => exit.remove()
            )
            
    }

    selectItem(title){
        
        this.items.forEach(item => {
            if(item.title === title){
                item.selected = true
            }else{
                item.selected = false
            }
          });

        this.#renderItems()

    }

    onClick(){

        const currentSelectedIndex = this.getSelectedItemIndex()
        let randomIndex = currentSelectedIndex
        
        do{
            randomIndex = Math.floor(Math.random() * this.items.length)
        } while (currentSelectedIndex === randomIndex);
        

        this.selectItem(this.items[randomIndex].title)
    }


}

