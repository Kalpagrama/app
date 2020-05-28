<template lang="pug">
div(
  :style=`{
    position: 'relative'
  }`
  ).row.full-width
  kalpa-debug(:style=`{position: 'absolute', zIndex: 2000, top: '50%'}` :options=`{ctx,visible,active,mini}`)
  img(
    v-if="preview"
    :src="preview"
    draggable="false"
    :style=`{
      userSelect: 'none',
      objectFit: 'contain'
    }`
    ).full-width
  //- player-video(
  //-   v-if="composition"
  //-   :ctx="ctx" :composition="composition"
  //-   :visible="visible" :active="active" :mini="mini")
  //-   template(v-for="(_, scopedSlotName) in $scopedSlots" v-slot:[scopedSlotName]="slotData")
  //-     slot(:name="scopedSlotName" v-bind="slotData")
      //- div(
      //-   v-if="scopedSlotName === 'video'"
      //-   :style=`{
      //-     position: 'absolute', zIndex: 10000, top: '0px',
      //-     borderRadius: '10px', overflow: 'hidden',
      //-   }`
      //-   ).row.full-width.bg-red.q-pa-sm
      //-   span.text-white hello
</template>

<script>
import playerVideo from './player_video'

export default {
  name: 'composition',
  components: {playerVideo},
  props: {
    ctx: {
      type: String,
      required: true,
      default () {
        return 'workspace'
      }
    },
    preview: {
      type: String
    },
    value: {
      type: Object,
      required: true
    },
    visible: {type: Boolean},
    active: {type: Boolean},
    mini: {type: Boolean}
  },
  data () {
    return {
      composition: null
    }
  },
  computed: {
  },
  watch: {
    value: {
      immediate: true,
      async handler (to, from) {
        this.$log('value CHANGED', to)
        if (to) {
          if (this.ctx === 'workspace') {
            this.composition = to
          }
          else {
            this.composition = await this.$store.dispatch('objects/get', {oid: to.oid})
          }
        }
      }
    },
  }
}
</script>
