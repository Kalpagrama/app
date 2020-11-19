<template lang="pug">
q-page(
  :style=`{
  }`
  ).row.full-width.items-start.content-start.justify-center
  kalpa-loader(
    :immediate="true"
    :query="nodesQuery" @items="nodesLoaded" v-slot=`{items,next,nexting}`)
    div(
      :style=`{
        height: $q.screen.height-headerHeight-0+'px',
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
              borderRadius: '10px 10px 0 0',
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
  name: 'pageNodes',
  props: ['contentKalpa', 'node', 'headerHeight'],
  components: {
    nodeActions: () => import('components/node/node_actions.vue'),
  },
  data () {
    return {
      nodeOpened: false,
    }
  },
  computed: {
    nodesQuery () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.contentKalpa.oid
        },
        populateObjects: true,
      }
      if (this.onlyMine) {
        res.selector.oidAuthor = {$eq: this.$store.getters.currentUser().oid}
      }
      return res
    },
  },
  methods: {
  }
}
</script>
