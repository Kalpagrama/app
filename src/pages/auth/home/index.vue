<template lang="pug">
kalpa-layout().b-30
  template(v-slot:body=`{scrollTop}`)
    //- desktop layout
    div(
      v-if="$q.screen.width > 768"
      :style=`{
        position: 'relative',
      }`).row.fit.items-center.content-center.justify-center.q-px-lg
      div(
        :style=`{
          position: 'relative',
          maxWidth: '800px',
          borderRadius: '30px',
          overflow: 'hidden',
        }`
        ).row.full-width
        div(:style=`{width: 'calc(50% + 15px)',}`).row
          div(:style=`{position: 'relative', paddingBottom: '100%',}`).row.full-width
            div(:style=`{position: 'absolute',}`).row.fit.items-center.content-center
              img(
                draggable="false"
                :src="'/images/space.png'"
                :style=`{
                  objectFit: 'cover',
                  //- maxHeight: '50vh'
                }`
                ).fit
              //- logo
              div(
                :style=`{
                  position: 'absolute', zIndex: 3, top: '0px',
                  //- maxHeight: '55vh',
                }`
                ).row.fit.row.fit.items-center.content-center.justify-center
                kalpa-logo(
                  :width="200"
                  :height="200").q-mb-md
                .row.full-width.justify-center
                  span(:style=`{fontSize: '30px',}`).text-white {{$t('Kalpagrama')}}
              //- tint
              div(
                :style=`{
                  position: 'absolute', zIndex: 2, top: '0px',
                  background: 'rgba(0,0,0,0.5)',
                  //- maxHeight: '100vh',
                }`
                ).row.fit.items-center.content-center.justify-center
        div(:style=`{width: 'calc(50% + 15px)', position: 'absolute', zIndex: 100, top: '0px', right: '0px',}`)
          div(:style=`{position: 'relative', paddingBottom: '100%'}`).row.full-width
            div(:style=`{position: 'absolute',borderRadius: '30px',}`).row.fit.b-80.q-pt-lg.q-px-xl
              auth-flow(:onSuccess="onSuccess")
    //- mobile layout
    div(
      v-if="$q.screen.width <= 768"
      @click="() => {}"
      :style=`{position: 'relative',}`).row.full-width.items-start.content-start
      div(
        :style=`{
          position: 'fixed',  zIndex: 1, top: '0px',
        }`
        ).row.full-width
        img(
          draggable="false"
          :src="'/images/space.png'"
          :style=`{
            objectFit: 'cover',
            maxHeight: '50vh'
          }`
          ).fit
        img(
          draggable="false"
          :src="'/images/space.png'"
          :style=`{
            objectFit: 'cover',
            maxHeight: '50vh',
            transform: 'scaleY(-1)',
          }`
          ).fit
      //- logo
      div(
        :style=`{
          position: 'fixed', zIndex: 3, top: '0px',
          maxHeight: '55vh',
        }`
        ).row.fit.row.fit.items-center.content-center.justify-center
        kalpa-logo(
          :width="200"
          :height="200"
          :style=`{
            transform: 'rotate(' + scrollTop / 2 + 'deg)',
          }`).q-mb-md
        .row.full-width.justify-center
          span(:style=`{fontSize: '30px',}`).text-white {{$t('Kalpagrama')}}
      //- tint
      div(
        :style=`{
          position: 'fixed', zIndex: 2, top: '0px',
          background: 'rgba(0,0,0,0.6)',
          maxHeight: '100vh',
        }`
        ).row.fit.items-center.content-center.justify-center
      //- tong
      div(
        @click.self="() => {}"
        :style=`{
          position: 'relative', zIndex: 100, transform: 'translate3d(0,0,0)',
          marginTop: '50vh',
          borderRadius: getRadius(scrollTop, scrollHeight),
          minHeight: $q.screen.height+'px',
          maxHeight: $q.screen.height+'px',
        }`
        ).row.full-width.items-start.content-start.b-80.q-pt-lg.q-px-xl
        auth-flow(:onSuccess="onSuccess")
</template>

<script>

import authFlow from './auth_flow.vue'

export default {
  name: 'pageAuth_home',
  components: {
    authFlow,
  },
  props: ['onSuccess'],
  methods: {
    getRadius (scrollTop, scrollHeight) {
      let r = 30
      // let r = 30 * (1 - (scrollTop / (this.$q.screen.height / 2)))
      return `${r}px ${r}px 0 0`
    },
  }
}
</script>
