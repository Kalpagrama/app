<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
  //- editor dialog
  k-dialog(ref="wsTagEditorDialog" @hide="tag = null")
    ws-tag-editor(:tag="tag" @hide="$refs.wsTagEditorDialog.hide()")
  //- create
  q-btn(icon="add" size="lg" color="primary" round @click="tagCreate()"
    :style=`{position: 'absolute', right: '10px', bottom: '10px', zIndex: 1000}`)
  //- header
  div(:style=`{height: '70px'}`).row.full-width
    //- menu
    div(:style=`{width: '70px', height: '70px'}`).row.items-center.justify-center
      q-btn(round flat color="primary" icon="menu" @click="$emit('menu')")
    //- name
    .col.full-height
      .row.fit.items-center.content-center.justify-center.q-px-sm
        span.text-bold Тэги
    //- search
    div(:style=`{width: '70px', height: '70px'}`).row.items-center.justify-center
      q-btn(round flat color="grey-6" icon="search" @click="$refs.wsFilters.toggle()")
  //- body
  div(ignore-body-scroll-lock).col.scroll.full-width.bg-grey-3
    ws-filters(ref="wsFilters" :items="tags")
      template(v-slot:items="{items}")
        .row.full-width.items-start.content-start.q-pa-sm
          //- tag item
          div(
            v-for="(t, ti) in items" :key="ti" @click="tagClick(t, ti)"
            :style=`{height: '50px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-center.q-mb-sm.bg-white
            //- tag color + icon...
            div(
              :class="[`bg-${t.color}`]"
              :style=`{height: '50px', width: '50px', borderRadius: '10px', overflow: 'hidden'}`)
            //- tag name
            .col
              .row.fit.items-center.content-center.q-px-md
                span.text-bold {{ t.name | cut(50) }}
        div(:style=`{height: '80px'}`).row.full-width
</template>

<script>
import wsFilters from './ws_filters'
import wsTagEditor from './ws_tag_editor'

export default {
  name: 'wsTags',
  components: {wsFilters, wsTagEditor},
  data () {
    return {
      tag: null,
      filtersHeight: 0
    }
  },
  computed: {
    tags () {
      return this.$store.state.workspace.workspace.tags
    }
  },
  methods: {
    async tagClick (t, ti) {
      this.$log('tagClick', t, ti)
      this.$set(this, 'tag', t)
      this.$nextTick(() => {
        this.$refs.wsTagEditorDialog.show()
      })
    },
    tagCreate () {
      this.$log('tagCreate')
      this.$refs.wsTagEditorDialog.show()
    },
    search () {
      this.$log('search')
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
