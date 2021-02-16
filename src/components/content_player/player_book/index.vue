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
    //- figure editor + audioplayer
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="true"
        :style=`{
        position: 'absolute', zIndex: 1000,
        bottom: '80px',
      }`
      ).row.full-width.justify-center
        slot(name="tint-bar" :tintFocused="true")
        div(
          v-if="audioPlayer.audio"
          :style=`{
          width: '320px',
          borderRadius: '20px',
          background: 'white',
        }`
        ).row.items-center.content-center.q-pa-md
          div().row.full-width.justify-center
            q-btn(round flat color="green" icon="skip_previous" @click="nextAudio(-1)")
            q-btn(round flat color="green" icon="replay_5" @click="seekAudio(-5)")
            q-btn(round flat color="green" :icon="audioPlayer.isPlaying ? 'pause' : 'play_arrow'" @click="audioPlayer.isPlaying ? pauseAudio() : playAudio()")
            q-btn(round flat color="green" icon="forward_5" @click="seekAudio(5)")
            q-btn(round flat color="green" icon="skip_next" @click="nextAudio(1)")
            q-btn(round flat color="green" icon="close" @click="destroyAudio()")
          div().row.full-width.justify-center
            q-select(outlined v-model="audioPlayer.system" :options="audioPlayer.systems" label="system")
            q-select(outlined v-model="audioPlayer.voice" :options="audioPlayer.voices[audioPlayer.system]" label="voice")
        div(
          v-if="(lastAnnotation && !audioPlayer.audio)"
          :style=`{
          width: '300px',
          borderRadius: '20px',
          background: 'rgba(30,30,30,0.8)',
        }`
        ).row.items-center.content-center.q-pa-md
          q-btn(round flat color="green" icon="play_arrow" @click="nextAudio(0, true)")
          q-btn(round flat color="red" icon="lens" @click="createColorNodeBookmark('red')")
          q-btn(round flat color="green" icon="lens" @click="createColorNodeBookmark('green')")
          q-btn(round flat color="purple" icon="lens" @click="createColorNodeBookmark('purple')")
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
    .row.full-width.justify-center
      div(
        v-if="false"
      )
        input(v-model="cfi" width="300").row.full-width
        q-btn(round flat color="white" icon="check" @click="goToCfiDebug(cfi)")
        q-btn(round flat color="white" icon="menu" @click='showTableOfContents')
        q-btn(round flat color="white" icon="first_page" @click='goToFirstPage')
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click='goToPrevPage')
        q-btn(round flat color="white" icon="keyboard_arrow_right" @click='goToNextPage')
        q-btn(round flat color="white" icon="last_page" @click='goToLastPage')
        //- input(size='3' type='range' max='100' min='0' step='1' @change='goToPercent($event.target.value)' :value='progress')
        //- input(type='text' :value='progress' @change='goToPercent($event.target.value)')
</template>

<script>
import { Book, EpubCFI } from 'epubjs'
import debounce from 'lodash/debounce'
import * as assert from 'assert'
import { RxCollectionEnum } from 'src/system/rxdb'
import { getChapterIdFromCfi, getTocIdFromCfi } from 'src/system/rxdb/common'
import { ContentApi } from 'src/api/content'

export default {
  name: 'contentPlayer_book',
  props: {
    contentKalpa: {
      type: Object,
      required: true
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
      required: true
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
      findNodesRes: null, // список всех ядер на контенте
      findDraftsRes: null, // список всех черновиков на контенте
      audioPlayer: {
        system: 'google',
        voice: 'ru-RU-Standard-D',
        systems: ['google', 'yandex'],
        voices: {
          yandex: ['zahar', 'oksana', 'jane', 'omazh', 'ermil', 'alena', 'filipp'],
          google: ['ru-RU-Standard-D', 'ru-RU-Standard-A', 'ru-RU-Standard-B', 'ru-RU-Standard-C', 'ru-RU-Standard-E']
        },
        audio: null,
        isPlaying: false,
        currentSectionHref: null, // текущая секция книги(обычно глава) (Данные подгружаются для каждой главы отдельно)
        paragraphs: [], // [{epubCfi, epubCfiText}] список абзацев (для озвучки)
        currentParagraphIndx: -1, // проигрываемый абзац
        findCutsRes: [] // озвученные куски книги
      }
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
    },
    'audioPlayer.system': {
      handler (to, from) {
        if (to) this.audioPlayer.voice = this.audioPlayer.voices[to][0]
      }
    }
  },
  methods: {
    setState (key, val) {
      // this.$log('setState', key, val)
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
    setFontSize (size) {
      this.rendition.themes.fontSize(size + '%')
    },
    resizeToScreenSize () {
      this.updateScreenSizeInfo()
      this.rendition.resize(this.width, this.height)
    },
    updateScreenSizeInfo () {
      this.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      this.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - this.contentBookModify
    },
    keyListener (e) {
      if (e.code === 'ArrowRight') {
        this.goToPrevPage()
      } else if (e.code === 'ArrowLeft') {
        this.goToPrevPage()
      }
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
    async goToCfi (epubCfi) {
      this.$log('goToCfi', epubCfi)
      await this.rendition.display(epubCfi)
    },
    async goToCfiDebug (epubCfi) {
      this.$log('goToCfi', epubCfi)
      await this.rendition.display(epubCfi)
      this.rendition.annotations.highlight(epubCfi, {}, async (e) => {
        this.$logE('highlight clicked', epubCfi)
      }, undefined, {
        fill: 'red',
        'fill-opacity': '0.5',
        'mix-blend-mode': 'multiply'
      })
    },
    async savePosition (epubCfi) {
      if (this.contentBookmark) { // save position
        this.$log('savePosition: ', epubCfi)
        if (!this.contentBookmark.meta) this.$set(this.contentBookmark, 'meta', {})
        this.contentBookmark.meta.currentCfi = epubCfi
      }
    },
    async restorePosition () {
      // go to saved position (хранится внутри закладки)
      let { items: [bookmark] } = await this.$rxdb.find({
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
          oid: this.contentKalpa.oid
        }
      })
      this.contentBookmark = bookmark
      let cfi = null
      if (this.contentBookmark && this.contentBookmark.meta && this.contentBookmark.meta.currentCfi) cfi = this.contentBookmark.meta.currentCfi
      await this.goToCfi(cfi)
      await this.goToCfi(cfi) // epubjs глючит и не переключается с первого раза
    },
    async goToPercent (value) {
      const percentage = value / 100
      const target = percentage > 0 ? this.book.locations.cfiFromPercentage(percentage) : null
      await this.goToCfi(target)
      if (percentage === 1) await this.goToNextPage()
    },
    showTableOfContents () {
      this.tableOfContents = !this.tableOfContents
    },
    hideNodeInputForm () {
      this.figure = null
    },
    async showNodeInputForm () {
      assert(this.lastAnnotation.cfiRange, 'bad this.lastAnnotation.cfiRange!')
      let range = await this.book.getRange(this.lastAnnotation.cfiRange)
      this.figure = [
        {
          epubCfi: this.lastAnnotation.cfiRange,
          epubCfiText: range.toString(),
          points: [],
          t: null
        }
      ]
    },
    clearLastAnnotation () {
      if (this.lastAnnotation) {
        this.rendition.annotations.remove(this.lastAnnotation.cfiRange, 'highlight')
      }
      this.lastAnnotation = null
      this.figure = null
    },
    updateLastAnnotation (color, startOffset, endOffset) {
      assert(this.lastAnnotation, '!this.lastAnnotation')
      let cfiRange = this.lastAnnotation.cfiRange
      color = color || this.lastAnnotation.styles.fill
      if (endOffset) {
        cfiRange = cfiRange.replace(/(?<=epubcfi\(.*,.*,\/.*:).*(?=\))/, function (a, b) {
          return parseInt(a) + endOffset
        })
      }
      this.clearLastAnnotation() // удалим старую и нарисуем новую
      this.makeLastAnnotation(cfiRange, color, '0.3')
    },
    makeLastAnnotation (cfiRange, color, opacity) {
      this.lastAnnotation = this.rendition.annotations.highlight(cfiRange, {}, async (e) => {
        this.$logE('highlight clicked', cfiRange)
      }, undefined, {
        fill: color,
        'fill-opacity': opacity,
        'mix-blend-mode': 'multiply'
      })
    },
    async showAllNodesForCurrentLocation () {
      let currentLocation = await this.rendition.currentLocation()
      let chapterId = getChapterIdFromCfi(currentLocation.start.cfi)
      let tocId = getTocIdFromCfi(currentLocation.start.cfi)
      let href = currentLocation.start.href
      if (!this.findNodesRes) {
        this.findNodesRes = await this.$rxdb.find({
          selector: {
            rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
            objectTypeEnum: { $in: ['NODE', 'JOINT'] },
            // objectTypeEnum: { $in: ['NODE'] },
            oidSphere: this.contentKalpa.oid,
            sortStrategy: 'AGE',
            groupByContentLocation: true
          },
          populateObjects: false
        })
        // массив изменился (скорей всего создали новое ядро и оно добавилось в массив) - нарисуем заново
        this.$watch('findNodesRes.items', async (newVal, oldVal) => {
          this.clearLastAnnotation() // иначе при добавлении нового ядра, новое выделение исчезнет после клика мышкой (см addEventListener('mouseup' ...))
          await this.showAllNodesForCurrentLocation()
        }, {
          immediate: false,
          deep: true
        })
      }
      // this.$log('allNodes', this.findNodesRes)
      for (let group of this.findNodesRes.items) {
        let { epubChapterId, epubTocId, epubHref } = group.figuresAbsolute[0]
        tocId = tocId || epubTocId
        if (chapterId !== epubChapterId && tocId !== epubTocId) continue
        for (let item of group.items) {
          let { oid, name, vertexType, figuresAbsoluteList, relatedOids, rate, weight, countVotes } = item
          for (let figuresAbsolute of figuresAbsoluteList) {
            this.rendition.annotations.remove(figuresAbsolute[0].epubCfi, 'highlight') // если такая уже есть - удалим
            this.rendition.annotations.highlight(figuresAbsolute[0].epubCfi, { item }, async (e) => {
              this.$logE('highlight clicked', item)
              await this.showNodeInList(item.oid)
            }, undefined, {
              fill: 'indigo',
              'fill-opacity': '0.5',
              'mix-blend-mode': 'multiply'
            })
          }
        }
      }
    },
    async showAllDraftsForCurrentLocation () {
      let currentLocation = await this.rendition.currentLocation()
      let chapterId = getChapterIdFromCfi(currentLocation.start.cfi)
      let tocId = getTocIdFromCfi(currentLocation.start.cfi)
      let href = currentLocation.start.href
      if (!this.findDraftsRes) {
        this.findDraftsRes = await this.$rxdb.find({
          selector: {
            rxCollectionEnum: RxCollectionEnum.WS_NODE,
            'items.0.layers.0.contentOid': this.contentKalpa.oid
          }
        })
        // массив изменился (скорей всего создали новое ядро и оно добавилось в массив) - нарисуем заново
        this.$watch('findDraftsRes.items', async (newVal, oldVal) => {
          this.$log('showAllDraftsForCurrentLocation', newVal)
          this.clearLastAnnotation() // иначе при добавлении нового ядра, новое выделение исчезнет после клика мышкой (см addEventListener('mouseup' ...))
          await this.showAllDraftsForCurrentLocation()
        }, {
          immediate: false,
          deep: false
        })
      }
      for (let draft of this.findDraftsRes.items) {
        let { name, items, color } = draft
        color = color || 'grey'
        let draftEpubCfi = items[0].layers[0].figuresAbsolute[0].epubCfi
        assert(draftEpubCfi, '!draftEpubCfi')
        let draftChapterId = getChapterIdFromCfi(draftEpubCfi)
        let draftTocId = getTocIdFromCfi(draftEpubCfi) || tocId
        if (chapterId !== draftChapterId && tocId !== draftTocId) continue

        this.rendition.annotations.remove(draftEpubCfi, 'highlight') // если такая уже есть - удалим
        this.rendition.annotations.highlight(draftEpubCfi, { draft }, async (e) => {
          this.$logE('highlight clicked', draft)
          await this.showDraftInList(draft.id)
        }, undefined, {
          fill: color,
          'fill-opacity': '0.5',
          'mix-blend-mode': 'multiply',
          stroke: 'black',
          'stroke-width': '1',
          'stroke-dasharray': '3'
        })
      }
    },
    async createColorNodeBookmark (color = 'green') {
      assert(this.lastAnnotation && this.lastAnnotation.cfiRange, 'bad lastAnnotation') // делаем черновик из текущего выделения
      let nodeInput = {
        name: '',
        layout: 'HORIZONTAL',
        items: [{
          layers: [{
            contentOid: this.contentKalpa.oid,
            figuresAbsolute: [{ points: [], epubCfi: this.lastAnnotation.cfiRange }]
          }]
        }],
        vertices: [],
        spheres: [],
        category: 'FUN',
        color
      }
      let nodeSaved = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      await this.updateLastAnnotation(color)
    },
    // todo showNodeInList - сделать реализацию
    async showNodeInList (oid) {
      // TODO показать список ядер и сфокусироваться на этом ядре
      alert('todo')
    },
    async showDraftInList (id) {
      // TODO показать список заметок и сфокусироваться на этой заметке
      alert('todo')
    },
    async showItem (item) { // blink node
      if (item.populatedObject) item = item.populatedObject
      assert(item.items && item.items.length, '!items1')
      assert(item.items[0].layers, '!items2')
      assert(item.items[0].layers[0], '!items3')
      assert(item.items[0].layers[0].figuresAbsolute, '!items4')
      let figuresAbsolute = item.items[0].layers[0].figuresAbsolute

      const blink = (count = 0) => {
        let timeout = count ? 300 : 0
        setTimeout(() => {
          if (count % 2) {
            this.rendition.annotations.remove(figuresAbsolute[0].epubCfi, 'underline') // если такая уже есть - удалим
          } else {
            this.rendition.annotations.underline(figuresAbsolute[0].epubCfi)
          }
          if (count < 5) blink(++count)
        }, timeout)
      }
      await this.goToCfi(figuresAbsolute[0].epubCfi)
      blink()
    },

    async prepareToc () {
      let { toc } = await this.book.loaded.navigation
      this.toc = toc
      const populateToc = (toc) => {
        for (let chapter of toc) {
          // this.$log('chapter=', chapter)
          chapter.go = async () => {
            this.tableOfContents = false
            await this.goToCfi(chapter.href)
            await this.goToCfi(chapter.href) // почему-то первый вызов пролистывается ниже
            // let section = await this.book.section(chapter.href)
          }
          if (chapter.subitems) populateToc(chapter.subitems)
        }
      }
      populateToc(this.toc)
    },
    async prepareAudioPlayer (location) {
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
          if (chapter.subitems && chapter.subitems.length) {
            for (let subchapter of chapter.subitems) {
              res.push(...getLowestChapters(subchapter))
            }
          } else res.push(chapter)
          return res
        }
        let chapters = [] // список всех глав (если в главе есть подглавы, то выводятся ТОЛЬКО подглавы)
        for (let chapter of this.toc) {
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
        for (let i = 0; i < chapters.length; i++) {
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
        for (let i = 1; i < chapters.length; i++) {
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
        for (let i of innerChapterIndexes) {
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
      const findParagraphDomElements = (el) => {
        // let res = []
        // if (el.children.length > 1 && el.tagName !== 'head' && el.tagName !== 'html') {
        //   res.push(...el.children)
        // } else if (el.children.length && el.tagName !== 'head') {
        //   for (let child of el.children) res.push(...findAllParagraphs(child))
        // }
        // return res
        let res = []
        if (el.tagName !== 'head') {
          if (el.children.length) {
            for (let child of el.children) res.push(...findParagraphDomElements(child))
          } else {
            res.push(el)
          }
        }
        return res
      }

      // получить все абзацы для озвучки
      let section = await this.book.section(location.start.href)
      if (this.audioPlayer.currentSectionHref !== section.href) {
        this.pauseAudio()
        this.audioPlayer.audio = null
        this.audioPlayer.isPlaying = false
        this.audioPlayer.paragraphs = []
        this.audioPlayer.currentParagraphIndx = -1
        this.audioPlayer.findCutsRes = await this.$rxdb.find({
          selector: {
            rxCollectionEnum: RxCollectionEnum.LST_CONTENT_CUTS,
            oidSphere: this.contentKalpa.oid
          }
        })
        this.audioPlayer.currentSectionHref = section.href

        let contents = await section.load(this.book.load.bind(this.book))
        let paragraphElements = findParagraphDomElements(section.document) // все параграфы данного документа
        let cfiBase = new EpubCFI(location.start.cfi)
        for (let i = 1; i < paragraphElements.length; i++) {
          let prevElement = paragraphElements[i - 1]
          let nextElement = paragraphElements[i]
          let range = document.createRange();
          range.setStart(prevElement, 0);
          range.setEnd(nextElement, 0);
          let epubCfi = (new EpubCFI(range, cfiBase.base)).toString()
          let epubCfiText = range.toString()
          let cuts = this.audioPlayer.findCutsRes.items.filter(item => item.epubCfi === epubCfi) // может быть несколько вар-тов с разной озвучкой
          this.audioPlayer.paragraphs.push({ epubCfi, epubCfiText, cuts })
        }
      }
    },

    highlightCurrentParagraphAudio (currentParagraph) {
      if (this.audioPlayer.currentParagraphIndx >= 0) { // удалим старое выделение
        let oldParagraph = this.audioPlayer.paragraphs[this.audioPlayer.currentParagraphIndx]
        this.rendition.annotations.remove(oldParagraph.epubCfi, 'highlight')
      }
      if (currentParagraph) {
        this.audioPlayer.currentParagraphIndx = this.audioPlayer.paragraphs.findIndex(p => p.epubCfi === currentParagraph.epubCfi)
        this.rendition.annotations.highlight(currentParagraph.epubCfi, {}, async (e) => {
          this.$logE('highlight clicked', currentParagraph.epubCfi)
        }, undefined, {
          fill: 'green',
          'fill-opacity': '0.5',
          'mix-blend-mode': 'multiply'
        })
        this.goToCfi(currentParagraph.epubCfi)
      } else this.audioPlayer.currentParagraphIndx = -1
    },
    async playAudio () {
      this.audioPlayer.isPlaying = true
      if (this.audioPlayer.audio) { // играем текущий
        this.audioPlayer.audio.play()
      } else {
        await this.nextAudio(1)
      }
    },
    pauseAudio () {
      this.audioPlayer.isPlaying = false
      if (this.audioPlayer.audio) this.audioPlayer.audio.pause()
    },
    seekAudio (sec) {
      if (this.audioPlayer.audio) this.audioPlayer.audio.currentTime += sec
    },
    async nextAudio (step = 1, fromCurrentSelection = false) {
      let currentParagraph
      if (fromCurrentSelection) { // ищем параграф, пересекающийся с выделением
        assert(this.lastAnnotation.cfiRange, '!!bad this.lastAnnotation.cfiRange!')
        for (let { epubCfi, epubCfiText, cuts } of this.audioPlayer.paragraphs) {
          let paragraphCfiStart, paragraphCfiEnd, selectedCfiStart, selectedCfiEnd
          paragraphCfiStart = new EpubCFI(epubCfi)
          paragraphCfiStart.collapse(true)
          paragraphCfiEnd = new EpubCFI(epubCfi)
          paragraphCfiEnd.collapse(false)
          selectedCfiStart = new EpubCFI(this.lastAnnotation.cfiRange)
          selectedCfiStart.collapse(true)
          selectedCfiEnd = new EpubCFI(this.lastAnnotation.cfiRange)
          selectedCfiEnd.collapse(false)
          // a.start <= b.end AND a.end >= b.start
          let one = (new EpubCFI()).compare(paragraphCfiStart, selectedCfiEnd) // First is earlier = -1, Second is earlier = 1, They are equal = 0
          let two = (new EpubCFI()).compare(paragraphCfiEnd, selectedCfiStart) // First is earlier = -1, Second is earlier = 1, They are equal = 0
          if (one <= 0 && two >= 1) { // пересекаются
            currentParagraph = { epubCfi, epubCfiText, cuts }
            break
          }
        }
        if (!currentParagraph) return await this.nextAudio(0) // проиграем сначала
        this.clearLastAnnotation()
      } else { // играем след параграф
        currentParagraph = this.audioPlayer.paragraphs[Math.max(0, this.audioPlayer.currentParagraphIndx + step)]
      }
      this.highlightCurrentParagraphAudio(currentParagraph)
      if (currentParagraph) {
        let currentCut = currentParagraph.cuts.find(c => c.params.system === this.audioPlayer.system && c.params.voice === this.audioPlayer.voice)
        if (!this.audioPlayer.nextInternal) {
          this.audioPlayer.nextInternal = debounce(async (currentCut, currentParagraph) => {
            if (!currentCut) { // просим сервер создать новый кат
              currentCut = await ContentApi.contentCutCreate(this.contentKalpa.oid, currentParagraph.epubCfi, currentParagraph.epubCfiText, {
                system: this.audioPlayer.system,
                voice: this.audioPlayer.voice
              })
              currentParagraph.cuts.push(currentCut)
            }
            this.pauseAudio()
            this.audioPlayer.audio = new Audio(currentCut.url)
            this.audioPlayer.audio.addEventListener('ended', async (event) => {
              if (this.audioPlayer.isPlaying) {
                await this.nextAudio(1)
              }
            })
            await this.playAudio()
          }, 1000)
        }
        this.audioPlayer.nextInternal(currentCut, currentParagraph)
      }
    },
    destroyAudio () {
      this.pauseAudio()
      this.highlightCurrentParagraphAudio(null)
      this.audioPlayer.audio = null
    }
  },
  async mounted () {
    this.$log('mounted')
    // init
    this.book = new Book(this.contentKalpa.url, {})
    // book navigation ready
    await this.prepareToc()

    this.$emit('toc', this.toc)

    // initReader
    {
      this.rendition = this.book.renderTo(this.bookArea, {
        // contained: true,
        // height: this.height,
        // width: this.width
        manager: 'continuous',
        flow: 'scrolled',
        // flow: 'scrolled-doc',
        width: '100%',
        height: '100%' // this.height
        // flow: 'scrolled-doc'
      })
      this.registerThemes()
      this.setTheme(this.theme)
      this.setFontSize(this.fontSize)
      this.rendition.themes.default({
        '::selection': {
          background: 'rgba(200,200,200, 0.3)',
          color: 'black'
        }
        // 'epubjs-hl': {
        //   background: 'rgba(200,200,200, 0.3)',
        //   color: 'black'
        // }
      })
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
      this.rendition.on('rendered', async (section, iframe) => {
        // this.$log('rendered section', section)
        { // подгружаем соседние секции. Иначе при быстром скроллировании вверх - баг (отскакивает вниз на несколько глав)
          // await this.rendition.next()
          // await this.rendition.prev()
        }

        const completeSelection = () => {
          this.clearLastAnnotation() // удалим предыдущее выделение (может быть только 1 выделенный кусок)
          // выполняем через пол секунды тк mouseup срабатывает раньше чем this.rendition.on('selected'...
          this.$wait(300).then(async () => {
            this.$log('mouseup')
            if (this.cfiRangeSelectInProgress) { // закончим выделение
              this.makeLastAnnotation(this.cfiRangeSelectInProgress, 'black', '0.3')
              this.cfiRangeSelectInProgress = null
            }
          })
        }
        iframe.document.documentElement.addEventListener('mouseup', async (ev) => {
          this.$log('mouseup', ev)
          completeSelection()
        })

        // на телефонах mouseup не выстреливает при выделении (опираемся на contextmenu)
        iframe.document.documentElement.addEventListener('contextmenu', (ev) => {
          this.$log('contextmenu', ev)
            ev.preventDefault()
            completeSelection()
            return false;
        })
        // iframe.document.documentElement.addEventListener('click', (ev, ev1) => {
        //   alert('click')
        // })
      })
      this.rendition.on('keyup', this.keyListener)
      this.rendition.on('click', (ev) => {
        // this.$log('asdfsadfsadf', ev)
      })
      this.rendition.on('relocated', async (location) => {
        await this.savePosition(location.start.cfi)
        // relocated вызывается слишком часто (например при промотке или при вызове this.rendition.display...)
        if (!this.debouncedUpdateBookContent) {
          this.debouncedUpdateBookContent = debounce(async (location) => {
            this.$log('debouncedUpdateBookContent ', location.start.cfi)
            // percentageFromCfi нормально НЕ работает пока не сработал this.book.locations.generate()
            const percent = this.book.locations.percentageFromCfi(location.start.cfi)
            const percentage = percent * 100
            this.progressValue = percentage
            // let cfiLoc = this.book.locations.cfiFromLocation(location.start.index)
            // this.$log('relocated cfiLoc = ', cfiLoc)
            await this.showAllNodesForCurrentLocation()
            await this.showAllDraftsForCurrentLocation()
            await this.prepareAudioPlayer(location)
          }, 500)
        }
        this.debouncedUpdateBookContent(location)
      })
      // долгая операция
      this.locations = this.book.locations.generate().then(() => {
        // todo можно отрисовать прогресс !
      }).catch(err => this.$log('err on this.book.locations.generate', err)) // (долгая операция) нужно для того чтобы прогресс нормально считался (без этого вызова percentageFromCfi не работает)
      // window.addEventListener('resize', debounce(() => {
      //   this.resizeToScreenSize()
      // }, 250))
      // this.updateScreenSizeInfo()
    }
    await this.book.ready // book ready
    await this.restorePosition()
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
        if (this.$refs.nameInput) this.$refs.nameInput.dispatchEvent(new CustomEvent(event, { detail: val }))
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
