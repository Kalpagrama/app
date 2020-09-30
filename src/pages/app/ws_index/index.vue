<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    q-page(:style=`{paddingTop: '0px',}`)
      div(
        v-if="$store.state.ui.showDesktopNavigation"
        ).row.full-width.justify-center.q-pt-sm.q-mb-sm
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-between.content-between
          //- q-btn(round flat color="white" icon="keyboard_arrow_left")
          .col.q-px-sm
            div(:style=`{height: '60px', borderRadius: '10px',}`).row.full-width.items-center.content-center.b-40
              q-icon(name="school" size="30px" color="white").q-mx-md
              span(:style=`{fontSize: '18px'}`).text-white.text-bold Мастерская
              .col
              q-btn(
                v-if="$q.screen.width < 600"
                flat color="white" no-caps icon-right="keyboard_arrow_down")
                span(:style=`{fontSize: '18px'}`).text-bold {{ page ? page.name : '' }}
                q-menu
                  div(:style=`{maxWidth: '160px'}`).row.b-40
                    q-btn(
                      @click="$router.push({name: p.id})"
                      v-for="p in pages" :key="p.id"
                      flat color="white" no-caps
                      align="right"
                      ).full-width.q-my-sm.q-pr-lg
                      span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ p.name }}
              div(v-if="$q.screen.width >= 600").row.full-height.items-center.content-center
                router-link(
                  :to="p.path"
                  v-for="p in pages" :key="p.id"
                  :class=`{
                  }`
                  :style=`{
                    fontSize: '18px'
                  }`).text-bold.text-white.q-mr-md {{ p.name }}
      router-view
</template>

<script>
export default {
  name: 'pageApp_wsIndex',
  computed: {
    page () {
      return this.pages.find(p => p.id === this.$route.name)
    },
    pages () {
      return [
        {id: 'workspace.contents', path: '/workspace/contents/video', name: this.$t('pageWs_content', 'Контент')},
        {id: 'workspace.nodes', path: '/workspace/nodes/drafts', name: this.$t('pageWs_nodes', 'Ядра')},
        {id: 'workspace.spheres', path: '/workspace/spheres', name: this.$t('pageWs_spheres', 'Сферы')},
      ]
    },
  }
}
</script>
