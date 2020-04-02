<template lang="pug">
//- q-layout(view="hHh lpR fFf" container :style=`{position: 'relative', height: height+'px'}`).bg-grey-10
div(:style=`{position: 'relative'}`).column.fit
  //- div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
  //-   span.text-white extra explore
  //- header
  //- transition(appear enter-active-class="animated slideInDown" leave-active-class="animated fadeOut")
  //-   div(
  //-     v-if="headerShow"
  //-     :style=`{position: 'absolute', zIndex: 200, height: '60px', top: '0px'}`
  //-     ).row.full-width.items-center.content-center.bg-grey-10
  //-     small.text-white scrollTop: {{ scrollTop }}
  //-     small.text-white.full-width scrollTopDirection: {{scrollTopDirection}}
  //-     small.text-white.full-width scrollDirection: {{scrollDirection}}
  //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated fadeOut")
  //-   div(
  //-     v-if="headerShow"
  //-     :style=`{position: 'absolute', zIndex: 200, height: '60px', bottom: '0px'}`
  //-     ).row.full-width.items-center.content-center.bg-red
  //-     small.text-white scrollTop: {{ scrollTop }}
  //-     small.text-white.full-width scrollTopDirection: {{scrollTopDirection}}
  //-     small.text-white.full-width scrollDirection: {{scrollDirection}}
  //- div(
  //-   ref="extraExploreScroll"
  //-   :style=`{overflow: scrollOverflow ? 'auto' : 'hidden'}`
  //-   @scroll="onScroll").col.full-width.scroll
  //-   div(v-touch-swipe.mouse.capture="onSwipe").row.fit.justify-center
  //-     div(
  //-       v-for="(c,ci) in 100" :key="ci"
  //-       :style=`{paddingBottom: '10px'}`).row.full-width.q-px-xs.q-pt-xs
  //-       div(:style=`{borderRadius: '10px'}`).row.full-width.items-start.content-start.bg-grey-9
  //-         //- span.text-white chain {{ ci }}
  //-         img(
  //-           :src="node.meta.compositions[0].thumbUrl" draggable="false"
  //-           :style=`{borderRadius: '10px', overflow: 'hidden', objectFit: 'contain', pointerEvents: 'none'}`).full-width
  //-         .row.full-width.q-pa-sm
  //-           span.text-white.text-bold {{name}}
          //- .row.full-width.q-pl-sm.q-pr-md
          //-   div(:style=`{width: '60px'}`).row.items-start.content-start.justify-center.q-pt-sm
          //-     div(:style=`{width: '40px', height: '40px', borderRadius: '50%'}`).row.bg-grey-4
          //-   .col.full-height
          //-     .row.fit.items-start.content-start.q-pt-sm
          //-       .row.full-width.items-end
          //-         span.text-white.text-bold Ivan Motovilov
          //-         small.text-white.q-ml-sm @ivanmoto
          //-       .row.full-width
          //-         span.text-white {{name}}
  //- byte
  div(
    v-if="height > 200 && mode === 'byte'"
    ref="extraExploreScroll"
    :style=`{overflow: 'hidden'}`).col.full-width.scroll
    div(
      v-touch-swipe.mouse.prevent.vertical="onSwipe").row.fit.items-start.content-start
      div(
        v-for="(c,ci) in 100" :key="ci"
        :style=`{paddingBottom: '54px'}`).row.fit.q-px-xs.q-pt-xs
        div(:style=`{borderRadius: '10px'}`).row.full-width.items-start.content-start.bg-grey-9
          img(
            :src="node.meta.compositions[0].thumbUrl" draggable="false"
            :style=`{borderRadius: '10px', overflow: 'hidden', objectFit: 'contain', pointerEvents: 'none'}`).full-width
          .row.full-width.q-pa-sm
            span.text-white.text-bold {{ name }}
  //- gallery
  div(
    v-if="height > 200 && mode === 'gallery'"
    ).col.full-width.scroll
    .row.full-width.items-start.content-start
      span.text-white gallery
  //- list
  div(
    v-if="height > 200 && mode === 'list'"
    ).col.full-width.scroll
    div(
      ).row.full-width.items-start.content-start.q-pa-xs
      div(
        v-for="(c,ci) in 100" :key="ci"
        :style=`{height: '35px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-center.content-center.q-px-sm.q-mb-xs.bg-grey-9
        span.text-white chain-{{ci}}
  //- dialogs
  chain-add(
    @hide="chainAddDialogShow = false"
    :style=`{
      position: 'absolute', zIndex: 3000, top: '0px', left: 500-chainAddDialogRight+'px',
      borderRadius: '10px', overflow: 'hidden'}`)
  //- actions
  div(
    v-if="height >= 120"
    :style=`{position: 'absolute', zIndex: 200, bottom: '60px', height: '50px', background: 'rgba(0,0,0,0.7)'}`).row.full-width
    .col.full-height
      .row.fit.items-center.content-center.q-px-xs
        q-btn(round flat :color="mode === 'byte' ? 'green' : 'grey-5'" icon="branding_watermark" @click="mode = 'byte'")
        q-btn(round flat :color="mode === 'gallery' ? 'green' : 'grey-5'" @click="mode = 'gallery'")
          q-icon(name="subtitles" size="26px")
        q-btn(round flat :color="mode === 'list' ? 'green'  : 'grey-5'" icon="featured_play_list" @click="mode = 'list'")
    div(:style=`{height: '50px', width: '50px'}`).row.items-center.content-center.justify-center
      q-btn(round push dense color="green" icon="add" @click="chainAddDialogShow = true"
        :style=`{borderRadius: '50%'}`)
  //- footer
  div(:style=`{height: '60px'}`).row.full-width.bg-grey-10
    kalpa-buttons(:value="tabs" :id="tab" @id="$emit('tab', $event)")
</template>

<script>
import chainAdd from './chain_add'

export default {
  name: 'nodeExplorer_extraExplore',
  components: {chainAdd},
  props: ['node', 'tabs', 'tab', 'height'],
  data () {
    return {
      nameInput: '',
      name: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s\'',
      scrollDirection: null,
      scrollTop: 0,
      scrollTopDirection: 0,
      scrollOverflow: false,
      headerShow: false,
      chainAddDialogShow: false,
      chainAddDialogRight: 0,
      mode: 'list'
    }
  },
  watch: {
    chainAddDialogShow: {
      handler (to, from) {
        this.$log('chainAddDialogShow', to)
        this.$tween.to(this, 0.3, {chainAddDialogRight: to ? 500 : 0})
      }
    },
    scrollDirection: {
      handler (to, from) {
        this.scrollTopDirection = this.scrollTop
        if (to && to === 'up') {
          this.headerShow = true
        }
      }
    }
  },
  methods: {
    onSwipe (e) {
      this.$log('onSwipe', e)
      // this.$q.notify('on swipe:' + e.direction)
      let ref = this.$refs.extraExploreScroll
      let to = e.direction === 'up' ? ref.scrollTop + ref.clientHeight : ref.scrollTop - ref.clientHeight
      this.$tween.to(this.$refs.extraExploreScroll, 0.3, {scrollTop: to})
    },
    onScroll (e) {
      // this.$log('onScroll', e)
      let to = e.target.scrollTop
      if (to > this.scrollTop) this.scrollDirection = 'down'
      else this.scrollDirection = 'up'
      this.scrollTop = to
      if (this.scrollDirection === 'down' && to - this.scrollTopDirection > 60) this.headerShow = false
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
