<style lang="sass">
iframe
  ::selection
    color: white
    background: green
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
  }`
  ).column.full-width
  player-node(:oid="showNodeOid" @close="showNodeOid = null")
  //- fictive/invisible input for emit/on/off events with native html element events
  input(v-model="name" ref="nameInput" :style=`{display: 'none'}`)
  //- figure editor + audioplayer
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="!figure"
      :style=`{
        position: 'absolute', zIndex: 1000,
        bottom: '80px',
      }`
      ).row.full-width.justify-center
      slot(name="tint-bar" :tintFocused="true")
      //- (lastAnnotation && !audioPlayer.audio)
      div(
        v-if="lastAnnotation"
        :style=`{
          width: '300px',
          borderRadius: '20px',
          background: 'rgba(30,30,30,0.8)',
        }`
        ).row.items-center.content-center.q-pa-md
        //- q-btn(round flat color="green" icon="play_arrow" @click="nextAudio(0, true)")
        q-btn(
          v-if="showDraftId"
          round flat color="red" icon="delete_outline"
          @click="showDraftDelete")
        .col
        q-btn(round flat color="red" icon="lens" @click="createColorNodeBookmark('red')")
        q-btn(round flat color="green" icon="lens" @click="createColorNodeBookmark('green')")
        q-btn(round flat color="purple" icon="lens" @click="createColorNodeBookmark('purple')")
        .col
        //- q-btn(round flat color="white" icon="keyboard_arrow_left" @click="updateLastAnnotation(null, null, -1)")
        //- q-btn(round flat color="white" icon="keyboard_arrow_right" @click="updateLastAnnotation(null, null, 1)")
        q-btn(v-if="!figure" @click='showNodeInputForm' round flat dense color="green" icon="add_circle_outline")
        q-btn(v-if="figure" @click='hideNodeInputForm' round flat dense color="white" icon="clear")
  //- table of contents
  transition(enter-active-class="animated slideInLeft" leave-active-class="animated slideOutLeft")
    player-toc(
      v-if="toc && tocShow"
      :toc="toc"
      :tocId="tocId"
      :style=`{
        position: 'absolute', top: '0px', left: '0px', zIndex: 1000,
        height: 'calc(100% - 50px)',
      }`
      @close="tocShow = false")
  //- body book area wrapper
  div(
    :style=`{
      position: 'relative',
      borderRadius: '10px',
      overflow: 'hidden',
      background: '#f3e8d2',
    }`).col.full-width
    q-resize-observer(@resize="onResize" :debounce="300")
    //- book ara
    div(
      ref="book-area"
      :style=`{
        borderRadius: '0 0 10px 10px'
      }`).row.fit
  //- footer
  .row.full-width.justify-center.q-pa-xs
    slot(name="footer")
    //- input(v-model="cfi" width="500").row.full-width
    //- q-btn(round flat color="green" icon="check" @click="goToCfiDebug(cfi)")
    .col
    q-btn(flat color="white" no-caps icon="keyboard_arrow_left" @click='goToPrevPage')
      span().gt-xs Пред. глава
    q-btn(flat color="white" no-caps icon-right="keyboard_arrow_right" @click='goToNextPage')
      span().gt-xs След. глава
    .col
    q-btn(round flat :color="tocShow ? 'green' : 'white'" icon="toc" @click="tocShow = !tocShow")
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

import playerToc from './player_toc.vue'
import playerNode from './player_node.vue'

export default {
  name: 'contentPlayer_book',
  components: {
    playerToc,
    playerNode,
  },
  props: {
    contentKalpa: {
      type: Object,
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
          '::selection': {
            background: 'rgba(76,175,79, 0.5)'
          },
          name: 'WHITE'
        },
        beige: {
          body: {
            color: '#000000',
            background: '#f3e8d2'
          },
          '::selection': {
            background: 'rgba(76,175,79, 0.5)'
          },
          name: 'BEIGE',
        },
        night: {
          body: {
            color: '#c8c8c8',
            background: '#282828'
          },
          '::selection': {
            background: 'rgba(76,175,79, 0.5)'
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
    contentBookModify: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      tocShow: false,
      tocId: null,
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
      // tableOfContents: false,
      cfiRangeSelectInProgress: null, // начатое выделение (начали выделять)
      lastAnnotation: null, // текущее выделение
      figure: null, // текущее выделение TODO почему называется figure, а не figuresAbsolute???
      events: {},
      findNodesRes: null, // список всех ядер на контенте
      findDraftsRes: null, // список всех черновиков на контенте
      showNodeOid: null,
      showDraftId: null,
      nodePlaying: null,
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
  },
  computed: {
    url () { return ContentApi.urlSelect(this.contentKalpa) }
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
      if (epubCfi) await this.rendition.display(epubCfi)
      else await this.rendition.display()
    },
    async goToCfiDebug (epubCfi) {
      this.$log('goToCfi', epubCfi)
      await this.rendition.display(epubCfi)
      this.rendition.annotations.highlight(epubCfi, {}, async (e) => {
        this.$logE('highlight clicked', epubCfi)
        // TODO: opend node in popup ?
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
    hideNodeInputForm () {
      this.$log('hideNodeInputForm')
      this.figure = null
    },
    async showNodeInputForm () {
      this.$log('showNodeInputForm')
      if (this.$store.getters.currentUser().profile.role === 'GUEST') {
        let authGuard = {
          message: 'Чтобы создать ядро, войдите в аккаунт.'
        }
        this.$store.commit('ui/stateSet', ['authGuard', authGuard])
      }
      else {
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
      }
    },
    clearLastAnnotation () {
      this.$log('clearLastAnnotation')
      if (this.lastAnnotation) {
        this.rendition.annotations.remove(this.lastAnnotation.cfiRange, 'highlight')
      }
      this.lastAnnotation = null
      this.showDraftId = null
      this.figure = null
    },
    updateLastAnnotation (color, startOffset, endOffset) {
      this.$log('updateLastAnnotation')
      // safari не поддерживает Lookbehind!!! Пока отключаем. Если потребуется - сделать без регулярки

      // assert(this.lastAnnotation, '!this.lastAnnotation')
      // let cfiRange = this.lastAnnotation.cfiRange
      // color = color || this.lastAnnotation.styles.fill
      // if (endOffset) {
      //   cfiRange = cfiRange.replace(/(?<=epubcfi\(.*,.*,\/.*:).*(?=\))/, function (a, b) {
      //     return parseInt(a) + endOffset
      //   })
      // }
      // this.clearLastAnnotation() // удалим старую и нарисуем новую
      // this.makeLastAnnotation(cfiRange, color, '0.3')
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
        epubTocId = epubTocId || ''
        if (chapterId === epubChapterId /* && epubTocId === (tocId || epubTocId) */) {
          for (let item of group.items) {
            let { oid, name, vertexType, figuresAbsoluteList, relatedOids, rate, weight, countVotes } = item
            for (let figuresAbsolute of figuresAbsoluteList) {
              this.rendition.annotations.remove(figuresAbsolute[0].epubCfi, 'highlight') // если такая уже есть - удалим
              this.rendition.annotations.highlight(figuresAbsolute[0].epubCfi, { item }, async (e) => {
                this.$logE('highlight clicked 3', item)
                await this.showNodeInList(item.oid)
              }, undefined, {
                fill: 'indigo',
                'fill-opacity': '0.5',
                'mix-blend-mode': 'multiply'
              })
            }
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
        let draftTocId = getTocIdFromCfi(draftEpubCfi) || ''
        if (chapterId === draftChapterId /* && draftTocId === (tocId || draftTocId) */) {
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
      }
    },
    // делаем черновик из текущего выделения
    async createColorNodeBookmark (color = 'green') {
      assert(this.lastAnnotation && this.lastAnnotation.cfiRange, 'bad lastAnnotation')
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
    // TODO: показать список ядер и сфокусироваться на этом ядре
    async showNodeInList (oid) {
      this.$log('showNodeInList', oid)
      this.showNodeOid = oid
    },
    // TODO: показать список заметок и сфокусироваться на этой заметке
    async showDraftInList (id) {
      this.$log('showDraftInList', id)
      // draft by id
      let { items: [nodeDraft] } = await this.$rxdb.find({
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          id: id,
        }
      })
      if (nodeDraft) {
        this.$log('nodeDraft', nodeDraft)
        let cfiRange = nodeDraft.items[0].layers[0].figuresAbsolute[0].epubCfi
        this.makeLastAnnotation(cfiRange, 'red', 0.5)
      }
      this.showDraftId = id
    },
    async showDraftDelete () {
      this.$log('showDraftDelete')
      if (this.showDraftId) {
        await this.$rxdb.remove(this.showDraftId)
        this.showDraftId = null
        await this.showAllDraftsForCurrentLocation()
      }
    },
    // blink node
    async showItem (item) {
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
            // this.tableOfContents = false
            await this.goToCfi(chapter.href)
            await this.goToCfi(chapter.href) // почему-то первый вызов пролистывается ниже
            // let section = await this.book.section(chapter.href)
          }
          if (chapter.subitems) populateToc(chapter.subitems)
        }
      }
      populateToc(this.toc)
    }
  },
  async mounted () {
    this.$log('mounted')
    // init
    this.book = new Book(this.url, {})
    // book navigation ready
    await this.prepareToc()
    // this.$emit('toc', this.toc)
    // initReader
    {
      this.rendition = this.book.renderTo(this.$refs['book-area'], {
        // manager: 'continuous',
        flow: 'scrolled-doc', // scrolled, paginated
        width: '100%',
        height: '100%'
      })
      this.registerThemes()
      this.setTheme(this.theme)
      this.setFontSize(this.fontSize)
      // this.rendition.themes.default({
      //   '::selection': {
      //     background: 'rgba(200,200,200, 0.3)',
      //     color: 'black'
      //   }
      //   // 'epubjs-hl': {
      //   //   background: 'rgba(200,200,200, 0.3)',
      //   //   color: 'black'
      //   // }
      // })
      // on selection, close on mouseup or touchend...
      this.rendition.on('selected', async (cfiRange, contents) => {
        this.$log('selected', cfiRange, contents)
        this.cfiRangeSelectInProgress = cfiRange // запомним тут. Обработаем в mouseup
        // let range = await this.book.getRange(cfiRange)
        // if (range) {
        //   this.$log('selected2', cfiRange)
        //   this.cfiRangeSelectInProgress = cfiRange // запомним тут. Обработаем в mouseup
        // }
        // contents.window.getSelection().removeAllRanges();
      })
      // on rendered to work with DOM of iframe...
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
      // handle keyboard events, dont work
      this.rendition.on('keyup', this.keyListener)
      // handle click ?
      this.rendition.on('click', (ev) => {
        // this.$log('asdfsadfsadf', ev)
      })
      // handle relocation, save position, show drafts and nodes...
      this.rendition.on('relocated', async (location) => {
        await this.savePosition(location.start.cfi)
        // relocated вызывается слишком часто (например при промотке или при вызове this.rendition.display...)
        if (!this.debouncedUpdateBookContent) {
          this.debouncedUpdateBookContent = debounce(async (location) => {
            this.$log('debouncedUpdateBookContent ', location.start.cfi)
            // let currentLocation = await this.rendition.currentLocation()
            // let chapterId = getChapterIdFromCfi(currentLocation.start.cfi)
            this.tocId = getTocIdFromCfi(location.start.cfi)
            // percentageFromCfi нормально НЕ работает пока не сработал this.book.locations.generate()
            const percent = this.book.locations.percentageFromCfi(location.start.cfi)
            const percentage = percent * 100
            this.progressValue = percentage
            // let cfiLoc = this.book.locations.cfiFromLocation(location.start.index)
            // this.$log('relocated cfiLoc = ', cfiLoc)
            await this.showAllNodesForCurrentLocation()
            await this.showAllDraftsForCurrentLocation()
            // await this.prepareAudioPlayer(location)
          }, 500)
        }
        this.debouncedUpdateBookContent(location)
      })
      // create locations...
      // долгая операция
      this.locations = this.book.locations.generate().then(() => {
        // todo можно отрисовать прогресс !
      }).catch(err => this.$log('err on this.book.locations.generate', err)) // (долгая операция) нужно для того чтобы прогресс нормально считался (без этого вызова percentageFromCfi не работает)
      // window.addEventListener('resize', debounce(() => {
      //   this.resizeToScreenSize()
      // }, 250))
      // this.updateScreenSizeInfo()
    }
    // book ready
    await this.book.ready
    await this.restorePosition()
    // everything ready, emit player!
    this.$emit('player', this)
  },
  created () {
    this.$log('created')
    // create events with fake input, html element here...
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
    // window.addEventListener('keyup', this.keyListener)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // window.removeEventListener('keyup', this.keyListener)
  }
}
</script>
