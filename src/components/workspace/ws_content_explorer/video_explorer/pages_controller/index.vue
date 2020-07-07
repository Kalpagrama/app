<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
    }`
    ).row.full-width.items-end.content-end.q-pt-sm
    //- q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
    .col
      .row.fit.justify-center
        q-tabs(
          :value="storeExplorer.pageId" @input="storeExplorer.pageId = $event"
          no-caps color="white"
          dense active-color="green"
          :style=`{
            maxWidth: 600+'px',
          }`
          ).full-width
          q-tab(
            v-for="(p,pi) in storeExplorer.pages" :key="p.id"
            :name="p.id" :label="p.name"
            no-caps color="white"
            :style=`{color: 'rgb(180,180,180)'}`)
    //- q-btn(round flat color="green" icon="check" @click="$emit('close')")
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
