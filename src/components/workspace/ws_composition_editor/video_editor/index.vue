<template lang="pug">
div(
  :style=`{
    position: 'relative',
    minWidth: pageFullscreen ? $q.screen.width+'px' : $q.screen.width+'px',
  }`
  ).column.full-width.b-50
  q-btn(
    round flat color="white" icon="keyboard_arrow_left"
    :style=`{position: 'absolute', zIndex: 1000, top: '8px', left: '8px'}`)
  .col.full-width
    ws-content-player(
      :sid="sidPlayer"
      :content="content")
      template(v-slot:controlsTools)
        q-btn(
          @click="storeEditor.stateSet('pageFullscreen', !storeEditor.getter('pageFullscreen'))"
          round flat dense color="white"
          :icon="storeEditor.getter('pageFullscreen') ? 'fullscreen_exit' : 'fullscreen'")
      template(v-slot:controls)
        div(
          v-if="true"
          :style=`{}`).row.full-width.q-pt-xs
          q-input(
            v-model="composition.name"
            filled dense dark color="white"
            label="What do you see?"
            :style=`{
              background: 'rgba(60,60,60,0.5)',
            }`).full-width
            template(v-slot:prepend)
              kalpa-avatar(:url="$store.getters.currentUser().profile.photoUrl" :width="20" :height="20")
            template(v-slot:append)
              q-btn(
                v-if="composition.name.length > 0"
                @click="toggleEdit"
                round flat dense color="grey-5"
                :icon="pageFullscreen ? 'check' : 'keyboard_arrow_down'")
      //- template(v-slot:video)
      //-   div(:style=`{position: 'absolute', zIndex: 1000, bottom: '0px'}`).row.full-width.justify-center.q-pa-sm
      //-     div(
      //-       :style=`{
      //-         maxWidth: '600px',
      //-       }`).row.full-width
      //-       div(:style=`{}`).row.full-width.q-mb-sm
              //- composition-progress(
              //-   :storePlayer="$store.state.storePlayer"
              //-   :composition="composition")
              //- div().row.full-width
              //-   //- span.text-white toolsn
              //-   .col
              //-   q-btn(
              //-     @click="pageFullscreen = !pageFullscreen"
              //-     round flat dense color="white"
              //-     :icon="pageFullscreen ? 'fullscreen_exit' : 'fullscreen'"
              //-     :style=`{}`)
              //- //- bar
              //- div(
              //-   :style=`{
              //-     position: 'relative',
              //-     height: '50px',
              //-     borderRadius: $store.state.ui.borderRadius+'px',
              //-     background: 'rgba(60,60,60,0.3)',
              //-   }`).row.full-width
              //-   div(:style=`{
              //-     position: 'absolute', zIndex: 1000,
              //-     left: '33%',
              //-     width: '3px',
              //-     top: '-4px',
              //-     height: 'calc(100% + 8px)',
              //-     borderRadius: '2px',
              //-   }`).bg-green
        q-btn(
          v-if="false"
          @click="showPagesController = !showPagesController"
          round flat dense color="white"
          :icon="showPagesController ? 'keyboard_arrow_down' : 'keyboard_arrow_up'"
          :style=`{position: 'absolute', zIndex: 1100, bottom: '8px', left: '8px'}`)
  //- composition-controller(
  //-   :composition="composition")
  //- editor tools
  div(
    :style=`{position: 'relative', overflow: 'hidden', height: pageHeight+'px'}`).row.full-width.justify-center
    page-details(
      v-if="storeEditor.getter('pageId') === 'details'"
      :storeEditor="storeEditor"
      :composition="composition"
      :content="content"
      :style=`{maxWidth: '600px', overflow: 'hidden'}`)
    page-edit(
      v-if="storeEditor.getter('pageId') === 'edit'"
      :composition="composition"
      :content="content")
    //- div(:style=`{position: 'relative', maxWidth: '600px', overflow: 'hidden'}`).column.fit
    //-   h1.text-white details
    //- div(:style=`{position: 'absolute', maxWidth: '600px', overflow: 'hidden'}`).column.fit
    //-   .col.full-width.scorll
    //-     div(v-for="(l,li) in 10" :key="li").row.full-width
    //-   .row.full-width.bg
    //-     .col
    //-     q-btn(round flat dense color="green" icon="check" @click="pageFullscreen = true")
    //- page-details(
    //-   v-if="state.pageId === 'details'"
    //-   :composition="composition"
    //-   :content="content"
    //-   :style=`{maxWidth: 600+'px'}`)
    //- page-editor(
    //-   v-if="stateEditor.pageId === 'editor'"
    //-   @createNode="$emit('createNode')"
    //-   @close="$emit('close')"
    //-   @delete="$emit('delete')"
    //-   :composition="composition"
    //-   :options="options"
    //-   :style=`{maxWidth: stateEditor.pageWidth+'px'}`)
    //- //- all components
    //- div(
    //-   v-if="!options.onlyProgress"
    //-   :style=`{paddingTop: '24px'}`).row.fit.justify-center
    //-   editor(
    //-     v-if="stateExplorer.player"
    //-     @createNode="$emit('createNode')"
    //-     @close="$emit('close')"
    //-     @delete="$emit('delete')"
    //-     :options="options"
    //-     :stateExplorer="stateExplorer"
    //-     :style=`{maxWidth: '600px'}`)
    //- //- only progress
    //- div(
    //-   v-if="options.onlyProgress"
    //-   :style=`{
    //-     position: 'relative',
    //-     minHeight: '40px',
    //-   }`
    //-   ).row.full-width
    //-   composition-progress(
    //-     :value="composition" :active="false"
    //-     :stateExplorer="stateExplorer"
    //-     ).fit
    //-     template(v-slot:actions)
    //-       slot(name="actions")
  pages-controller(
    v-if="storeEditor && pageHeight > 40"
    :storeEditor="storeEditor")
</template>

<script>
import pageDetails from './page_details'
// import pageEditor from './page_editor'
import pageEdit from './page_edit'
import pagesController from './pages_controller'
import compositionController from './composition_controller'
import compositionProgress from './composition_progress'

export default {
  name: 'videoEditor',
  components: {
    pageDetails,
    pageEdit,
    pagesController,
    compositionController,
    compositionProgress
  },
  props: {
    sid: {type: String, default () { return 'wce' }},
    composition: {type: Object},
    content: {type: Object},
    storePlayer: {type: Object}
  },
  data () {
    return {
      pageHeight: 0,
      compositionName: '',
    }
  },
  provide () {
    return {
      sidEditor: this.sid,
      sidPlayer: this.sidPlayer
    }
  },
  computed: {
    sidPlayer () {
      return `${this.sid}-storePlayer`
    },
    storeEditor () {
      return this.$stores[this.sid]
    },
  },
  watch: {
  },
  methods: {
    toggleEdit () {
      this.$log('toggleEdit')
      if (this.pageHeight === 500) {
        this.pageHeight = 0
      }
      else {
        this.pageHeight = 500
        this.storeEditor.stateSet('pageId', 'edit')
        this.storeEditor.stateSet('pageFullscreen', false)
      }
    }
  },
  created () {
    this.$log('created')
    let _this = this
    this.$storesAdd(this.sid, {
      state: {
        pageFullscreen: false,
        pageId: 'details',
        pages: [
          {id: 'details', name: 'Details'},
          {id: 'edit', name: 'Edit'},
        ]
      },
      mutations: {
        fuckYou (state, val) {
          _this.$log('fuckYou', val)
        }
      },
      getters: {
        pageId: state => state.pageId,
        pageFullscreen: state => state.pageFullscreen
      }
    })
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$storesRemove(this.sid)
  }
}
</script>
