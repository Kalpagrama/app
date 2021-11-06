<template lang="pug">
div(
  :style=`{
  position: 'relative',
  borderRadius: '10px',
}`
).row.fit.items-start.content-start.justify-center.b-40
  q-resize-observer(@resize="height = $event.height")
  //- footer
  transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    context-bar(
      v-if="isActive"
      :contentKalpa=`{oid: composition.layers[0].contentOid, name: composition.layers[0].contentName}`
      :height="height")
  //- footer gradient
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="textContainerOverflowHidden"
      @click="textContainerOverflowToggle"
      :style=`{
      position: 'absolute', zIndex: 10, bottom: '0px', left: '0px',
      height: '50%',
      background: 'linear-gradient(0deg, rgba(40,40,40,1) 0%, rgba(40,40,40,0) 100%)',
      borderRadius: '0px 0px 10px 10px',
    }`
    ).row.full-width.cursor-pointer
  //- body
  div(
    ref="text-container"
    :style=`{
    maxHeight: 'calc(100% - 48px)',
    overflow: textContainerOverflowHidden ? 'hidden' : 'scroll',
    //- paddingTop: '50px',
  }`
  ).row.fit.items-start.content-start.q-px-md.q-pt-md
    div(
      ref="text-wrapper"
    ).row.full-width
      p.text-white.text-caption {{ name }}
</template>

<script>
import contextBar from './context_bar.vue'

export default {
  name: 'typeBook',
  components: {
    contextBar
  },
  props: {
    compositionKey: { type: String },
    composition: { type: Object, required: true },
    isActive: { type: Boolean },
    isVisible: { type: Boolean },
    isMini: { type: Boolean },
    options: { type: Object },
    styles: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      textContainerRef: null,
      textContainerOverflowHidden: true,
      textWrapperRef: null,
      textMoreShow: false,
      height: 0
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
  watch: {
    isActive: {
      handler (to, from) {
        this.$log('isActive TO', to)
        if (to) {
        } else {
          this.textWrapperOverflowHidden = true
        }
      }
    }
  },
  methods: {
    contextClick () {
      this.$log('contextClick')
      if (this.options.nodeOid) {
        this.$store.commit('ui/stateSet', ['nodeOnContent', this.options.nodeOid])
      }
      this.$router.push('/content/' + this.composition.layers[0].contentOid)
    },
    textContainerOverflowToggle () {
      this.$log('textContainerOverflowToggle START')
      if (this.textContainerOverflowHidden) {
        // scroll a little bit!
        this.textContainerOverflowHidden = false
        this.$gsap.to(
            this.textContainerRef,
            1.5,
            {
              scrollTop: this.textContainerRef.scrollTop + 50,
              onComplete: () => {
                this.$log('textContainerOverflowToggle DONE')
              }
            }
        )
      } else {
        // scrollto back to top!
        this.textContainerOverflowHidden = true
        this.$gsap.to(
            this.textContainerRef,
            0.3,
            {
              scrollTop: 0,
              onComplete: () => {
                this.$log('textContainerOverflowToggle DONE')
              }
            }
        )
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$nextTick(() => {
      this.textContainerRef = this.$refs['text-container']
      // this.$log('textContainerRef', this.textContainerRef)
      this.textWrapperRef = this.$refs['text-wrapper']
      // this.$log('textWrapperRef', this.textWrapperRef)
      if (this.textWrapperRef.clientHeight > this.textContainerRef.clientHeight - 40) {
        this.$log('this.textRef.clientHeight > this.textWrappeRef.clientHeight')
        this.textMoreShow = true
      }
    })
  },
  beforeUnmount () {
    // this.$log('beforeDestroy')
  }
}
</script>
