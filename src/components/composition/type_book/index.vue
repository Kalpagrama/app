<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
  }`
  ).row.fit.items-start.content-start.justify-center.b-40
  //- footer
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="!isMini"
      :style=`{
        position: 'absolute', zIndex: 3000,
        bottom: '0px',
        borderRadius: '0 0 10px 10px',
        userSelect: 'none',
      }`
      ).row.full-width.items-center.content-center.q-pa-sm
      div(
        @click="contextClick()"
        :style=`{
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '10px',
        }`
        ).row.items-center.content-center.q-py-xs.q-px-sm.cursor-pointer
        q-icon(name="select_all" color="white" size="16px").q-ma-xs
        span.text-white Контекст
        //- span.text-white {{ composition.layers[0].contentName }}
      .col
      q-btn(
        v-if="textMoreShow && !textContainerOverflowHidden"
        round flat no-caps color="grey-6"
        :icon="textContainerOverflowHidden ? 'keyboard_arrow_down' : 'keyboard_arrow_up'"
        @click="textContainerOverflowToggle"
        )
        //- span {{ textContainerOverflowHidden ? 'Читать' : 'Свернуть' }}
  //- footer gradient
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="textContainerOverflowHidden"
      @click="textContainerOverflowToggle"
      :style=`{
        position: 'absolute', zIndex: 10, bottom: '40px', left: '0px',
        height: '50%',
        background: 'linear-gradient(0deg, rgba(40,40,40,1) 0%, rgba(0,0,0,0) 100%)',
        borderRadius: '0px 0px 10px 10px',
      }`
      ).row.full-width.cursor-pointer
  //- body
  div(
    ref="text-container"
    :style=`{
      maxHeight: 'calc(100% - 48px)',
      overflow: textContainerOverflowHidden ? 'hidden' : 'scroll',
    }`
    ).row.fit.items-start.content-start.q-px-md.q-pt-md
    div(
      ref="text-wrapper"
      ).row.full-width
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
      textContainerRef: null,
      textContainerOverflowHidden: true,
      textWrapperRef: null,
      textMoreShow: false,
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
        }
        else {
          this.textWrapperOverflowHidden = true
        }
      }
    },
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
        this.$tween.to(
          this.textContainerRef,
          1.5,
          {
            scrollTop: this.textContainerRef.scrollTop + 50,
            onComplete: () => {
              this.$log('textContainerOverflowToggle DONE')
            }
          }
        )
      }
      else {
        // scrollto back to top!
        this.textContainerOverflowHidden = true
        this.$tween.to(
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
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
