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
      //- q-page-sticky(
        v-if="!$route.params.id"
        expand position="bottom").row.full-width.justify-center.b-30
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
        {id: 'workspace.contents', name: this.$t('pageWs_content', 'Контент')},
        {id: 'workspace.nodes', name: this.$t('pageWs_nodes', 'Ядра')},
        {id: 'workspace.spheres', name: this.$t('pageWs_spheres', 'Сферы')},
        // {id: 'chain-list', path: 'chains', name: this.$t('pageWs_chains', 'Цепочки')},
        // {id: 'ws-settings', path: 'settings', name: this.$t('pageWs_settings', 'Настройки')}
      ]
    },
  }
}
</script>
