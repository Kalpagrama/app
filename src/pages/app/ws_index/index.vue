<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    q-page(:style=`{paddingTop: '0px',}`)
      router-view
        template(v-slot:header)
          .row.full-width.items-center.content-center.q-pa-sm
            //- q-btn(
              v-if="$q.screen.width > 960"
              round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
            .col
              .row.fit.items-center.content-center.q-pl-md
                router-link(
                  :to=`{name: p.id}`
                  v-for="p in pages" :key="p.id"
                  :class=`{
                    'text-bold': p.id === $route.name,
                    'text-grey-8': p.id !== $route.name,
                    'text-white': p.id === $route.name,
                  }`
                  :style=`{
                    fontSize: '18px'
                  }`).text-bold.q-mr-md {{ p.name }}
</template>

<script>
export default {
  name: 'pageApp_wsIndex',
  computed: {
    pages () {
      return [
        {id: 'workspace.contents', name: this.$t('pageWs_content', 'Контент')},
        {id: 'workspace.nodes', name: this.$t('pageWs_nodes', 'Ядра')},
        {id: 'workspace.spheres', name: this.$t('pageWs_spheres', 'Сферы')},
        // {id: 'workspace.boards', name: this.$t('pageWs_boards', 'Доски')}
        // {id: 'chain-list', path: 'chains', name: this.$t('pageWs_chains', 'Цепочки')},
        // {id: 'ws-settings', path: 'settings', name: this.$t('pageWs_settings', 'Настройки')}
      ]
    },
  }
}
</script>
