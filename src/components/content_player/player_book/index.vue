<style lang="sass">
iframe
  ::selection
    color: white
    background: green
</style>

<template lang="pug">
div( :style=`{height: '100%',overflow: 'hidden'}`).column.full-width.relative-position
  player-node(:node="selectedEssence" @close="selectedEssence = null").br
  //- fictive/invisible input for emit/on/off events with native html element events
  input(v-model="name" ref="nameInput" :style=`{display: 'none'}`)
  //- figure editor + audioplayer
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(:style=`{ position: 'absolute', zIndex: 1000,bottom: '80px'}`).row.full-width.justify-center
      slot(name="tint-bar" :tintFocused="true")
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
  //- settings
  div(
    v-if="settingsShow"
    :style=`{zIndex: 1000, width: '70%'}`
  ).absolute-center
    player-settings(:settings="settings" @close="settingsShow = false" :style=`{borderRadius: '20px'}`).b-40
  //- book wrapper
  div(:style=`{ border: '3px solid #222',overflow: 'hidden'}`).col.full-width.relative-position.br-10
    q-resize-observer(@resize="onResize" :debounce="300")
    //- book area
    div(ref="book-area").row.fit
  // progress
  q-linear-progress(size='5px' :value="progressValue / 100" color="green-10").row.full-width.q-px-sm
  //- footer
  .row.full-width.justify-center.q-pa-xs
    slot(name="footer")
    //- input(v-model="cfi" width="500").row.full-width
    //- q-btn(round flat color="green" icon="check" @click="goToCfiDebug(cfi)")
    .col
    q-btn(flat color="white" no-caps icon="keyboard_arrow_left" @click='goToPrevPage')
      span().gt-xs {{$t('Prev chapter')}}
    q-btn(flat color="white" no-caps icon-right="keyboard_arrow_right" @click='goToNextPage')
      span().gt-xs {{$t('Next chapter')}}
    .col
    q-btn(round flat :color="tocShow ? 'green' : 'white'" icon="toc" @click="tocShow = !tocShow")
    q-btn(round flat :color="settingsShow ? 'green' : 'white'" icon="settings" @click="settingsShow = !settingsShow")
    //- input(size='3' type='range' max='100' min='0' step='1' @change='goToPercent($event.target.value)' :value='progress')
    //- input(type='text' :value='progress' @change='goToPercent($event.target.value)')
</template>

<script>
import { Book } from 'epubjs'
import debounce from 'lodash/debounce'
import { assert } from 'src/system/common/utils'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import { getChapterIdFromCfi, getTocIdFromCfi } from 'src/system/rxdb/common'
import { ContentApi } from 'src/api/content'
import playerToc from './player_toc.vue'
import playerSettings from './player_settings.vue'
import playerNode from './player_node.vue'

export default {
  name: 'contentPlayer_book',
  components: {
    playerToc,
    playerSettings,
    playerNode
  },
  props: {
    contentKalpa: {
      type: Object,
      required: true
    },
    themes: {
      type: Object,
      required: true,
      default () {
        return {
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
            'a:link': {
              color: 'green'
            },
            'a:visited': {
              color: 'grey'
            },
            'a:hover': {
              color: 'teal !important'
            },
            body: {
              color: '#000000',
              background: '#f3e8d2'
            },
            '::selection': {
              background: 'rgba(76,175,79, 0.5)'
            },
            name: 'BEIGE'
          },
          night: {
            'a:link': {
              color: 'green'
            },
            'a:visited': {
              color: 'grey'
            },
            'a:hover': {
              color: 'teal !important'
            },
            body: {
              color: 'silver',
              background: 'rgb(30,30,30)',
              'font-family': 'Roboto, sans-serif !important'
            },
            '::selection': {
              background: 'rgba(76,175,79, 0.5)'
            },
            name: 'NIGHT'
          }
        }
      }
    },
    theme: {
      type: String,
      required: true,
      default: 'night'
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
      settingsShow: false,
      settings: null,
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
      currentSelection: null, // текущее выделение
      figure: null, // текущее выделение
      selectedItem: null, // активное ядро
      events: {},
      findNodesRes: null, // список всех ядер на контенте
      findDraftsRes: null, // список всех черновиков на контенте
      selectedEssence: null,
      selectedDraft: null,
      nodePlaying: null
    }
  },
  watch: {
    theme (val) {
      this.setTheme(val)
    },
    settings: {
      deep: true,
      async handler (to, from) {
        this.$log('settings=', to)
        assert(to.fontSize && to.fontSize >= 50 && to.fontSize <= 200)
        this.rendition.themes.fontSize(to.fontSize + '%')
        await rxdb.set(RxCollectionEnum.META, { id: 'playerBookSettings', valueString: JSON.stringify(this.settings) })
      }
    },
    progressValue (val) {
      this.$emit('update:progress', val)
    }
  },
  computed: {
    url () {
      return ContentApi.urlSelect(this.contentKalpa)
    }
  },
  methods: {
    setState (key, val) {
      // this.$log('setState', key, val)
      this.$set_deprecated(this, key, val)
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
        if (!this.contentBookmark.meta) this.$set_deprecated(this.contentBookmark, 'meta', {})
        this.contentBookmark.meta.currentCfi = epubCfi
      }
    },
    async restorePosition () {
      let cfi = null
      if (this.$route.query.wsNodeId) {
        let wsNode = await this.$rxdb.get(RxCollectionEnum.WS_ANY, this.$route.query.wsNodeId)
        cfi = wsNode.items[0].layers[0].figuresAbsolute[0].epubCfi
        this.selectedDraft = wsNode
      } else {
        // go to saved position (хранится внутри закладки)
        let { items: [bookmark] } = await this.$rxdb.find({
          selector: {
            rxCollectionEnum: RxCollectionEnum.WS_ANY,
            oid: this.contentKalpa.oid
          }
        })
        this.contentBookmark = bookmark
        if (this.contentBookmark && this.contentBookmark.meta && this.contentBookmark.meta.currentCfi) cfi = this.contentBookmark.meta.currentCfi
      }
      await this.goToCfi(cfi)
      await this.goToCfi(cfi) // epubjs глючит и не переключается с первого раза
    },
    async goToPercent (value) {
      const percentage = value / 100
      const target = percentage > 0 ? this.book.locations.cfiFromPercentage(percentage) : null
      await this.goToCfi(target)
      if (percentage === 1) await this.goToNextPage()
    },
    clearSelection () {
      this.$log('clearSelection', this.currentSelection, this.selectedDraft)
      if (this.currentSelection) {
        this.rendition.annotations.remove(this.currentSelection.cfiRange, 'highlight')
      }
      // this.currentSelection = null
      // this.figure = null
      // this.selectedEssence = null
      // this.selectedDraft = null
    },
    updateSelection (color, startOffset, endOffset) {
      this.$log('updateSelection')
      // safari не поддерживает Lookbehind!!! Пока отключаем. Если потребуется - сделать без регулярки

      // assert(this.currentSelection, '!this.currentSelection')
      // let cfiRange = this.currentSelection.cfiRange
      // color = color || this.currentSelection.styles.fill
      // if (endOffset) {
      //   cfiRange = cfiRange.replace(/(?<=epubcfi\(.*,.*,\/.*:).*(?=\))/, function (a, b) {
      //     return parseInt(a) + endOffset
      //   })
      // }
      // this.clearSelection() // удалим старую и нарисуем новую
      // this.makeSelection(cfiRange, color, '0.3')
    },
    makeSelection (cfiRange, color, opacity) {
      this.currentSelection = this.rendition.annotations.highlight(cfiRange, {}, async (e) => {
        this.$log('selection highlight clicked', cfiRange)
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
            objectTypeEnum: { $in: ['NODE', 'JOINT', 'BLOCK'] },
            // objectTypeEnum: { $in: ['NODE'] },
            oidSphere: this.contentKalpa.oid,
            sortStrategy: 'AGE',
            groupByContentLocation: true
          },
          populateObjects: false
        })
        // массив изменился (скорей всего создали новое ядро и оно добавилось в массив) - нарисуем заново
        this.$watch('findNodesRes.items', async (newVal, oldVal) => {
          // this.clearSelection() // иначе при добавлении нового ядра, новое выделение исчезнет после клика мышкой (см addEventListener('mouseup' ...))
          await this.showAllNodesForCurrentLocation()
        }, {
          immediate: false,
          deep: true
        })
      }
      // this.$log('allNodes', this.findNodesRes)
      for (let group of this.findNodesRes.items) {
        let { epubChapterId, epubTocId, epubHref } = group.figuresAbsolute[0] || {}
        epubTocId = epubTocId || ''
        if (chapterId === epubChapterId /* && epubTocId === (tocId || epubTocId) */) {
          for (let item of group.items) {
            // console.error('item=', cloneDeep(item))
            let { oid, name, vertexType, figuresAbsoluteList, relatedOids, rate, weight, countVotes } = item
            for (let figuresAbsolute of figuresAbsoluteList) {
              this.rendition.annotations.remove(figuresAbsolute[0].epubCfi, 'highlight') // если такая уже есть - удалим
              this.rendition.annotations.highlight(figuresAbsolute[0].epubCfi, { item }, async (e) => {
                this.$logD('node highlight clicked', item)
                this.selectedEssence = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
              }, undefined, {
                fill: rate ? this.$rateMeta.find(r => this.$rateMeta.checkHitRate(rate, r)).color : 'rgba(156,39,176,0.7)',
                'fill-opacity': '0.5',
                'mix-blend-mode': 'multiply'
              })
            }
          }
        }
      }
    },
    async showAllDraftsForCurrentLocation () {
      this.$logD('showAllDraftsForCurrentLocation start')
      let currentLocation = await this.rendition.currentLocation()
      let chapterId = getChapterIdFromCfi(currentLocation.start.cfi)
      let tocId = getTocIdFromCfi(currentLocation.start.cfi)
      let href = currentLocation.start.href
      if (!this.findDraftsRes) {
        this.findDraftsRes = await this.$rxdb.find({
          selector: {
            rxCollectionEnum: RxCollectionEnum.WS_NODE,
            'items.layers.contentOid': this.contentKalpa.oid
          }
        })
        // массив изменился (скорей всего создали новое ядро и оно добавилось в массив) - нарисуем заново
        this.$watch('findDraftsRes.items', async (newVal, oldVal) => {
          this.$logD('showAllDraftsForCurrentLocation items changed', oldVal.length, newVal.length)
          // this.clearSelection() // иначе при добавлении нового ядра, новое выделение исчезнет после клика мышкой (см addEventListener('mouseup' ...))
          await this.showAllDraftsForCurrentLocation() // выделим заново
        }, {
          immediate: false,
          deep: true
        })
      }
      if (this.tmpDraftEpubCfis) {
        for (let cfi of this.tmpDraftEpubCfis) {
          this.$log('this.rendition.annotations.remove:', cfi)
          this.rendition.annotations.remove(cfi, 'highlight')
          this.rendition.annotations.remove(cfi, 'highlight')
          this.rendition.annotations.remove(cfi, 'highlight')
        }
      }
      this.tmpDraftEpubCfis = []
      for (let draft of this.findDraftsRes.items) {
        // this.$logD('draft item=', draft)
        let { name, items, color } = draft
        color = color || 'grey'
        let draftEpubCfi = items[0].layers[0].figuresAbsolute[0].epubCfi
        assert(draftEpubCfi, '!draftEpubCfi')
        this.tmpDraftEpubCfis.push(draftEpubCfi)
        let draftChapterId = draft?.meta?.chapterId || getChapterIdFromCfi(draftEpubCfi)
        let draftTocId = getTocIdFromCfi(draftEpubCfi) || ''
        if (chapterId === draftChapterId /* && draftTocId === (tocId || draftTocId) */) {
          // this.$logT('annotations.highlight')
          this.rendition.annotations.remove(draftEpubCfi, 'highlight') // если такая уже есть - удалим
          this.rendition.annotations.highlight(draftEpubCfi, { draft }, async (e) => {
            this.$log('draft highlight clicked', draft)
            // закомментил (иначе при удалении черновика не снимается выделение)
            // this.makeSelection(draft.items[0].layers[0].figuresAbsolute[0].epubCfi, draft.color || 'black', 0.2)
            this.figure = draft.items[0].layers[0].figuresAbsolute[0]
            this.selectedDraft = draft
          }, undefined, {
            fill: color,
            'fill-opacity': '0.15',
            'mix-blend-mode': 'multiply',
            stroke: color,
            'stroke-width': '1',
            'stroke-dasharray': '3'
          })
        }
      }
    },
    // делаем черновик из текущего выделения
    async createColorNodeDraft (color, cfiRange, temporary = true) {
      this.$logD('createColorNodeDraft')
      assert(cfiRange, 'bad cfiRange')
      let range = await this.book.getRange(cfiRange)
      let currentLocation = await this.rendition.currentLocation()
      let chapterId = getChapterIdFromCfi(currentLocation.start.cfi)
      let nodeInput = {
        name: '',
        thumbUrl: this.contentKalpa.thumbUrl,
        layout: 'HORIZONTAL',
        items: [{
          layers: [{
            contentOid: this.contentKalpa.oid,
            figuresAbsolute: [{ points: [], epubCfi: cfiRange, epubCfiText: range.toString() }]
          }]
        }],
        vertices: [],
        spheres: [],
        // category: 'FUN',
        temporary,
        color,
        meta: {chapterId}
      }
      let nodeSaved = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      await this.updateSelection(color)
      return nodeSaved
    },
    // TODO: показать список ядер и сфокусироваться на этом ядре
    // async showNodeInList (oid) {
    //   this.$log('showNodeInList', oid)
    // },
    // TODO: показать список заметок и сфокусироваться на этой заметке
    // async showDraftInList (id) {
    //   // this.$log('showDraftInList', id)
    //   // // draft by id
    //   // let { items: [nodeDraft] } = await this.$rxdb.find({
    //   //   selector: {
    //   //     rxCollectionEnum: RxCollectionEnum.WS_NODE,
    //   //     id: id,
    //   //   }
    //   // })
    //   // if (nodeDraft) {
    //   //   this.$log('nodeDraft', nodeDraft)
    //   //   let cfiRange = nodeDraft.items[0].layers[0].figuresAbsolute[0].epubCfi
    //   //   this.makeSelection(cfiRange, nodeDraft.color || 'black', 0.2)
    //   // }
    //   // this.showDraftId = id
    // },
    // async showDraftDelete () {
    //   // this.$log('showDraftDelete')
    //   // if (this.showDraftId) {
    //   //   await this.$rxdb.remove(this.showDraftId)
    //   //   this.showDraftId = null
    //   //   await this.showAllDraftsForCurrentLocation()
    //   // }
    // },
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
  async created () {
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
      this.settings = JSON.parse(await rxdb.get(RxCollectionEnum.META, 'playerBookSettings')) || { fontSize: 100 }
      // this.setFontSize(200)
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
        this.$logD('selected', cfiRange, contents)
        this.selectedDraft = null // сбросим. чтобы убрать окно редактирования ядра
        this.cfiRangeSelectInProgress = cfiRange // запомним тут. Обработаем в mouseup
        // let range = await this.book.getRange(cfiRange)
        // if (range) {
        //   this.$log('selected2', cfiRange)
        //   this.cfiRangeSelectInProgress = cfiRange // запомним тут. Обработаем в mouseup
        // }
        this.contentsWindowSelection = contents.window.getSelection()
      })
      // on rendered to work with DOM of iframe...
      this.rendition.on('rendered', async (section, iframe) => {
        // this.$log('rendered section', section)
        { // подгружаем соседние секции. Иначе при быстром скроллировании вверх - баг (отскакивает вниз на несколько глав)
          // await this.rendition.next()
          // await this.rendition.prev()
        }

        const completeSelection = () => {
          // this.clearSelection() // удалим предыдущее выделение (может быть только 1 выделенный кусок)
          // выполняем через пол секунды тк mouseup срабатывает раньше чем this.rendition.on('selected'...
          this.$wait(300).then(async () => {
            // this.$logT('completeSelection ')
            if (this.cfiRangeSelectInProgress) { // закончим выделение
              // this.makeSelection(this.cfiRangeSelectInProgress, 'black', '0.3')
              this.selectedDraft = await this.createColorNodeDraft('orange', this.cfiRangeSelectInProgress)
              this.cfiRangeSelectInProgress = null
              if (this.contentsWindowSelection && !this.$q.platform.is.mobile) this.contentsWindowSelection.removeAllRanges();
            }
          })
        }
        iframe.document.documentElement.addEventListener('mouseup', async (ev) => {
          // this.$logT('mouseup', ev)
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
  async beforeUnmount () {
    this.$log('beforeDestroy')
    // window.removeEventListener('keyup', this.keyListener)
  }
}
</script>
