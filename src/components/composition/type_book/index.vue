<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
  }`
  ).row.fit.items-center.content-center.justify-center.q-px-md.b-40
  //- context
  q-btn(
    @click="contextClick"
    :to="'/content/'+composition.layers[0].contentOid"
    round flat color="white" no-caps icon="select_all"
    :style=`{
      position: 'absolute', top: '4px', left: '4px', zIndex: 100,
      overflow: 'hidden',
      maxWidth: 'calc(100% - 16px)',
    }`).q-pl-sm
    .col
      span(:style=`{whiteSpace: 'nowrap'}`).text-white.q-mx-sm {{ composition.layers[0].contentName }}
  //- body
  div(
    :style=`{
      position: 'relative',
      maxHeight: '100%',
    }`
    ).row.full-width.scroll.q-pt-xl.q-px-sm
    p.text-white.text-caption {{ name }}
</template>

<script>
export default {
  name: 'typeBook',
  props: {
    compositionKey: {type: String},
    composition: {type: Object, required: true},
    isActive: {type: Boolean},
    isVisible: {type: Boolean},
    isMini: {type: Boolean},
    options: {type: Object},
    styles: {type: Object, default: {}},
  },
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
    contextClick () {
      this.$log('contextClick')
      if (this.options.nodeOid) {
        this.$store.commit('ui/stateSet', ['nodeOnContent', this.options.nodeOid])
      }
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
