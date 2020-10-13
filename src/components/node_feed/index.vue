<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-start.content-start
  div(
    :style=`{
      position: 'relative',
      background: 'rgb(35,35,35)',
      borderRadius: '10px', overflow: 'hidden',
    }`).row.full-width
    //- header: author, createdAt
    .row.full-width.items-center.content-center.q-pa-sm
      q-btn(
        :to="'/user/'+node.author.oid"
        flat color="white" dense no-caps
        )
        user-avatar(:url="node.author.thumbUrl" :width="24" :height="24")
        span.text-grey-4.q-ml-sm {{ node.author.name }}
      .col
      small.text-grey-8.q-mr-xs {{ node.countViews }}
      q-icon(name="visibility" color="grey-8").q-mr-md
      small.text-grey-8.q-mr-sm {{ $date(node.createdAt, 'DD.MM.YYYY') }}
    //- items wrapper
    .row.full-width
      //- SLIDER
      //- div(
        v-if="node.layout === 'SLIDER'"
        :style=`{
          position: 'relative',
          borderRadius: '10px', overflow: 'hidden',
        }`).row.full-width.items-start.content-start
        list-slider(:items="node.items")
          template(v-slot:item=`{item, isActive: itemActive}`)
            div(
              :style=`{
                position: 'relative',
                borderRadius: '10px', overflow: 'hidden',
              }`
              ).row.fit.b-40.shadow-5
              composition-player(
                :composition="item" :isVisible="isVisible" :isActive="isActive && itemActive"
                :options=`{height: '100%', objectFit: 'cover', loop: true}`)
      //- PIP, VERTICAL
      div(
        v-if="['SLIDER', 'PIP', 'VERTICAL', 'HORIZONTAL'].includes(node.layout)"
        :style=`{
          position: 'relative',
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.full-width.items-start.content-start
        composition-player(
          :composition="node.items[0]" :isVisible="isVisible" :isActive="isActive"
          :options=`{height: 'auto', objectFit: 'contain', loop: true}`)
        q-btn(
          v-if="isActive && isVisible && node.items.length > 1"
          :to="'/node/'+node.oid"
          flat dense color="grey-2" no-caps
          :style=`{
            position: 'absolute', zIndex: 3000, bottom: '8px',
            left: 'calc(50% - 20px)',
            background: 'rgba(0,0,0,0.2)',
          }`
          ).q-px-sm
          small.text-white.text-bold {{ node.items.length }} внутри
    //- essence
    div(:style=`{position: 'relative',}`).row.full-width
      router-link(
        :to="'/node/'+node.oid"
        :style=`{
          position: 'relative',
        }`
        ).row.full-width.justify-center.cursor-pointer.q-pa-md
        span(:style=`{fontSize: '18px'}`).text-white.text-bold.shaking.cursor-pointer {{ node.name }}
      q-btn(
        @click="showMore = !showMore"
        round flat color="white"
        :icon="showMore ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        :style=`{
          position: 'absolute', zIndex: 1000, right: '8px', bottom: '8px',
        }`)
    div(
      v-if="showMore"
      :style=`{
        position: 'relative',
        height: $q.screen.width > 600 ? '600px' : $q.screen.width+'px',
        opacity: 0.5,
      }`
      ).row.full-width
  //- footer
  node-actions(:node="node" :isActive="isActive" :isVisible="isVisible")
</template>

<script>

export default {
  name: 'nodeFeed',
  components: {
    compositionPlayer: () => import('components/composition/composition_player/index.vue'),
    nodeActions: () => import('components/node/node_actions.vue')
  },
  props: ['node', 'isActive', 'isVisible'],
  data () {
    return {
      showMore: false,
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>
