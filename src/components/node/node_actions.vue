<template lang="pug">
div(:style=`{height: '60px'}`).row.full-width.items-center.justify-end
  //- node Voting
  //- node votes stats
  q-dialog(ref="rateStatsDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    div(@click.self="$refs.rateStatsDialog.hide()").row.fit.items-end.content-end
      div(:style=`{height: '16px'}`).row.full-width.justify-center.items-center
        div(:style=`{height: '5px', width: '50px', borderRadius: '2.5px'}`).row.bg-grey-2
      div(:style=`{height: $q.screen.height/2+'px', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`).column.full-width.bg-white
        div(:style=`{position: 'relative', height: '50px'}`).row.full-width
          div(:style=`{position: 'absolute', bottom: '0px', height: '3px'}`).row.full-width.bg-grey-3
          q-tabs(v-model="tab" align="justify")
            q-tab(v-for="(r,ri) in rates" :key="ri" :name="ri" :label="r.name")
        .col.full-width.scroll
          q-tab-panels(v-model="tab" swipeable).fit
            q-tab-panel(v-for="(r,ri) in rates" :key="ri" :name="ri").fit
              .row.full-width.items-start.content-start
                div(
                  v-for="(u, ui) in 50" :key="ui"
                  :style=`{height: '50px'}`
                  ).row.full-width.items-center.q-px-md.br
                  span User {{ tab }} {{ ui }}
  div(
    v-if="nodeBluring"
    @click="nodeBluring = false"
    v-touch-pan.left.right.prevent.mouse="nodeBlurPan"
    :style=`{position: 'fixed', zIndex: 500, top: 0, left: 0}`).row.fit
    //- background: 'rgba(0,0,0,0.1)'
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="nodeBluring"
      :style=`{position: 'relative'}`
      ).row.fit.items-center.justify-center
      //- leave-active-class="animated slideOutDown"
      transition(appear enter-active-class="animated slideInUp")
        div(
          v-if="nodeBluring"
          :style=`{
            position: 'absolute', zIndex: 1000, left: '0px', top: '-100px',
            width: ratesWidth+'px', height: '100px', overflow: 'hidden'}`).row.items-end
          div(
            v-for="(r, ri) in rates" :key="ri"
            @click="rateClick(r, ri)"
            :style=`{position: 'relative', height: '50px'}`
            ).col.bg-white
            transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
              div(
                v-if="ri === rate"
                :style=`{position: 'absolute', zIndex: 2000, height: '50px', bottom: '0px'}`
                ).row.full-width.items-start.justify-center
                div(:style=`{width: '40px', height: '40px', borderRadius: '50%', background: r.color}`).row.items-center.justify-center
                  span.text-bold {{ r.name }}
            .row.fit.items-center.justify-center
              //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
              span(v-if="rates !== ri").text-bold {{ r.name }}
      //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      //- q-icon(name="keyboard_arrow_left" color="grey" size="20px")
      span(v-if="nodeBluring").text-bold {{ $t('Tap or slide to select') }}
      //- q-icon(name="keyboard_arrow_right" color="grey" size='20px')
    div(v-else).row.fit.items-center
      //- blur
      q-btn(
        color="grey-9" round flat
        @click="nodeBlurClick()"
        v-touch-hold.mouse="nodeBlurHold"
        :style=`{position: 'relative'}`)
        q-icon(name="blur_on" size="40px"
          :style=`{color: rates[rate].color}`)
      //- rate
      span(@click="rateStatsClick()").text-bold.q-ml-sm {{ rates[rate].name }} / 95
      //- div(v-if="nodeFull && nodeFull.rateUser").q-mr-sm
      //-   small {{Math.ceil(nodeFull.rateUser*100)}}/
      //-   span(:style=`{fontSize: '15px'}`).text-bold {{Math.ceil(nodeFull.rate*100)}}
      .col
      //- share
      q-btn(round flat color="grey-9" icon="share" @click="nodeShare()")
</template>

<script>
export default {
  name: 'nodeActions',
  components: {},
  props: ['index', 'zIndex', 'node', 'nodeFull', 'active'],
  data () {
    return {
      nodeBluring: false,
      tab: 0,
      rate: 0,
      rates: [
        {id: 0, name: '5', color: 'blue'},
        {id: 1, name: '25', color: 'green'},
        {id: 2, name: '50', color: 'red'},
        {id: 3, name: '75', color: 'yellow'},
        {id: 4, name: '95', color: 'gold'}
      ]
    }
  },
  computed: {
    ratesWidth () {
      return this.$q.screen.width - 20
    }
  },
  methods: {
    rateStatsClick () {
      this.$log('rateStatsClick')
      this.$refs.rateStatsDialog.show()
    },
    rateClick (r, ri) {
      this.$log('rateClick', r, ri)
      this.$set(this, 'rate', ri)
      this.nodeBluring = false
    },
    async nodeBlurPan (e) {
      this.$log('nodeBlurPan', e)
      let left = e.position.left
      let i = e.offset.x / (this.ratesWidth / 5)
      this.$set(this, 'rate', Math.round(i))
      if (e.isFinal) {
        await this.$wait(700)
        this.nodeBluring = false
      }
    },
    async nodeBlurHold (e) {
      this.$log('nodeBlurHold', e)
      this.nodeBluring = true
      // await this.$wait(3000)
      // this.nodeBluring = false
    },
    async nodeBlurClick () {
      this.$log('nodeBlurClick')
      this.nodeBluring = true
      // await this.$wait(3000)
      // this.nodeBluring = false
      // this.$store.commit('node/stateSet', ['node', this.node])
      // this.$store.commit('node/stateSet', ['nodeFull', this.nodeFull])
      // this.$store.commit('ui/stateSet', ['nodeRateDialogOpened', true])
    },
    nodeShare () {
      this.$log('nodeShare')
      // this.$store.commit('ui/stateSet', ['nodeShareDialogOpened', true])
    }
  }
}
</script>
