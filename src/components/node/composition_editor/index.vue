<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  composition(
    v-if="composition"
    :ctx="ctx" :value="composition"
    :visible="true" :active="true" :mini="false"
    :styles=`{
      paddingBottom: '200px',
      paddingTop: '0px',
      paddingLeft: menuWidth+'px'
    }`).fit
    template(v-slot:editor=`{player, meta}`)
      //- header
      div(:style=`{position: 'absolute', zIndex: 20000, height: '60px', left: '0px', top: '0px', background: meta.playing ? 'rgba(0,0,0,0.3)' : 'black'}`).row.full-width
        div(:style=`{width: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          q-btn(round flat color="green" icon="menu" @click="menuWidth === 0 ? menuWidth = 400 : menuWidth = 0")
        .col.full-height
          .row.fit.items-center.content-center.q-px-md
        div(:style=`{height: '60px'}`).row.items-center.content-center.q-px-md
          q-btn(push no-caps color="green")
            span.text-white Done
      //- menu
      div(
        :style=`{
          position: 'absolute', left: '0px', bottom: '0px',
          height: 'calc(100% - 60px)',
          width: menuWidth+'px'
        }`).row.bg-grey-10
      //- layerEditor
      div(
        :style=`{
          position: 'absolute', bottom: '0px', right: '0px',
          width: 'calc(100% - '+menuWidth+'px)', height: '200px'
        }`).row.bg-black
</template>

<script>
import videoComposer from './video_composer'

export default {
  name: 'compositionEditor',
  components: {videoComposer},
  props: {
    ctx: {type: String, default () { return 'workspace' }},
    inDialog: {type: Boolean},
    mode: {type: String, default () { return 'content' }},
    node: {type: Object, required: true},
    saving: {type: Boolean},
    compositionIndex: {type: Number, required: true, default () { return 0 }}
  },
  data () {
    return {
      menuWidth: 0
    }
  },
  computed: {
    composition () {
      return this.node.compositions[this.compositionIndex]
    }
  }
}
</script>
