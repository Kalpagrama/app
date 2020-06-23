<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: 600+'px',
    }`
    ).row.full-width
    q-tabs(
      :value="storeExplorer.pageId" @input="storeExplorer.pageId = $event"
      dense no-caps color="white"
      active-color="green"
      :style=`{}`
      ).full-width
      q-tab(
        v-for="(p,pi) in storeExplorer.pages" :key="p.id"
        :name="p.id" :label="p.name"
        dense no-caps color="white"
        :style=`{color: 'rgb(180,180,180)'}`)
</template>

<script>
export default {
  name: 'pagesController',
  inject: ['sidExplorer'],
  computed: {
    storeExplorer () {
      return window.stores[this.sidExplorer]
    }
  }
}
</script>
