<template lang="pug">
div(
  :style=`{
    borderRadius: '10px', overflow: 'hidden',
    maxHeight: '70vh'
  }`
  ).column.fit.bg-grey-9
  //- pages
  router-link(
    v-for="(p,pi) in pages" :key="p.id"
    :to=`{params: {page: p.id}}`
    :class=`{
      'bg-grey-7': $route.params.page === p.id
    }`
    :style=`{height: '40px'}`).row.full-width.items-center.content-center.q-px-md.page-item
    span.text-white {{ p.name }}
  //- spheres
  div(:style=`{height: '50px'}`).row.full-width.items-center.q-px-md
    span.text-white Related spheres
  .col.full-width.scroll
    .row.full-width.q-pa-sm
      sphere-spheres(v-if="user" :oid="user.oid")
</template>

<script>
export default {
  name: 'userExplorer-menuRight',
  props: ['user'],
  data () {
    return {
    }
  }
}
</script>
