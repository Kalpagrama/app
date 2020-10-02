<template lang="pug">
.row.full-width.items-start.content-start
  div(
    :style=`{
      background: 'rgb(35,35,35)',
      borderRadius: '10px', overflow: 'hidden',
    }`).row.full-width
    //- header: author, createdAt
    //- .row.full-width.items-center.content-center.q-pa-sm
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
        v-if="['SLIDER', 'HORIZONTAL', 'PIP', 'VERTICAL'].includes(node.layout)"
        :style=`{
          position: 'relative',
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.full-width.items-start.content-start
        composition-player(
          :composition="node.items[0]" :isVisible="isVisible" :isActive="isActive"
          :options=`{height: 'auto', objectFit: 'contain', loop: true}`)
    //- essence
    router-link(
      :to="'/node/'+node.oid"
      ).row.full-width.justify-center.cursor-pointer.q-pa-md
      span(:style=`{fontSize: '1rem'}`).text-white.text-bold.shaking.cursor-pointer {{ node.name }}
  //- footer
  //- node-actions(:node="node" :isActive="isActive" :isVisible="isVisible")
</template>

<script>

export default {
  name: 'nodeMini',
  components: {
    compositionPlayer: () => import('components/composition/composition_player/index.vue'),
    // nodeActions: () => import('components/node/node_actions.vue')
  },
  props: ['node', 'isActive', 'isVisible'],
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>
