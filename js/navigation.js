class destinationHandler {

    static getDestinations (){
        const data = this.#getDestinationData()
        return data.map(destData => new destination (destData))
    }

    static #getDestinationData(){
        return [
            {title: 'plans'},
            {title: 'concepts'}
        ]
    }
}

class destination {
    constructor(d){
        this.title = d.title
    }
}



