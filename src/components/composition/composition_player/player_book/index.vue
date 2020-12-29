<template lang="pug">
div(
  :style=`{
    borderRadius: '10px',
  }`
  ).row.fit.items-center.content-center.justify-center.q-px-md.b-40
  div(
    :style=`{
      position: 'relative',
    }`
    ).row.full-width.q-pl-lg
    div(
      :style=`{
        position: 'absolute', left: '10px',
        width: '4px',
        borderRadius: '2px',
      }`
      ).row.full-height.b-90
    p.text-white.text-caption {{ name }}
    router-link(
      v-if="contentKalpa"
      :to="'/content/'+contentKalpa.oid"
      ).row.full-width
      small.text-white.text-italic {{ contentKalpa.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'playerBook',
  props: ['composition'],
  data () {
    return {
      contentKalpa: null,
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
    // setState (key, val) {},
    // play () {}
  },
  async mounted () {
    this.$log('mounted')
    if (!this.contentKalpa) this.$set(this, 'contentKalpa', await this.$rxdb.get(RxCollectionEnum.OBJ, this.composition.layers[0].contentOid))
  },
}
</script>
