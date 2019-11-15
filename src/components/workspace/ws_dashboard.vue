<template lang="pug">
.row.full-width.items-start.content-start.q-px-sm.q-pt-sm
  div(:style=`{height: '60px', borderRadius: '10px'}` @click="$emit('page', 'bookmarks')").row.full-width.items-center.justify-center.bg-white.q-mb-sm.q-px-md
    span Заметки
    .col
    span {{ $store.state.workspace.workspace.bookmarks.length }}
  div(:style=`{height: '60px', borderRadius: '10px'}` @click="$emit('page', 'contents')").row.full-width.items-center.justify-center.bg-white.q-mb-sm.q-px-md
    span Контент
    .col
    span {{ $store.state.workspace.workspace.contents.length }}
  div(:style=`{height: '60px', borderRadius: '10px'}` @click="$emit('page', 'fragments')").row.full-width.items-center.justify-center.bg-white.q-mb-sm.q-px-md
    span Фрагменты
    .col
    span {{ $store.state.workspace.workspace.fragments.length }}
  div(:style=`{height: '60px', borderRadius: '10px'}` @click="$emit('page', 'drafts')").row.full-width.items-center.justify-center.bg-white.q-mb-sm.q-px-md
    span Ядра
    .col
    span {{ $store.state.workspace.workspace.nodes.length }}
  div(:style=`{height: '60px', borderRadius: '10px'}` @click="$emit('page', 'tags')").row.full-width.items-center.justify-center.bg-white.q-mb-sm.q-px-md
    span Сферы
    .col
    span {{ $store.state.workspace.workspace.spheres.length }}
</template>

<script>
export default {
  name: 'workspace__dashboard',
  components: {},
  data () {
    return {
    }
  },
  computed: {
    types () {
      return this.$store.state.workspace.types
    }
  }
}
</script>
