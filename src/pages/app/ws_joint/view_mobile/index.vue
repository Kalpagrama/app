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
      :pageId_="'kalpa'"
      :pagesShow="false"
      :workspaceTypes="['IMAGE', 'VIDEO', 'NODE']"
      :kalpaTypes="['NODE', 'USER', 'SPHERE']"
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
                :style=`{position: 'relative'}`) {{ typeGet(0).name }}
                q-popup-proxy(
                  fit dark
                  position="bottom")
                  div(
                    :style=`{
                      maxWidth: $q.screen.width < 800 ? $q.screen.width+'px' : 300+'px',
                      borderRadius: '10px',overflow: 'hidden',}`
                    ).row.full-width.items-start.content-start.b-40
                    //- header
                    div(
                      v-if="$q.screen.width < 800"
                      :style=`{
                        height: '60px',
                      }`
                      ).row.full-width.items-center
                      span(:style=`{fontSize: '18px'}`).text-white.text-bold.q-ml-md Выберите тип связи
                      .col
                      q-btn(round flat color="white" icon="clear" v-close-popup).q-mr-sm
                    q-btn(
                      v-for="t in types" :key="t.id" v-close-popup
                      @click="typeClick(0, t)"
                      flat color="grey-5" no-caps
                      ).full-width {{ t.name }}
            //- item right footer
            div(v-if="ii === 1" :style=`{height: '40px', position: 'relative',}`).row.full-width
              q-btn(
                v-if="itemOpened !== 0" flat dense no-caps color="grey-5" icon="keyboard_arrow_down"
                :style=`{position: 'relative'}`) {{ typeGet(1).name }}
                q-popup-proxy(
                  fit dark
                  position="bottom")
                  div(
                    :style=`{
                      maxWidth: $q.screen.width < 800 ? $q.screen.width+'px' : 300+'px',
                      borderRadius: '10px',overflow: 'hidden',}`
                    ).row.full-width.items-start.content-start.b-40
                    //- header
                    div(
                      v-if="$q.screen.width < 800"
                      :style=`{
                        height: '60px',
                      }`
                      ).row.full-width.items-center
                      span(:style=`{fontSize: '18px'}`).text-white.text-bold.q-ml-md Выберите тип связи
                      .col
                      q-btn(round flat color="white" icon="clear" v-close-popup).q-mr-sm
                    q-btn(
                      v-for="t in types" :key="t.id" v-close-popup
                      @click="typeClick(1, t)"
                      flat color="grey-5" no-caps
                      ).full-width {{ t.name }}
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
      //- debug
      //- .row.full-width.justify-center
        div(:style=`{maxWidth: 600+'px'}`).row.full-width.bg-green
          small.text-white {{ joint.type }}
      .row.full-width.justify-center
        div(:style=`{maxWidth: 600+'px'}`).row.full-width.q-mt-md
          edit-name(v-if="joint" :node="joint" placeholder="В чем связь?")
          div(:style=`{paddingLeft: '68px', paddingRight: '68px',}`).row.full-width.q-pt-xl
            q-btn(
              @click="publish()"
              color="green" no-caps
              icon="link"
              :loading="publishing"
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
import { ObjectCreateApi } from 'src/api/object_create'

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
      itemMaxHeight: 0,
    }
  },
  computed: {
    types () {
      return [
        {id: 'CAUSE', name: 'Причина', 0: 'CAUSE_EFFECT', 1: 'EFFECT_CAUSE'},
        {id: 'EFFECT', name: 'Следствие', 0: 'EFFECT_CAUSE', 1: 'CAUSE_EFFECT'},
        {id: 'PROBLEM', name: 'Проблема', 0: 'PROBLEM_SOLUTION', 1: 'SOLUTION_PROBLEM'},
        {id: 'SOLUTION', name: 'Решение', 0: 'SOLUTION_PROBLEM', 1: 'PROBLEM_SOLUTION'},
        {id: 'TRUE', name: 'Правда', 0: 'TRUE_FALSE', 1: 'FALSE_TRUE'},
        {id: 'FALSE', name: 'Ложь', 0: 'FALSE_TRUE', 1: 'TRUE_FALSE'},
        {id: 'FROM', name: 'Первое', 0: 'FROM_TO', 1: 'TO_FROM'},
        {id: 'TO', name: 'Второе', 0: 'TO_FROM', 1: 'FROM_TO'},
      ]
    }
  },
  methods: {
    typeGet (index) {
      return this.types.find(t => {
        return t.id === this.joint.type.split('_')[index]
      })
    },
    typeClick (index, type) {
      this.$log('typeClick', index, type)
      this.joint.type = type[index]
    },
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
    async publish () {
      try {
        this.$log('publish start')
        let jointInput = { leftItem: {oid: null}, rightItem: {oid: null} }
        await this.$wait(500)
        // check 0 item
        if (this.joint.items[0]) {
          if (this.joint.items[0].oid) {
            jointInput.leftItem.oid = this.joint.items[0].oid
          }
          // else if (this.joint.items[0].oidUrl) {
          //   // get content by url...
          //   throw new Error('Need to upload content!')
          // }
          // else if (this.joint.items[0].wsItemType === 'WS_NODE') {
          //   // pre publish node
          //   throw new Error('Need to publish node!')
          // }
          else {
            throw new Error('Wrong first item!')
          }
        }
        // check 1 item
        if (this.joint.items[1]) {
          if (this.joint.items[1].oid) {
            jointInput.rightItem.oid = this.joint.items[1].oid
          }
          // else if (this.joint.items[1].oidUrl) {
          //   // get content by url...
          //   throw new Error('Need to upload content!')
          // }
          // else if (this.joint.items[1].wsItemType === 'WS_NODE') {
          //   // pre publish node...
          //   throw new Error('Need to publish node!')
          // }
          else {
            throw new Error('Wrong second item!')
          }
        }
        // essence
        if (this.joint.type === 'ESSENCE') {
          if (this.joint.name.length === 0) {
            jointInput.jointType = 'ASSOCIATIVE'
          }
          else {
            jointInput.jointType = 'ESSENCE'
            jointInput.name = this.joint.name
          }
        }
        else if (this.joint.type === 'ASSOCIATIVE') {
          jointInput.jointType = this.joint.type
        }
        else {
          this.$log('*** joint TYPE *** ', this.joint.type)
          let switchMap = {
            EFFECT_CAUSE: 'CAUSE_EFFECT',
            SOLUTION_PROBLEM: 'PROBLEM_SOLUTION',
            TRUE_FALSE: 'FALSE_TRUE',
            TO_FROM: 'FROM_TO'
          }
          // switch items and set another...
          if (switchMap[this.joint.type]) {
            this.$log('*** SWITCH ***', this.joint.type)
            let t = jointInput.rightItem
            jointInput.rightItem = jointInput.leftItem
            jointInput.leftItem = t
            jointInput.jointType = switchMap[this.joint.type]
          }
          else {
            jointInput.jointType = this.joint.type
          }
        }
        let joint = await ObjectCreateApi.jointCreate(jointInput)
        this.$log('joint done joint', joint)
        this.$log('publish done')
        this.publishing = false
        this.$router.push('/user/' + this.$store.getters.currentUser().oid + '/joints')
      }
      catch (e) {
        this.$log('publish error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.publishing = false
      }
    }
  }
}
</script>
