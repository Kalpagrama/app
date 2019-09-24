<template lang="pug">
.row.fit
  workspace(@contentClick="contentClick")
    //- template(v-slot:header)
    //-   div(:style=`{height: '70px'}`).row.full-width.items-center.justify-start.q-px-md
    //-     q-btn(round color="primary" :icon="source.icon" @click="$emit('sourcesToggle')")
    //-     .col.full-height
    //-       .row.fit.items-center.justify-start.q-px-sm
    //-         span {{ source.name }}
    template(v-slot:presearch)
      q-btn(round color="primary" :icon="source.icon" @click="$emit('sourcesToggle')").q-ml-sm
        //- q-btn(round flat color="grey-8" icon="more_horiz")
</template>

<script>
import workspace from 'components/workspace'

// TODO: add mode for workspace finder, and editor
export default {
  name: 'contentFinder__sourceWorkspace',
  props: ['source'],
  components: {workspace},
  data () {
    return {
    }
  },
  methods: {
    contentClick (c, ci) {
      this.$log('contentClick', c, ci)
      this.$emit('uploaded', c.oid)
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
