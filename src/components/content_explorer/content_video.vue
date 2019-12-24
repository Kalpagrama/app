<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  //- toggle nodes
  //- q-btn(
  //-   color="accent" no-caps @click="$refs.kTongue.show()"
  //-   :style=`{position: 'fixed', zIndex: 1000, top: '10px', left: '10px', height: '60px', width: 'calc(100% - 20px)', borderRadius: '10px'}`)
  //-   span 23 Nodes to explore
  //- video-editor(:inCreator="false" :fragmentInput="{content: content, relativePoints: []}")
  //- video nodes
  //- k-tongue(ref="kTongue")
  //-   template(v-slot:header)
  //-     div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-md.bg-white
  //-       span Explore nodes
  //-   template(v-slot:body)
  //-     .row.full-width.full-height.items-start.content-start.bg-white
  //-       node-loader(ref="nodeLoader" mode="feed" :variables="variables")
  //-         template(v-slot:items=`{items, fetchingMore}`)
  //-           node-feed(:nodes="items" :fetchingMore="fetchingMore" @more="$refs.nodeLoader.fetchMore()")
</template>

<script>
export default {
  name: 'contentExplorer__contentVideo',
  components: {},
  props: {
    content: {type: Object},
    inEditor: {type: Boolean, default () { return false }}
  },
  data () {
    return {
      variables: {
        oid: this.content.oid
      }
    }
  },
  computed: {
  },
  watch: {
    content: {
      immediate: true,
      async handler (to, from) {
        this.$logD('content CHANGED', to)
      }
    }
  },
  methods: {
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
