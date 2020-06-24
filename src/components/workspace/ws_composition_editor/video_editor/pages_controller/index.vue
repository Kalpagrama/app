<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
    }`
    ).row.full-width.q-pt-sm
    q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
    .col
      .row.fit.justify-center
        q-tabs(
          :value="storeEditor.pageId" @input="storeEditor.pageId = $event"
          dense no-caps color="white"
          active-color="green"
          :style=`{
            maxWidth: 600+'px',
          }`
          ).full-width
          q-tab(
            v-for="(p,pi) in storeEditor.pages" :key="p.id"
            :name="p.id" :label="p.name"
            dense no-caps color="white"
            :style=`{color: 'rgb(180,180,180)'}`)
    q-btn(round flat color="green" icon="check" @click="$emit('close')")
</template>

<script>
export default {
  name: 'pagesController',
  inject: ['sidEditor'],
  computed: {
    storeEditor () {
      return window.stores[this.sidEditor]
    }
  }
}
</script>
