<template lang="pug">
.column.full-width
  .row.full-width
    slot(name="header")
  .col.full-width.scroll
    kalpa-loader(
      :immediate="true"
      :query="spheresQuery" :limit="1000" v-slot=`{items}`)
      .row.full-width.items-start.content-start
        q-btn(
          v-for="(sphere,ii) in items" :key="sphere.id"
          v-if="!selected.includes(sphere.id)"
          @click="sphereClick(sphere)"
          flat color="white" dense no-caps
          ).full-width
          span.text-white {{ sphere.name }}
  .row.full-width
    slot(name="footer")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'sphereAutocomplete',
  props: {
    searchString: {
      type: String,
      default: ''
    },
    selected: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
    }
  },
  computed: {
    spheresQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_SPHERE}}
      // add name filter...
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    }
  },
  methods: {
    sphereClick (sphere) {
      this.$log('sphereClick', sphere)
      this.$emit('sphere', sphere)
    }
  }
}
</script>
