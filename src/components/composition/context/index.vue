<template lang="pug">
div(
  :style=`{
    //- height: heightMax === 0 ? 'calc('+heightMax+'% + 28px)' : 'calc('+heightMax+'% + 28px)',
    height: heightMax+'%',
    minHeight: '27px',
    background: 'rgba(0,0,0,0.8)',
    borderRadius: '10px',
  }`
  ).column.full-width.items-end.content-end.justify-end
    div(
      v-show="heightMax > 0"
      :style=`{overflow: 'hidden',}`
      ).col.full-width
      div(
        v-if="contentKalpa"
        :style=`{overflow: 'hidden',}`
        @click.self="miniClick()"
        ).row.fit.items-start.content-start.q-pa-sm
        .row.full-width.q-px-md.q-py-sm
          span(
            :class=`{
              //- 'q-my-lg': $q.screen.width > 768,
            }`
            :style=`{
              fontSize: width > 300 ? '18px' : '12px',
            }`
          ).text-white.text-bold {{ contentKalpa.name }}
        div(v-if="width > 300").row.full-width.q-px-md
          router-link(
            :to="'/content/'+contentKalpa.oid"
            :style=`{
              borderRadius: '10px',
            }`
            ).row.full-width.b-35.q-pa-xs
            img(
              :src="contentKalpa.thumbUrl"
              :style=`{
                //- height: $q.screen.width > 768 ? '100px' : '50px',
                height: '50px',
                borderRadius: '10px',
              }`).q-mr-sm
            .col
              div(:style=`{minHeight: '50px',}`).row.full-width.items-center.justify-end
                .row.items-center.content-center.q-pr-md
                  span(:style=`{fontSize: '24px',lineHeight: 1}`).text-white.text-bold {{contentKalpa.countStat.countNodes}}
                  span(:style=`{fontSize: '16px',}`).text-white.text-bold.q-ml-sm Nodes
                //- .row.items-center.content-center.q-px-md
                  span(:style=`{fontSize: '24px',lineHeight: 1}`).text-white.text-bold {{contentKalpa.countStat.countViews}}
                  span(:style=`{fontSize: '16px',}`).text-white.text-bold.q-ml-sm Views
        .row.full-width.q-px-md.q-pt-sm
          q-btn(
            outline no-caps color="white"
            :style=`{
              minHeight: '50px',
            }`
            @click="goContext()"
            ).full-width
            span.text-white {{ $t('Watch in context')}}
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      div(
        v-if="isActive"
        transition-show="jump-down"
        :style=`{
          height: '28px',
          //- background: 'rgb(0,0,0)',
          borderRadius: '10px',
          paddingLeft: '14px',
        }`
        ).row.full-width.items-center.content-center.cursor-pointer
        div(
          @click="miniClick()"
          ).col
          .row.full-width.items-center.content-center
          q-icon(name="select_all" color="grey-4" size="14px").q-mr-xs
          //- small.text-grey-4 {{composition.layers[0].contentName}}
          small.text-grey-4 {{$t('Context')}}
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          div(
            v-if="composition.outputType === 'VIDEO' && player"
            ).row.items-center.content-center.q-px-xs
            q-btn(
              round flat
              :color="'white'"
              :icon="'replay'" size="xs"
              @click="player.replay()").q-px-md
            small.text-white {{ $time(player.currentTime) }}
            small.text-white.q-mx-xs :
            small.text-white {{ $time(player.duration) }}
            q-btn(
              round flat
              :color="player.muted ? 'red' : 'white'"
              :icon="player.muted ? 'volume_off' : 'volume_up'" size="xs"
              @click="player.mutedToggle()").q-px-md
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'context',
  props: ['composition', 'isActive', 'isVisible', 'nodeOid', 'width', 'height', 'player'],
  data () {
    return {
      heightMax: 0,
      contentKalpa: null,
    }
  },
  watch: {
    isActive: {
      immediate: true,
      handler (to, from) {
        if (to) {
          this.$wait(3000).then(() => {
            this.getContent()
          })
        }
        else {
          this.$tween.to(this, 0.3, {heightMax: 0})
        }
      }
    }
  },
  methods: {
    miniClick () {
      this.$log('miniClick')
      if (!this.contentKalap) this.getContent()
      this.$tween.to(this, 0.3, {heightMax: this.heightMax === 100 ? 0 : 100})
    },
    async getContent () {
      this.$log('getContent')
      this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.composition.layers[0].contentOid)
    },
    goContent () {
      this.$log('goContent')
      this.$router.push('/content/' + this.composition.layers[0].contentOid)
    },
    goContext () {
      this.$log('goContext')
      if (this.nodeOid) this.$store.commit('ui/stateSet', ['nodeOnContent', this.nodeOid])
      this.$router.push('/content/' + this.composition.layers[0].contentOid)
    }
  }
}
</script>
