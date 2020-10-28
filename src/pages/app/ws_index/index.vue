<template lang="pug">
router-view()
  template(v-slot:header)
    .row.full-width
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
      .row.full-width.justify-center.q-px-md
        q-tabs(
          :value="$route.name" @input="$router.push({name: $event})"
          no-caps active-color="green" align="left"
          stretch :breakpoint="100" inline-label
          :switch-indicator="true").full-width.text-grey-8
          q-tab(
            v-for="t in pages" :key="t.id"
            inline-label
            :to="t.id" :name="t.id" :label="t.name" :icon="t.icon").q-px-sm
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
        {id: 'workspace.nodes', path: '/workspace/nodes/drafts', name: this.$t('pageWs_nodes', 'Ядра'), icon: 'filter_tilt_shift'},
        {id: 'workspace.joints', path: '/workspace/joints', name: this.$t('pageWs_joints', 'Связи'), icon: 'link'},
        // {id: 'workspace.spheres', path: '/workspace/spheres', name: this.$t('pageWs_spheres', 'Сферы'), icon: 'blur_on'},
        {id: 'workspace.trash', path: '/workspace/trash', name: this.$t('pageWs_trash', 'Корзина'), icon: 'delete_outline'}
      ]
    },
  }
}
</script>
