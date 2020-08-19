<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      height: '58px',
    }`
    ).row.full-width.items-center.content-center.q-px-sm
    q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
    .col.full-height
      .row.fit.items-end.content-end.justify-center
        q-tabs(
          :value="storeExplorer.pageId" @input="storeExplorer.pageId = $event"
          no-caps color="white"
          dense active-color="white"
          :style=`{
            maxWidth: 600+'px',
          }`
          ).fit.text-grey-4
          q-tab(
            v-for="(p,pi) in storeExplorer.pages" :key="p.id"
            :name="p.id" :label="p.name"
            no-caps color="white"
            :style=`{color: 'rgb(180,180,180)'}`).full-height
    q-btn(
      round flat color="white" icon="menu" @click="$emit('close')"
      :style=`{opacity: 0}`)
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
