<template lang="pug">
q-layout(view="hHh Lpr lff").b-30
  q-dialog(
    v-model="itemFinderOpened"
    @hide="itemFinding = null"
    position="bottom"
    maximized
    transition-show="none"
    transition-hide="none")
    kalpa-finder(
      @contentKalpa="itemFound"
      :workspaceTypes="['IMAGE', 'VIDEO', 'NODE']"
      :kalpaTypes="['IMAGE', 'VIDEO', 'NODE', 'USER', 'SPHERE']"
      :style=`{
        height: $q.screen.height+'px',
        maxWidth: $store.state.ui.pageWidth+'px',
      }`)
      template(v-slot:header)
        div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="itemFinderOpened = false")
          .col
            span(:style=`{fontSize: '18px'}`).text-white.text-bold Выбрать элемент
      template(v-slot:tint=`{item}`)
        div(
          @click="itemFound(item)"
          :class=`{
            //- 'bg-red': collection.bookmarks.includes(item.id)
          }`
          :style=`{
            position: 'absolute', zIndex: 1000,
            opacity: 0.5,
          }`
          ).row.fit
  q-header().b-30
    .row.full-width.items-start.content-start.justify-center.q-pt-xs
      //- header
      div(
        v-if="true"
        ).row.full-width.justify-center
        div(:style=`{maxWidth: 600+'px'}`).row.full-width.items-center.content-center.justify-between.q-pa-sm
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
          span(:style=`{fontSize: '18px'}`).text-white.text-bold Создание связи
          q-btn(round flat color="white" icon="more_vert")
      //- items
      div(
        :style=`{
          position: 'relative',
          maxWidth: 600+'px',
          minHeight: $q.screen.height/2+'px',
        }`
        ).row.full-width.items-end.content-end.q-px-sm
        //- middle btn
        q-btn(
          @click="itemOpened = null"
          round flat color="green" icon="link" size="lg"
          :style=`{
            position: 'absolute', zIndex: 2000, bottom: '40px',
            left: itemOpened === null ? 'calc(50% - 30px)' : itemOpened === 0 ? 'calc(100% - 60px - 42px)' : 'calc(60px - 20px)',
          }`)
        //- items .col s
        div(
          v-for="(i,ii) in 2" :key="ii"
          :style=`{
            position: 'relative', zIndex: 10,
            maxWidth: itemOpened === null ? '50%' : itemOpened === ii ? '100%' : '60px',
            transform: ii === 0 ? 'perspective(1000px) rotateY(10deg)' : 'perspective(1000px) rotateY(-10deg)'
          }`
          ).col
          edit-item(
            v-if="joint.items[ii]"
            :item="joint.items[ii]" :isOpened="itemOpened === ii"
            @open="itemOpened = ii")
            //- item left footer
            div(v-if="ii === 0" :style=`{height: '40px', position: 'relative',}`).row.full-width
              q-btn(round flat dense color="grey-9" icon="delete_outline" @click="itemDelete(0)")
              .col
              q-btn(
                v-if="itemOpened !== 1" flat dense no-caps color="grey-5" icon-right="keyboard_arrow_down"
                :style=`{position: 'relative'}`) Проблема
            //- item right footer
            div(v-if="ii === 1" :style=`{height: '40px', position: 'relative',}`).row.full-width
              q-btn(
                v-if="itemOpened !== 0" flat dense no-caps color="grey-5" icon="keyboard_arrow_down"
                :style=`{position: 'relative'}`) Решение
              .col
              q-btn(round flat dense color="grey-9" icon="delete_outline" @click="itemDelete(1)")
          //- no item
          div(
            v-else
            :style=`{background: 'rgb(35,35,35)', borderRadius: '10px', marginBottom: '42px',}`).row.full-width
            q-btn(
              @click="itemFinderOpened = true, itemFinding = ii"
              flat color="green" size="lg"
              :icon="itemFinding === ii ? 'clear' : 'add'"
              :style=`{
                height: '100px',
              }`).full-width.b-40
            div(
              @click="itemOpened === ii ? itemOpened = null : itemOpened = ii"
              :style=`{height: '60px'}`
              ).row.full-width
      .row.full-width.justify-center
        div(:style=`{maxWidth: 600+'px'}`).row.full-width.q-mt-md
          edit-name(v-if="joint" :node="joint" placeholder="В чем связь?")
          div(:style=`{paddingLeft: '68px', paddingRight: '68px',}`).row.full-width.q-pt-xl
            q-btn(
              @click="join()"
              color="green" no-caps
              icon="link"
              :style=`{
                height: '50px',
              }`).full-width
              span.text-white.text-bold.q-ml-sm Связать
  q-page-container
    q-page(
      :style=`{
        paddingTop: '4px',
      }`
      ).row.full-width.items-start.content-start.q-px-xs
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsJoint_viewMobile',
  props: ['joint'],
  components: {
    editName: () => import('components/node_editor/view_publish/edit_name.vue'),
    editItem: () => import('../edit_item/index.vue'),
  },
  data () {
    return {
      itemFinderOpened: false,
      itemOpened: 0,
      itemFinding: null,
      itemMaxHeight: 0
    }
  },
  methods: {
    async itemFound (item) {
      this.$log('itemFound', item)
      if (item.wsItemType) {
        if (item.wsItemType === 'WS_BOOKMARK') {
          if (item.type === 'VIDEO') {
          }
          if (item.type === 'IMAGE') {
          }
        }
      }
      else {
        item = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
        this.$log('itemFound item get', item)
        // use node as is...
        if (item.oid && item.type === 'NODE') {
          this.$log('using node as is...')
          this.$set(this.joint.items, this.itemFinding, JSON.parse(JSON.stringify(item)))
          this.itemOpened = this.itemFinding
        }
        if (item.oid && item.type === 'VIDEO') {
          // use as video...
        }
        if (item.oid && item.type === 'IMAGE') {
          // use as image node...
        }
        if (item.oid && item.type === 'USER') {
          this.$log('using user as is...')
          this.$set(this.joint.items, this.itemFinding, JSON.parse(JSON.stringify(item)))
          this.itemOpened = this.itemFinding
        }
        if (item.oid && ['WORD', 'SENTENCE'].includes(item.type)) {
          this.$log('using sphere as is...')
          this.$set(this.joint.items, this.itemFinding, JSON.parse(JSON.stringify(item)))
          this.itemOpened = this.itemFinding
        }
      }
      this.itemFinding = null
      this.itemFinderOpened = false
    },
    itemDelete (itemIndex) {
      this.$log('itemDelete', itemIndex)
      this.$set(this.joint.items, itemIndex, null)
      this.itemOpened = itemIndex === 0 ? 1 : 0
    },
    async join () {
      this.$log('join')
    }
  }
}
</script>
