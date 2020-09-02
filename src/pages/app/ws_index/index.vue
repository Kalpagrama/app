<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    q-page(:style=`{paddingTop: '0px',}`)
      router-view
        template(v-slot:header)
          .row.full-width.items-center.content-center.q-px-sm
            //- q-btn(
              v-if="$q.screen.width > 960"
              round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
            //- q-icon(name="school" size="30px" color="white")
            .col
              .row.fit.items-center.content-center.justify-start.q-py-sm
                router-link(
                  :to=`{name: p.id}`
                  v-for="p in pages" :key="p.id"
                  :class=`{
                    'text-bold': $route.name.includes(p.id),
                    'text-grey-8': !$route.name.includes(p.id),
                    'text-white': $route.name.includes(p.id),
                  }`
                  :style=`{
                    fontSize: '18px'
                  }`).text-bold.q-pa-md {{ p.name }}
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
      ]
    },
  }
}
</script>
