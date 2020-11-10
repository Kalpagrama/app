<template lang="pug">
.row.full-width.items-start.content-start
  div(
    :style=`{
      background: 'rgb(35,35,35)',
      borderRadius: '10px', overflow: 'hidden',
    }`).row.full-width
    //- items wrapper
    .row.full-width
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
    slot(name="name")
    //- essence
    router-link(
      v-if="!$slots.name && showName"
      :to="'/node/'+node.oid"
      :style=`{
        textAlign: 'center',
        height: '60px',
      }`
      ).row.full-width.items-center.content-center.justify-center.cursor-pointer.q-px-md
      span(:style=`{}`).text-white.text-bold.cursor-pointer {{ node.name.slice(0, 20) }}
</template>

<script>

export default {
  name: 'nodeMini',
  components: {
    compositionPlayer: () => import('components/composition/composition_player/index.vue'),
    // nodeActions: () => import('components/node/node_actions.vue')
  },
  // props: ['node', 'isActive', 'isVisible'],
  props: {
    node: {type: Object},
    isActive: {type: Boolean, default: false},
    isVisible: {type: Boolean, default: false},
    showName: {type: Boolean, default: true}
  },
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
