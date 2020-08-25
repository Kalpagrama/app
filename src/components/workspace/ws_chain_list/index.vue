<template lang="pug">
//- div(:style=`{position: 'relative'}`).column.fit
  //- chain add
  q-btn(
    @click="chainAdd()"
    round color="green" icon="add"
    :style=`{
      position: 'absolute', zIndex: 1000, bottom: '70px', right: '30px', tranform: 'translate3d(0,0,0)',
      borderRadius: '50%'
    }`)
  //- chain editor
  q-dialog(
    v-model="chainEditorOpened" persistent position="bottom")
    ws-chain-editor(
      :value="chain"
      @close="chainEditorOpened = false"
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
        maxWidth: $store.state.ui.maxWidthPage+'px',
      }`)
  //- header
  div(:style=`{}`).row.full-width.justify-center
    div(:style=`{maxWidth: '800px'}`).row.full-width.items-center.content-center.justify-between
      .row.full-width.items-center.q-px-md.q-pb-sm.q-pt-md
        span(:style=`{fontSize: '19px'}`).text-white.text-bold {{$t('wsChainList_title', 'Цепочки')}}
    //- search
    .row.full-width.q-pa-sm
      q-input(
        v-model="searchString"
        filled dense dark color="white"
        :label="$t('wsChainList_searchPlaceholder', 'Найти цепочку')"
        ).full-width
        template(v-slot:append)
          q-btn(
            v-if="searchString.length > 0"
            flat dense color="white" icon="clear" @click="searchString = ''")
          q-btn(
            flat dense color="white" icon="filter_list")
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-sm
      div(
        v-for="c in 3" :key="c"
        @click="chainClick(c)"
        :style=`{height: '100px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
        ).row.full-width.b-50.q-mb-sm
//- div(:style=`{position: 'relative'}`).column.fit
  //- .col.full-width
  //- .row.full-width.q-pa-sm
  //-   span.text-white.text-bold Уолден или жизнь в лесу.
  .col.full-width.scroll
    .row.full-width.justify-center.q-pt-sm
      div(
        ref="bookWrapper"
        :style=`{position: 'relative', maxWidth: '800px', borderRadius: '10px',}`).row.full-width.bg-grey-2.q-pa-sm
        div(
          :style=`{
            position: 'fixed', width: '50px',
            right: '-25px', top: '100px',
            height: '500px', borderRadius: '10px', overflow: 'hidden'}`
          ).b-70
          div(:style=`{position: 'absolute', zIndex: 5, top: '0px', height: '30%',}`).row.full-width.b-90
          div(:style=`{position: 'absolute', zIndex: 10, top: '5%', height: '2px'}`).row.full-width.bg-green
          div(:style=`{position: 'absolute', zIndex: 10, top: '13%', height: '2px'}`).row.full-width.bg-green
          div(:style=`{position: 'absolute', zIndex: 10, top: '15%', height: '2px'}`).row.full-width.bg-green
          div(:style=`{position: 'absolute', zIndex: 10, top: '17%', height: '2px'}`).row.full-width.bg-green
          div(:style=`{position: 'absolute', zIndex: 10, top: '22%', height: '2px'}`).row.full-width.bg-green
</template>

<script>
import wsChainEditor from '../ws_chain_editor'
// import ePub from 'epubjs/dist/epub.min.js'
import { Book, Rendition } from 'epubjs'

export default {
  name: 'wsChainList',
  components: {wsChainEditor},
  data () {
    return {
      searchString: '',
      chain: null,
      chainEditorOpened: false,
      book: null,
      rendition: null,
    }
  },
  methods: {
    chainClick (chain) {
      this.$log('chainClick', chain)
    },
    chainAdd () {
      this.$log('chainAdd')
      let chainInput = {
        name: '',
        wsItemType: 'WS_NODE',
        items: [],
        spheres: [],
        category: 'FUN',
        layout: 'PIP',
        stage: 'draft'
      }
      this.chain = chainInput
      this.chainEditorOpened = true
    }
  },
  mounted () {
    this.$log('mounted')
    // this.book = ePub('statics/book.epub')
    // // this.book = ePub('https://s3.amazonaws.com/epubjs/books/alice/OPS/package.opf')
    // this.rendition = this.book.renderTo(this.$refs.bookWrapper, {
    //   // width: '100%',
    //   // height: '500px',
    //   // method: 'continuous',
    //   // flow: 'scrolled-continuous',
    //   flow: 'scrolled-doc',
    //   // fullsize: true
    // })
    // this.rendition.display()
    // this.rendition.on('rendered', (section) => {
    //   console.log('rendered !!!', section)
    //   // section.next()
    //   var nextSection = section.next()
    //   var prevSection = section.prev()
    //   if (nextSection) {
    //     let nextNav = this.book.navigation.get(nextSection.href)
    //   }
    // })
    this.book = new Book('statics/book.epub')
    this.rendition = new Rendition(this.book, {
      // flow: 'scrolled-doc',
      method: 'continuous',
      flow: 'scrolled-continuous',
      width: '100%',
      height: '100%',
    })
    this.book.ready
      .then(() => {
        this.$log('book READY')
        this.rendition.attachTo(this.$refs.bookWrapper)
        this.rendition.display(10)
        // this.rendition.themes.registerRules('dark', dark)
        // this.rendition.themes.registerRules('tan', tan)
        this.rendition.ready = true
      })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
