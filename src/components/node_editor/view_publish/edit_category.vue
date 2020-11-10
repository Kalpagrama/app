<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width
  q-resize-observer(@resize="width = $event.width")
  q-btn(
    no-caps flat color="grey-5" align="between"
    icon-right="keyboard_arrow_down"
    :style=`{position: 'relative', height: '40px'}`
    ).full-width.q-px-sm.b-50 {{ category(node.category) ? category(node.category).label : 'Выбери категорию' }}
    q-popup-proxy(
      fit dark
      position="bottom")
      div(
        :style=`{
          maxWidth: $q.screen.width < 800 ? $q.screen.width+'px' : width+'px',
          borderRadius: '10px',overflow: 'hidden',}`
        ).row.full-width.items-start.content-start.b-40
        //- header
        div(
          v-if="$q.screen.width < 800"
          :style=`{
            height: '60px',
          }`
          ).row.full-width.items-center
          span(:style=`{fontSize: '18px'}`).text-white.text-bold.q-ml-md Выберите категорию
          .col
          q-btn(round flat color="white" icon="clear" v-close-popup).q-mr-sm
        q-btn(
          v-for="n in categories" :key="n.value" v-close-popup
          @click="node.category = n.value"
          flat color="grey-5" no-caps
          ).full-width {{ n.label }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'editCategory',
  props: ['node'],
  data () {
    return {
      width: 0,
      nodeCategories: [],
    }
  },
  computed: {
    categories () {
      return this.nodeCategories.reduce((acc, val) => {
        if (val.type !== 'ALL') {
          acc.push({
            value: val.type,
            // label: val.alias // val.sphere.name.charAt(0).toUpperCase() + val.sphere.name.slice(1)
            label: val.alias.charAt(0).toUpperCase() + val.alias.slice(1),
          })
        }
        return acc
      }, [])
    }
  },
  methods: {
    category (val) {
      return this.categories.find(c => c.value === val)
    },
    categorySelected (val) {
      this.$log('categorySelected', val)
      this.node.category = val.value
    }
  },
  async beforeCreate () {
    this.$log('beforeCreate')
    this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories')
  }
}
</script>
