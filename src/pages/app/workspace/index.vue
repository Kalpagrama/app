<template lang="pug">
div(:style=`{height: 'calc(var(--vh, 1vh) * 100)'}`).row.full-width.bg-grey-4
  div(:style=`{width: '76px'}`).row.full-height.gt-sm
  .col
    nodes(v-if="page === 'nodes'" @click="nodeClick")
    div(v-else).row.fit.q-pa-md
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.fit.items-start.content-start.bg-white.q-pa-sm
        h4 {{ pages[page].name }}
</template>

<script>
import nodes from './nodes'

export default {
  name: 'page_app_workspace',
  components: {nodes},
  data () {
    return {
      page: 'nodes',
      pages: {
        collections: {name: 'Коллекции'},
        nodes: {name: 'Ядра'},
        videos: {name: 'Видео'},
        images: {name: 'Изображения'},
        books: {name: 'Книги'},
        notes: {name: 'Заметки'},
        settings: {name: 'Настройки'}
      }
    }
  },
  computed: {
  },
  methods: {
    nodeClick (n, ni) {
      this.$log('nodeClick', n, ni)
      this.$router.push(`/app/node/${n.oid}`)
    }
  },
  watch: {
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
