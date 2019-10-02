<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
  //- actions
  q-btn(
    v-if="false"
    round color="primary" size="lg" icon="add" @click="contentCreate()"
    :style=`{position: 'absolute', right: '10px', bottom: '10px'}`)
  //- dialogs
  k-dialog(ref="wsContentEditorDialog" @hide="content = null")
    ws-content-editor(type="update" :content="content" @hide="$refs.wsContentEditorDialog.hide()")
  //- header
  div(:style=`{minHeight: '70px'}`).row.full-width.items-center
    //- menu
    div(:style=`{width: '70px'}`).row.full-height.items-center.content-center.justify-center
      q-btn(icon="menu" round flat color="primary" @click="$emit('menu')").q-mx-sm
    //- name
    .col.full-height
      .row.fit.items-center.content-center.justify-center.q-px-sm
        span.text-bold.text-black Контент
    //- search
    div(:style=`{width: '70px'}`).row.full-height.items-center.content-center.justify-center
      q-btn(round flat color="grey-6" icon="search" @click="$refs.wsFilters.toggle()")
    //- filters
  //- body
  div(body-scroll-lock-ignore).col.scroll.full-width.bg-grey-3
    ws-filters(ref="wsFilters" :items="contents")
      template(#items=`{items}`)
        div(:style=`{paddingBottom: '80px'}`).row.full-width.items-start.content-start.q-px-sm.q-pt-sm
          ws-content-item(v-for="(c, ci) in items" :key="c.uid" :item="c" @clicked="contentClick")
</template>

<script>
import wsContentItem from './ws_content_item'
// import wsContentEditor from './ws_content_editor'
import wsFilters from './ws_filters'

export default {
  name: 'wsContents',
  components: {wsContentItem, wsFilters},
  data () {
    return {
      content: null
    }
  },
  computed: {
    contents () {
      return this.$store.getters['workspace/contents']
    }
  },
  methods: {
    async contentCreate () {
      this.$log('contentCreate')
      this.$refs.wsContentEditorDialog.show()
    },
    async contentClick (c, ci) {
      this.$log('contentClick', c, ci)
      this.$set(this, 'content', c)
      this.$nextTick(() => {
        this.$refs.wsContentEditorDialog.show()
      })
      // this.$set(this, 'content', c)
      // let content = {oid: c.content.oid, ...c}
      // this.$refs.contentUpdateDialog.show()
      // this.$emit('contentClick', content)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
