<template lang="pug">
div(
  :style=`{
    position: 'fixed', top: top+'px', zIndex: 1000,
  }`
  ).row.full-width.justify-center.q-px-sm
  div(
    :style=`{
      position: 'relative',
      maxWidth: '500px', borderRadius: '10px',
      //- background: 'rgba(0,0,0,0.5)',
      //- background: 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
      //- filter: 'blur(10px)',
    }`).row.full-width.b-30
    div(
      v-if="!opened"
      @click="opened = true"
      :style=`{
        position: 'absolute', zIndex: 100,
      }`
      ).row.fit
    //- div(
      v-if="true"
      :style=`{
        position: 'absolute', zIndex: 1,
        pointerEvents: 'none',
        filter: 'blur(10px)',
        opacity: 0.5,
      }`
      ).row.fit.bg-black.br
    div(
      :style=`{
        minHeight: '70px',
        zIndex: 10,
      }`
      ).row.full-width
      q-input(
        v-model="name"
        dark borderless
        placeholder="В чем суть?"
        type="textarea" autogrow
        :rows="1" :maxlength="120"
        :input-style=`{
          fontSize: '20px',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center'
        }`).full-width
    div(:style=`{overflow: 'hidden',}`).row.full-width
      transition(enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp")
        div(
          v-if="opened"
          :style=`{
            zIndex: 10,
          }`
          ).row.full-width.q-pa-sm
          .row.full-width
            .row.full-width.items-center.content-center.q-px-md
              span.text-white Сферы сути:
              .col
              q-btn(round flat dense color="green" icon="add")
            .row.full-width.scroll.q-px-sm.q-pb-sm
              .row.no-wrap
                span(
                  v-for="(s,si) in 5" :key="si"
                  :style=`{
                    whiteSpace: 'nowrap',
                    borderRadius: '10px',
                  }`
                ).text-white.q-py-xs.q-px-sm.q-mr-sm.b-40 aqwe sphere {{ si }}
          .row.full-width.q-pa-sm
            q-btn(
              no-caps color="green"
              ) Опубликовать
            .col
            q-btn(
              flat no-caps color="white"
              @click="opened = false") Свернуть
//- div(
  @click.self="focused = false"
  :style=`{
    position: 'absolute', zIndex: 999,
    bottom: '0px',
    background: 'rgba(0,0,0,'+heightOpacity+')',
    width: '100%',
    height: '100%',
    maxHeight: heightPercent+'%',
    minHeight: '70px',
  }`).row.items-center.content-center.justify-center
  div(
    :style=`{
      position: 'relative',
      minHeight: '70px',
      maxWidth: '400px',
      borderRadius: '10px',
    }`
    ).b-40.cursor-pointer
    div(
      v-if="focused === false"
      @click="focused = true"
      :style=`{
        position: 'absolute', zIndex: 100,
      }`
      ).row.fit.br
    //- :disable="false || heightPercent !== 100"
    q-input(
      v-show="heightPercent === 100"
      v-model="name"
      ref="nameInput"
      borderless dark
      placeholder="В чем суть?"
      :autofocus="true"
      :input-style=`{
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white'
      }`
      @blur="focused = false"
      ).full-width
    //- input(
      v-if="heightPercent === 100"
      v-model="name"
      :autofocus="true"
      ).full-width
    q-input(
      v-if="heightPercent !== 100"
      v-model="name"
      borderless dark
      placeholder="В чем суть?"
      :disable="true"
      :input-style=`{
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white',
        pointerEvents: 'none',
      }`
      ).full-width
</template>

<script>
export default {
  name: 'nodeEditor',
  data () {
    return {
      name: '',
      focused: false,
      heightPercent: 10,
      heightOpacity: 0,
      top: 0,
      opened: false,
    }
  },
  watch: {
    opened: {
      immediate: true,
      handler (to, from) {
        if (to) {
          this.$tween.to(this, 0.4, {
            top: 8,
            // top: this.$q.screen.height - 240,
            // top: this.$q.screen.height / 2,
            // top: 172,
            // heightPercent: 100,
            // heightOpacity: 0.5,
            onComplete: async () => {
              // this.$refs.nameInput.focus()
              // await this.$wait(100)
              // let ref = this.$refs.nameInput
              // this.$log('ref', ref)
              // ref.focus()
              // this.$refs.nameInput.$el.click()
            }
          })
        }
        else {
          this.$tween.to(this, 0.4, {
            top: 8,
            // top: 172,
            // top: this.$q.screen.height - 240,
            // heightPercent: 10,
            // heightOpacity: 0,
          })
        }
      }
    },
    focused: {
      handler (to, from) {
        if (to) {
          this.$tween.to(this, 0.4, {
            heightPercent: 100,
            heightOpacity: 0.5,
            onComplete: async () => {
              // this.$refs.nameInput.focus()
              // await this.$wait(100)
              // let ref = this.$refs.nameInput
              // this.$log('ref', ref)
              // ref.focus()
              // this.$refs.nameInput.$el.click()
            }
          })
        }
        else {
          this.$tween.to(this, 0.4, {
            heightPercent: 10,
            heightOpacity: 0,
          })
        }
      }
    }
  },
  methods: {
  },
  created () {
    // this.top = this.$q.screen.height - 170
  }
}
</script>
