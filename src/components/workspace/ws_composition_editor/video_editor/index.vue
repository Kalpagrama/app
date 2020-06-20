<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).column.full-width.b-50
  .col.full-width
    ws-content-player(
      id="statePlayer"
      :content="content")
  .col.full-width
    ws-content-player(
      id="statePlayer2"
      :content="content")
  //- composition-controller(
  //-   :composition="composition")
  //- editor tools
  div(
    :style=`{height: 500+'px', paddingTop: '50px'}`).row.full-width.justify-center
    div(v-if="$store.state.statePlayer").row.full-width
      h2.text-white {{ $store.state.statePlayer.currentTime }}
    div(v-if="$store.state.statePlayer2").row.full-width
      h2.text-white {{ $store.state.statePlayer2.currentTime }}
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
  pages-controller
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
