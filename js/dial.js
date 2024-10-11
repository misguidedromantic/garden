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
        return this.items.findIndex(item => item.selected === true);
    }

    getDialColours(){
        if(this.id === "domain"){
            return {
                darkest: '#03657F',
                middle: '#89BACB',
                lightest: '#AFD1DE'
            }
        } else {
            return {
                darkest: '#A52243',
                middle: '#D78E9C',
                lightest: '#E7B5BE'
            }
        }

    }


    #renderItems(){

        const selectedIndex = this.getSelectedItemIndex();
        const dialColours = this.getDialColours()

        function getDistanceFromSelected(d, i){

            const gap = 20

            if (i > selectedIndex){
                return (i - selectedIndex) * gap
            } else if(i < selectedIndex){
                return (selectedIndex - i) * - gap
            } else {
                return 0
            }
        }

        function calculateY(d, i){
            let y = 40 + getDistanceFromSelected(d, i)
            return y
        }

        function calculateTranslate(d, i){
            const x = 0
            const y = calculateY(d, i)
            return getTranslateString(x, y)
        }

        function calculateFontSize(d, i){

            const absDist = Math.abs(getDistanceFromSelected(d, i))

            if (absDist >= 40){
                return '12px'
            } else if (absDist >= 20){
                return '13px' 
            } else if(absDist === 0){
                return '14px'
            }

        }

        function calculateFill(d, i){

            const absDist = Math.abs(getDistanceFromSelected(d, i))

            

            if (absDist >= 40){
                return dialColours.lightest
            } else if (absDist >= 20){
                return dialColours.middle
            } else if(absDist === 0){
                return dialColours.darkest
            }

        }

        function enterElements(classText){
            return function(enter){
                let groups = enter.append('g')
                    .attr("id", d => d.title)
                    .attr("class", classText)
                    .attr("transform", calculateTranslate)

                groups.append('text')
                    .text(d => d.title)
                    .style('font-family', 'tahoma')
                    .style('font-size', calculateFontSize)
                    .attr('fill', calculateFill)
                    .attr('y', 14 / 2)
            }
        }

        function updateElements(){
            return function(update){
                update.transition()
                    .duration(500)
                    .ease(d3.easeCubicOut)
                    .attr("transform", calculateTranslate)

                update.select('text').transition()
                    .duration(500)
                    .ease(d3.easeCubicOut)
                    .attr('fill', calculateFill)
                    .style('font-size', calculateFontSize)
            }
        }

        function exitElements(){
            return function(exit){
                exit.remove()
            }
        }

        this.g.selectAll('g.' + this.id)
            .data(this.items, d => d.title)
            .join(
                enterElements(this.id),
                updateElements(),
                exitElements()
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

    getRandomItemTitle(){
        const selectedIndex = this.getSelectedItemIndex();
        let randomIndex = selectedIndex
        
        do{
            randomIndex = Math.floor(Math.random() * this.items.length)
        } while (selectedIndex === randomIndex);

        return this.items[randomIndex].title
    }

}

function selectRandomItem(){

    const dials = [
        personaDial,
        domainDial
    ]

    const dialToMove = dials[Math.floor(Math.random() * 2)]

    const randomDialItemTitle = dialToMove.getRandomItemTitle()

    dialToMove.selectItem(randomDialItemTitle)

}

