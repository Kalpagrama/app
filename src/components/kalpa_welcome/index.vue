<template lang="pug">
div(
  @click.self="$emit('close')"
  :style=`{
    position: 'relative',
    //- width: $q.screen.width+'px',
    minWidth: 500+'px',
    maxWidth: 500+'px',
    //- height: $q.screen.height+'px',
  }`
  ).column.items-center.content-center.justify-center.bg
  //- header
  div(
    :style=`{
      position: 'absolute', zIndex: 100, top: '0px',
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
    ).row.full-height.br
  div(
    @click="next()"
    :style=`{
      position: 'absolute', zIndex: 100, top: '0px', right: '0px',
      width: '30%',
    }`
    ).row.full-height.br
  //- body
  q-carousel(
    ref="slides-carousel"
    v-model="slide"
    transition-prev="slide-right"
    transition-next="slide-left"
    swipeable animated navigation arrows
    control-color="white").fit
    q-carousel-slide(
      v-for="(s,si) in slides" :key="s.id"
      :name="s.id"
      ).row.fit.items-center.content-center.justify-center.b-30.br
      small.text-white {{ s.body }}
</template>

<script>
export default {
  name: 'kalpaWelcome',
  props: {
    mode: {
      type: String, default: 'standalone'
    }
  },
  data () {
    return {
      slide: 'welcome',
      slides: [
        {
          id: 'welcome',
          body: 'welcome home alabama'
        },
        {
          id: 'feed',
          body: 'On feeds you can do anything...'
        }
      ]
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
  mounted () {
    this.$log('mounted')
    // if mode standalone, add last slide as settings...
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
