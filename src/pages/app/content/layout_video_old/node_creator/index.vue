<template lang="pug">
.row.full-width
  //- popup created node...
  q-dialog(
    v-model="nodeShow"
    :maximized="true"
    :full-width="true"
    :contentStyle=`{
      //- backgroundColor: 'rgba(0,0,0,0.7)',
    }`)
    div(
      @click.self="nodeShow = false, nodeCreating = false"
      :style=`{
        //- background: 'rgba(0,0,0,0.7)',
      }`
      ).row.fit.items-center.content-center.justify-center
      div(:style=`{textAlign: 'center'}`).row.full-width.justify-center.q-pa-lg
        h1(:style=`{fontSize: '36px',}`).text-white.text-bold Ядро создано 🎉
      node-feed(
        :isActive="true"
        :isVisible="true"
        :node="nodeCreating"
        :style=`{
          maxWidth: 600+'px',
        }`)
  //- edit node if player.figure
  transition(enter-active-class="animated slideInUp" leave-active-class="animated slideInDown")
    node-editor(
      v-if="player && player.figure"
      :player="player"
      :contentKalpa="contentKalpa"
      @published="nodePublished")
  //- after published show progress of node
  transition(enter-active-class="animated slideInUp" leave-active-class="animated slideInDown")
    node-creating(
      v-if="nodeCreating && nodeCreatingShow"
      :player="player"
      :contentKalpa="contentKalpa"
      :node="nodeCreating"
      @created="nodeCreated")
</template>

<script>
import nodeEditor from './node_editor/index.vue'
import nodeCreating from './node_creating/index.vue'

export default {
  name: 'nodeCreator',
  props: ['player', 'contentKalpa'],
  components: {
    nodeEditor,
    nodeCreating,
  },
  data () {
    return {
      nodeCreating: null,
      nodeCreatingShow: false,
      nodeShow: false,
    }
  },
  watch: {
    nodeShow: {
      handler (to, from) {
        if (this.contentKalpa.type === 'VIDEO') {
          if (to) this.player.pause()
          else this.player.play()
        }
      }
    },
  },
  methods: {
    nodePublished (node) {
      this.$log('nodePublished', node)
      this.nodeCreating = node
      this.nodeCreatingShow = true
    },
    nodeCreated () {
      this.$log('nodeCreated')
      this.$store.commit('ui/stateSet', ['nodeCreating', false])
      this.nodeCreatingShow = false
      this.nodeShow = true
    }
  }
}
</script>
