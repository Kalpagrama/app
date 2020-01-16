<template lang="pug">
div(
  :style=`{position: 'relative', minHeight: '46px', overflow: 'hidden', borderRadius: '10px'}`
  ).row.full-width.q-mb-sm.bg-grey-3
  //- cut ACTIONS play, modes, more
  div(
    v-if="true"
    :style=`{position: 'relative', height: '46px'}`
    ).row.full-width.items-center.content-center.q-px-sm.bg-grey-3
    //- :color="cutPlaying === ci ? 'red' : 'green'"
    div(:style=`{height: '100%', width: '46px'}`).row.items-center.justify-center
      q-btn(
        round dense push @click="$emit('play', index)"
        :style=`{zIndex: 105, background: cut.color}`)
        q-icon(:name="cutPlaying === index ? 'pause' : 'play_arrow'" color="white")
    //- cut name
    .col.full-height
      //- cut.name if we had one
      div(
        @click="nameSettingStart()"
        :style=`{position: 'relative'}` v-ripple=`{color: 'white'}`).col.full-height.cursor-pointer
        div(v-if="true").row.fit.items-center.content-center
          span(
            v-if="!nameSetting"
            :style=`{paddingLeft: '10px'}`
            ) {{ cut.name.length > 0 ? cut.name : 'Set cut name' }}
          input(
            v-if="nameSetting" ref="nameInput"
            v-model="cut.name"
            @keyup.enter="nameSetting = false" @blur="nameSetting = false"
            :style=`{background: 'none', margin: 0, paddingLeft: '10px', borderRadius: '10px'}`).full-width.kinput.bg-green.text-white
    //- start
    div(
        @click="startSet()"
        :style=`{}`
        ).full-height.cursor-pointer
        .row.fit.items-center.content-center
          .col
            .row.fit.items-center.justify-center.q-px-sm
              span(
                :class=`{'text-green': startSetting, 'text-bold': startSetting}`
                :style=`{fontSize: '16px', userSelect: 'none'}`).text-black {{ $time((parseInt(cut.points[0].x*100))/100) }}
    //- divider of start&end
    div().row.full-height.items-center.justify-center
      span(:style=`{fontSize: '16px'}`).text-black.text-bold.q-mx-xs -
    //- end
    div(
      @click="endSet()"
      :style=`{}`
      ).full-height.cursor-pointer
      div(:style=`{paddingRight: '0px'}`).row.fit.items-center.content-center
        .col
          .row.fit.items-center.justify-center.q-px-sm
            span(
              :class=`{'text-green': endSetting, 'text-bold': endSetting}`
              :style=`{fontSize: '16px', userSelect: 'none'}`).text-black {{ $time((parseInt(cut.points[1].x*100))/100) }}
    //- actions
    //- options
    div(:style=`{height: '100%', width: '46px'}`).row.items-center.justify-center
      q-btn(
        round flat dense icon="more_vert" color="grey-8"
        @click="$emit('action')")
    //- drag
    div(:style=`{height: '100%', width: '46px'}`).row.items-center.justify-center.handle
      q-btn(
        round flat dense icon="drag_indicator" color="grey-8")
  //- cut BODY name, start, end
  div(
    v-if="false"
    :style=`{position: 'relative', height: '40px'}`
    ).row.full-width.items-center.content-center.justify-end
    //- cut.name if we had one
    div(
      @click="nameSettingStart()"
      :style=`{position: 'relative'}` v-ripple=`{color: 'white'}`).col.full-height.cursor-pointer
      div(v-if="true").row.fit.items-center.content-center
        span(
          v-if="!nameSetting"
          :style=`{paddingLeft: '10px'}`
          ) {{ cut.name.length > 0 ? cut.name : 'Set name' }}
        input(
          v-if="nameSetting" ref="nameInput"
          v-model="cut.name"
          @keyup.enter="nameSetting = false" @blur="nameSetting = false"
          :style=`{background: 'none', margin: 0, paddingLeft: '10px', borderRadius: '10px'}`).full-width.kinput.bg-green.text-white
    //- start
    div(
      @click="startSet()"
      :style=`{}`
      ).full-height.cursor-pointer
      .row.fit.items-center.content-center
        .col
          .row.fit.items-center.justify-center.q-px-sm
            span(
              :class=`{'text-green': startSetting, 'text-bold': startSetting}`
              :style=`{fontSize: '16px', userSelect: 'none'}`).text-black {{ $time((parseInt(cut.points[0].x*100))/100) }}
    //- divider of start&end
    div().row.full-height.items-center.justify-center
      span(:style=`{fontSize: '16px'}`).text-black.text-bold.q-mx-xs -
    //- end
    div(
      @click="endSet()"
      :style=`{}`
      ).full-height.cursor-pointer
      div(:style=`{paddingRight: '0px'}`).row.fit.items-center.content-center
        .col
          .row.fit.items-center.justify-center.q-px-sm
            span(
              :class=`{'text-green': endSetting, 'text-bold': endSetting}`
              :style=`{fontSize: '16px', userSelect: 'none'}`).text-black {{ $time((parseInt(cut.points[1].x*100))/100) }}
  //- cut TIMER
  cut-timer(
    v-if="startSetting || endSetting"
    :player="player" :cut="cut" :index="index" :pointIndex="startSetting ? 0 : 1")
  //- cut INACTIVE
  div(
    v-if="cutIndex !== index" @click="$emit('cutIndex', index)"
    :style=`{
      position: 'absolute', zIndex: 200,
      left: 0, width: 'calc(100% - 50px)',
      background: 'rgba(0,0,0,0.35)'}`).row.full-height.cursor-pointer
  div(
    v-if="cutIndex !== index"
    :style=`{
      position: 'absolute', zIndex: 200,
      right: 0, width: '50px', pointerEvents: 'none',
      background: 'rgba(0,0,0,0.35)'}`).row.full-height
  //- cut PLAYING tint
  div(
    v-if="cutPlaying === index" @click="player.playing ? player.pause() : player.play()"
    :style=`{
      position: 'absolute', zIndex: 100
    }`
    ).row.fit
    div(
      :style=`{
        position: 'absolute', zIndex: 100, right: 0, background: 'rgba(76, 175, 80, 0.8)', pointerEvents: 'none',
        width: ((cut.points[1].x-now)/(cut.points[1].x-cut.points[0].x))*100+'%'}`
      ).row.full-height
</template>

<script>
import cutTimer from './cut_timer'

export default {
  name: 'nFEVcut',
  components: {cutTimer},
  props: ['index', 'cut', 'cutIndex', 'cutPlaying', 'player', 'now'],
  data () {
    return {
      startSetting: false,
      endSetting: false,
      nameSetting: false
    }
  },
  watch: {
    cutIndex: {
      handler (to, from) {
        this.$log('cutIndex CHANGED', to)
        if (to !== this.index) {
          this.startSetting = false
          this.endSetting = false
        }
      }
    }
  },
  methods: {
    nameSettingStart () {
      this.$log('nameSettingStart')
      this.nameSetting = !this.nameSetting
      this.$nextTick(() => {
        this.$refs.nameInput.focus()
      })
    },
    startSet () {
      this.$log('startSet')
      if (this.startSetting) {
        this.startSetting = false
        this.endSetting = false
      } else {
        this.startSetting = true
        this.endSetting = false
      }
    },
    endSet () {
      this.$log('endSet')
      if (this.endSetting) {
        this.endSetting = false
        this.startSetting = false
      } else {
        this.endSetting = true
        this.startSetting = false
      }
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
