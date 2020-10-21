<template lang="pug">
.row.full-width
  node-mini(
    v-if="item.type === 'NODE'"
    :isActive="isActive" :isVisible="isVisible"
    :node="item"
    :marginBottom="80")
  //- user
  //- sphere
  div(
    v-if="item.type === 'WORD'"
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
      marginTop: '50px',
      marginBottom: '30px',
    }`
    ).row.full-width.q-pa-sm.b-40
    span.text-white.q-ml-sm {{ item.name }}
  //- content
  div(
    v-if="item && ['VIDEO', 'IMAGE'].includes(item.type)"
    @click="$router.push(`/content/${item.oid}`)"
    :style=`{
      background: 'rgb(35,35,35)',
      borderRadius: '10px',
    }`
    ).row.full-width.items-start.content-start.cursor-pointer
    img(
      draggable="false"
      :src="item.thumbUrl"
      :style=`{
        borderRadius: '10px',
      }`
      ).full-width
    div(
      :style=`{
        height: '60px',
      }`
      ).row.full-width
      div(:style=`{width: '60px',}`).row.full-height.items-center.content-center.justify-center
        q-icon(name="select_all" color="white" size="20px")
      .col
        .row.fit.items-center.content-center
          span.text-white {{ item.name }}
  //- content,ws, bookmarkws
  .row.full-width
    slot(name="footer")
</template>

<script>
export default {
  name: 'jointItem',
  props: ['item', 'isActive', 'isVisible'],
}
</script>
