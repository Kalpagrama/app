<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).column.full-width
  //- header
  div(
    :style=`{
      borderRadius: $q.screen.xs ? '0 0 10px 10px' : '10px',
      overflow: 'hidden',
    }`
    ).row.full-width.items-start.content-start.b-50.q-pb-sm.q-mb-sm
    div(
      v-if="showHeader").row.full-width.items-center.content-center.q-pa-md
      q-btn(round flat color="white" icon="keyboard_arrow_left").q-mr-sm
      span(:style=`{fontSize: '20px'}`).text-white.text-bold Spheres
    //- header: search
    div(
      v-if="showSearch"
      ).row.full-width.q-px-sm
      q-input(
        v-model="searchString"
        filled dense dark color="white"
        label="Find or create sphere"
        @keyup.enter="searchStringEnter()").full-width
        template(v-slot:append)
          q-btn(v-if="searchString.length > 0" flat round dense icon="clear" color="white" @click="searchString = ''")
  //- body
  .col.full-width.scroll
    kalpa-loader(type="WS_SPHERE" :variables="variables")
      template(v-slot=`{items}`)
        .row.full-width.items-start.content-start.q-px-sm
          slot(name="items" :searchString="searchString" :items="items")
          div(v-if="items.length === 0").row.full-width.items-center.contetn.center.q-pa-md
            span.text-white.q-mr-sm Create sphere
            q-btn(color="green" no-caps @click="sphereCreate()") {{ searchString }}
          div(v-if="showItems && items.length > 0").row.full-width.q-py-sm
            ws-sphere(
              v-for="(s, si) in items" :key="s.id"
              @sphereClick="searchString = '', $emit('sphereClick', s)"
              :sphere="s" :sphereIndex="si").q-mr-sm.q-mb-sm
</template>

<script>
export default {
  name: 'wsSphereList',
  props: {
    showHeader: {
      type: Boolean,
      default () {
        return true
      }
    },
    showSearch: {
      type: Boolean,
      default () {
        return true
      }
    },
    showItems: {
      type: Boolean,
      default () {
        return true
      }
    },
    spheres: {
      type: Array
    }
  },
  data () {
    return {
      searchString: ''
    }
  },
  computed: {
    variables () {
      let res = {selector: {}}
      // selector: name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      // selector: props, import selector from props...
      return res
    }
  },
  watch: {
    searchString: {
      handler (to, from) {
        this.$log('searchString CHANGED', to)
        if (to.length === 0) this.$emit('searchEnded')
        if (to.length > 0 && from.length === 0) this.$emit('searchStarted')
      }
    }
  },
  methods: {
    async sphereCreate () {
      this.$log('sphereCreate')
      if (this.searchString.length === 0) return
      let sphereInput = {
        wsItemType: 'WS_SPHERE',
        name: this.searchString,
        color: ''
      }
      let res = await this.$rxdb.upsertItem(sphereInput)
      // let sphereColor = this.$randomColor(res.id)
      if (res.color.length === 0) res.color = this.$randomColor(res.id)
      this.$log('res', res)
      this.$emit('created', res)
      this.searchString = ''
    },
    searchStringEnter () {
      this.$log('searchStringEnter')
      this.sphereCreate()
    }
  }
}
</script>
