<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  q-header()
    .row.full-width.justify-center
      div(
        :style=`{
          height: '60px',
        }`
        ).row.full-width.items-center.content-center.q-pa-sm
        q-btn(round flat color="white" icon="west" @click="$routerKalpa.back()")
        .col
          .row.fit.items-center.content-center.justify-center.q-pa-sm
            span(:style=`{fontSize: '18px',}`).text-white.text-bold Creating
        q-btn(round flat color="white" icon="more_vert")
  q-page-container
    q-page
      component(
        :is="'view-'+pageId")
      q-page-sticky(
        expand position="bottom"
        :offset=`[0,80]`
        :style=`{zIndex: 1000,}`
        ).row.full-width.justify-center
        q-btn-group(
          flat no-caps
          :style=`{
            borderRadius: '10px',
          }`).b-40
          q-btn(
            @click="pageId = p.id"
            v-for="(p,pi) in pages" :key="p.id"
            flat no-caps
            :color="pageId === p.id ? 'green' : 'grey-6'")
            span {{ p.name }}
</template>

<script>
export default {
  name: 'workspace_pageCreate',
  components: {
    viewUpload: () => import('./view_upload/index.vue'),
    viewWrite: () => import('./view_write/index.vue'),
    viewStream: () => import('./view_stream/index.vue'),
  },
  data () {
    return {
      pageId: 'upload',
    }
  },
  computed: {
    pages () {
      return [
        {id: 'upload', name: 'Upload'},
        {id: 'write', name: 'Write'},
        {id: 'stream', name: 'Stream'},
      ]
    }
  }
}
</script>
