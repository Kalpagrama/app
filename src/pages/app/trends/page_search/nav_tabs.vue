<template lang="pug">
.row.full-width.justify-center.b-30
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-px-md
    q-tabs(
      v-model="tabId"
      dense no-caps active-color="green" switch-indicator
      ).full-width.text-grey-8
      q-tab(v-for="t in tabs" :key="t.id" :name="t.id" :label="t.name" dense)
</template>

<script>
export default {
  name: 'navTabs',
  computed: {
    tabs () {
      return [
        {id: 'content', name: 'Медиа', types: ['VIDEO', 'IMAGE', 'BOOK']},
        {id: 'nodes', name: 'Ядра', types: ['NODE']},
        {id: 'joints', name: 'Связи', types: ['JOINT']},
        {id: 'spheres', name: 'Сферы', types: ['WORD', 'SENTENCE']},
        {id: 'users', name: 'Люди', types: ['USER']}
      ]
    },
    tab () {
      return this.tabs.find(t => t.id === this.tabId)
    },
  },
}
</script>
