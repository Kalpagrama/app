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
  ).row.items-center.content-center
  q-btn(
    round flat color="grey-2" icon="select_all" no-caps)
  div(
    v-if="composition.outputType !== 'IMAGE'"
    :style=`{overflow: 'hidden',}`).col.full-height.q-pr-sm.br
    .row.fit.items-center.content-center.q-pr-sm
      span(:style=`{whiteSpace: 'nowrap'}`).text-white {{ content ? content.name : '' }} {{ content ? content.name : '' }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'compositionPlayer_video_contentExplorer',
  props: ['composition'],
  data () {
    return {
      content: null,
    }
  },
  methods: {
    async start () {
      this.$log('start')
      // this.loading = true
      let contentOid = this.composition.layers[0].contentOid
      let start = this.composition.layers[0].figuresAbsolute[0].t
      this.$log('contentOid/start', contentOid, start)
      this.$router.push(`/content/${contentOid}?viewid=nodes-all&startat=${start}`)
    },
  },
  async created () {
    this.$log('created')
    this.content = await this.$rxdb.get(RxCollectionEnum.OBJ, this.composition.layers[0].contentOid)
  }
}
</script>
