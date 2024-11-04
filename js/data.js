class view {
    constructor(title){
        this.title = title
        this.header = true
    }
}

function getViews(){
    return [
        new view ('plans'),
        new view ('concepts')
    ]

    
}

