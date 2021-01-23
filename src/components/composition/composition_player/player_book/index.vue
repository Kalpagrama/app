<template lang="pug">
div(
  :style=`{
    borderRadius: '10px',
  }`
  ).row.fit.items-center.content-center.justify-center.q-px-md.b-40
  div(
    :style=`{
      position: 'relative',
      maxHeight: '100%',
    }`
    ).row.full-width.q-pl-lg.scroll.q-py-sm
    div(
      :style=`{
        position: 'absolute', left: '10px',
        width: '4px',
        borderRadius: '2px',
      }`
      ).row.full-height.b-90
    p.text-white.text-caption {{ name }}
    router-link(
      v-if="true"
      :to="'/content/'+composition.layers[0].contentOid"
      ).row.full-width
      small.text-white.text-italic {{ composition.layers[0].contentName }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'compositionPlayer_Book',
  props: ['composition'],
  data () {
    return {
    }
  },
  computed: {
    name () {
      return this.composition.layers[0].figuresAbsolute[0].epubCfiText
    },
    fontSize () {
      if (this.name.length > 50) return 14
      else return 16
    }
  },
  methods: {
  },
  async mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
