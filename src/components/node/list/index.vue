<template lang="pug">
.row.fit
  //- header mode changer... filter...
  //- div(:style=`{height: '50px'}`).row.full-width.items-center.content-center
  component(:is="`node-list-${mode}`" :nodes="nodes")
    template(v-slot:header)
      slot(name="header")
</template>

<script>
// import nodeListName from 'components/node/list_name'
import nodeListMiddle from 'components/node/list_middle'
import nodeListByte from 'components/node/list_byte'

export default {
  name: 'nodeList',
  components: {nodeListMiddle, nodeListByte},
  props: {
    mode: {type: String, default () { return 'middle' }},
    nodes: {type: Array},
    options: {type: Object}
  },
  data () {
    return {
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
