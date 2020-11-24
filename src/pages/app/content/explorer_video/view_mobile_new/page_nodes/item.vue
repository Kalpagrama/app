<template lang="pug">
div(
  :style=`{
    borderRadius: '10px',
    overflow: 'hidden',
    paddingRight: '0px',
  }`
  ).row.full-width.items-start.content-start.q-mb-md
    div(
      :style=`{
        background: 'rgb(35,35,35)',
        borderRadius: '10px',
        overflow: 'hidden',
      }`
      ).row.full-width
      //- header
      .row.full-width.items-center.content-center.q-pa-sm
        img(:src="node.thumbUrl" :style=`{width: '28px', height: '28px', borderRadius: '50%',}`)
        .col.q-px-sm
          .row.full-width.items-center.content-center
            .col
              small.text-white {{node.author.name}}
            small.text-grey-8 17.11.2020
      //- body
      .row.full-width.items-start.content-start
        .row.full-width.items-start.content-start.q-px-sm
          div(
            @click="nodeClick(node)"
            :style=`{
              position: 'relative',
              borderRadius: '10px',
            }`).row.full-width.b-40
            //- currentTime
            div(
              v-if="player.currentTime >= start && player.currentTime <= end"
              :style=`{
                position: 'absolute', zIndex: 200,
                borderRadius: '10px',
                overflow: 'hidden',
                //- opacity: 0.5,
                background: 'rgba(255,255,255,0.2)',
              }`
              ).row.fit
              div(
                :style=`{
                  position: 'absolute', zIndex: 210, left: '0px',
                  width: (player.currentTime-start)/duration*100+'%',
                  background: 'rgba(255,255,255,0.5)',
                }`
                ).row.full-height
            .col.q-pa-sm
              span.text-white.text-bold {{node.name}}
            .col
              .row.full-width.items-start.content-start.justify-end
                img(
                  :src="node.thumbUrl"
                  :style=`{
                    //- objectFit: 'contain',
                    height: '60px',
                    borderRadius: '10px',
                  }`).b-30
        //- spheres
        .row.full-width.justify-start.q-pt-sm.q-px-sm.scroll
          .row.no-wrap
            q-btn(
              v-for="(sphere,si) in node.spheres" :key="si"
              round flat dense color="grey-6" no-caps
              :to="'/sphere/'+sphere.oid"
              :style=`{whiteSpace: 'nowrap',}`).q-px-sm.b-40.q-mr-sm.q-mb-sm {{ sphere.name }}
    //- footer
    node-actions(:node="node")
</template>

<script>
export default {
  name: 'pageNodes_item',
  props: ['node', 'player', 'contentKalpa'],
  components: {
    nodeActions: () => import('components/node/node_actions.vue'),
  },
  data () {
    return {
    }
  },
  computed: {
    start () {
      return this.node.items[0].layers[0].figuresAbsolute[0].t
    },
    end () {
      return this.node.items[0].layers[0].figuresAbsolute[1].t
    },
    duration () {
      return this.end - this.start
    }
  }
}
</script>
