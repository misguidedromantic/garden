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

class parterre extends display {
    constructor(title){
        super(title)
    }
}

class recordDisplay extends display {

    constructor(title){
        super(title)
    } 
}

