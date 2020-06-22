<template lang="pug">
div(
  :style=`{
    position: 'relative',
    minWidth: pageFullscreen ? $q.screen.width+'px' : 800+'px',
  }`
  ).column.full-width.b-50
  q-btn(
    round flat color="white" icon="keyboard_arrow_left"
    :style=`{position: 'absolute', zIndex: 1000, top: '8px', left: '8px'}`)
  .col.full-width
    ws-content-player(
      sid="statePlayer"
      :content="content")
      //- template(v-slot:bar)
      //-   div(
      //-     v-if="true"
      //-     :style=`{}`).row.full-width
      //-     q-input(
      //-       v-model="name"
      //-       filled dense dark color="green"
      //-       label="What do you see?"
      //-       :style=`{
      //-         background: 'rgba(60,60,60,0.2)',
      //-       }`).full-width
      //-       template(v-slot:prepend)
      //-         kalpa-avatar(:url="$store.getters.currentUser().profile.photoUrl" :width="20" :height="20")
      //-       template(v-slot:append)
      //-         q-btn(
      //-           v-if="name.length > 0"
      //-           @click="pageFullscreen = false, pageHeight = 500"
      //-           round flat dense color="grey-5"
      //-           :icon="pageFullscreen ? 'check' : 'edit'")
      //- template(v-slot:video)
      //-   div(:style=`{position: 'absolute', zIndex: 1000, bottom: '0px'}`).row.full-width.justify-center.q-pa-sm
      //-     div(
      //-       :style=`{
      //-         maxWidth: '600px',
      //-       }`).row.full-width
      //-       div(:style=`{}`).row.full-width.q-mb-sm
              //- composition-progress(
              //-   :statePlayer="$store.state.statePlayer"
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
    :style=`{position: 'relative', height: 500+'px'}`).row.full-width.justify-center
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
  //- pages-controller(
  //-   v-show="!pageFullscreen"
  //-   )
</template>

<script>
import pageDetails from './page_details'
import pageEditor from './page_editor'
import pagesController from './pages_controller'
import compositionController from './composition_controller'
import compositionProgress from './composition_progress'

export default {
  name: 'videoEditor',
  components: {
    pageDetails,
    pageEditor,
    pagesController,
    compositionController,
    compositionProgress
  },
  props: {
    key: {type: String, default () { return 'default' }},
    composition: {type: Object},
    content: {type: Object},
    // statePlayer: {type: Object},
    options: {
      type: Object,
      default () {
        return {
          usePlayer: true,
          useEditor: true,
          onlyProgress: false,
        }
      }
    }
  },
  // inject: ['store'],
  data () {
    return {
      name: '',
      pageHeight: 0,
      pageFullscreen: false,
      showPagesController: false,
      // pageId: 'details',
      // // layer
      // layerSelected: null,
      // layerEditing: null,
      // // composition
      // compositionPlaying: false
    }
  },
  computed: {
    storeKey () {
      return `wsce-${this.key}`
    },
    state () {
      return this.$store.state[this.storeKey]
    },
    // stateEditor () {
    //   return {
    //     // layout
    //     // pageId: 'details',
    //     pageId: this.pageId,
    //     pages: [
    //       {id: 'details', name: 'Details', icon: 'details'},
    //       {id: 'editor', name: 'Editor', icon: 'edit'},
    //     ],
    //     pageFullscreen: false,
    //     pageWidth: 600,
    //     pageHeight: 400,
    //     // states
    //     statePlayer: this.store.state.statePlayer,
    //     compositionPlaying: this.compositionPlaying,
    //     // layer
    //     layerPlaying: null,
    //     layerEditing: null,
    //     set: (key, val) => {
    //       this[key] = val
    //     }
    //   }
    // }
  },
  // provide () {
  //   return {
  //     stateEditor: this.stateEditor
  //   }
  // },
  provide () {
    return {
      storeKey: this.storeKey
    }
  },
  watch: {
    // 'stateEditor.statePlayer.fullscreen': {
    //   handler (to, from) {
    //     this.$log('stateEditor.statePlayer.fullscreen TO', to)
    //     if (to) {
    //       this.pageWidth = this.$q.screen.width
    //       this.pageHeight = 60
    //     }
    //     else {
    //       this.pageWidth = 600
    //       this.pageHeight = 400
    //     }
    //   }
    // }
  },
  created () {
    this.$log('created')
    let _this = this
    this.$store.registerModule(this.storeKey, {
      namespaced: true,
      state: () => {
        return {
          pageId: 'details',
          pages: [
            {id: 'details', name: 'Details', icon: 'details'},
            {id: 'editor', name: 'Editor', icon: 'edit'},
          ],
        }
      },
      mutations: {
        stateSet (state, [key, val]) {
          _this.$log('stateSet', key, val)
          state[key] = val
        },
      },
      getters: {
      }
    })
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$store.unregisterModule(this.storeKey)
  }
}
</script>
