<style lang="sass" scoped>
.menu-item
  &:hover
    background: rgb(70,70,70) !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'
  }`
  ).column.full-width.q-pt-sm
  div(:style=`{height: '100px'}`).row.full-width.items-center.content-center.q-px-md
    span(:style=`{fontSize: '16px', userSelect: 'none'}`).text-white.text-bold {{$t('Мастерская')}}
  .col.full-width.scroll
    .row.full-width.items-start
      router-link(
        :to="{name: p.id}"
        v-for="(p,pi) in storeWorkspace.pages" :key="pi"
        :class=`{
            'b-70': $route.name === p.id,
          }`
        :style=`{
          height: '50px',
          borderRadius: $store.state.ui.borderRadius+'px',
          overflow: 'hidden'
        }`
        ).row.full-width.items-center.content-center.menu-item.q-px-md
        span(
          :style=`{
            fontSize: '16px',
            userSelect: 'none'
          }`
          ).text-white {{ $t(p.name) }}
</template>

<script>
export default {
  name: 'workspace-menuRight',
  inject: ['sidWorkspace'],
  computed: {
    storeWorkspace () {
      return window.stores[this.sidWorkspace]
    }
  }
}
</script>
