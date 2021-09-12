<template lang="pug">
div(
  ref="wrapper"
  :style=`{
    position: 'absolute', zIndex: 10, top: '0px',
  }`
  ).column.fit
  //- Debug
  //- div(:style=`{position: 'absolute',zIndex: 100,top: '0px',left: '0px',borderRadius: '10px',opacity:0.5,}`).row.full-width.text-white.bg-red.q-pa-sm
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
        :style=`{
          fontSize: fontSize+'px',
        }`
        ).row.full-width.q-pt-md.q-pb-lg
        p.text-white {{ epubCfiText }}
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
      return this.heightWrapper <= this.heightP
    },
    epubCfiText () {
      return this.composition.layers[0].figuresAbsolute[0].epubCfiText
    },
    epubCfiTextLength () {
      return this.epubCfiText.length
    },
    fontSize () {
      let l = this.epubCfiTextLength
      if (this.$q.screen.width > 768) {
        if (l < 100) return 36
        else if (l < 140) return 32
        else if (l < 180) return 28
        else if (l < 220) return 24
        else return 14
      }
      else {
        if (l < 100) return 22
        else if (l < 140) return 20
        else if (l < 180) return 18
        else if (l < 220) return 16
        else return 14
      }
    }
  },
  mounted () {
    // this.$log('composition', this.composition)
    this.$nextTick(() => {
      this.heightWrapper = this.$refs['wrapper'].clientHeight
      this.heightP = this.$refs['p-wrapper'].clientHeight
    })
  }
}
</script>
