const TestSuite = (() => {
  const results = []

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed')
    }
  }

  function assertEqual(actual, expected, message) {
    assert(actual === expected, message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }

  function assertDeepEqual(actual, expected, message) {
    const actualJson = JSON.stringify(actual)
    const expectedJson = JSON.stringify(expected)
    assert(actualJson === expectedJson, message || `Expected ${expectedJson}, got ${actualJson}`)
  }

  async function runTest(name, callback) {
    try {
      await callback()
      results.push({ name, status: 'PASS' })
    } catch (error) {
      results.push({ name, status: 'FAIL', error })
    }
  }

  function createSummaryElement() {
    const container = document.createElement('section')
    container.style.fontFamily = 'system-ui, sans-serif'
    container.style.padding = '24px'
    container.style.background = '#111'
    container.style.color = '#EEE'
    container.style.minHeight = '100vh'

    const title = document.createElement('h1')
    title.textContent = 'Garden Test Suite'
    title.style.marginTop = '0'
    container.appendChild(title)

    const summary = document.createElement('p')
    const passed = results.filter(r => r.status === 'PASS').length
    const failed = results.length - passed
    summary.textContent = `${passed} passed, ${failed} failed, ${results.length} total`
    container.appendChild(summary)

    const list = document.createElement('ol')
    results.forEach(result => {
      const item = document.createElement('li')
      item.textContent = `${result.name}: ${result.status}`
      item.style.marginBottom = '8px'
      if (result.status === 'FAIL') {
        item.style.color = '#F88'
        const error = document.createElement('pre')
        error.textContent = result.error.stack || result.error.message
        error.style.whiteSpace = 'pre-wrap'
        error.style.marginTop = '4px'
        error.style.fontSize = '0.9rem'
        item.appendChild(error)
      }
      list.appendChild(item)
    })
    container.appendChild(list)
    return container
  }

  async function runAll() {
    window.innerWidth = window.innerWidth || 1200
    window.innerHeight = window.innerHeight || 900
    window.gRatio = window.gRatio || 1.618

    await runTest('cardPositioning.top returns gap when no card above', () => {
      class titleCard {}
      const card = new titleCard()
      const positioning = new cardPositioning()
      assertEqual(positioning.top(card, null), 15)
    })

    await runTest('cardPositioning.left returns window width + gap for viewTitleCard', () => {
      class viewTitleCard {}
      const card = new viewTitleCard()
      const positioning = new cardPositioning()
      const expected = window.innerWidth + 15
      assertEqual(positioning.left(card, null), expected)
    })

    await runTest('cardSizing.defaultDimensions for titleCard returns safe aspect ratio', () => {
      class titleCard {}
      const card = new titleCard()
      const dimensions = new cardSizing().defaultDimensions(card)
      assertEqual(typeof dimensions.width, 'number')
      assertEqual(typeof dimensions.height, 'number')
      assert(dimensions.width > 0)
      assert(dimensions.height > 0)
    })

    await runTest('elementSizing.defaultWidth and defaultHeight derive from grid', () => {
      const sizing = new elementSizing({ columnCount: 4, columnWidth: 20, gutterWidth: 5 })
      assertEqual(sizing.defaultWidth(), 95)
      assertEqual(sizing.defaultHeight(), Math.ceil(95 / 1.618))
      assertDeepEqual(sizing.default(), { width: 95, height: Math.ceil(95 / 1.618) })
    })

    await runTest('elementSizing.toContent uses supplied height and span width', () => {
      const sizing = new elementSizing({ columnCount: 4, columnWidth: 10, gutterWidth: 2 })
      const result = sizing.toContent(123, 3)
      assertEqual(result.width, 3 * 10 + 2 * 2)
      assertEqual(result.height, 123)
    })

    await runTest('dataHandler.weeksOfLife returns 4160 weeks and current week marker', () => {
      const start = new Date(1990, 0, 1)
      const end = new Date(1991, 0, 1)
      const data = new dataHandler().weeksOfLife(start, end)
      assertEqual(data.length, 80 * 52)
      const livedCount = data.filter(item => item.status === 'lived').length
      const currentCount = data.filter(item => item.status === 'current').length
      const expectedCount = data.filter(item => item.status === 'expected').length
      assertEqual(livedCount, 52)
      assertEqual(currentCount, 1)
      assertEqual(livedCount + currentCount + expectedCount, data.length)
    })

    await runTest('record.addEvent stores a date value and preserves null values', () => {
      const subject = new record('test')
      subject.addEvent('mixed', '2025-09-29')
      subject.addEvent('tracked', null)
      const mixedDate = subject.history.get('mixed')
      assert(mixedDate instanceof Date)
      assertEqual(mixedDate.getFullYear(), 2025)
      assertEqual(mixedDate.getDate(), 29)
      assertEqual(subject.history.get('tracked'), null)
    })

    await runTest('song.addKeyDate stores a zero-based month date', () => {
      const subject = new song('id', 'title')
      subject.addKeyDate('recorded', 2024, 7)
      const entry = subject.history.find(event => event.event === 'recorded')
      assert(entry instanceof Object)
      assertEqual(entry.event, 'recorded')
      assertEqual(entry.date.getFullYear(), 2024)
      assertEqual(entry.date.getMonth(), 6)
    })

    await runTest('songConceptModelData.getFirstTerm and getSecondTerm extract terms correctly', () => {
      const terms = ['verse', 'chorus', 'section']
      const text = 'verse is a kind of structural section'
      assertEqual(songConceptModelData.getFirstTerm(terms, text), 'verse')
      assertEqual(songConceptModelData.getSecondTerm(terms, text), 'section')
    })

    await runTest('recordsData.getTitles returns the expected title list', () => {
      const titles = recordsData.getTitles()
      assert(Array.isArray(titles))
      assertEqual(titles[0], 'misguided romantic')
    })

    await runTest('Grid.deviceType detects mobile and desktop by width', () => {
      const originalWidth = window.innerWidth
      window.innerWidth = 400
      assertEqual(new Grid().deviceType, 'mobile')
      window.innerWidth = 900
      assertEqual(new Grid().deviceType, 'tablet')
      window.innerWidth = 1200
      assertEqual(new Grid().deviceType, 'desktop')
      window.innerWidth = originalWidth
    })

    const app = document.getElementById('test-results') || document.body
    app.appendChild(createSummaryElement())

    if (results.some(r => r.status === 'FAIL')) {
      console.error('Test suite completed with failures', results)
    } else {
      console.info('All tests passed', results)
    }
  }

  return { runAll }
})()

window.addEventListener('DOMContentLoaded', () => {
  if (typeof d3 === 'undefined') {
    console.warn('d3 is not loaded. Load d3 before running the test suite.')
    return
  }
  TestSuite.runAll()
})
