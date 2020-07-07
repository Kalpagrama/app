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
    ).row.full-width.items-start.content-start.b-50.q-px-sm.q-pb-sm.q-mb-sm
    slot(name="header")
    //- navigation
    div(
      v-if="!$slots.header").row.full-width.items-center.content-center.q-py-md
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '20px'}`).text-white.text-bold {{$t('Spheres', 'Сферы')}}
    //- search
    div(
      v-if="showSearch"
      ).row.full-width
      q-input(
        v-model="searchString"
        filled dense dark color="grey-6"
        :label="$t('Find or create sphere', 'Найди или создай сферу')"
        @focus="searchStringFocused"
        @blur="searchStringBlurred"
        @keyup.enter="searchStringEnter()").full-width
        template(v-slot:append)
          q-btn(v-if="searchString.length > 0" flat round dense icon="clear" color="white" @click="searchString = ''")
  //- body
  .col.full-width.scroll
    kalpa-loader(:mangoQuery="mangoQuery")
      template(v-slot=`{items}`)
        .row.full-width.items-start.content-start.q-px-sm
          slot(name="items" :searchString="searchString" :items="items")
          div(v-if="items.length === 0").row.full-width.items-center.content-center.justify-center.q-pa-md
            //- span.text-white.q-mr-sm Create sphere
            q-btn(
              v-if="searchString.length > 0"
              color="green" push no-caps @click="sphereCreate()"
              :style=`{minHeight: '50px'}`) {{$t('Create sphere', 'Создать сферу')}} "{{ searchString }}"
          div(v-if="showItems && items.length > 0").row.full-width.q-py-sm
            ws-sphere(
              v-for="(s, si) in items" :key="s.id"
              @sphereClick="searchString = '', $emit('sphereClick', s)"
              :sphere="s" :sphereIndex="si").q-mr-sm.q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
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
    mangoQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_SPHERE}}
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
      let res = await this.$rxdb.set(RxCollectionEnum.WS_SPHERE, sphereInput)
      // let sphereColor = this.$randomColor(res.id)
      if (res.color.length === 0) res.color = this.$randomColor(res.id)
      this.$log('res', res)
      this.$emit('created', res)
      this.searchString = ''
    },
    searchStringEnter () {
      this.$log('searchStringEnter')
      this.sphereCreate()
    },
    searchStringFocused () {
      this.$log('searchStringFocused')
      this.$store.commit('ui/stateSet', ['wsShowMenu', false])
    },
    searchStringBlurred () {
      this.$log('searchStringBlurred')
      this.$store.commit('ui/stateSet', ['wsShowMenu', true])
    }
  }
}
</script>
