<template lang="pug">
  q-page-container
    q-page.row.full-width.justify-center
      div(
        :style=`{maxWidth: '700px', height: '60px',borderRadius: '10px',}`
      ).row.full-width.items-center.content-center.b-40.q-px-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click='goToPrevPage')
        q-btn(round flat color="white" icon="keyboard_arrow_right" @click='goToNextPage')
        input(size='3' type='range' max='100' min='0' step='1' @change='onChange($event.target.value)' :value='progress')
        input(type='text' :value='progress' @change='onChange($event.target.value)')
        q-btn(v-if="selection.cfiRange" round flat color="white" icon="add_circle" @click='createEssence')
      div(
        :id='bookArea'
        :style=`{maxWidth: '600px',borderRadius: '10px',}`
      ).row.full-width.items-center.content-center.b-40.q-px-sm
</template>

<script>
import {Book, EpubCFI} from 'epubjs'
import debounce from 'lodash/debounce'
import * as assert from 'assert'

export default {
  name: 'contentPlayer_book',
  props: {
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
            color: '#000000',
            background: '#ffffff'
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
            color: '#ffffff',
            background: '#4a4a4a'
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
      cfi: null,
      width: 0,
      height: 0,
      locations: null,
      selection: {
        cfiRange: null,
        text: null
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
    }
  },
  methods: {
    initReader () {
      this.rendition = this.book.renderTo(this.bookArea, {
        contained: true,
        height: this.height
      })
      this.registerThemes()
      this.setTheme(this.theme)
      this.setFontSize(this.fontSize)
      this.rendition.display()
      this.rendition.on('selected', async (cfiRange, contents) => {
        // this.$log('selected', cfiRange)
        if (this.selection.cfiRange) {
          // this.$log('remove range', cfiRange)
          this.rendition.annotations.remove(this.selection.cfiRange, 'highlight')
          this.selection.cfiRange = null
          this.selection.text = null
        }
        let range = await this.book.getRange(cfiRange)
        if (range) {
          this.$log('current range', cfiRange)
          this.selection.cfiRange = cfiRange
          this.selection.text = range.toString()
          this.rendition.annotations.highlight(cfiRange, {})
        }
        // contents.window.getSelection().removeAllRanges();
      })
      this.rendition.on('keyup', this.keyListener)
    },
    registerThemes () {
      this.rendition.themes.register(this.themes)
    },
    goToPrevPage () {
      this.rendition.prev()
    },
    goToNextPage () {
      this.rendition.next()
    },
    setTheme (theme) {
      this.rendition.themes.select(theme)
      document.body.style.background = this.themes[theme].body.background
    },
    setFontSize (size) {
      this.rendition.themes.fontSize(size + '%')
    },
    onChange (value) {
      const percentage = value / 100
      const target = percentage > 0 ? this.book.locations.cfiFromPercentage(percentage) : 0
      this.rendition.display(target)
      if (percentage === 1) this.goToNextPage()
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
    async createEssence () {
      this.$log('createEssence', this.selection.cfiRange, this.selection.text)
      assert(this.selection.cfiRange, '! this.selection.cfiRange!')
      // await this.rendition.display(this.selection.cfiRange)

      // let cfiRange = prompt('enter cfiRange')
      // let cfiObj = new EpubCFI(cfiRange)
      // let cmp = cfiObj.compare(this.selection.cfiRange, cfiOb j)
      // this.$log('cmp=', cmp)
    },
    async highLight(cfiRange){
      await this.rendition.display(cfiRange)
      this.rendition.annotations.highlight(cfiRange, {})
    }
  },
  mounted () {
    this.$log('mounted!!!')
    this.book = new Book(this.url, {})
    this.book.loaded.navigation.then(({ toc }) => {
      this.toc = toc
      this.$emit('toc', this.toc)
      this.initReader()
      this.rendition.on('click', () => {
        this.$emit('click')
      })
    })
    this.book.ready.then(() => {
      return this.book.locations.generate()
    }).then(() => {
      this.locations = JSON.parse(this.book.locations.save())
      this.ready = true
      this.rendition.on('relocated', (location) => {
        const percent = this.book.locations.percentageFromCfi(location.start.cfi)
        const percentage = Math.floor(percent * 100)
        this.progressValue = percentage
        this.$emit('relocated')
      })
    })
    window.addEventListener('resize', debounce(() => {
      this.resizeToScreenSize()
    }, 250))
    this.updateScreenSizeInfo()
  },
  created () {
    window.addEventListener('keyup', this.keyListener)
  },
  beforeDestroy () {
    window.removeEventListener('keyup', this.keyListener)
  }
}
</script>
