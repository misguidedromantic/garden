

class display {
    elements = {}
    
    constructor(title, type){
        this.title = title
        this.type = type
        this.id = this.createID(title, type)
        this.elements = new Map
    }

    createID(title, type){
        const capitalisedType = type.charAt(0).toUpperCase() + type.slice(1);
        return title + type
    }
}

