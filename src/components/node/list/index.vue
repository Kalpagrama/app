<template lang="pug">
.row.full-width
  //- header mode changer... filter...
  div(:style=`{height: '50px'}`).row.full-width.items-center.content-center
  component(:is="`node-list-${mode}`")
</template>

<script>
import nodeListName from 'components/node/list_name'
import nodeListMiddle from 'components/node/list_middle'
import nodeListByte from 'components/node/list_byte'

export default {
  name: 'nodeList',
  components: {nodeListName, nodeListMiddle, nodeListByte},
  props: {
    mode: {type: String, default () { return 'name' }},
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
