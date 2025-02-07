window.onload = async function(){
    await loadData()
    setupDisplays()
    loadDisplays()
}

async function loadData(){
    return songsDataHandling.load()
}

function setupDisplays(){
    displayFactory.createDisplay('songStructures')
}

function loadDisplays(){
    displayOrchestration.load('songStructures', songsDataHandling.getSongs())
}






