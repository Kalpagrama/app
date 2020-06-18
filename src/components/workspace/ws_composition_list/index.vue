<style lang="sass">
</style>

<template lang="pug">
div(
  :class=`{
    'full-height': !inDialog,
  }`
  :style=`{
    position: 'relative',
  }`
  ).column.full-width
  //- ws composition editor
  q-dialog(
    v-model="compositionEditorOpened" position="bottom"
    @show="$store.commit('ui/stateSet', ['wsShowMenu', false])"
    @hide="$store.commit('ui/stateSet', ['wsShowMenu', true])")
    ws-composition-editor(
      v-if="composition" :value="composition"
      @close="compositionEditorOpened = false"
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
        maxWidth: $store.state.ui.maxWidthPage+'px',
      }`).b-50
  //- header
  //- kalpa-debug(:options=`{ctx}`)
  div(
    :style=`{
      borderRadius: $q.screen.xs ? '0 0 10px 10px' : '10px'
    }`).row.full-width.items-start.content-start.b-50.q-pb-sm.q-px-sm
    //- slot(name="header")
    //- navigation
    div(
      v-if="ctx === 'workspace'"
      :style=`{}`).row.full-width.items-center.content-center.q-py-md
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '20px'}`).text-white.text-bold Compositions
    //- search
    div.row.full-width
      q-input(
        v-model="searchString"
        ref="searchStringInput"
        filled dense dark color="grey-5"
        :autofocus="ctx === 'workpsace'"
        placeholder="Find composition"
        @focus="searchStringFocused"
        @blur="searchStringBlurred"
        ).full-width
        template(v-slot:append)
          q-btn(
            v-if="searchString.length > 0"
            flat dense color="grey-2" icon="clear" @click="searchString = ''")
    //- tools
    div(
      :style=`{}`
      ).row.full-width.q-pt-xs
      .col
      q-btn(round flat dense color="white" icon="edit")
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-py-md.q-px-sm
      kalpa-loader(:mangoQuery="mangoQuery" :key="i")
        template(v-slot=`{items}`)
          div(v-if="items.length > 0").row.full-width.items-start.content-start
            div(
              :style=`{paddingBottom: '100px'}`).row.full-width.items-start.content-start
              composition-item(
                v-for="(c,ci) in items" :key="c.id"
                @pick="compositionPicked(c,ci)"
                @explore="compositionExplore(c,ci)"
                @delete="compositionDelete(c,ci)"
                :ctx="ctx" :composition="c").col-6.q-pa-xs
          //- nothing found
          div(
            v-else
            :style=`{height: '200px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.content-center.justify-center.b-50
            span.text-white Nothing found :(
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
        // this.content = content
        // this.contentEditorOpened = true
        this.$router.push(`/workspace/composition/${composition.id}`)
      }
      else {
        this.$emit('composition', JSON.parse(JSON.stringify(composition)))
      }
    },
    compositionExplore (c, ci) {
      this.$log('contentExplore', c, ci)
      // this.$router.push(`/content/${c.contentOid}`).catch(e => e)
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
