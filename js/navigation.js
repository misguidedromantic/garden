let mainNavigator = {}

class container {

    constructor(id){
        this.id = id
    }

    createDiv(){
        this.div = d3.select('body')
            .append('div')
            .attr('id', this.id + "div")
            .style('position', 'fixed')
            .style('background-color', 'white')
            .style('border-radius', '20px')
            .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)')
    }

    createSVG(){
        this.svg = this.div.append('svg')
    }

    resize (width, height, delay, duration){
        this.width = width
        this.height = height

        this.div.transition("tSize").delay(delay).duration(duration)
            .style('width', width + 'px')
            .style('height', height + 'px')
    }

    reposition (left, top, delay, duration) {
        this.left = left
        this.top = top

        this.div.transition("tPosition").delay(delay).duration(duration)
            .style('left', left + 'px')
            .style('top', top + 'px')
    }

}

class navigator extends container {

    constructor(id){
        super(id)
        this.createDiv()
        this.createSVG()
    }

    getData(){
        return d3.selectAll('g.item').data()
    }

    renderInitialSize(){
        this.resize(this.width, this.height, 0, 0)
    }

    renderInitialPosition(){
        this.reposition(this.left, this.top, 0, 0)
    }


    renderItems(classText, data){

        function calculateTransformTranslate(d, i){
            const x = mainNavigator.width / 2
            let y = 20 * (i + 1)
            
            if(classText === 'item'){
                y = y + 20
            } else if (classText === 'subItem'){
                y = y + 40
            }

            return getTranslateString(x, y)
            
        }

        function calculateTextAnchor(){
            if(classText === 'item'){
                return 'middle'
            }
            else if(classText === 'subItem'){
                return 'left'
            }
        }
        
        function enterElements(){

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
                    .style('text-anchor', calculateTextAnchor)
                    .attr('fill', 'black')
                    .attr('y', - (14 / 2))
            }
        }


        function updateElements(){

            return function(update){
    
                if(update.empty()){
                    return
                }
    
                let text = update.select('text')
                let width = text.node().getBBox().width
    
                update.transition()
                    .delay(300)
                    .duration(600)
                        .attr("transform", (d, i) => {return getTranslateString(width / 2 + 20, 20 + 20 * (i + 1))})
            }
        }
    
        function exitElements(){
    
            return function(exit){
                
                exit.selectAll('text').each(function(){
                    let text = d3.select(this)
                    text.transition()
                        .duration(100)
                        .style('fill', 'grey')
                        .on("end", function() {
                            tweenTextRemovalAndColour(text, 200)
                        })
                    
                })
    
                exit.transition().delay(400).remove()
            }
    
        }

        this.svg.selectAll('g.' + classText)
            .data(data, d => d.title)
            .join(
                enterElements(),
                updateElements(),
                exitElements()
            )



    }

    renderSelectedItem(selection){ 
        const id = selection.attr('id')
        const items = mainNavigator.getData()
        const filtered = items.filter(item => item.title === id)
        const plans = getPlans()
        console.log(plans)
        this.renderItems('item', filtered)
        this.renderItems('subItem', plans)

        const width = (selection.select('text').node().getBBox().width + 40)
        const left = 50

        mainNavigator.resize(width, this.height, 300, 600)
        mainNavigator.reposition(left, this.top, 300, 600)
    }
}

class menuItem {
    constructor(title){
        this.title = title
    }
}

function setupNavigator (){


    const views = getViews()

    function sizeNavigator(){
        mainNavigator.width = window.innerWidth / 4
        mainNavigator.height = views.length * 20 + 40
        mainNavigator.renderInitialSize()
    }

    function positionNavigator(){
        mainNavigator.left = (window.innerWidth / 2) - (mainNavigator.width / 2)
        mainNavigator.top = 50
        mainNavigator.renderInitialPosition()
    }

    mainNavigator = new navigator ('mainNavigator')
    sizeNavigator()
    positionNavigator()
    mainNavigator.renderItems('item', views) 
}



function selectItem(){   
    mainNavigator.renderSelectedItem(d3.select(this))
}


function tweenTextRemovalAndColour(selection, duration) {
    const originalText = selection.text();
    const length = originalText.length;

    selection.transition()
      .duration(duration)
      .textTween(function() {
        return function(t) {
          const i = Math.floor((1 - t) * length);
          return originalText.slice(0, i);
        };
      })
      .on("end", function() {
        d3.select(this).text("");
      });

}
