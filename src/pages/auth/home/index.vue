<template lang="pug">
.row.window-height.window-width
  div(v-if="isReady && $q.screen.width > 768" @click.self="close()").row.fit.items-center.content-center.justify-center
    //- desktop layout
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        @click.self="close()"
        :style=`{
          position: 'relative',
          maxWidth: '900px',
          borderRadius: '30px',
          overflow: 'hidden',
        }`
      )
        img(
          draggable="false"
          :src="'/images/rainbow.jpg'"
          :style=`{
                  objectFit: 'cover',
                }`
        ).fit
        div(
          :style=`{position: 'absolute', zIndex: 2, top: '0px', background: 'rgba(0,0,0,0.5)'}`
        ).row.fit
          div(:style=`{position: 'absolute', width: 'calc(50% + 15px)',}`).full-height
            .row.fit.items-center.content-center
              //- logo
              div(
                :style=`{
                    position: 'absolute', zIndex: 3, top: '0px',
                    //- maxHeight: '55vh',
                  }`
              ).row.fit.row.fit.items-center.content-center.justify-center
                kalpa-logo(
                  :width="200"
                  :height="200").q-mb-md.rotating-slow
                .row.full-width.justify-center
                  router-link(
                    :to="'/trends'"
                    :style=`{fontSize: '30px',}`).text-white {{$t('Kalpagrama')}}

              //- tint

          div(:style=`{width: 'calc(50% + 15px)', position: 'absolute', zIndex: 100, right: '0px', borderLeft: '0px solid rgba(90,90,90,0.6)'}`).full-height.q.ma-sm
            auth-flow(:onSuccess="onSuccess").q-pa-lg.full-height.scroll
          div(:style=`{position: 'absolute', zIndex: 100, right: '0px'}`).q-ma-xs
            q-btn(round flat color="white" icon="clear" @click="close")
    //- mobile layout
  div(
    v-else
    @click="() => {}"
  ).row.full-height
    img(
      draggable="false"
      :src="'/images/rainbow.jpg'"
      :style=`{
            position: 'fixed', top: '0px',
            transform: 'rotate(180deg)',
            objectFit: 'fill',
          }`
    ).row.fit
    div(
      :style=`{position: 'fixed', top: '0px', background: 'rgba(0,0,0,0.5)'}`
    ).row.fit
    div(:style=`{zIndex: 2}`).row.fit
      q-btn(
        round flat color="white" icon="clear" @click="close" size='20px'
        :style=`{position: 'absolute', zIndex: 100, right: '0px', top: '13%'}`
        )
      //- logo
      kalpa-logo(
        :width="100"
        :height="100"
        :style=`{
            transform: 'rotate(' + scrollTop / 2 + 'deg)',
          }`).rotating-slow.q-mt-xl
      span( :style=`{fontSize: '22px',}`).text-white.text-bold.text-center.full-width {{$t('Kalpagrama')}}
      // - tong
      div().q.ma
        auth-flow(
          :onSuccess="onSuccess").no-scroll.q-pa-lg
</template>

<script>
import authFlow from './auth_flow.vue'

export default {
  name: 'pageAuth_home',
  components: {
    authFlow,
  },
  props: ['onSuccess'],
  data () {
    return {
      isReady: true,
      backgroundOpacity: 0,
    }
  },
  methods: {
    getRadius (scrollTop, scrollHeight) {
      let r = 30
      // let r = 30 * (1 - (scrollTop / (this.$q.screen.height / 2)))
      return `${r}px ${r}px 0 0`
    },
    close () {
      this.$log('close START')
      if (this.$route.name === 'signIn'){
        this.$router.replace('/')
        return
      }
      this.$gsap.to(
        this,
        0.3,
        {
          backgroundOpacity: 0,
          onComplete: () => {
            this.$log('close DONE')
          }
        })
      this.$wait(150).then(() => {
        this.$emit('close')
      })
    }
  },
  mounted () {
    this.$log('mounted')
    this.$gsap.to(this, 0.5, {backgroundOpacity: 1})
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
