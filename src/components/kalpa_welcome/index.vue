<template lang="pug">
div(
  @click.self="$emit('close')"
  :style=`{
    position: 'relative',
    //- width: $q.screen.width+'px',
    //- minWidth: 500+'px',
    //- maxWidth: 500+'px',
    height: $q.screen.height+'px',
  }`
  ).column.full-width.items-center.content-center.justify-center.b-30
  //- header
  div(
    :style=`{
      position: 'absolute', zIndex: 200, top: '0px',
    }`
    ).row.full-width.q-pa-sm
    .col
    q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  //- left/right next/prev
  div(
    @click="prev()"
    :style=`{
      position: 'absolute', zIndex: 100, top: '0px', left: '0px',
      width: '30%',
    }`
    ).row.full-height
  div(
    @click="next()"
    :style=`{
      position: 'absolute', zIndex: 100, top: '0px', right: '0px',
      width: '30%',
    }`
    ).row.full-height
  //- body
  q-carousel(
    ref="slides-carousel"
    v-model="slide"
    transition-prev="slide-right"
    transition-next="slide-left"
    swipeable animated navigation arrows
    infinite
    :autoplay="5000"
    control-color="white").fit
    q-carousel-slide(
      v-for="(s,si) in slides" :key="s.id"
      :name="s.id"
      :style=`{
        userSelect: 'none',
        //- background: 'rgb(25,25,25)',
      }`
      ).row.fit.items-center.content-center.justify-center.b-30
      img(
        draggable="false"
        :src="s.url"
        :style=`{
          objectFit: 'contain',
          pointerEvents: 'none',
          userSelect: 'none',
        }`
        ).fit
</template>

<script>
import { ObjectApi } from 'src/api/object'

export default {
  name: 'kalpaWelcome',
  props: {
    config: {
      type: Object,
      required: true,
    }
  },
  data () {
    return {
      slide: 'welcome',
      doc: null,
      tutorialInitial: {
        main: false,
        content: false,
        node: false,
        joint: false
      }
    }
  },
  computed: {
    slides () {
      if (!this.doc) return []
      return this.doc.fields.slides.map(s => {
        return {
          id: s.sys.id,
          url: s.fields.file.url,
        }
      })
    },
    tutorial () {
      return this.$store.getters.currentUser().profile.tutorial
    }
  },
  watch: {
    slides: {
      immediate: true,
      handler (to, from) {
        if (to && to[0]) {
          this.slide = to[0].id
        }
      }
    }
  },
  methods: {
    prev () {
      this.$log('prev')
      this.$refs['slides-carousel'].previous()
    },
    next () {
      this.$log('next')
      this.$refs['slides-carousel'].next()
    },
  },
  async mounted () {
    this.$log('mounted')
    // get docs
    const {items: [doc]} = await this.$contentful.getEntries({
      content_type: 'tutorial',
      'fields.id': this.config.id,
    })
    this.$log('doc', doc)
    this.doc = doc
  },
  async beforeDestroy () {
    this.$log('beforeDestroy')
    if (typeof this.tutorial !== 'object') {
      await ObjectApi.update(this.$store.getters.currentUser().oid, 'profile.tutorial', this.tutorialInitial)
    }
    // set tutorial main gone
    let tutorialInput = {[this.config.id]: true, ...this.tutorialInitial}
    await ObjectApi.update(this.$store.getters.currentUser().oid, 'profile.tutorial', tutorialInput)
  }
}
</script>
