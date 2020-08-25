<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(
        :style=`{maxWidth: '800px', height: '50px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.q-px-md.b-30
        span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ contentWorkspaceName }}
  q-page-container
    q-page
      .row.full-width.justify-center
        div(:style=`{maxWidth: '800px',}`).row.full-width.items-start.content-start
          img(
            :src="contentKalpa.url"
            draggable="false"
            :style=`{
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).row.full-width
      //- footer: page control
      q-page-sticky(expand position="bottom")
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: '800px', height: '50px',}`
            ).row.full-width.items-center.content-center.b-30
            q-btn(
              @click="$emit('back')"
              round flat color="white" icon="keyboard_arrow_left").q-ml-xs
            .col.full-height
              q-tabs(v-model="pageId" no-caps active-color="white").fit.text-grey-6
                q-tab(name="details" label="Details")
                q-tab(name="drafts" label="Drafts")
                q-tab(name="nodes" label="Nodes")
</template>

<script>
export default {
  name: 'wsExplorerImage',
  props: ['contentKalpa', 'contentWorkspace'],
  data () {
    return {
      pageId: 'details',
    }
  },
  computed: {
    contentWorkspaceName () {
      return this.contentWorkspace.name
    }
  }
}
</script>
