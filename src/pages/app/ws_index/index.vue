<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    q-page(:style=`{paddingTop: '0px',}`)
      div(
        v-if="$store.state.ui.showDesktopNavigation"
        ).row.full-width.justify-center.q-pt-sm.q-mb-sm
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-between.content-between.q-px-sm
          div(
            :style=`{
              height: '60px',
              borderRadius: '10px', overflow: 'hidden',
            }`).row.full-width.items-center.content-center.q-px-sm.b-40
            q-btn(
              v-if="$q.screen.width > $store.state.ui.pageMaxWidth+140"
              @click="$router.back()"
              round flat color="white" icon="keyboard_arrow_left")
            q-icon(name="school" size="30px" color="white").q-mr-md.q-ml-sm
            .col
              span(:style=`{fontSize: '1.1rem'}`).text-white.text-bold Мастерская
            //- q-btn(round flat color="grey-6" icon="more_vert")
          .row.full-width.q-pt-xs
            q-btn(
              :to="p.path"
              v-for="p in pages" :key="p.id"
              flat no-caps
              :color="$route.name === p.id ? 'green' : 'grey-7'")
              q-icon(:name="p.icon" size="22px").q-mr-xs
              span(
                :style=`{
                  fontSize: '16px'
                }`
                ).text-bold {{ p.name }}
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
        {id: 'workspace.feeds', path: '/workspace/feeds', name: 'Коллекции', icon: 'view_week'},
        // {id: 'workspace.contents', path: '/workspace/contents/video', name: this.$t('pageWs_content', 'Контент'), icon: 'select_all'},
        {id: 'workspace.nodes', path: '/workspace/nodes/drafts', name: this.$t('pageWs_nodes', 'Ядра'), icon: 'filter_tilt_shift'},
        {id: 'workspace.joints', path: '/workspace/joints', name: this.$t('pageWs_joints', 'Связи'), icon: 'link'},
        // {id: 'workspace.spheres', path: '/workspace/spheres', name: this.$t('pageWs_spheres', 'Сферы'), icon: 'blur_on'},
        // {id: 'workspace.trash', path: '/workspace/trash', name: '', icon: 'delete_outline'}
      ]
    },
  }
}
</script>
