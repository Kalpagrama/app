<template lang="pug">
.row.full-width.justify-center
  q-select(
    v-if="nodeCategories.length > 0"
    borderless dark color="white" dense
    option-value="value"
    option-label="label"
    stack-label
    label="Тематика"
    dropdown-icon="keyboard_arrow_down"
    behavior="menu" fit cover
    menu-anchor="top middle"
    menu-self="top middle"
    :value="node.category"
    :display-value="nodeCategories.find(c => c.type === node.category).alias"
    @input="categoryChanged"
    :options="options"
    :style=`{
      maxWidth: '200px',
      //- borderRadius: '10px', overflow: 'hidden',
      //- minWidth: '300px', zIndex: 2000, transform: 'translate3d(0,0,0)',
    }`).full-width
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'categotyEditor',
  props: ['node'],
  data () {
    return {
      nodeCategories: [],
    }
  },
  computed: {
    options () {
      // return this.nodeCategories
      return this.nodeCategories.reduce((acc, val) => {
        if (val.type !== 'ALL') {
          acc.push({
            value: val.type,
            label: val.alias.charAt(0).toUpperCase() + val.alias.slice(1),
          })
        }
        return acc
      }, [])
    }
  },
  methods: {
    categoryChanged (val) {
      this.$log('categoryChanged', val)
      this.node.category = val.value
    }
  },
  async mounted () {
    this.$log('mounted')
    this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories')
  }
}
</script>
