class destinationHandler {

    static getDestinations (){
        const data = this.#getDestinationData()
        return data.map(destData => new destination (destData))
    }

    static getSubLocations (destName){
        const data = this.#getDestinationData().find(dest => dest.title === destName).subLocations
        return data.map(subLocationData => new subLocation (subLocationData))
    }


    static #getDestinationData(){
        return [
            {title: 'plans', subLocations: planHandler.getPlans()},
            {title: 'concepts'}
        ]
    }



   
}

class destination {
    constructor(d){
        this.title = d.title
    }
}

class subLocation extends destination {
    constructor(d){
        super(d)
    }    
}



