<template lang="pug">
div(
  :style=`{
    position: 'relative',
    background: 'rgb(35,35,35)',
    borderRadius: '10px',
  }`
  ).row.full-width
  item-player(
    v-if="isOpened"
    :item="node.items[0]"
    :isActive="isOpened"
    :isEditing="isEditing"
    :isOpened="isEditing")
  img(
    v-else
    :src="node.thumbUrl"
    :style=`{
      borderRadius: '10px',
    }`).full-width
  div(
    v-if="isOpened"
    :style=`{
      marginTop: '-20px', paddingTop: '24px',
      borderRadius: '10px',
    }`
    ).row.full-width.bg-black.q-px-xs.q-pb-xs
    //- q-btn(round flat dense color="grey-6" icon="delete_outline")
    .col
    q-btn(round flat dense color="grey-6" icon="edit" @click="isEditing = !isEditing")
  div(:style=`{height: '60px',textAlign: 'center'}`).row.full-width.items-center.content-center.justify-center.q-pa-sm
    span(v-if="isOpened").text-white.text-bold {{ node.name }}
    q-icon(v-else name="filter_tilt_shift" color="white" size="24px")
</template>

<script>
export default {
  name: 'fromWsNode',
  props: ['node', 'isOpened'],
  components: {
    itemPlayer: () => import('components/node_editor/edit_items/item_player.vue')
  },
  data () {
    return {
      isEditing: false,
    }
  }
}
</script>
