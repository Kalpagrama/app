<template lang="pug">
div(
  ref="wrapper"
  :style=`{
    position: 'absolute', zIndex: 10, top: '0px',
  }`
  ).column.fit
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

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
<script>
import { assert } from 'src/system/common/utils'
import { reactive } from 'vue'

export default {
  name: 'fromBook',
  props: ['composition', 'itemState', 'isActive', 'isVisible'],
  computed: {
    data() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      assert(this.itemState)
      let key = this.$options.name + this.composition.oid
      if (!this.itemState[key]) {
        this.$set_deprecated(this.itemState, key, reactive({
          heightWrapper: 0,
          heightP: 0,
        }))
      }
      return this.itemState[key]
    },
    isOverflowed () {
      return this.data.heightWrapper <= this.data.heightP
    },
    epubCfiText () {
      return this.composition.layers[0].figuresAbsolute[0].epubCfiText
    },
    epubCfiTextLength () {
      return this.epubCfiText.length
    },
    fontSize () {
      let l = this.epubCfiTextLength
      if (this.$q.screen.width > this.$store.state.ui.pageMinWidthDesktop) {
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
      this.data.heightWrapper = this.$refs['wrapper'].clientHeight
      this.data.heightP = this.$refs['p-wrapper'].clientHeight
    })
  }
}
</script>
