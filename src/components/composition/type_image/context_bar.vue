<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 3000,
    left: '0px',
    bottom: '0px',
    borderRadius: '10px',
    userSelect: 'none',
    background: 'rgba(0,0,0,0.5)',
  }`
  ).row.full-width.items-end.content-end
  //- content full info
  div(
    @click.self="contextMiniClick()"
    :style=`{
      height: contentKalpaFullHeight+'px',
      overflow: 'hidden',
      order: 10,
    }`
    ).row.full-width.items-start.content-start
    div(
      v-if="!contentKalpaFull"
      ).row.fit.items-center.content-center.justify-center
      q-spinner(size="50px" color="green")
    div(
      v-if="contentKalpaFull"
      ).row.full-width.items-start.content-start.q-pa-sm
      img(
        :src="contentKalpaFull.thumbUrl"
        :style=`{
          borderRadius: '10px',
          maxHeight: '70px',
        }`)
      .col.q-pl-sm.text-white
        .row.full-width
          small.full-width {{ $t('Subscribers') }}: {{ contentKalpaFull.countStat.countSubscribers }}
          small.full-width {{ $t('Views') }}: {{ contentKalpaFull.countStat.countViews }}
          small.full-width {{ $t('Links') }}: {{ contentKalpaFull.countStat.countJoints }}
          small.full-width {{ $t('Nodes') }}: {{ contentKalpaFull.countStat.countNodes }}
    //- go to context btn
    div(
      v-if="contentKalpaFull"
      :style=`{order: 1}`
      ).row.q-px-sm
      q-btn(
        @click="contextGo()"
        outline no-caps color="white" icon-right="launch"
        :style=`{
          height: '40px',
        }`
        )
        span.text-bold.q-mr-sm {{ $t('Watch in context') }}
  //- content mini
  div(
    :style=`{
      height: '30px',
      paddingLeft: '12px',
      paddingRight: '12px',
    }`
    ).row.full-width.items-center.content-center
    div(
      @click="contextMiniClick()"
      ).col.cursor-pointer
      .row.full-width.items-center.content-center.no-wrap
        q-icon(name="select_all" color="grey-4" size="16px").q-ma-xs
        .col.scroll
          .row.full-width.items-center.content-center.no-wrap
            small(:style=`{whiteSpace: 'nowrap'}`).text-grey-4 {{ isOpened ? contentKalpa.name : $t('Context') }}
    div(
      v-if="player && player.duration"
      :style=`{
      }`
      ).row.items-center.content-center.q-pa-xs
      //- context.name
      small(:style=`{borderRadius: '8px'}`).text-grey-4.q-py-xs.q-px-sm {{$time(player.currentTime)}} / {{$time(player.duration)}}
      //- muted toggle
      q-btn(
        @click="player.setState('muted', !player.muted)"
        round flat dense size="sm"
        :color="player.muted ? 'red' : 'white'"
        :icon="player.muted ? 'volume_off' : 'volume_up'"
        :style=`{
        }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'contextBar',
  props: ['contentKalpa', 'player', 'height', 'nodeOid'],
  data () {
    return {
      isOpened: false,
      contentKalpaFull: null,
      contentKalpaFullHeight: 0,
    }
  },
  computed: {
  },
  watch: {
    isOpened: {
      handler (to, from) {
        if (to) {
          this.$gsap.to(this, 0.3, {contentKalpaFullHeight: this.height - 30})
        }
        else {
          this.$gsap.to(this, 0.3, {contentKalpaFullHeight: 0})
        }
      }
    }
  },
  methods: {
    async contextMiniClick () {
      this.$log('contextMiniClick')
      this.isOpened = !this.isOpened
      this.contentKalpaFull = await this.$rxdb.get(RxCollectionEnum.OBJ, this.contentKalpa.oid)
    },
    contextGo () {
      this.$log('contentGo')
      if (this.nodeOid) {
        this.$store.commit('ui/stateSet', ['nodeOnContent', this.nodeOid])
      }
      this.$router.push('/content/' + this.contentKalpa.oid)
    }
  },
}
</script>
