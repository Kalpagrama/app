<template lang="pug">
div(
  :style=`{
    height: data.heightMax+'%',
    minHeight: '27px',
    //- background: 'rgba(0,0,0,0.5)',
    background: wrapperBackground,
    borderRadius: '10px',
  }`
  ).column.full-width.items-end.content-end.justify-end
    //- top/opened
    div(
      v-show="data.heightMax > 0"
      :style=`{overflow: 'hidden',}`
      ).col.full-width
      div(
        v-if="data.contentKalpa"
        :style=`{overflow: 'hidden',}`
        @click.self="miniClick()"
        ).row.fit.items-start.content-start
        //- name
        .row.full-width.q-px-md.q-py-sm
          span(
            :class=`{
              //- 'q-my-lg': $q.screen.width > 768,
            }`
            :style=`{
              fontSize: width > 500 ? '16px' : '12px',
            }`
          ).text-white.text-bold {{ data.contentKalpa.name }}
        //- go to content
        div(v-if="width > 300").row.full-width.q-px-md
          router-link(
            :to="'/content/'+data.contentKalpa.oid"
            :style=`{
              borderRadius: '10px',
            }`
            ).row.full-width.b-35.q-pa-xs
            img(
              :src="data.contentKalpa.thumbUrl"
              :style=`{
                height: '50px',
                borderRadius: '10px',
              }`).q-mr-sm
            .col
              div(:style=`{minHeight: '50px',}`).row.full-width.items-center.justify-end
                .row.items-center.content-center.q-pr-sm
                  span(:style=`{fontSize: '24px',lineHeight: 1}`).text-white.text-bold {{contentKalpaActivity}}
                  q-icon(name="whatshot" size="30px" color="white")
        //- go to context
        .row.full-width.q-px-md.q-pt-sm
          q-btn(
            outline no-caps color="white"
            :style=`{
              minHeight: '50px',
            }`
            @click="goContext()"
            ).full-width
            span.text-white {{ $t('Watch in context')}}
    //- bottom
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      div(
        v-if="isActive"
        transition-show="jump-down"
        :style=`{
          height: '28px',
          borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.cursor-pointer
        div(@click="miniClick()").col.full-height
          .row.fit.items-center.content-center.q-px-sm
            q-icon(name="select_all" color="grey-4" size="14px").q-mr-xs
            //- small.text-grey-4 {{composition.layers[0].contentName}}
            small(v-if="width > 330").text-grey-4 {{$t('Context')}}
        //- video controls
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          div(
            v-if="composition.outputType === 'VIDEO' && player"
            ).row.full-height.items-center.content-center.q-px-xs
            q-btn(
              round flat dense
              :color="'white'"
              :icon="'replay'" size="xs"
              @click="player.replay()").q-px-md.q-mt-xs
            //- full countdown
            //- .row.q-px-sm.q-mt-xs
              small.text-white {{ $time(player.currentTime) }}
              small.text-white.q-mx-xs :
              small.text-white {{ $time(player.duration) }}
            //- mini countdown
            .row.q-px-sm.q-mt-xs
              small.text-white {{ $time(player.duration-player.currentTime) }}
            q-btn(
              round flat dense
              :color="player.muted ? 'red' : 'white'"
              :icon="player.muted ? 'volume_off' : 'volume_up'" size="xs"
              @click="player.mutedToggle()").q-px-md.q-mt-xs
</template>

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { assert } from 'src/system/common/utils'

export default {
  name: 'context',
  props: ['composition', 'itemState', 'isActive', 'isVisible', 'nodeOid', 'width', 'height', 'player'],
  watch: {
    isActive: {
      immediate: true,
      handler (to, from) {
        if (to) {
          // this.$wait(3000).then(() => {
          //   this.getContent()
          // })
        }
        else {
          this.$gsap.to(this.data, 0.3, {heightMax: 0})
        }
      }
    }
  },
  computed: {
    data() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      assert(this.itemState)
      let key = this.$options.name + this.composition.oid
      if (!this.itemState[key]) {
        this.$set(this.itemState, key, {
          heightMax: 0,
          contentKalpa: null,
        })
      }
      return this.itemState[key]
    },
    contentKalpaActivity () {
      if (this.data.contentKalpa) {
        //  + this.data.contentKalpa.relatedContent.length
        return Object.values(this.data.contentKalpa.countStat).reduce((acc, val) => {
          if (Number.isInteger(val)) {
            acc += val
          }
          return acc
        }, 0)
      }
      else {
        return null
      }
    },
    wrapperBackground () {
      if (this.composition.outputType === 'BOOK') {
        return 'rgb(0,0,0)'
      }
      else {
        return 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 200%)'
      }
    }
  },
  methods: {
    miniClick () {
      this.$log('miniClick')
      if (!this.contentKalap) this.getContent()
      this.$gsap.to(this.data, 0.3, {heightMax: this.data.heightMax === 100 ? 0 : 100})
    },
    async getContent () {
      this.$log('getContent')
      this.data.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.composition.layers[0].contentOid)
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
