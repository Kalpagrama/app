<template lang="pug">
div(
  @click="start()"
  :style=`{
    position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
    top: '4px', left: '4px',
    height: '44px',
    background: 'rgba(0,0,0,0.25)',
    borderRadius: '10px', overflow: 'hidden',
    maxWidth: 'calc(100% - 8px)',
  }`
  v-ripple=`{color: 'white'}`
  ).row.items-center.content-center.cursor-pointer
  q-btn(
    @mouseenter="mouseOver = true"
    @mouseleave="mouseOver = false"
    round flat color="grey-2" icon="select_all" no-caps)
  transition(enter-active-class="animated fadeIn" leave-active-class="none")
    div(
      v-if="showContentName"
      :style=`{overflow: 'hidden', pointerEvents: 'none'}`).col.full-height
      .row.fit.q-pr-sm
        div(:style=`{overflow: 'hidden'}`).row.fit.items-center.content-center
          span(:style=`{userSelect:'none', fontSize: '0.7rem', whiteSpace: 'nowrap'}`).text-white {{ content ? content.name : '' }} {{ content ? content.name : '' }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'compositionPlayer_video_contentExplorer',
  props: ['composition'],
  data () {
    return {
      content: null,
      mouseOver: false,
    }
  },
  computed: {
    showContentName () {
      if (this.composition.outputType === 'IMAGE') return false
      else {
        if (this.$q.platform.is.mobile) {
          return false
        }
        else {
          return this.mouseOver
        }
      }
    }
  },
  methods: {
    async start () {
      this.$log('start')
      let contentOid = this.composition.layers[0].contentOid
      let start = this.composition.layers[0].figuresAbsolute[0].t
      this.$log('contentOid/start', contentOid, start)
      this.$router.push(`/content/${contentOid}?viewid=nodes&startat=${start}`)
    },
  },
  async created () {
    this.$log('created')
    this.content = await this.$rxdb.get(RxCollectionEnum.OBJ, this.composition.layers[0].contentOid)
  }
}
</script>
