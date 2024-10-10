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
            let y = 0

            if(i > selectedIndex){
                y = (i - selectedIndex) * 20
            } else if(i < selectedIndex){
                y = (selectedIndex - i) * -20
            }

            return getTranslateString(x, y)
        }

        function enterElements(selection){
            selection.attr("id", d => d.title)
                .attr("transform", calculatePosition)

            selection.append('text')
                .text(d => d.title)
                .style('font-family', 'tahoma')
                .style('font-size', '14px')
                .attr('y', 14 / 2)
        }
        
        this.g.selectAll('g.' + this.id)
            .data(this.items)
            .join(
                enter => enter.append('g').call(enterElements),
                update => update.attr('transform', calculatePosition),
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


}