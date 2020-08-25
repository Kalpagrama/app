<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    q-page
      router-view
      q-page-sticky(
        v-if="!$route.params.id"
        expand position="bottom")
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: '800px', height: '50px', paddingLeft: '50px', paddingRight: '50px',}`).row.full-width
            q-tabs(
              :value="$route.name" @input="$router.push({name: $event})"
              no-caps dense active-color="white").fit.text-grey-8
              q-tab(v-for="p in pages" :key="p.id" :name="p.id" :label="p.name")
</template>

<script>
export default {
  name: 'wsIndex',
  computed: {
    pages () {
      return [
        {id: 'content-list', path: 'contents', name: this.$t('pageWs_content', 'Контент')},
        {id: 'node-list', path: 'nodes', name: this.$t('pageWs_nodes', 'Ядра')},
        // {id: 'chain-list', path: 'chains', name: this.$t('pageWs_chains', 'Цепочки')},
        // {id: 'sphere-list', path: 'spheres', name: this.$t('pageWs_spheres', 'Сферы')},
        {id: 'ws-settings', path: 'settings', name: this.$t('pageWs_settings', 'Настройки')}
      ]
    },
  }
}
</script>
