<style lang="sass" scoped>
.page-item
  &:hover
    background: #777 !important
</style>

<template lang="pug">
div(
  :style=`{
    borderRadius: '10px', overflow: 'hidden',
    maxHeight: '70vh'
  }`
  ).column.full-width.bg-grey-9
  //- pages
  router-link(
    v-for="(p,pi) in pages" :key="p.id"
    :to=`{params: {page: p.id}}`
    :class=`{
      'b-100': $route.params.page === p.id
    }`
    :style=`{height: '50px', borderRadius: '10px'}`).row.full-width.items-center.content-center.q-px-md.page-item
    span.text-white {{ p.name }}
  //- //- spheres
  //- div(:style=`{height: '50px'}`).row.full-width.items-center.q-px-md
  //-   span.text-white Related spheres
  //- .col.full-width.scroll
  //-   .row.full-width.q-pa-sm
  //-     sphere-spheres(v-if="user" :oid="user.oid")
</template>

<script>
// created, voted, contents, spheres, people following, followers
export default {
  name: 'userExplorer-menuRight',
  props: ['user'],
  data () {
    return {
      pages: [
        {id: 'created', name: 'Created'},
        {id: 'voted', name: 'Voted'},
        {id: 'followers', name: 'Followers'},
        {id: 'following', name: 'Following'},
        // {id: 'spheres', name: 'Spheres'}
      ]
    }
  }
}
</script>
