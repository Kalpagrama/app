<template lang="pug">
div(
  ref="wrapper"
  :style=`{
    position: 'absolute', zIndex: 10, top: '0px',
  }`
  ).column.fit
  //- Debug
  div(:style=`{position: 'absolute',zIndex: 100,top: '0px',left: '0px',borderRadius: '10px',}`).row.full-width.text-white.bg-red.q-pa-sm
    small.full-width heightWrapper: {{ heightWrapper }}
    small.full-width heightP: {{ heightP }}
  //- Footer here...
  div(
    :class=`{
      'scroll': isActive && isOverflowed,
    }`
    ).col.full-width
    div(
      :class=`{
        'items-start': isOverflowed,
        'content-start': isOverflowed,
        'items-center': !isOverflowed,
        'content-center': !isOverflowed,
      }`
      ).row.fit.q-px-md
      //- Paragraph wrapper
      div(
        ref="p-wrapper"
        :style=`{}`
        ).row.full-width.q-pt-md.q-pb-lg
        p.text-white {{ composition.layers[0].figuresAbsolute[0].epubCfiText }}
        //- p.text-white {{ composition.layers[0].figuresAbsolute[0].epubCfiText }}
        //- p.text-white {{ composition.layers[0].figuresAbsolute[0].epubCfiText }}
</template>

<script>
export default {
  name: 'fromBook',
  props: ['composition', 'isActive', 'isVisible'],
  data () {
    return {
      heightWrapper: 0,
      heightP: 0,
    }
  },
  computed: {
    isOverflowed () {
      return this.heightWrapper - 40 <= this.heightP
    }
  },
  mounted () {
    this.$log('composition', this.composition)
    this.$nextTick(() => {
      this.heightWrapper = this.$refs['wrapper'].clientHeight
      this.heightP = this.$refs['p-wrapper'].clientHeight
    })
  }
}
</script>
