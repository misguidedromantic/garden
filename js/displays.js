

class display {
    cards = {}
    views = {}
    
    constructor(title){
        this.title = title
        this.id = title.replaceAll(' ','').toLowerCase()
        this.cards = new Map
        this.views = new Map
    }
}

class lifelineDisplay extends display {
    constructor(title){
        super(title)
    }
}

