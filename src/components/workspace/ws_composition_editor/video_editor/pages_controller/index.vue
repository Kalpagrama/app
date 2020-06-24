<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: 600+'px',
    }`
    ).row.full-width
    q-btn(round flat dense color="white" icon="keyboard_arrow_left" @click="$emit('close')")
    .col
      q-tabs(
        :value="storeEditor.pageId" @input="storeEditor.pageId = $event"
        dense no-caps color="white"
        active-color="green"
        :style=`{}`
        ).full-width
        q-tab(
          v-for="(p,pi) in storeEditor.pages" :key="p.id"
          :name="p.id" :label="p.name"
          dense no-caps color="white"
          :style=`{color: 'rgb(180,180,180)'}`)
    q-btn(round flat dense color="green" icon="check" @click="$emit('close')")
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
