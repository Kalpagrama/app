<template lang="pug">
div(
  :style=`{
    position: 'relative',
    //- ...styles,
    height: '100%',
  }`
  ).column.full-width.bg-black
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
  .row.full-width.justify-center
    input(v-model="cfi" width="300").row.full-width
    q-btn(round flat color="white" icon="check" @click='goToCfi')
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
      default: 'night'
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
      locations: null,
      selection: {
        cfiRange: null,
        text: null
      },
      isFullscreen: false,
      contentBookmark: null,
      tableOfContents: false,
      cfi: 'epubcfi(/6/12[id83]!/4/2/2[id2]/12,/1:0,/1:263)'
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
    async goToCfi () {
      this.$log('goToCfi', this.cfi)
      let loc = await this.rendition.currentLocation()
      this.$log('loc=', loc)
      this.$log('loc start=', loc.start.cfi)
      this.$log('loc end=', loc.end.cfi)

      // let spineItem = this.book.spine.get(this.cfi);
      // this.$log('loc spineItem=', spineItem)
      // let navItem = this.book.navigation.get(spineItem.href);
      // this.$log('loc navItem=', navItem)
      // this.$log('loc navItem=', navItem)

      // let cfi = new EpubCFI(this.cfi)
      // this.$log('loc cfi=', cfi)
      // cfi.collapse(true)
      //
      // this.$log('loc start=', cfi)
      //
      // let spineItem = this.book.spine.get(cfi);
      // this.$log('loc spineItem=', spineItem)
      // this.$log('loc spineItem=', spineItem.href)
      // let navItem = this.book.navigation.get(spineItem.href);
      // this.$log('loc navItem=', navItem)
      //
      // this.$log('loc end=', loc.end.cfi)

      await this.rendition.display(this.cfi)
      // await this.rendition.annotations.highlight(this.cfi)

      // let loc2 = await this.book.locations.locationFromCfi(this.cfi)
      // this.$log('loc loc2=', loc2)
      // this.$log('loc loc2=', loc2)
    },
    async showTableOfContents () {
      this.tableOfContents = !this.tableOfContents
    },
    setTheme (theme) {
      this.rendition.themes.select(theme)
      document.body.style.background = this.themes[theme].body.background
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
    }
  },
  async mounted () {
    this.$log('mounted')
    // init
    this.book = new Book(this.contentKalpa.url, {})
    // book navigation ready
    let { toc } = await this.book.loaded.navigation
    this.toc = toc
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
        // this.$log('selected', cfiRange)
        let range = await this.book.getRange(cfiRange)
        if (range) {
          this.$log('current range', cfiRange)
          this.selection.cfiRange = cfiRange // запомним тут. Обработаем в mouseup
          this.selection.text = range.toString()
        }
        // // // contents.window.getSelection().removeAllRanges();
      })
      this.rendition.on('rendered', (section, iframe) => {
        iframe.document.documentElement.addEventListener('mouseup', async (ev) => {
          if (this.selection.cfiRange){ // закончим выделение
            let rangeCurrent = this.selection.cfiRange
            this.rendition.annotations.highlight(this.selection.cfiRange, {}, (e) => {
              console.log('highlight clicked', rangeCurrent);
            }, undefined, {
              fill: 'gold',
              'fill-opacity': '0.3',
              'mix-blend-mode': 'multiply',
            })
            // let range = await this.book.getRange(this.selection.cfiRange)
            // console.error('range=', range)

            this.selection.cfiRange = null
            this.selection.text = null
          }
        })
        iframe.document.documentElement.addEventListener('contextmenu', (ev) => {
          ev.preventDefault();
          console.error(ev)
          alert('contextmenu')
          // ev.preventDefault()
          return false;
        })
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
        this.$log('relocated (progress) = ', percentage)
        if (this.contentBookmark){ // save position
          if (!this.contentBookmark.meta) this.$set(this.contentBookmark, 'meta', {})
          this.contentBookmark.meta.currentCfi = location.start.cfi
        }
      })

      this.book.spine.hooks.serialize.register(function(text, section, xxx) {
        // this.$log('this.book.spine.hooks.serialize')
        return true
      })
    }

    const populateToc = (toc) => {
      for (let chapter of toc){
        // this.$log('chapter=', chapter)
        chapter.go = () => {
          alert('go ' + chapter.label)
          this.tableOfContents = false
          this.rendition.display(chapter.href)
        }
        if (chapter.subitems) populateToc(chapter.subitems)
      }
    }
    populateToc(toc)

    // go to saved position
    let [bookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.contentKalpa.oid}})
    this.contentBookmark = bookmark
    if (this.contentBookmark && this.contentBookmark.meta && this.contentBookmark.meta.currentCfi) this.rendition.display(this.contentBookmark.meta.currentCfi)

    await this.book.ready // book ready
    this.ready = true
    let locs = await this.book.locations.generate() // нужно для того чтобы прогресс нормально считался (без этого вызова percentageFromCfi не работает)
    // this.$log('locations.generate tm = ', Date.now() - tm)
    // this.locations = JSON.parse(this.book.locations.save())
    // this.$log('this.locations=', this.locations)
    // let i = 0
    // for (let cfi of this.locations) {
    //   if (++i < 100) continue
    //   await this.rendition.display(cfi)
    //   await this.$wait(1000)
    //   await this.rendition.annotations.highlight(cfi)
    // }
    this.$emit('player', this)

    // window.addEventListener('resize', debounce(() => {
    //   this.resizeToScreenSize()
    // }, 250))
    // this.updateScreenSizeInfo()
  },
  created () {
    this.$log('created')
    // window.addEventListener('keyup', this.keyListener)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // window.removeEventListener('keyup', this.keyListener)
  }
}
</script>
