<template lang="pug">
//- h1.text-red wsJOint
.row.full-width
  div(v-if="$route.params.item === undefined").row.full-width.items-start.content-start
    //- header
    .row.full-width.justify-center.q-pt-sm.q-mb-sm
      div(
        :style=`{
          height: '60px',
          maxWidth: $store.state.ui.pageWidth+'px',
          borderRadius: '10px',overflow: 'hidden'
        }`
        ).row.full-width.items-center.content-center.q-px-sm
        q-btn(round flat dense color="grey-6" icon="keyboard_arrow_left" @click="$router.back()")
        .col
        span(:style=`{fontSize: '1rem'}`).text-grey-6.text-bold Создание связи
        .col
        q-btn(round flat dense color="grey-6" icon="more_vert")
    //- items wrapper
    .row.full-width.justify-center
      div(
        v-if="joint"
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
          borderRadius: '10px',
        }`).row.full-width.q-px-md.q-pt-md
        //- left item
        .col
          div(:style=`{transform: 'perspective(600px) rotateY(10deg)'}`).row.fit.items-end.content-end
            joint-item(
              @click="$router.push({params: {item: 0}})"
              v-if="joint.items[0]" :item="joint.items[0]" :joint="joint")
            div(:style=`{height: '40px'}`).row.full-width.justify-end
              transition( appear enter-active-class="animated zoomIn" leave-active-class="animated zoomOut")
                q-btn(
                  v-if="itemsTypesShow && joint.items[0] && !['ESSENCE', 'ASSOCIATIVE'].includes(joint.type)"
                  icon-right="keyboard_arrow_down"
                  flat dense color="grey-6" no-caps)
                  span.text-white.text-bold {{ itemTypes.find(i => i.id === joint.type.split('_')[0]).name }}
                  q-menu(dark)
                    div(:style=`{width: '110px'}`).row
                      q-btn(
                        @click="itemTypeSet(0, t.id)"
                        v-for="(t,ti) in itemTypes" :key="t.id" v-close-popup
                        v-if="!['ESSENCE', 'ASSOCIATIVE'].includes(t.id)"
                        flat dense no-caps color='grey-2').full-width {{ t.name }}
        //- items divider
        div(
          v-if="$q.screen.width > 600"
          :style=`{width: '1px'}`).column.full-height.items-center.content-center.justify-center
          .col
          q-icon(name="link" color="green" size="30px")
          .col
        //- right item
        .col
          div(:style=`{transform: 'perspective(600px) rotateY(-10deg)'}`).row.fit.items-end.content-end
            joint-item(
              @click="$router.push({params: {item: 1}})"
              v-if="joint.items[1]" :item="joint.items[1]" :joint="joint")
            div(:style=`{height: '40px',}`).row.full-width.justify-start
              transition( appear enter-active-class="animated zoomIn" leave-active-class="animated zoomOut")
                q-btn(
                  v-if="itemsTypesShow && joint.items[1] && !['ESSENCE', 'ASSOCIATIVE'].includes(joint.type)"
                  icon="keyboard_arrow_down"
                  flat dense color="grey-6" no-caps)
                  span.text-white.text-bold {{ itemTypes.find(i => i.id === joint.type.split('_')[1]).name }}
                  q-menu(dark)
                    div(:style=`{width: '110px'}`).row
                      q-btn(
                        @click="itemTypeSet(1, t.id)"
                        v-for="(t,ti) in itemTypes" :key="t.id" v-close-popup
                        v-if="!['ESSENCE', 'ASSOCIATIVE'].includes(t.id)"
                        flat dense no-caps color='grey-2').full-width {{ t.name }}
    //- name
    div(v-if="joint").row.full-width.items-center.content-center.justify-center.q-py-xs
      .row.full-width.justify-center
        div(:style=`{maxWidth: '600px',}`).row.full-width
          q-input(
            v-if="joint.type === 'ESSENCE'"
            v-model="joint.name"
            borderless dark type="textarea" autogrow autofocus
            placeholder="Что их связывает?"
            :input-style=`{
              fontSize: '18px',
              fontWeight: 'bold',
              textAlign: 'center',
            }`).full-width
      .row.full-width.justify-center.q-pa-md
        transition( appear enter-active-class="animated zoomIn" leave-active-class="animated zoomOut")
          div(
            v-if="joint && joint.items.length > 0"
            :style=`{
              background: 'rgb(35,35,35)',
              borderRadius: '10px', overflow: 'hidden'
            }`
            ).row
            q-btn(
              @click="publish()"
              color="green" no-caps size="lg" icon="link"
              :loading="publishing").full-width.q-px-sm
              span.text-white.text-bold.q-ml-md Связать
            div(:style=`{order: -1}`).row.full-width.q-pa-xs
              .col
                q-btn(
                  @click="joint.type === 'ESSENCE' ? joint.type = 'ASSOCIATIVE' : joint.type = 'ESSENCE'"
                  :color="joint.type === 'ESSENCE' ? 'green': 'grey-8'"
                  :class=`{
                    'b-60': joint.type === 'ESSENCE'
                  }`
                  flat dense no-caps dark).full-width Указать суть
              .col
                q-btn(
                  @click="['ESSENCE', 'ASSOCIATIVE'].includes(joint.type) ? joint.type = 'PROBLEM_SOLUTION' : joint.type = 'ASSOCIATIVE'"
                  :color="!['ESSENCE', 'ASSOCIATIVE'].includes(joint.type) ? 'green' : 'grey-8'"
                  :class=`{
                    'b-60': !['ESSENCE', 'ASSOCIATIVE'].includes(joint.type)
                  }`
                  flat dense no-caps dark).full-width Указать тип
    //- view add wrapper
    .row.full-width.justify-center.q-mt-md
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
          background: 'rgb(35,35,35)',
          borderRadius: '10px', overflow: 'hidden',
          minHeight: '500px',
        }`).row.full-width
        view-add(v-if="joint" :joint="joint" @item="(item, ii) => itemFound(item, ii)")
  div(v-else).row.full-width
    q-btn(round flat dense color="grey-6" icon="keyboard_arrow_left" @click="$router.back()")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectCreateApi } from 'src/api/object_create'

export default {
  name: 'pageApp_wsJoint',
  components: {
    jointItem: () => import('./joint_item.vue'),
    viewAdd: () => import('./view_add/index.vue')
  },
  data () {
    return {
      joint: null,
      jointNew: {
        name: '',
        type: 'ASSOCIATIVE',
        items: [],
      },
      publishing: false,
    }
  },
  computed: {
    itemTypes () {
      return [
        {id: 'ESSENCE', name: 'По сути', pair: 'ESSENCE', origin: 'ESSENCE'},
        {id: 'ASSOCIATIVE', name: 'Ассоциация', pair: 'ASSOCIATIVE', origin: 'ASSOCIATIVE'},
        {id: 'CAUSE', name: 'Причина', pair: 'EFFECT', origin: 'CAUSE_EFFECT'},
        {id: 'EFFECT', name: 'Следствие', pair: 'CAUSE', origin: 'CAUSE_EFFECT'},
        {id: 'PROBLEM', name: 'Проблема', pair: 'SOLUTION', origin: 'PROBLEM_SOLUTION'},
        {id: 'SOLUTION', name: 'Решение', pair: 'PROBLEM', origin: 'PROBLEM_SOLUTION'},
        {id: 'TRUE', name: 'Опровержение', pair: 'FALSE', origin: 'FALSE_TRUE'},
        {id: 'FALSE', name: 'Фэйк', pair: 'TRUE', origin: 'FALSE_TRUE'},
        {id: 'FROM', name: 'До', pair: 'TO', origin: 'FROM_TO'},
        {id: 'TO', name: 'После', pair: 'FROM', origin: 'FROM_TO'},
      ]
    },
    itemsTypesShow () {
      if (['ESSENCE', 'ASSOCIATIVE'].includes(this.joint.type)) return false
      else return true
    },
    jointNameShow () {
      if (this.joint.items[0] && this.joint.items[0].type === 'ESSENCE') return true
      if (this.joint.items[1] && this.joint.tiems[1].type === 'ESSENCE') return true
      else return false
    },
    jointExtended () {
      return ['ESSENCE', 'ASSOCIATIVE'].includes(this.joint.type) && this.joint.name.length > 0
    }
  },
  watch: {
    'joint.name': {
      handler (to, from) {
        if (to.length > 0) this.joint.type = 'ESSENCE'
      }
    },
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          if (to === 'new') {
            // this.$q.notify({type: 'positive', position: 'top', message: 'Creating new joint'})
            this.joint = JSON.parse(JSON.stringify(this.jointNew))
            // get first item
            if (this.$route.query.oid) {
              let item = await this.$rxdb.get(RxCollectionEnum.OBJ, this.$route.query.oid)
              this.itemFound(item, 0)
            }
            var unwatch = this.$watch(
              'joint',
              async (_from, _to) => {
                this.$log('joint TO', to)
                // create node...
                if (unwatch) unwatch()
                let jointInput = JSON.parse(JSON.stringify(this.joint))
                let joint = await this.$rxdb.set(RxCollectionEnum.WS_JOINT, jointInput)
                this.$router.replace(`/workspace/joint/${joint.id}`)
              },
              {
                deep: true,
              }
            )
          }
          else {
            let item = await this.$rxdb.get(RxCollectionEnum.WS_JOINT, to)
            this.$log('FOUND joint', item)
            this.joint = item
          }
        }
      }
    },
  },
  methods: {
    itemTypeSet (index, type) {
      this.$log('itemTypeSet', index, type)
      let pair = this.itemTypes.find(t => t.id === type).pair
      this.$log('pair', pair)
      if (index === 0) {
        this.joint.type = `${type}_${pair}`
      }
      if (index === 1) {
        this.joint.type = `${pair}_${type}`
      }
    },
    itemFound (item, index) {
      this.$log('itemFound', item, index)
      let itemInput = {
        // type: 'SOLUTION',
        item: item,
      }
      // if (index === 0) {
      //   if (this.joint.items[1]) {
      //     itemInput.type = this.itemTypes.find(i => i.id === this.joint.items[1].type).pair
      //   }
      // }
      // if (index === 1) {
      //   if (this.joint.items[0]) {
      //     itemInput.type = this.itemTypes.find(i => i.id === this.joint.items[0].type).pair
      //   }
      // }
      this.$set(this.joint.items, index, itemInput)
    },
    itemDelete (index) {
      this.$log('itemDelete', index)
      this.$set(this.joint.items, index, null)
    },
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        await this.$wait(1000)
        let jointInput = { leftItem: {oid: null}, rightItem: {oid: null} }
        // check 0 item
        if (this.joint.items[0]) {
          if (this.joint.items[0].item.oid) {
            jointInput.leftItem.oid = this.joint.items[0].item.oid
          }
          else if (this.joint.items[0].item.oidUrl) {
            // get content by url...
            throw new Error('Need to upload content!')
          }
          else if (this.joint.items[0].item.wsItemType === 'WS_NODE') {
            // pre publish node
            throw new Error('Need to publish node!')
          }
          else {
            throw new Error('Wrong first item!')
          }
        }
        // check 1 item
        if (this.joint.items[1]) {
          if (this.joint.items[1].item.oid) {
            jointInput.rightItem.oid = this.joint.items[1].item.oid
          }
          else if (this.joint.items[1].item.oidUrl) {
            // get content by url...
            throw new Error('Need to upload content!')
          }
          else if (this.joint.items[1].item.wsItemType === 'WS_NODE') {
            // pre publish node...
            throw new Error('Need to publish node!')
          }
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
        // another types...
        this.$log('*** JOINT TYPE *** ', jointInput.jointType)
        let joint = await ObjectCreateApi.jointCreate(jointInput)
        this.$log('joint done joint', joint)
        this.$log('publish done')
        this.publishing = false
        this.$router.replace('/joint/' + joint.oid).catch(e => e)
        // this.$rxdb.remove(this.joint.id)
        await this.joint.remove()
      }
      catch (e) {
        this.$log('publish error', e)
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
        this.publishing = false
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
    this.$store.commit('ui/stateSet', ['showDesktopNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
    this.$store.commit('ui/stateSet', ['showDesktopNavigation', true])
  }
}
</script>
