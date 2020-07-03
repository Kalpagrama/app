<style lang="sass">
.q-dialog
  border-radius: 0px !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative'
  }`
  ).column.fit.q-pt-sm
  //- header
  div(
    :style=`{
      borderRadius: $q.screen.gt.xs ? '10px' : '0 0 10px 10px',
    }`
    ).row.full-width.items-start.content-start.b-50.q-pb-sm.q-px-sm
    //- header
    div(:style=`{height: '100px',}`).row.full-width.items-center.content-center
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '20px'}`).text-white.text-bold {{$t('Nodes')}}
    //- search
    div().row.full-width
      q-input(
        v-model="searchString"
        filled dark dense color="white"
        placeholder="Search..."
        ).full-width
        template(v-slot:append)
          q-btn(
            v-if="searchString.length > 0"
            flat dense color="grey-2" icon="clear" @click="searchString = ''")
          q-btn(
            flat dense color="grey-2" icon="filter_list")
    //- actions
    .row.full-width.items-end.content-end
      kalpa-buttons(:value="types" :id="type" @id="type = $event" screenSet="gt.xs" wrapperBg="b-70").justify-start
  //- body
  .col.full-width
    kalpa-loader(:mangoQuery="mangoQuery")
      template(v-slot=`{items}`)
        .row.fit.items-start.content-start
          list-published(v-if="type === 'saved'" :items="items")
          list-draft(v-if="type === 'draft'" :items="items")
          list-published(v-if="type === 'published'" :items="items")
</template>

<script>
import assert from 'assert'
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'

import listDraft from './list_draft'
import listPublished from './list_published'

export default {
  name: 'wsNodeLsit',
  components: {listDraft, listPublished},
  data () {
    return {
      type: 'draft',
      searchString: '',
    }
  },
  computed: {
    types () {
      return [
        {id: 'saved', name: this.$t('nodes_saved', 'Сохраненные')},
        {id: 'draft', name: this.$t('nodes_drafts', 'Черновики')},
        {id: 'published', name: this.$t('nodes_published', 'Опубликованные')},
      ]
    },
    mangoQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_NODE}}
      // name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      // type
      if (this.type !== 'all') {
        res.selector.stage = this.type
      }
      // sort
      res.sort = [{updatedAt: 'desc'}]
      return res
    }
  },
  watch: {
  },
  methods: {
  }
}
</script>
