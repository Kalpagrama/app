<template lang="pug">
div(
  :class=`{
    'full-height': !inDialog,
    'q-pt-sm': $q.screen.gt.xs,
  }`
  :style=`{
    position: 'relative',
  }`
  ).column.full-width
  //- ws composition editor
  q-dialog(v-model="compositionEditorOpened" position="bottom")
    ws-composition-editor(
      v-if="composition"
      @close="compositionEditorOpened = false"
      :value="composition"
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
        maxWidth: $store.state.ui.maxWidthPage+'px',
      }`).b-50
  //- header
  div(
    :style=`{
      borderRadius: $q.screen.xs ? '0 0 10px 10px' : '10px'
    }`).row.full-width.items-start.content-start.b-50
    //- navigation
    div(
      v-if="ctx === 'workspace'"
      :style=`{height: '100px',}`).row.full-width.items-center.content-center.q-px-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '20px'}`).text-white.text-bold {{$t('Образы')}}
    //- search
    div.row.full-width.q-px-sm.q-pb-sm
      .col
        q-input(
          v-model="searchString"
          ref="searchStringInput"
          filled dense dark color="white"
          :placeholder="$t('placeholder_search', 'Поиск')"
          @focus="searchStringFocused"
          @blur="searchStringBlurred"
          ).full-width
          template(v-slot:append)
            q-btn(
              v-if="searchString.length > 0"
              flat dense color="white" icon="clear" @click="searchString = ''")
            q-btn(
            flat dense color="white" icon="filter_list")
      q-btn(
        v-for="(v,vi) in views" :key="v.id"
        @click="view = v.id"
        round flat dense no-caps
        :icon="v.icon"
        :color="view === v.id ? 'green' : 'white'")
    //- tools: views
    div(
      v-if="false"
      :style=`{}`
      ).row.full-width.q-pt-xs
      .col
      q-btn(
        v-for="(v,vi) in views" :key="v.id"
        @click="view = v.id"
        round flat dense no-caps
        :icon="v.icon"
        :color="view === v.id ? 'green' : 'white'"
        )
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-py-md
      kalpa-loader(:mangoQuery="mangoQuery" :key="i")
        template(v-slot=`{items}`)
          div(v-if="items.length > 0").row.full-width.items-start.content-start
            div(
              :style=`{paddingBottom: '100px'}`).row.full-width.items-start.content-start
              composition-item(
                v-for="(c,ci) in items" :key="c.id"
                :view="view"
                @pick="compositionPicked(c,ci)"
                @delete="compositionDelete(c,ci)"
                :ctx="ctx" :composition="c")
          //- nothing found
          div(
            v-else
            :style=`{height: '200px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
            ).row.full-width.items-center.content-center.justify-center.b-50
            span.text-white {{$t('Nothing found :(')}}
</template>

<script>
import { ContentApi } from 'src/api/content'
import { RxCollectionEnum } from 'src/system/rxdb'

import compositionItem from './composition_item'

export default {
  name: 'wsCompositionList',
  components: {compositionItem},
  props: {
    inDialog: {
      type: Boolean,
      default () {
        return false
      }
    },
    ctx: {
      type: String,
      default () {
        return 'workspace'
      }
    }
  },
  data () {
    return {
      searchString: '',
      composition: null,
      compositionShow: false,
      compositionEditorOpened: false,
      view: 'semi',
      views: [
        {id: 'maxi', name: 'Maxi', icon: 'crop_din'},
        {id: 'semi', name: 'Semi', icon: 'crop_5_4'},
        {id: 'mini', name: 'Mini', icon: 'crop_7_5'},
      ]
    }
  },
  computed: {
    mangoQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_CONTENT}}
      // selector
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      res.selector.contentType = 'COMPOSITION'
      // sort
      res.sort = [{updatedAt: 'desc'}]
      return res
    }
  },
  watch: {
  },
  methods: {
    compositionPicked (composition) {
      this.$log('compositionPicked', this.ctx)
      if (this.ctx === 'workspace') {
        this.composition = composition
        this.compositionEditorOpened = true
        // this.$router.push(`/workspace/composition/${composition.id}`)
      }
      else {
        this.$emit('composition', JSON.parse(JSON.stringify(composition)))
      }
    },
    async compositionDelete (composition, ci) {
      this.$log('compositionDelete', composition, ci)
      if (!confirm('Delete composition ?!')) return
      await this.$rxdb.remove(composition.id)
    },
    searchStringFocused () {
      this.$log('searchStringFocused')
      // this.$store.commit('ui/stateSet', ['wsShowMenu', false])
    },
    searchStringBlurred () {
      this.$log('searchStringBlurred')
      // this.$store.commit('ui/stateSet', ['wsShowMenu', true])
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
