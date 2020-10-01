<template lang="pug">
.row.full-width
  div(
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
      background: 'rgb(35,35,35)',
    }`
    ).row.full-width.q-pa-sm
    .row.full-width.items-end.content-end
      .col-6.q-pr-xs
        link-item(:item="link.leftItem")
      .col-6.q-pl-xs
        link-item(:item="link.rightItem")
    //- name
    div(
      v-if="link.jointType !== 'ASSOCIATIVE'"
      ).row.full-width.justify-center.q-pa-sm
      span().text-white.text-bold {{ link.name }}
  //- actions
  .row.full-width.justify-center
    span.text-white actions
</template>

<script>
export default {
  name: 'linkFeed',
  props: ['link'],
  components: {
    linkItem: () => import('./link_item.vue'),
  },
  data () {
    return {
    }
  }
}
</script>
