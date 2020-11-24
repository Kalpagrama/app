<template lang="pug">
q-page(
  :style=`{
    //- height: $q.screen.height-headerHeight-50+'px',
  }`
  ).row.full-width.items-start.content-start.justify-center
  q-resize-observer(@resize="onResize")
  kalpa-loader(
    :immediate="true"
    :query="jointsQuery" @items="jointsLoaded" v-slot=`{items,next,nexting}`)
    div(
      ref="jointsScroll"
      :style=`{
        overflow: jointsScrollOverflow,
      }`
      ).row.full-width.scroll
      div().row.no-wrap
        item(
          v-for="(joint,ii) in items" :key="joint.oid"
          :joint="joint" :ii="ii" :contentKalpa="contentKalpa" :player="player"
          :isActive="jointActive === ii"
          :style=`{
            height: $q.screen.height-headerHeight-50+'px',
            minWidth: '100%',
          }`
          @prev="jointMove(0)"
          @next="jointMove(1)")
      //- small.text-white {{items}}
    //- div(
      :style=`{
        height: $q.screen.height-headerHeight-50+'px',
        maxWidth: '100%',
      }`).column.full-width.items-start.content-start
      .col.full-width.scroll
        div(
          v-for="(node, nodeii) in items" :key="node.oid"
          :style=`{
            position: 'relative',
          }`
          ).row.fit
          //- left
          div(
            :style=`{
              position: 'absolute', zIndex: 100, left: '0px',
              width: '60px',
            }`
            ).row.full-height.br
          //- right
          div(
            :style=`{
              position: 'absolute', zIndex: 100, right: '0px',
              width: '60px',
            }`
            ).row.full-height.br
          //- node body items
          img(
            :src="node.thumbUrl"
            :style=`{
              objectFit: 'contain',
            }`
            ).fit
          //- header
          div(
            :style=`{
              position: 'absolute', zIndex: 100, top: '0px',
            }`
            ).row.full-width.justify-center.q-py-sm
            q-btn(color="white" flat no-caps).b-50 Причина
          //- footer name vote spheres
          div(
            :style=`{
              position: 'absolute', zIndex: 100, bottom: '0px',
              //- borderRadius: '10px 10px 0 0',
            }`
            ).row.full-width.q-pa-sm
            div(
              :style=`{
                borderRadius: '10px',
              }`
              ).row.full-width.b-40
              //- name
              div(
                @click="nodeOpened = !nodeOpened"
                :style=`{
                }`
                ).row.full-width.items-center.content-center.justify-center.q-px-sm.cursor-pointer
                //- q-btn(round flat color="white" icon="keyboard_arrow_up")
                .col
                  .row.full-width.items-center.content-center.justify-center.q-pa-md
                    span(:style=`{fontSize: '18px',}`).text-white.text-bold {{ node.name }}
                //- q-btn(round flat color="white" icon="keyboard_arrow_up")
              //- spheres
              div(
                v-if="nodeOpened && node.spheres.length > 0").row.full-width.scroll
                .row.full-width.justify-start.no-wrap.q-pl-sm
                  div(
                    v-for="(s,si) in node.spheres" :key="s.oid"
                    ).row.items-start.content-start.justify-start.q-pr-sm.q-pb-sm
                    q-btn(
                      flat color="white" dense no-caps
                      :to="'/sphere/'+s.oid"
                      :style=`{borderRadius: '10px', whiteSpace: 'nowrap',}`).row.b-50.q-px-sm.text-grey-4 {{ s.name }}
              //- vote
              node-actions(v-if="nodeOpened" :node="node" :isActive="true" :isVisible="true")
          //- small.text-white {{node}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageJoints',
  props: ['contentKalpa', 'node', 'headerHeight', 'player'],
  components: {
    nodeActions: () => import('components/node/node_actions.vue'),
    item: () => import('./item.vue')
  },
  data () {
    return {
      width: 0,
      jointActive: 0,
      jointMoving: false,
      jointsScrollOverflow: 'hidden',
      nodeOpened: false,
    }
  },
  computed: {
    // nodesQuery () {
    //   let res = {
    //     selector: {
    //       rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
    //       oidSphere: this.contentKalpa.oid
    //     },
    //     populateObjects: true,
    //   }
    //   if (this.onlyMine) {
    //     res.selector.oidAuthor = {$eq: this.$store.getters.currentUser().oid}
    //   }
    //   return res
    // },
    jointsQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_JOINTS,
          oidSphere: this.contentKalpa.oid,
          jointItemType: {$in: ['NODE', 'WORD']},
          // sortStrategy: 'AGE',
          // sortOrder: 'ASC' // DESC
        },
        populateObjects: true,
      }
    }
  },
  methods: {
    jointMove (forward) {
      if (this.jointMoving) return
      this.jointMoving = true
      this.$log('jointMove', forward)
      this.jointsScrollOverflow = 'auto'
      let index = this.jointActive + 1
      if (forward === 0) index -= 2
      this.$tween.to(
        this.$refs.jointsScroll,
        0.3,
        {
          scrollLeft: index * this.width,
          onComplete: () => {
            this.$log('jointMove_onComplete')
            this.jointsScrollOverflow = 'hidden'
            this.jointActive = index
            this.jointMoving = false
          }
        }
      )
    },
    jointsLoaded () {
      this.$log('jointsLoaded')
    },
    onResize (e) {
      this.$log('onResize', e.width)
      this.width = e.width
    }
  }
}
</script>
