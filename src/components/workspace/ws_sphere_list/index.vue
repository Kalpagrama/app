<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- header
  div(:style=`{}`).row.full-width.justify-center
    div(:style=`{maxWidth: '800px'}`).row.full-width.items-center.content-center.justify-between
      .row.full-width.items-center.q-px-md.q-pb-sm.q-pt-md
        span(:style=`{fontSize: '19px'}`).text-white.text-bold {{$t('wsSphereList_title', 'Сферы')}}
    //- search
    .row.full-width.q-pa-sm
      q-input(
        v-model="searchString"
        filled dense dark color="white"
        :label="$t('wsSphereList_searchPlaceholder', 'Найди или создай сферу')"
        @focus="searchStringFocused"
        @blur="searchStringBlurred"
        @keyup.enter="searchStringEnter()").full-width
        template(v-slot:append)
          q-btn(v-if="searchString.length > 0" flat round dense icon="clear" color="white" @click="searchString = ''")
  //- body
  .col.full-width.scroll
    kalpa-loader(:mangoQuery="mangoQuery" :sliseSize="1000")
      template(v-slot=`{items}`)
        .row.full-width.items-start.content-start.q-px-sm
          slot(name="items" :searchString="searchString" :items="items")
          div(v-if="items.length === 0").row.full-width.items-center.content-center.justify-center.q-pa-md
            //- span.text-white.q-mr-sm Create sphere
            q-btn(
              v-if="searchString.length > 0"
              color="green" push no-caps @click="sphereCreate()"
              :style=`{minHeight: '50px'}`) {{$t('Create sphere', 'Создать сферу')}} "{{ searchString }}"
          div(v-if="showItems && items.length > 0").row.full-width
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
