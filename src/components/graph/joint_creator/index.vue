<template lang="pug">
  .row.full-width.full-height.justify-center
    div(:style=`{borderStyle: 'solid'}`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import jointsRow from 'src/pages/app/cube/joints_row/index.vue'
import jointItem from 'src/pages/app/cube/joints_row/joint_item.vue'
import jointCreator from 'src/pages/app/cube/joint_creator/index.vue'

export default {
  name: 'graph_jointCreator',
  components: {
    jointsRow,
    jointItem,
    jointCreator,
  },
  data () {
    return {
    }
  },
  props: {
    leftItem: {
      type: Object,
      required: true,
    },
    rightItem: {
      type: Object,
      required: false,
    },
    vertices: {
      type: Array,
      required: false,
    },
    name: {
      type: String,
      required: false,
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
