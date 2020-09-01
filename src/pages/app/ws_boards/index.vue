<style lang="sass" scoped>
.board-item
  cursor: pointer
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{maxWidth: '800px'}`).row.full-width
        slot(name="header")
        .row.full-width.items-center.content-center
          .col.q-pl-sm.q-pr-xs
            div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
              q-input(
                v-model="searchString"
                filled dark dense color="white"
                :placeholder="$t('wsBoards_searchPlaceholder', 'Найти доску')"
                ).full-width
                template(v-slot:append)
                  q-btn(
                    v-if="searchString.length > 0"
                    flat dense color="white" icon="clear" @click="searchString = ''")
                  q-btn(
                    flat dense color="white" icon="filter_list")
          q-btn(
            flat color="grey-6" icon="tune"
            :style=`{width: '38px', height: '38px',}`)
            q-menu(fit dark).b-50
              div(:style=`{borderRadius: '10px', overflow: 'hidden',}`).row.full-width.b-50
                q-btn(flat color="white" no-caps).full-width List
                q-btn(flat color="white" no-caps).full-width Gallery
          q-btn(
            @click="boardAdd()"
            flat color="green" icon="add"
            :style=`{width: '38px', height: '38px',}`)
        .row.full-width.q-px-md
            q-tabs(v-model="type" dense no-caps active-color="white" align="left" switch-indicator).full-width.text-grey-8
              q-tab(v-for="t in typesFiltered" :key="t.id" :name="t.id" :label="t.name")
      q-page-sticky(position="bottom" :offset="[0, 60]")
  q-page-container
    q-page(:style=`{paddingTop: '8px'}`)
      .row.full-width.justify-center
        div(
          :style=`{maxWidth: '800px', paddingBottom: '200px',}`
          ).row.full-width.items-start.content-start.q-px-sm
          .row.full-width.items-start.content-start
            kalpa-loader(:mangoQuery="queryBookmarks" :sliceSize="1000")
              template(v-slot=`{items, itemsMore}`)
                .row.full-width.items-start.content-start
                  div(
                    v-for="(i,ii) in items" :key="i.id"
                    @click="boardClick(i,ii)"
                    :style=`{
                      width: '300px',
                      borderRadius: '10px', overflow: 'hidden',
                    }`
                    ).row.q-mr-sm.q-mb-sm.b-40.board-item
                    div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width
                      div(
                        :style=`{
                          width: '200px', height: '200px',
                          borderRight: '1px solid rgb(50,50,50)',
                        }`).row
                        img(
                          :src="i.thumbOid"
                          :style=`{
                            //- borderRadius: '10px', overflow: 'hidden',
                            objectFit: 'cover'
                          }`).fit
                      .col
                        .column.fit
                          .col.full-width
                            img(
                              :src="i.thumbOid"
                              :style=`{
                                //- borderRadius: '10px', overflow: 'hidden',
                                objectFit: 'cover'
                              }`).fit
                          div(:style=`{borderBottom: '1px solid rgb(50,50,50)'}`).col.full-width
                            img(
                              :src="i.thumbOid"
                              :style=`{
                                //- borderRadius: '10px', overflow: 'hidden',
                                objectFit: 'cover'
                              }`).fit
                    .row.full-width.q-px-sm.q-pt-sm
                      span.text-white.text-bold {{ i.name }}
                    .row.full-width.q-px-md.q-pb-xs
                      small.text-grey-5 {{ii}} items
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsBoards',
  data () {
    return {
      searchString: ''
    }
  },
  computed: {
    queryBookmarks () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK}}
      // name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      res.sort = [{updatedAt: 'desc'}]
      return res
    },
  },
  methods: {
    boardClick (board, boardIndex) {
      this.$log('boardClick', board, boardIndex)
      this.$router.push(`/workspace/board/${board.id}`)
    },
    boardAdd () {
      this.$log('boardAdd')
      this.$router.push('/workspace/board/new')
    }
  }
}
</script>
