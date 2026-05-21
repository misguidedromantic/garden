//events
window.onload = () => {
    const displayOrchestrator = new DisplayOrchestrator()
    displayOrchestrator.requestView('WikiPage')
}


class DisplayOrchestrator {
        viewController    

        requestView(viewType, contentSelection = null){
            switch(viewType){
                case 'WikiPage':
                    this.viewController = new WikiController()
            }

            this.viewController.processRequest(contentSelection)
        }

        
}

class WikiController {
    constructor(){
        this.notesModel = new NotesModel()
    }

    processRequest(requestedNoteTitle){
        this.clearCurrentNote()
        this.loadNewNote(requestedNoteTitle)
        
    }

    clearCurrentNote(){
        d3.select('article').html('')
    }

    async loadNewNote(requestedNoteTitle){
        const title = requestedNoteTitle ?? this.notesModel.randomNoteTitle
        const noteModel = await this.composeNoteModel(title)
        const navModel = this.composeNavModel()
        const view = this.composeView()
        this.renderNote(noteModel, view)  
        this.renderNav(navModel, view)
    }

    async composeNoteModel(title){

        const notePath = () => {
            return './docs/' + title + '.html'
        }

        const htmlDoc = () => {
            const loader = new HtmlDocLoader()
            return loader.getDoc(notePath())
        }

        const formattedNote = (htmlDoc) => {
            const transformer = new DocTransformer()
            return transformer.createNote(htmlDoc, title)
        }

        return formattedNote(await htmlDoc())
    }

    composeNavModel(){
        const model = []
        const options = ['Random Note','List']
        for(let i = 0; i < options.length; i++){
            model.push(new NavOption(options[i]))
        }
        return model
    }

    composeView(){
        const composer = new ViewComposer(
            new WikiStructure(),
            new WikiLayout(),
            new WikiStyling()
        )

        const {structure, layout, styling} = {
            structure: composer.structure, 
            layout: composer.layout, 
            styling: composer.styling
        }

        const setupArticle = () => {
            structure.article
                .style('background-color', styling.backgroundColour)
                .style('padding', layout.padding + 'px')
                .style('margin', layout.margin + 'px')
        }

        const setupNav = () => {
            structure.nav
                .style('background-color', styling.navStyling.backgroundColour)
                .style('border-radius', styling.borderRadius + 'px')
                .style('box-shadow', styling.boxShadow)
                .style('position', layout.navLayout.position)
                .style('padding', layout.navLayout.padding + 'px')
                .style('width', layout.navLayout.width + 'px')
                .style('height', layout.navLayout.height + 'px')
                .style('top', layout.navLayout.top + 'px')
                .style('left', layout.navLayout.left + 'px')
        }

        setupArticle()
        setupNav()
        return structure
    }

    renderNote(model, structure){

        const renderer = new LineRenderer()
 
        model.lines.forEach(line => {
            renderer.setStrategy(new RenderStrategy(line.constructor.name))
            renderer.renderLine(structure, line, this)
        })

    }

    renderNav(model, structure){

        const renderer = new LineRenderer()
        renderer.setStrategy(new NavOptionStrategy())

        model.forEach(line => {
            renderer.renderLine(structure, line, this)
        })
    }

}

class NavOption {
    constructor(text, fnToCall = null){
        this.text = text
        this.fnToCall = fnToCall
    }
}

//fetch data
//format payload data into model
//style elements
//render elements


function handleNoteLinkClick(elem, controller){

    const isExternalLink = () => {
        return elem.attr('href').substring(0, 4) === 'http'
    }

    const isValidInternalLink = () => {
        return elem.attr('href').substring(0, 2) === './'
    }

    const getTitleFromHref = (link) => {
        link = link.substring(2, link.length - 5)
        return link.replaceAll('%20', ' ').replaceAll('%',' ')
    }

    if(isExternalLink()){
        window.open(elem.attr('href'), '_blank')
    } else if(isValidInternalLink()){
        controller.requestView('WikiPage', getTitleFromHref(elem.attr('href')))
    } else {
        console.error('invalid link: ' + elem.attr('href'))
    }
}

class ViewComposer {
    constructor(structure, layout, styling){ 
        this.structure = structure
        this.layout = layout
        this.styling = styling
    }
}

class Styling {
    constructor(){
        this.colours = new ColourPalette()
    }

    get borderRadius () {
        return 6
    }

    get boxShadow () {
        return this.boxShadowLayers.join(', ')
    }

    get boxShadowLayers(){
        return [
            '0px -0.4px 0.5px hsl(' + this.shadowColour + ' / 0.36)',
            '0px -1.3px 1.5px -0.8px hsl(' + this.shadowColour + ' / 0.36)',
            '0px -3.4px 3.8px -1.7px hsl(' + this.shadowColour + ' / 0.36)',
            '0px -8.2px 9.2px -2.5px hsl(' + this.shadowColour + ' / 0.36)'
        ]
    }

    get shadowColour () {
        return '0deg 0% 60%'
    }

    get backgroundColour(){
        return '#F5F5F5'
    }
}

class WikiStyling extends Styling {

    get navStyling(){
        return new NavStyling()
    }

}

class NavStyling extends Styling {
    get backgroundColour(){
        return 'rgba(128, 128, 128, 0.38)'
    }
}

class ListStyling extends Styling {
    
    get backgroundColour(){
        return '#E2E2E2'
    }
}

class Structure {
    #siteNav = null
    #main = null

    get body(){
        return d3.select('body')
    }

    get main() {
        if(this.#main === null){
            this.#main = this.getSelection('main')
        }
        return this.#main
    }

    get siteNav() {
        if(this.#siteNav === null){
            this.#siteNav = this.getSelection('nav')
        }
        return this.#siteNav
    }

    getSelection(selector, parentSelection = this.body){
        const selectFromDom = () => {
            const selection = parentSelection.select(selector)
            if(selection.empty()){
                throw new Error('main element not found')
            }
            return selection
        }

        const createOnDom = () => {
            return parentSelection.append(selector)
        }

        try{return selectFromDom()}
        catch{return createOnDom()}
    }
}

class WikiStructure extends Structure {
    #article = null
    #list = null
    #nav = null
    #section = null

    get article() {
        if(!this.#article){
            this.#article = this.getSelection('article', this.main)    
        }
        return this.#article
    }

    get list() {
        if(!this.#list){
            this.#list = this.getSelection('ul', this.section)
        }
        return this.#list
    }

    get section() {
        if(!this.#section){
            this.#section = this.getSelection('section', this.article)
        }

        return this.#section
    }


    get nav(){
        if(!this.#nav){
            this.#nav = this.getSelection('nav', this.main)
        }
        return this.#nav
    }


    createSection(){
        this.endCurrentList()
        this.#section = this.article.append('section')
    }

    endCurrentList(){
        this.#list = null
    }
}

class ListStructure extends Structure {

}

class Layout {
    constructor(){
        this.grid = new Grid()
    }

    get position(){
        return 'relative'
    }

    get spacing(){
        return this.grid.cellSize
    }

    get left(){
        return this.grid.columnWidth
    }

    get top(){
        return this.grid.rowHeight
    }

    get zIndex(){
        return 0
    }

    get width(){
        return 'min(100% - 3rem, 75ch)'
    }

    get height(){
        return window.innerHeight - 8 * this.grid.cellSize
    }

    get margin (){
        return this.grid.margin
    }

    get padding (){
        return this.grid.padding
    }

}

class WikiLayout extends Layout {
    get navLayout(){
        return new NavLayout()
    }

    get width(){
        const ch = (fontSize, ratio = 0.618) => {
            return Math.floor(fontSize * ratio)
        }

        return Math.floor(ch * 75)
    }
}

class NavLayout extends Layout {
    get position(){
        return 'fixed'
    }

    get width(){
        return this.grid.columnWidth
    }

    get height(){
        return this.grid.rowHeight
    }

    get top(){
        return 0
    }

    get left(){
        return this.grid.margin
    }
}

class ListLayout extends Layout {

}

class LineRenderer {

    #strategy

    setStrategy(strategy){
        this.#strategy = strategy
    }

    renderLine(doc, line, wiki){
        if(!this.#strategy){
            throw new Error ('render strategy not set')
        }

        this.#strategy.render(doc, line, wiki)
    }

} 

class RenderStrategy {

    constructor(lineType){
        switch(lineType){
            case 'LineBreak':
                return new LineBreakStrategy()
            case 'P':
                return new PStrategy()
            case 'Bullet':
                return new BulletStrategy()
            case 'Heading':
                return new HeadingStrategy()
        }
    }

    renderWithAnchor(elem, line, wiki){
        elem.html(this.htmlString(line.text, line.a))
        this.configureAnchor(elem, wiki)
    }

    htmlString(elemText, anchor){
        const splitAnchor = (i) => {
                return {
                    preAnchor: elemText.substring(0, i), 
                    postAnchor: elemText.substring(i).replace(anchor.text, '')
                }
            }

        const anchorString = () => {
            return '<a href=' + anchor.url + '>' + anchor.text + '</a>'
        }

        const {preAnchor, postAnchor} = splitAnchor(elemText.indexOf(anchor.text))
        return preAnchor + anchorString() + postAnchor
    }

    configureAnchor(elem, wiki){
        elem.select('a')
            .on('click', function(event){
                event.preventDefault()
                handleNoteLinkClick(d3.select(this), wiki)
            })
    }

}

class LineBreakStrategy extends RenderStrategy {
    render(doc, line){
        doc.createSection()
    }
}

class PStrategy extends RenderStrategy {
    render(doc, line, wiki){
        const p = doc.section.append('p')
        try{this.renderWithAnchor(p, line, wiki)}
        catch{p.text(line.text)}
    }
}

class BulletStrategy extends RenderStrategy {
    render(doc, line, wiki){
        const li = doc.list.append('li')
        try{this.renderWithAnchor(li, line, wiki)}
        catch{li.text(line.text)}
    }
}

class HeadingStrategy extends RenderStrategy {
    render(doc, line){
        doc.createSection()
        doc.section.append('h' + line.level).text(line.text)
    }
    
}

class NavOptionStrategy extends RenderStrategy {
    render(doc, line){
        doc.nav.append('span').text(line.text)
    }
}

//model - notes
class NotesModel {

    #notes = null

    constructor(){
        this.#notes = new Map()
    }

    get titles(){
        return [
            'Statement of intent',
            'song genealogy',
            'Test note 1',
            'Test note 2'
        ]
    }

    get notes(){
        return Array.from(this.#notes.values())
    }

    get activeNote(){
        this.notes.find(note => (note.active))
    }

    get activeNoteTitle(){
        try{return this.activeNote.title}
        catch{return null}
    }

    get randomNoteTitle(){
        const randomIndex = () => {
            return Math.floor(Math.random() * this.titles.length)
        }
        return this.titles[randomIndex()]
    }

    get randomNote(){
        return this.getNote(this.randomNoteTitle)
    }

    async loadData(){
        const noteLoader = new NoteLoader(new HtmlConvertor())
        for(let i = 0; i < this.titles.length; i++){
            const title = this.titles[i]
            this.#notes.set(title, await noteLoader.load(new Note(title)))
        }
        return Promise.resolve()
    }

    getNote (title){
        return this.#notes.get(title)
    }

    activate(title){
        switch(this.activeNoteTitle){
            case title:
                return
            default:
                this.deactivate(this.activeNote)
            case null:
                this.getNote(title).active = true

        }
    }

    deactivate(title){
        this.getNote(title).active = false
    }

}

class Note {
    constructor(title){
        this.id = title.replaceAll(' ','')
        this.title = title
        this.lines = undefined
        this.selected = false
        this.creationDate = undefined
    }
}

class HtmlDocLoader {

    async getDoc(path){
        const parser = new DOMParser()
        const htmlString = await this.getHtmlString(path)
        return Promise.resolve(parser.parseFromString(htmlString, 'text/html'))
    }

    async getHtmlString(path){
        const response = await fetch(path)
        return response.text()
    }
}

class DocTransformer {
    createNote(htmlDoc, title){
        const note = new Note(title)
        note.creationDate = this.getCreationDate(htmlDoc)
        note.lines = this.getLines(htmlDoc)
        return note
    }

    getCreationDate(htmlDoc){      
        const htmlElement = d3.select(htmlDoc).selectAll('meta').filter(function(){
            return d3.select(this).attr('name') === 'created'
        })

        return new Date(htmlElement.attr('content'))
    }

    getLines(htmlDoc){
        const lines = []
            
        const getLine = (elem) => {
            const tag = elem.node().tagName.toLowerCase()  
        
            switch(tag){
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                    return new Heading(lines.length, elem)
                case 'li':
                    return new Bullet(lines.length, elem)
                case 'p':
                    return new P(lines.length, elem)
                default:
                    throw new Error('incompatible elem type')
            }
        }

        const selection = d3.select(htmlDoc)
            .select('body')
            .selectAll('h1, h2, h3, h4, h5, h6, li, p')

        selection.each(function(){
            try{lines.push(getLine(d3.select(this)))}
            catch{return}
        })
    
        return lines
    }
}

class HtmlConvertor {

    async getDoc(path){
        const parser = new DOMParser()
        const htmlString = await this.getHtmlString(path)
        return Promise.resolve(parser.parseFromString(htmlString, 'text/html'))
    }

    async getHtmlString(path){
        const response = await fetch(path)
        return response.text()
    }

}

class NoteLoader {
    constructor(){
        this.htmlConverter = new HtmlConvertor()
    }

    async load(note){
        const path = './docs/' + note.title + '.html'
        const doc = await this.htmlConverter.getDoc(path)
        this.setProperties(note, doc)
        return note
    }



    setProperties(note, doc){

        const getCreationDate = () => {
            
            const selection = d3.select(doc).selectAll('meta').filter(function(){
                return d3.select(this).attr('name') === 'created'
            })

            return new Date(selection.attr('content'))
        }

        const getLines = () => {
            const lines = []
            
            const getLine = (elem) => {
                const tag = elem.node().tagName.toLowerCase()  
            
                switch(tag){
                    case 'h1':
                    case 'h2':
                    case 'h3':
                    case 'h4':
                    case 'h5':
                    case 'h6':
                        return new Heading(lines.length, elem)
                    case 'li':
                        return new Bullet(lines.length, elem)
                    case 'p':
                        return new P(lines.length, elem)
                    default:
                        throw new Error('incompatible elem type')
                }
            }

            const selection = d3.select(doc)
                .select('body')
                .selectAll('h1, h2, h3, h4, h5, h6, li, p')

            selection.each(function(){
                try{lines.push(getLine(d3.select(this)))}
                catch{return}
            })
        
            return lines
        }

        note.creationDate = getCreationDate()
        note.lines = getLines()
    
    }
}

class A {
    constructor(a){
        this.url = this.isValidUrl(a.attr('href'))
        this.text = a.text()
    }

    isValidUrl(url){
        console.log(url)
        return url
    }
}

class Line {
    constructor(lineNumber, elem = null){
        if(!this.isValid(elem)){
            throw new Error ('invalid line')
        }

        this.number = lineNumber
        this.addText(elem)
        this.addProps(elem)
    }

    get id (){
        return this.constructor.name + this.number
    }

    isValid(){
        return true
    }

    addText(elem){
        this.text = elem.text()
    }

    addProps(elem){
        try{this.a = this.getA(elem)}
        catch{this.a = null}
    }

    getA(elem){
        return new A(elem.selectAll('a'))
    }
    
}

class P extends Line {
    isValid(elem){
        return !this.isHashtag(elem.text())
    }

    isHashtag(text){
        return text.substring(0, 1) === '#'
    }

}

class Bullet extends Line {
/*     addText(elem){
        this.text = String.fromCharCode(8226) + ' ' + elem.text()
    } */
}

class Heading extends Line {
    addProps(elem){
        this.addLevel(elem)
    }

    addLevel(elem){
        const tag = elem.node().tagName.toLowerCase()
        this.level = tag.substring(1)
    }
}

//model - songs
class Songs {
    #songs = null

    async loadData(){
        const data = await d3.csv('./data/songs.csv')
        this.#songs = data.map(d => new Song (d))
        return Promise.resolve(this.songs)
    }

    get songs(){
        return this.#songs
    }
}

class Song {
    constructor(d){
        this.id = d.short_title
        this.title = d.title
        this.releaseId = d.release_id
        this.selected = false
    }

    get lyrics(){
        return [
            new Line("I'm a doll and nothing more"),
            new Line("deny all my rights"),
            new Line("adore me and I'll want to be in your bed tonight"),
            new Line("it takes so much to remain this high"),
            new Line("I keep on taking, still I need you to try"),
            new Line("cause when you're open I can feed off attention"),
            new Line("your eyes trained on mine (on mine)")
        ]   
    }
}

//view - element data structures
class Display {
    #active = false
    data = null

    constructor(data){
        this.data = data
    }

    get isActive(){
        return this.#active
    }

    activate(){
        this.loadElements()
        this.#active = true
    }

}

class ListDisplay extends Display {

    #header
    #accordion

    get accordion (){
        if(this.#accordion === undefined){
            return new Accordion(this.data, this)
        }
    }

    get header (){
        if(this.#header === undefined){
            return new DisplayHeader(this.headerText, this)
        }
    }

    get layout(){
        return {
            DisplayHeader: {column: 1, row: 1},
            Accordion: {column: 1, row: 2}
        }
    }

    loadElements(){
        this.header.load()
        this.accordion.load()
    }

}

class NotesList extends ListDisplay {
    
    get headerText(){
        return 'notes'
    }


}

class ColourPalette {
    get captionText(){
        return '#6E7271'
    }

    get main(){
        return '#384D48'
    }

    get backgroundRaised (){
        return '#E2E2E2'
    }
}

class Colours {
    static get palette (){
        return {
            caption: '#6E7271',
            captionReverse: '#D8D4D5',
            main: '#384D48',
            mainReverse: '#F5F5F5',


        }
    }
    
    static get captionText(){
        return '#6E7271'
    }

    static get main(){
        return '#384D48'
    }

    static get backgroundRaised (){
        return '#E2E2E2'
    }
}

class Grid {

    #cellSize = 16

    constructor() {
        this.minCellsPerColumn = 4
        this.breakpoints = { mobile: 500, tablet: 1000 }
        this.columnMap = { mobile: 4, tablet: 8, desktop: 12 }
        this.gutterMap = { mobile: this.#cellSize / 4, tablet: this.#cellSize / 2, desktop: this.#cellSize}
        this.marginMap = { mobile: this.#cellSize, tablet: this.#cellSize * 2, desktop: this.#cellSize * 4}
        this.paddingMap = { mobile: this.#cellSize / 4, tablet: this.#cellSize / 2, desktop: this.#cellSize}
    }

    get deviceType() {
        const width = window.innerWidth
        if (width < this.breakpoints.mobile) return 'mobile'
        if (width < this.breakpoints.tablet) return 'tablet'
        return 'desktop'
    }


    get availableWidth(){
        return window.innerWidth - this.margin * 2 - this.padding * 2 - this.#cellSize
    }

    get columnCount() {
        return this.columnMap[this.deviceType]
    }

    get columnWidth() {
        return this.totalColumnWidth / this.columnCount
    }

    get gutterWidth() {
        return this.gutterMap[this.deviceType]
    }

    get margin(){
        return this.marginMap[this.deviceType]
    }

    get maxCellsPerRow(){
        return this.usableWidth / this.#cellSize
    }

    get overHang(){
        return this.availableWidth % this.#cellSize
    }

    get totalColumnWidth(){
        return this.usableWidth - this.totalGutterWidth    
    }

    get totalGutterWidth() {
        return this.gutterWidth * (this.columnCount - 1)
    }

    get usableWidth() {
        return this.availableWidth - this.overHang
    }

    get padding() {
        return this.paddingMap[this.deviceType]
    }

    get rowHeight(){
        return this.#cellSize
    }

    spanWidth(columnCount){
        return columnCount * this.columnWidth
    }

    offsetWidth(columnCount){
        return this.spanWidth(columnCount) + this.gutterWidth
    }

}

class Element {
    #gridCoordinates = {}

    constructor(data, parent = null){
        this.parent = parent
        this.data = data
        this.grid = new Grid()
        this.dynamics = new ElementDynamics()
    }

    get spacing(){
        return this.grid.cellSize
    }

    get left(){
        return (this.#gridCoordinates.column - 1) * this.grid.columnWidth
    }

    get top(){
        return (this.#gridCoordinates.row - 1) * this.grid.rowHeight
    }

    get width(){
        return this.grid.usableWidth
    }

    get height(){
        return window.innerHeight - 8 * this.grid.cellSize
    }

    get backgroundColour(){
        return '#F5F5F5'
    }

    get margin (){
        return this.grid.margin
    }

    get padding (){
        return this.grid.padding
    }

    get borderRadius () {
        return 6
    }

    get boxShadow () {
        return this.boxShadowLayers.join(', ')
    }

    get boxShadowLayers(){
        return [
            '0px -0.4px 0.5px hsl(' + this.shadowColour + ' / 0.36)',
            '0px -1.3px 1.5px -0.8px hsl(' + this.shadowColour + ' / 0.36)',
            '0px -3.4px 3.8px -1.7px hsl(' + this.shadowColour + ' / 0.36)',
            '0px -8.2px 9.2px -2.5px hsl(' + this.shadowColour + ' / 0.36)'
        ]
    }

    get shadowColour () {
        return '0deg 0% 60%'
    }

    get position(){
        return 'relative'
    }

    get parentElement(){
        try{return this.parent.div}
        catch{return d3.select('body')}
    }

    get zIndex(){
        return 0
    }

    load(){
        this.initializeDomElements()
        this.renderContent()
        this.dynamics.resize(this)
    }


    setCoordinates(row = 1, column = 1){
        this.#gridCoordinates = {row: row, column: column}
    }

    initializeDomElements() {
        this.div = this.addDiv()
        this.svg = this.addSvg()
    }

    addDiv() {
        return this.parentElement.append('div')
            .attr('class', this.constructor.name.toLowerCase())
            .style('position', this.position)
            .style('margin', this.margin + 'px')
            .style('left', this.left + 'px')
            .style('top', this.top + 'px')
            .style('padding', this.padding + 'px')
            .style('width', this.width + 'px')
            .style('height', this.height + 'px')
            .style('overflow', 'hidden')
            .style('border-radius', this.borderRadius + 'px')
            .style('box-shadow', this.boxShadow)
            .style('background-color', this.backgroundColour)
    }

    addSvg() {
        return this.div.append('svg')
            .attr('class', this.constructor.name.toLowerCase())
            .attr('width', this.width)
            .attr('height', this.height)
            
    }

    move(transitionDuration = 0){
        this.div.transition('tMoveDiv')
            .duration(transitionDuration)
                .style('left', this.left + 'px')
                .style('top', this.top + 'px')
    }

    recolour(t){
         return this.div.transition(t)
            .style('background-color', this.backgroundColour)
        .end()

    }

    renderContent(){}

}

class Accordion extends Element {
    //margin: top right bottom left
    get margin(){
        return '0px ' + this.grid.margin + 'px ' + this.grid.margin + 'px ' + this.grid.margin
    }

    get backgroundColour(){
        return '#E2E2E2'
    }

    get expandedItemOffset(){
        return this.selectedItem ? AccordionItem.heightExpanded - AccordionItem.dividerHeight : 0
    }

    get selectedItem(){
        return this.data.find(item => item.selected)
    }

    get selecteItemIndex(){
        return this.data.findIndex(item => item.selected)
    }

    get selectedItemYCoordinate(){
        return this.getItemYCoordinate(this.selecteItemIndex)
    }

    get height(){
        return this.data.length * AccordionItem.heightCollapsed + this.expandedItemOffset
    }

    getItemYCoordinate(index){
        return index * AccordionItem.heightCollapsed
    }

    select(item){
        item.selected = true
    }
    
    deselect(item){
        item.selected = false
    }


    async update(clickedItem, transitionDuration){

        const thisItemRendering = new AccordionItemRendering(clickedItem, this)

        switch(this.selectedItem){
            case clickedItem:
                clickedItem.selected = false
                break;
            default:
                const previousItem = this.selectedItem
                this.deselect(previousItem)
                const previousItemRendering = new AccordionItemRendering(previousItem, this)
                previousItemRendering.render()
            case undefined:
                this.select(clickedItem)
        }

        thisItemRendering.render()        

    }


    toggleSelection(clickedItem){
        switch(this.selectedItem){
            case clickedItem:
                this.deselect(clickedItem)
                break;
            default:
                this.deselect(this.selectedItem)
            case undefined:
                this.select(clickedItem)
        } 
    }

    setItemConfiguration(){
        AccordionItem.cellSize = this.grid.cellSize
        AccordionItem.accordionWidth = this.width
        AccordionItem.columnWidth = this.grid.columnWidth
        AccordionItem.gutterWidth = this.grid.gutterWidth
    }

    renderContent(transitionDuration = 0){
        const accordion = this
        this.setItemConfiguration()

        accordion.svg.selectAll('g')
            .data(accordion.data, d => d.id)
            .join(
                enter => accordion.enterItems(enter, accordion),
                update => accordion.updateItems(update, accordion, 350),
                exit => exit
            )
    }

    enterItems(selection, accordion){

        let g = null
        let gHeader = null
        let gContent = null

        const createItemObjects = () => {}

        const createSvgGroups = () => {
            g = selection.append('g').attr('id', d => d.id)
            gHeader = g.append('g').attr('class', 'itemHeader')
            gContent = g.append('g').attr('class', 'itemContent')
        }

        const positionGroups = () => {
            g.attr('transform', (d, i) => {
                const {x, y} = { x: 0, y: i * AccordionItem.heightCollapsed}
                return 'translate(' + x + ',' + y + ')'
            })
        }

        const attachEventHandlers = () => {
            gHeader.on('mouseover', function(){
                const item = d3.select(this)
                item.select('rect.item').attr('fill', '#6E7271')
                item.select('text.main').attr('fill', '#F5F5F5')
                item.select('text.caption').attr('fill', '#D8D4D5')
            })
            .on('mouseout', function(){
                const item = d3.select(this)
                item.select('rect.item').attr('fill', 'transparent')
                item.select('text.main').attr('fill', '#384D48')
                item.select('text.caption').attr('fill', '#6E7271')
            })
            .on('click', function(event, d){
                const item = d3.select(this)
                item.select('rect.item').attr('fill', 'transparent')
                item.select('text.main').attr('fill', '#384D48')
                item.select('text.caption').attr('fill', '#6E7271')
                accordion.update(d, 350)
            })
        }

        const renderGraphics = () => {
            
            const itemBackgroundRectangles = () => {
                gHeader.append('rect')
                    .attr('class', 'item')
                    .attr('width', AccordionItem.rectWidth)
                    .attr('height', AccordionItem.rectHeightCollapsed)
                    .attr('y', AccordionItem.rectOffsetY)
                    .attr('fill', 'transparent')
            }

            const itemDividerRectangles = () => {
                gHeader.append('rect')
                    .attr('class', 'divider')
                    .attr('width', (d, i) => {return i > 0 ? AccordionItem.dividerWidth : 0})
                    .attr('height', AccordionItem.dividerHeight)
                    .attr('fill', '#D8D4D5')
            }

            itemBackgroundRectangles()
            itemDividerRectangles()
        }

        const renderText = () => {
            
            const itemMainText = () => {
                gHeader.append('text')
                    .attr('class', 'main')
                    .text(d => d.title.toLowerCase())
                    .attr('x', AccordionItem.textMainPositionX) //column 2
                    .attr('dy', AccordionItem.textOffsetY)
                    .attr('fill', '#384D48')
                    .style('font-size', AccordionItem.fontHeight + 'px')
                    .style('user-select', 'none')
            }

            const itemCaptionText = () => {
                gHeader.append('text')
                    .attr('class', 'caption')
                    .text((d, i) => {
                        const digits = (i + 1) > 9 ? '0' + (i + 1) : '00' + (i + 1)
                        const targetObjectClass = d.constructor.name
                        return targetObjectClass.toUpperCase() + ' ' + digits
                    })
                    .attr('dx', 4)
                    .attr('dy', AccordionItem.textOffsetY)
                    .attr('fill', '#6E7271')
                    .style('font-size', (AccordionItem.fontHeight - 2) + 'px')
                    .style('user-select', 'none')
            }

            itemMainText()
            itemCaptionText()
        }

        createSvgGroups()
        positionGroups()
        attachEventHandlers()
        renderGraphics()
        renderText()
    }

    updateItems(selection, accordion, transitionDuration){

        const expandedItemIndex = accordion.selecteItemIndex

        const repositionGroups = () => {

            const translateString = (x, y) => {return 'translate(' + x + ',' + y + ')'}
            const isHigherItemExpanded = (thisItemIndex) => {
                if(expandedItemIndex === -1){
                    return false
                } else {
                    return thisItemIndex > expandedItemIndex
                }
            }

            selection.transition('tUpdateItems')
                .duration(350)
                .ease(d3.easeCubicIn)
                .attr('transform', (d, i) => {
                    const defaultY = i * AccordionItem.heightCollapsed
                    const expansionOffset = isHigherItemExpanded(i) ? 200 : 0
                    const {x, y} = {x: 0, y: defaultY + expansionOffset}
                    return translateString(x, y)
                })
        }

        const renderText = () => {
            selection.selectAll('text.main')
                .transition('tUpdateMainText')
                .duration(350)
                .style('font-weight', d => d.selected ? 'bold' : 'normal')
        }

        repositionGroups()
        renderText()

    }

}

class AccordionItemRendering {
    constructor(item, accordion){
        this.item = item
        this.accordion = accordion
    }

    get g (){
        return this.accordion.svg.select('g#' + this.item.id)
    }

    get lines(){
        return this.item.selected ? this.item.lines : []
    }

    
    render(){
        const itemRendering = this

        this.g.select('g.itemContent').selectAll('text.line')
            .data(this.lines, d => {return 'line' + d.number})
            .join(
                enter => itemRendering.enter(enter, itemRendering),
                update => update,
                exit => itemRendering.exit(exit)
            )
    }

    enter(selection, itemRendering){
        
        const renderedLines = itemRendering.renderLinesTransparent(selection)

        const expand = (accordion) => {
            accordion.renderContent(350)
            accordion.dynamics.resize(accordion, 350)
        }

        const tweenInText = () => {
            renderedLines.text('')
                .attr('fill', '#6E7271')
                
            renderedLines.each(function(d, i){
                d3.select(this)
                    .transition('tweenLinesIn')
                    .delay(25 * i + 150)
                    .duration(25)
                    .tween('text', AccordionItem.typeWriterTween(d.text))
            })  
        }

        const wrapLines = () => {

            const renderedWidth = (line) => {
                return line.node().getBBox().width
            }

            
            renderedLines.each(function(d, i){
                const availableWidth = AccordionItem.dividerWidth - AccordionItem.textMainPositionX - AccordionItem.fontHeight * 2

                if(renderedWidth(d3.select(this)) > availableWidth){
                    console.log(renderedLines.data())
                }
                
            })
        }

        const getHeightOfContent = () => {

        }

        wrapLines()

        expand(itemRendering.accordion)
        tweenInText()
        
    }

    update(){}
    
    exit(selection){
        selection.transition('exitLines')
            .delay((d, i) => {return (350 / selection.size()) * (selection.size() - 1 - i)})
            .duration(350 / selection.size())
            .attr('fill', 'transparent')
            .on('end', function(){
                d3.select(this).remove()
            })
    }

    renderLinesTransparent(selection){

        const fontHeight = (d) => {
            let height = AccordionItem.fontHeight - 1
            if(d.constructor.name === 'Heading'){
                height = height + (6 - d.level)
            }
            return height 
        }

        const lineSpacing = AccordionItem.fontHeight * 1.38
        const yOffset = AccordionItem.heightCollapsed * 1.38
        
        return selection
            .append('text')
            .attr('class', 'line')
            .attr('id', d => d.id)
            .text(d => d.text)
            .attr('x', (d) => {
                const inset = d.constructor.name === 'Bullet' ? fontHeight(d) * 0.618 : 0
                return AccordionItem.textMainPositionX + inset
            })
            .attr('y', (d, i) => i * lineSpacing + yOffset)
            .attr('fill', 'transparent')
            .attr('font-weight', d => d.constructor.name === 'Heading' ? 700 : 400)
            .style('font-size', d => fontHeight(d) + 'px')
    }

    expandedHeight(renderedLines){     
        const lineHeight = (line) => {
            return line.node().getBBox().height
        }

        let totalHeight = 0

        renderedLines.each(function(){
            totalHeight = totalHeight + lineHeight(d3.select(this)) 
        })

        return totalHeight
    }


}

class DisplayHeader extends Element {
    get margin(){
        const {top, right, bottom, left} = {
            top: this.grid.margin + 'px ',
            right: this.grid.margin + 'px ',
            bottom: '0px ',
            left: this.grid.margin
        }
        return top + right + bottom + left
    }

    get padding(){
        const {top, right, bottom, left} = {
            top: this.grid.padding + 'px ',
            right: this.grid.padding * 1.5 + 'px ',
            bottom: this.grid.padding * 1 + 'px ',
            left: this.grid.padding  * 1.5
        }

        return top + right + bottom + left
    }

    get renderedWidth(){
        try{return Math.ceil(this.boundingRect.width)}
        catch{return null}
    }

    get renderedHeight(){
        try{return Math.ceil(this.boundingRect.height)}
        catch{return null}
    }

    get boundingRect(){
        return this.div.select('span').node().getBoundingClientRect()
    }

    get height(){
        return this.renderedHeight ?? this.grid.cellSize * 2
    }

    get width(){
        return this.renderedWidth ?? this.grid.cellSize * 20
    }

    renderContent(){
        const p = this.div.append('p')
            .style('margin', '0px')
            .style('height', this.height + 'px')

        p.append('span')
            .text(this.data)
            .style('color', Colours.main) //#8AA1B1
            .style('font-size', '18px')
            .style('font-weight', '200')
            .style('font-family', 'Helvetica, sans-serif')
        
    }

    initializeDomElements() {
        this.div = this.addDiv()
    }
}

class Navigation extends Element {
    
    get width(){
        return 400
    }

    get height(){
        return this.grid.rowHeight
    }

    get left(){
        return 40 //this.columnWidth
    }

    get top(){
        return 75 //window.innerHeight / 2 - this.height / 2
    }

    get position(){
        return 'fixed'
    }

    get backgroundColour(){
        return 'rgba(128, 128, 128, 0.38)'
    }

    initializeDomElements() {
        this.nav = this.addNav()
    }

    addNav() {
        return this.parentElement.append('nav')
            .style('position', this.position)
            .style('margin', this.margin + 'px')
            .style('left', this.left + 'px')
            .style('top', this.top + 'px')
            .style('padding', this.padding + 'px')
            .style('width', this.width + 'px')
            .style('height', this.height + 'px')
            .style('overflow', 'hidden')
            .style('border-radius', this.borderRadius + 'px')
            .style('box-shadow', this.boxShadow)
            .style('background-color', this.backgroundColour)
    }

    renderContent(){

        const optionWidth = this.width / this.data.length
        const fontHeight = 16
        const svg = this.nav.append('svg')

        const g = svg.selectAll('g')
            .data(this.data)
            .join('g')
            .attr('transform', (d, i) => {
                const {x, y} = { x: i * optionWidth, y: this.height / 2}
                return 'translate(' + x + ',' + y + ')'
            })

        g.append('text')
            .text(d => d.text)
            .attr('dx', 4)
            .attr('dy', fontHeight / 2)
            .attr('fill', 'black')
            .style('font-size', fontHeight + 'px')
            .style('user-select', 'none')


    }


}

class NavigationOption {
    constructor(id, text){
        this.id = id
        this.text = text
    }

}

class AccordionItem {

    constructor(){

    }
    
    static goldenRatio = 1.618
    static cellSize = 0
    static accordionWidth = 0
    static columnWidth = 0
    static gutterWidth = 0

    static get dividerHeight(){
        return 1
    }

    static get dividerWidth(){
        return this.accordionWidth
    }

    static get heightCollapsed(){
        return this.cellSize * 2.5
    }

    static get heightExpanded(){
        return 200 
    }

    static get fontHeight(){
        const gRatioConjugate = this.goldenRatio - 1
        const complimentaryRatio = 1 - gRatioConjugate
        return Math.floor(this.rectHeightCollapsed * complimentaryRatio)
    }

    static get rectHeightCollapsed(){
        return this.heightCollapsed - this.dividerHeight 
    }

    static get rectHeightExpanded(){
        return this.heightExpanded - this.dividerHeight 
    }

    static get rectOffsetY(){
        return this.dividerHeight
    }

    static get rectWidth(){
        return this.accordionWidth
    }

    static get textCaptionWidth(){
        return this.columnWidth 
    }

    static get textMainPositionX(){
        return this.textCaptionWidth + this.gutterWidth
    }

    static get textOffsetY(){
        return this.fontHeight / 2 + this.rectHeightCollapsed / 2 - this.dividerHeight 
    }

    static typeWriterTween(finalText) {
        return function() {
            // Get the length of the string
            const len = finalText.length;
            // Define an interpolator from 0 to total length
            const i = d3.interpolateRound(0, len);

            return function(t) {
                // Set textContent to a slice of the final text based on t
                this.textContent = finalText.slice(0, i(t));
            };
        };
    }
}

class ElementDynamics {
    async resize(element, duration = 0){
        await this.resizeDiv(element, duration)
        await this.resizeSVG(element, duration)
        return Promise.resolve()
    }

    resizeDiv(element, duration){
        return element.div.transition('tResizeDiv')
            .duration(duration)
            .ease(d3.easeCubicIn)
                .style('width', element.width + 'px')
                .style('height', element.height + 'px')
    }

    resizeSVG(element, duration){
        try{
            return element.svg.transition('tResizeSvg')
                .duration(duration)
                .ease(d3.easeCubicIn)
                    .attr('width', element.width)
                    .attr('height', element.height)
        }

        catch{
            return Promise.resolve()
        }

    }
    
    move(){}
}

//controller
function loadNotesList(){

}

class Displays {
    static #notesList
    static #notesWiki

    static async notesList(){
        if(this.#notesList === undefined){
            this.#notesList = new NotesList(await new NotesModel().loadData())
        }
        return Promise.resolve(this.#notesList)
    }

    static async notesWiki(){
        if(this.#notesWiki === undefined){
            this.#notesWiki = new NotesWiki(new NotesModel())
        }
        await wiki.initalise()
        return Promise.resolve(this.#notesWiki)
    }
}

class Orchestrator {
    static async activateDisplay(displayName){

        const renderer = new DisplayRenderer()
        
        if(displayName === 'Notes Wiki'){
            renderer.setStrategy(new NotesWiki(new NotesModel()))
            renderer.initialiseElements(new Accordion())
        } else if (displayName === 'Notes List'){
            renderer.setStrategy(new ListDisplayStrategy(new NotesModel()))
            renderer.initialiseElements(new Accordion())
        }

        
    }

}

async function initialiseWiki(){
    const wiki = new NotesWiki(new NotesModel())
    await wiki.initalise()
    return Promise.resolve(wiki)
}

function initialiseElements(display){
    
    const main = (container = d3.select('body')) => {
        return container.append('main')
    }

    const div = (container = d3.select('main')) => {
        return container.append('div')
            .attr('class', this.display.constructor.name.toLowerCase())
            .style('position', this.position)
            .style('margin', this.margin + 'px')
            .style('left', this.left + 'px')
            .style('top', this.top + 'px')
            .style('padding', this.padding + 'px')
            .style('width', this.width + 'px')
            .style('height', this.height + 'px')
            .style('overflow', 'hidden')
            .style('border-radius', this.borderRadius + 'px')
            .style('box-shadow', this.boxShadow)
            .style('background-color', this.backgroundColour)
    }

    const svg = (container = d3.select('main').select('div')) => {
        return container.append('svg')
            .attr('class', this.constructor.name.toLowerCase())
            .attr('width', this.width)
            .attr('height', this.height)
            
    }

    return {
        main: main(),
        div: div()

    }
    
}

//entities
    //person
    //role
        //producer
        //performer
            //session musician
    //song
    //recording
    //release
        //almost at the ivory
        //eastern shores ep
        //emerson rush
        //every weekend
        //in the lights
        //misguided romantic
        //on my back
        //young emotions

//pages
    //release personnel
    //notes (all)


//strategic problem space
//events
    //release selected
    //note selected

//core subdomains
    //ingression
    //preserve
    //nursery


//tactical solution space

//bounded context
//entities(has id)
    //song
    //person
    //recording
    //
//value objects (no id, building block)
    //property
//domain events (async messaging between bounded contexts)
    //async messaging
//aggregates (cluster of entities, has a root entity, in a bounded context)
    //person featured on release
//domain and application services


//controllers
//services (no state)
    //application services (auth, emailing)
    //domain services (design logic)
        //view release
