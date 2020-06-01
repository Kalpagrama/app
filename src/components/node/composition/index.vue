<template lang="pug">
div(
  :style=`{
    position: 'relative'
  }`
  ).row.full-width.items-start.content-start
  //- kalpa-debug(:style=`{position: 'absolute', zIndex: 2000, top: '240px'}` :options=`{ctx,visible,active,mini}`)
  //- menu
  //- q-btn(
  //-   v-if="visible && active"
  //-   round flat color="white" icon="more_vert"
  //-   :style=`{position: 'absolute', top: '8px', right: '8px', zIndex: 10000, background: 'rgba(0,0,0,0.1)'}`)
  img(
    v-if="preview"
    :src="preview"
    draggable="false"
    @load="previewLoaded"
    @error="previewErrored"
    :style=`{
      userSelect: 'none',
      objectFit: 'contain'
    }`
    ).full-width
  //- player-video(
  //-   v-if="composition && active"
  //-   :ctx="ctx" :composition="composition"
  //-   :visible="visible" :active="active" :mini="mini")
  //-   template(
  //-     v-for="(_, scopedSlotName) in $scopedSlots"
  //-     v-slot:[scopedSlotName]="slotData")
  //-     slot(:name="scopedSlotName" v-bind="slotData")
</template>

<script>
import playerVideo from './player_video'
import { RxCollectionEnum } from 'src/system/rxdb'

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
        // this.$log('value CHANGED', to)
        if (to) {
          if (this.ctx === 'workspace') {
            this.composition = to
          }
          else {
            this.composition = await this.$rxdb.get(RxCollectionEnum.OBJ, to.oid)
          }
        }
      }
    },
  },
  methods: {
    previewLoaded () {
      // this.$log('previewLoaded')
    },
    previewErrored () {
      // this.$log('previewErrored')
    }
  }
}
</script>
