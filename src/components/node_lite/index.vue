<template lang="pug">
div(
  @mouseenter="active = true"
  @mouseleave="active = false"
  :style=`{
    position: 'relative',
    borderRadius: '10px', overflow: 'hidden',
    minHeight: '200px',
  }`
  ).row.full-width.items-start.content-start.b-50
  //- composition wrapper
  div(
    :style=`{
      position: 'relative', borderRadius: '10px', overflow: 'hidden',
      cursor: 'pointer',
    }`
    ).row.full-width.items-start.content-start
    img(
      :src="thumbUrl" draggable="false"
      :style=`{borderRadius: '10px', overflow: 'hidden',}`
      ).full-width
    div(
      v-if="composition"
      :style=`{
        position: 'absolute', zIndex: 100,
      }`
      ).row.fit
      video(
        v-if="composition.outputType === 'VIDEO'"
        :src="composition.url"
        autoplay loop playsinline
        :style=`{
          objectFit: 'contain',
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).fit
  //- essence
  div(
    @click="nodeEssenceClick()"
    ).row.full-width.q-pa-sm
    span(:style=`{userSelect: 'none'}`).text-white {{ node.name }}
  .row.full-width
    slot(name="footer")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeLite',
  props: ['node'],
  data () {
    return {
      active: false,
      nodeFull: null,
      composition: null,
    }
  },
  computed: {
    thumbUrl () {
      return this.node.meta.items[0].thumbUrl
    }
  },
  watch: {
    active: {
      async handler (to, from) {
        if (to && this.nodeFull) {
          this.composition = await this.$rxdb.get(RxCollectionEnum.OBJ, this.nodeFull.items[0].oid)
        }
        else {
          this.composition = null
        }
      }
    }
  },
  methods: {
    nodeEssenceClick () {
      this.$log('nodeEssenceClick')
    }
  },
  async mounted () {
    // this.$log('mounted')
    this.nodeFull = await this.$rxdb.get(RxCollectionEnum.OBJ, this.node.oid)
  }
}
</script>
