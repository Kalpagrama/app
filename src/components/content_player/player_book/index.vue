<template lang="pug">
div(
  :style=`{
    position: 'relative',
    //- ...styles,
    height: '100%',
  }`
  ).column.full-width.bg-black
  //-  fictive/invisible input for emit/on/off events with native html element events
  input(v-model="name" ref="nameInput" :style=`{display: 'none'}`)
  //- figure editor...
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="lastAnnotation"
      :style=`{
        position: 'absolute', zIndex: 1000,
        bottom: '80px',
      }`
      ).row.full-width.justify-center
      slot(name="tint-bar" :tintFocused="true")
      div(
        v-if="lastAnnotation"
        :style=`{
          width: '300px',
          borderRadius: '20px',
          background: 'rgba(30,30,30,0.8)',
        }`
        ).row.items-center.content-center.q-pa-md
        q-btn(round flat color="red" icon="lens" @click="updateLastAnnotation('red')")
        q-btn(round flat color="green" icon="lens" @click="updateLastAnnotation('green')")
        q-btn(round flat color="blue" icon="lens" @click="updateLastAnnotation('blue')")
        .col
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="updateLastAnnotation(null, null, -1)")
        q-btn(round flat color="white" icon="keyboard_arrow_right" @click="updateLastAnnotation(null, null, 1)")
        q-btn(v-if="!figure" @click='showNodeInputForm' round flat dense color="green" icon="add_circle_outline")
        q-btn(v-if="figure" @click='hideNodeInputForm' round flat dense color="white" icon="clear")
  //- table of contents...
  div(
    v-if="tableOfContents === true"
    :id="bookMenu"
    :style=`{
      position: 'absolute', zIndex: 1000, top: '0px',
      borderRadius: '10px',
      height: 'calc(100% - 120px)',
    }`
    ).column.full-width.b-40
    .col.full-width.scroll
      q-btn(
        v-for="chapter in toc" :key="chapter.href"
        @click="chapter.go()"
        no-caps
        ).row.full-width.scroll
        span(:style=`{fontSize: '18px', color: 'red', userSelect: 'none'}`).text-bold {{ chapter.label }}
        q-btn(
          v-for="subchapter in chapter.subitems" :key="subchapter.href"
          @click="subchapter.go()"
          no-caps
          ).row.full-width.scroll
          span(:style=`{fontSize: '18px', color: 'green', userSelect: 'none'}`).text-bold {{ subchapter.label }}
  //- body book area
  div(
    :style=`{
      position: 'relative',
      borderRadius: '0 0 10px 10px',
    }`).col.full-width
    q-resize-observer(@resize="onResize" :debounce="300")
    div(
      :id="bookArea"
      :style=`{
        borderRadius: '0 0 10px 10px',
        overflow: 'hidden'
      }`
      ).row.fit
    //- div(
      :style=`{}`)
  //- footer
  .row.full-width.justify-center
    //- input(v-if = "true" v-model="cfi" width="300").row.full-width
    //- q-btn(v-if = "true" round flat color="white" icon="check" @click='goToCfi')
    q-btn(round flat color="white" icon="menu" @click='showTableOfContents')
    q-btn(round flat color="white" icon="first_page" @click='goToFirstPage')
    q-btn(round flat color="white" icon="keyboard_arrow_left" @click='goToPrevPage')
    q-btn(round flat color="white" icon="keyboard_arrow_right" @click='goToNextPage')
    q-btn(round flat color="white" icon="last_page" @click='goToLastPage')
    //- input(size='3' type='range' max='100' min='0' step='1' @change='goToPercent($event.target.value)' :value='progress')
    //- input(type='text' :value='progress' @change='goToPercent($event.target.value)')
</template>

<script>
import {Book, EpubCFI} from 'epubjs'
import debounce from 'lodash/debounce'
import * as assert from 'assert'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'contentPlayer_book',
  props: {
    contentKalpa: {
      type: Object,
      required: true,
    },
    url: {
      type: String,
      required: true
    },
    fontSize: {
      type: Number,
      default: 100
    },
    themes: {
      type: Object,
      required: true,
      default: {
        white: {
          body: {
            color: 'black',
            background: 'white'
          },
          name: 'WHITE'
        },
        beige: {
          body: {
            color: '#000000',
            background: '#f3e8d2'
          },
          name: 'BEIGE'
        },
        night: {
          body: {
            color: '#c8c8c8',
            background: '#282828'
          },
          name: 'NIGHT'
        }
      }
    },
    theme: {
      type: String,
      required: true,
      default: 'beige'
    },
    progress: {
      type: Number,
      required: true,
    },
    bookArea: {
      type: String,
      default: 'area'
    },
    contentBookModify: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      book: null,
      rendition: null,
      section: null,
      toc: [],
      progressValue: 0,
      slide: null,
      width: 0,
      height: 0,
      locations: null, // this.book.locations.generate()
      isFullscreen: false,
      contentBookmark: null, // закладка, хранимая в мастерской (на закладке хранится текущая позиция на контенте)
      tableOfContents: false,
      cfiRangeSelectInProgress: null, // начатое выделение (начали выделять)
      lastAnnotation: null, // текущее выделение
      figure: null, // текущее выделение TODO почему называется figure, а не figuresAbsolute???
      events: {},
      chapterWithNodes: [] // главы, в которых отображены ядра
    }
  },
  watch: {
    theme (val) {
      this.setTheme(val)
    },
    fontSize (val) {
      this.setFontSize(val)
    },
    progressValue (val) {
      this.$emit('update:progress', val)
    }
  },
  methods: {
    setState (key, val) {
      this.$log('setState', key, val)
      this[key] = val
    },
    onResize (e) {
      this.$log('onResize', e)
      this.width = e.width
      this.height = e.height
      if (this.rendition) this.rendition.resize(this.width, this.height)
    },
    registerThemes () {
      this.rendition.themes.register(this.themes)
    },
    setTheme (theme) {
      this.rendition.themes.select(theme)
      document.body.style.background = this.themes[theme].body.background
    },
    async goToFirstPage () {
      await this.goToPercent(0)
    },
    async goToLastPage () {
      await this.goToPercent(100)
    },
    async goToPrevPage () {
      await this.rendition.prev()
    },
    async goToNextPage () {
      await this.rendition.next()
    },
    goToPercent (value) {
      const percentage = value / 100
      const target = percentage > 0 ? this.book.locations.cfiFromPercentage(percentage) : 0
      this.rendition.display(target)
      if (percentage === 1) this.goToNextPage()
    },
    async goToCfi (cfi) {
      this.$log('goToCfi', cfi)
      this.rendition.annotations.highlight(cfi, {})
      // let loc = await this.rendition.currentLocation()
      // this.$log('loc=', loc)
      // this.$log('loc start=', loc.start.cfi)
      // this.$log('loc end=', loc.end.cfi)
      await this.rendition.display(cfi)
    },
    async showTableOfContents () {
      this.tableOfContents = !this.tableOfContents
    },
    setFontSize (size) {
      this.rendition.themes.fontSize(size + '%')
    },
    updateScreenSizeInfo () {
      this.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      this.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - this.contentBookModify
    },
    resizeToScreenSize () {
      this.updateScreenSizeInfo()
      this.rendition.resize(this.width, this.height)
    },
    keyListener (e) {
      if (e.code === 'ArrowRight') {
        this.goToPrevPage()
      } else if (e.code === 'ArrowLeft') {
        this.goToPrevPage()
      }
    },
    async highLight(cfiRange){
      await this.rendition.display(cfiRange)
      this.rendition.annotations.highlight(cfiRange, {})
    },
    clearLastAnnotation(){
      if (this.lastAnnotation) {
        this.rendition.annotations.remove(this.lastAnnotation.cfiRange, 'highlight')
      }
      this.lastAnnotation = null
      this.figure = null
    },
    async updateLastAnnotation(color, startOffset, endOffset) {
     assert(this.lastAnnotation, '!this.lastAnnotation')
      let cfiRange = this.lastAnnotation.cfiRange
      color = color || this.lastAnnotation.styles.fill
      if (endOffset) {
        cfiRange = cfiRange.replace(/(?<=epubcfi\(.*,.*,\/.*:).*(?=\))/, function(a, b){
          return parseInt(a) + endOffset
        })
      }
      this.clearLastAnnotation() // удалим старую и нарисуем новую
      this.makeLastAnnotation(cfiRange, color, '0.3')
    },
    makeLastAnnotation(cfiRange, color, opacity){
      this.lastAnnotation = this.rendition.annotations.highlight(cfiRange, {}, async (e) => {
        this.$logE('highlight clicked', cfiRange)
      }, undefined, {
        fill: color,
        'fill-opacity': opacity,
        'mix-blend-mode': 'multiply',
      })
    },
    async showNodeInputForm(){
      assert(this.lastAnnotation.cfiRange, 'bad this.lastAnnotation.cfiRange!')
      let range = await this.book.getRange(this.lastAnnotation.cfiRange)
      this.figure = [
        {
          epubCfi: this.lastAnnotation.cfiRange,
          epubCfiText: range.toString(),
          points: [],
          t: null
        },
      ]
    },
    hideNodeInputForm(){
      this.figure = null
    },
    async prepareToc () {
      let { toc } = await this.book.loaded.navigation
      this.toc = toc
      const populateToc = (toc) => {
        for (let chapter of toc){
          // this.$log('chapter=', chapter)
          chapter.go = () => {
            alert('go ' + chapter.label)
            this.tableOfContents = false
            this.rendition.display(chapter.href)
            // let section = await this.book.section(chapter.href)
          }
          if (chapter.subitems) populateToc(chapter.subitems)
        }
      }
      populateToc(this.toc)
    },
    async prepareParagraphs () {
      const makeRangeCfi = (a, b) => {
        const CFI = new EpubCFI()
        const start = CFI.parse(a)
        const end = CFI.parse(b)
        start.base.steps = start.base.steps.filter(step => step)
        end.base.steps = end.base.steps.filter(step => step)
        start.path.steps = start.path.steps.filter(step => step)
        end.path.steps = end.path.steps.filter(step => step)
        const cfi = {
          range: true,
          base: start.base,
          path: {
            steps: [],
            terminal: null
          },
          start: start.path,
          end: end.path
        }
        const len = cfi.start.steps.length
        for (let i = 0; i < len; i++) {
          if (CFI.equalStep(cfi.start.steps[i], cfi.end.steps[i])) {
            if (i === len - 1) {
              // Last step is equal, check terminals
              if (cfi.start.terminal === cfi.end.terminal) {
                // CFI's are equal
                cfi.path.steps.push(cfi.start.steps[i])
                // Not a range
                cfi.range = false
              }
            } else cfi.path.steps.push(cfi.start.steps[i])
          } else break
        }
        cfi.start.steps = cfi.start.steps.slice(cfi.path.steps.length)
        cfi.end.steps = cfi.end.steps.slice(cfi.path.steps.length)
        let z = CFI.segmentString(cfi.base)
        let x = CFI.segmentString(cfi.path)
        let c = CFI.segmentString(cfi.start)
        let v = CFI.segmentString(cfi.end)

        return 'epubcfi(' + CFI.segmentString(cfi.base) + '!' + CFI.segmentString(cfi.path) + ',' + CFI.segmentString(cfi.start) + ',' + CFI.segmentString(cfi.end) + ')'
      }
      // вернет главы, попавшие в диапазон cfiStart, cfiEnd
      let getChapters = async (cfiStart, cfiEnd) => {
        // for (let chapter of this.toc){
        //   return chapter.subitems
        // }
        // список наимельчайших глав
        let getLowestChapters = (chapter) => {
          let res = []
          if (chapter.subitems && chapter.subitems.length){
            for (let subchapter of chapter.subitems){
              res.push(...getLowestChapters(subchapter))
            }
          } else res.push(chapter)
          return res
        }
        let chapters = [] // список всех глав (если в главе есть подглавы, то выводятся ТОЛЬКО подглавы)
        for (let chapter of this.toc){
          chapters.push(...getLowestChapters(chapter))
        }
        let innerChapterIndexes = []

        // // todo не обрабатывается последняя глава
        // for (let i = 1; i < chapters.length; i++){
        //   let prevSection = this.book.spine.get(chapters[i - 1].href)
        //   let nextSection = this.book.spine.get(chapters[i].href)
        //   let contentsPrev = await prevSection.load(this.book.load.bind(this.book))
        //   let contentsNext = await nextSection.load(this.book.load.bind(this.book))
        //   let cfiChapterPrev = new EpubCFI(prevSection.cfiFromElement(prevSection.document.firstElementChild))
        //   let cfiChapterNext = new EpubCFI(nextSection.cfiFromElement(nextSection.document.firstElementChild))
        //   let start = cfiChapterPrev
        //   let end = cfiChapterNext
        //   // a.start <= b.end AND a.end >= b.start
        //   let one = (new EpubCFI()).compare(cfiStart, end) // First is earlier = -1, Second is earlier = 1, They are equal = 0
        //   let two = (new EpubCFI()).compare(cfiEnd, start) // First is earlier = -1, Second is earlier = 1, They are equal = 0
        //   if (one <= 0 && two >= 1){ // пересекаются
        //     let rangeCfi = makeRangeCfi(start.str, end.str)
        //     let range = await this.book.getRange(rangeCfi)
        //     this.$log('range=', range)
        //     this.$log('range text =', range.toString())
        //     this.$log('range text =', range.toString())
        //   }
        // }
        // ищем те главы, начала которых попали непосредственно в диапазон
        for (let i = 0; i < chapters.length; i++){
          assert(chapters[i].href, '!href')
          let section = this.book.spine.get(chapters[i].href)
          let contents = await section.load(this.book.load.bind(this.book))
          let cfiChapter = new EpubCFI(section.cfiFromElement(section.document.firstElementChild))
          let startRes = (new EpubCFI()).compare(cfiChapter, cfiStart) // First is earlier = -1, Second is earlier = 1, They are equal = 0
          let endRes = (new EpubCFI()).compare(cfiChapter, cfiEnd) // First is earlier = -1, Second is earlier = 1, They are equal = 0
          if (startRes >= 0 && endRes <= 0) { // начало главы попало в диапазон
            innerChapterIndexes.push(i)
          }
        }
        // добавим главы, НАЧИНАЮЩИЕСЯ слева и справа от диапазона
        for (let i = 1; i < chapters.length; i++){
          let prevSection = this.book.spine.get(chapters[i - 1].href)
          let nextSection = this.book.spine.get(chapters[i].href)
          let contentsPrev = await prevSection.load(this.book.load.bind(this.book))
          let contentsNext = await nextSection.load(this.book.load.bind(this.book))
          let cfiChapterPrev = new EpubCFI(prevSection.cfiFromElement(prevSection.document.firstElementChild))
          let cfiChapterNext = new EpubCFI(nextSection.cfiFromElement(nextSection.document.firstElementChild))
          {
            let startResPrev = (new EpubCFI()).compare(cfiChapterPrev, cfiStart) // First is earlier = -1, Second is earlier = 1, They are equal = 0
            let startResNext = (new EpubCFI()).compare(cfiChapterNext, cfiStart) // First is earlier = -1, Second is earlier = 1, They are equal = 0
            if (startResPrev < 0 && startResNext >= 0) { // prev - до диапазона, next - в диапазоне либо после него
              innerChapterIndexes.push(i - 1) // добавляем prev
            }
          }
          {
            let endResPrev = (new EpubCFI()).compare(cfiChapterPrev, cfiEnd) // First is earlier = -1, Second is earlier = 1, They are equal = 0
            let endResNext = (new EpubCFI()).compare(cfiChapterNext, cfiEnd) // First is earlier = -1, Second is earlier = 1, They are equal = 0
            if (endResNext > 0 && endResPrev <= 0) { // next - после диапазона, prev - в диапазоне либо до него
              innerChapterIndexes.push(i) // добавляем next
              break
            }
          }
        }
        let result = []
        for (let i of innerChapterIndexes){
          let chapter = chapters[i]
          // todo  надо получить chapter rangeCFI и отсечь те, что не пересекаются с cfiStart, cfiEnd
          // let sectionChapter = await this.book.section(chapter.href)
          let sectionChapter = this.book.spine.get(chapter.href)
          this.$log('chapter=', chapter)
          this.$log('sectionChapter=', sectionChapter)
          let section = sectionChapter
          let contents = await section.load(this.book.load.bind(this.book))
          let cfiBase = new EpubCFI(section.cfiFromElement(section.document.firstElementChild))
          this.$log('contents=', contents)
          this.$log('cfiBase=', cfiBase)
          this.$log('doc=', section.document)
          result.push(chapter)
        }
        return result
      }
      const findAllParagraphs = (el) => {
        let res = []
        if (el.children.length > 1 && el.tagName !== 'head' && el.tagName !== 'html') {
          res.push(...el.children)
        } else if (el.children.length && el.tagName !== 'head') {
          for (let child of el.children) res.push(...findAllParagraphs(child))
        }
        return res
      }
      // получить все абзацы для озвучки
      {
        let currentLoc = await this.rendition.currentLocation()
        let sectionLocation = await this.book.section(location.start.href)
        let contentsLocation = await sectionLocation.load(this.book.load.bind(this.book))
        let cfiBase = new EpubCFI(location.start.cfi)
        let paragraphsLocation = findAllParagraphs(sectionLocation.document)
        for (let i = 1; i < paragraphsLocation.length; i++){
          let start = paragraphsLocation[i - 1]
          let end = paragraphsLocation[i]
          let range = document.createRange();
          range.setStart(start, 0);
          range.setEnd(end, 0);
          let cfiParagraph = new EpubCFI(range, cfiBase.base)
          this.$log('chapter range=', range)
          this.$log('chapter range.visible=', range.startContainer.visible)
          this.$log('chapter Paragraph=', range.toString())
          this.$log('chapter cfiParagraph=', cfiParagraph.toString())
          // start.addEventListener('click', (ev) => {
          //   ev.preventDefault();
          //   console.error(ev)
          //   alert('contextmenu2')
          //   // ev.preventDefault()
          //   return false;
          // })
          // this.rendition.annotations.highlight(cfiParagraph.toString(), {})
        }

        // let chapters = await getChapters(location.start.cfi, location.end.cfi)
        // for (let chapter of chapters){
        //   this.$log(chapter)
        //   let sectionChapter = await this.book.section(chapter.href)
        //   this.$log(chapter, sectionChapter)
        //   let section = sectionChapter
        //   let contents = await section.load(this.book.load.bind(this.book))
        //   let cfiBase = new EpubCFI(section.cfiFromElement(section.document.firstElementChild))
        //   this.$log('section.document:', section.document)
        //   let paragraphs = findAllParagraphs(section.document)
        //   for (let i = 1; i < paragraphs.length; i++){
        //     let start = paragraphs[i - 1]
        //     let end = paragraphs[i]
        //     let range = document.createRange();
        //     range.setStart(start, 0);
        //     range.setEnd(end, 0);
        //     let cfiParagraph = new EpubCFI(range, cfiBase.base)
        //     this.$log('chapter Paragraph=', range.toString())
        //     this.$log('chapter cfiParagraph=', cfiParagraph.toString())
        //   }
        // }
      }
    },
    async showAllNodes(сhapterId) {
      if (this.chapterWithNodes.includes(сhapterId)) return
      this.chapterWithNodes.push(сhapterId)
      let findRes = await this.$rxdb.find({
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE', 'JOINT'] },
          // objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.contentKalpa.oid,
          sortStrategy: 'AGE',
          groupByContentLocation: true
        },
        populateObjects: false,
      })
      this.$log('allNodes', findRes)
      for (let group of findRes.items) {
        let {epubChapterId, epubTocId, epubHref} = group.figuresAbsolute[0]
        if (сhapterId !== epubChapterId) continue
        for (let item of group.items) {
          let { oid, name, vertexType, figuresAbsoluteList, relatedOids, rate, weight, countVotes } = item
          for (let figuresAbsolute of figuresAbsoluteList) {
            this.rendition.annotations.highlight(figuresAbsolute[0].epubCfi, {}, async (e) => {
              this.$logE('highlight clicked', item)
            }, undefined, {
              fill: '#8000FF',
              'fill-opacity': '0.5',
              'mix-blend-mode': 'multiply',
            })
          }
        }
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    // init
    this.book = new Book(this.contentKalpa.url, {})
    // book navigation ready
    await this.prepareToc()

    this.$emit('toc', this.toc)

    { // initReader
      this.rendition = this.book.renderTo(this.bookArea, {
        contained: true,
        height: this.height,
        width: this.width
      })
      this.registerThemes()
      this.setTheme(this.theme)
      this.setFontSize(this.fontSize)
      this.rendition.themes.default({
        '::selection': {
          background: 'rgba(200,200,200, 0.3)',
          color: 'black'
        },
        // 'epubjs-hl': {
        //   background: 'rgba(200,200,200, 0.3)',
        //   color: 'black'
        // }
      });
      this.rendition.display()
      this.rendition.on('selected', async (cfiRange, contents) => {
        this.$log('selected', cfiRange)
        this.cfiRangeSelectInProgress = cfiRange // запомним тут. Обработаем в mouseup
        // let range = await this.book.getRange(cfiRange)
        // if (range) {
        //   this.$log('selected2', cfiRange)
        //   this.cfiRangeSelectInProgress = cfiRange // запомним тут. Обработаем в mouseup
        // }
        // contents.window.getSelection().removeAllRanges();
      })
      this.rendition.on('rendered', (section, iframe) => {
        iframe.document.documentElement.addEventListener('mouseup', async (ev) => {
          // выполняем через пол секунды тк mouseup срабатывает раньше чем this.rendition.on('selected'...
          this.$wait(300).then(async () => {
            this.$log('mouseup')
            this.clearLastAnnotation() // удалим предыдущее выделение (может быть только 1 выделенный кусок)
            if (this.cfiRangeSelectInProgress){ // закончим выделение
              this.makeLastAnnotation(this.cfiRangeSelectInProgress, 'green', '0.3')
              this.cfiRangeSelectInProgress = null
            }
          })
        })
        // iframe.document.documentElement.addEventListener('contextmenu', (ev) => {
        //   ev.preventDefault();
        //   console.error(ev)
        //   alert('contextmenu')
        //   // ev.preventDefault()
        //   return false;
        // })
      })
      this.rendition.on('keyup', this.keyListener)
      this.rendition.on('click', () => {
        this.$emit('click')
      })
      this.rendition.on('relocated', async (location) => {
        this.$log('relocated to', location.start.cfi)
        // percentageFromCfi нормально НЕ работает пока не сработал this.book.locations.generate()
        const percent = this.book.locations.percentageFromCfi(location.start.cfi)
        const percentage = percent * 100
        this.progressValue = percentage
        this.$emit('relocated')
        // let cfiLoc = this.book.locations.cfiFromLocation(location.start.index)
        // this.$log('relocated cfiLoc = ', cfiLoc)
        this.$log('relocated (progress) = ', percentage)
        if (this.contentBookmark){ // save position
          if (!this.contentBookmark.meta) this.$set(this.contentBookmark, 'meta', {})
          this.contentBookmark.meta.currentCfi = location.start.cfi
        }
        let chapterId = location.start.cfi.match(/epubcfi\(.*\[(.*)\]!/)[1]
        await this.showAllNodes(chapterId)
      })
    }

    // go to saved position (хранится внутри закладки)
    let {items: [bookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.contentKalpa.oid}})
    this.contentBookmark = bookmark
    if (this.contentBookmark && this.contentBookmark.meta && this.contentBookmark.meta.currentCfi) this.rendition.display(this.contentBookmark.meta.currentCfi)

    await this.book.ready // book ready
    this.ready = true

    // this.$emit('player', this)
    // долгая операция
    this.locations = await this.book.locations.generate() // нужно для того чтобы прогресс нормально считался (без этого вызова percentageFromCfi не работает)

    // window.addEventListener('resize', debounce(() => {
    //   this.resizeToScreenSize()
    // }, 250))
    // this.updateScreenSizeInfo()
  },
  created () {
    this.$log('created')
    this.events = {
      on: (event, cb) => {
        if (this.$refs.nameInput) this.$refs.nameInput.addEventListener(event, cb)
      },
      off: (event, cb) => {
        if (this.$refs.nameInput) this.$refs.nameInput.removeEventListener(event, cb)
      },
      emit: (event, val) => {
        if (this.$refs.nameInput) this.$refs.nameInput.dispatchEvent(new CustomEvent(event, {detail: val}))
      }
    }
    this.$emit('player', this)
    // window.addEventListener('keyup', this.keyListener)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // window.removeEventListener('keyup', this.keyListener)
  }
}
</script>
