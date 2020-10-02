<template lang="pug">
.row.full-width
  div(v-if="$route.params.item === undefined").row.full-width.items-start.content-start
    //- header
    .row.full-width.justify-center.q-pt-sm.q-mb-sm
      div(
        :style=`{
          height: '60px',
          maxWidth: $store.state.ui.pageMaxWidth+'px',
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
        v-if="link"
        :style=`{
          maxWidth: $store.state.ui.pageMaxWidth+'px',
          borderRadius: '10px',
        }`).row.full-width.q-px-md.q-pt-md
        //- left item
        .col
          div(:style=`{transform: 'perspective(600px) rotateY(10deg)'}`).row.fit.items-end.content-end
            link-item(
              @click="$router.push({params: {item: 0}})"
              v-if="link.items[0]" :item="link.items[0]" :link="link")
            div(:style=`{height: '40px'}`).row.full-width.justify-end
              transition( appear enter-active-class="animated zoomIn" leave-active-class="animated zoomOut")
                q-btn(
                  v-if="itemsTypesShow && link.items[0]"
                  icon-right="keyboard_arrow_down"
                  flat dense color="grey-6" no-caps)
                  span.text-white.text-bold {{ itemTypes.find(i => i.id === link.items[0].type).name }}
                  q-menu(dark)
                    div(:style=`{width: '100px'}`).row
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
            link-item(
              @click="$router.push({params: {item: 1}})"
              v-if="link.items[1]" :item="link.items[1]" :link="link")
            div(:style=`{height: '40px',}`).row.full-width.justify-start
              transition( appear enter-active-class="animated zoomIn" leave-active-class="animated zoomOut")
                q-btn(
                  v-if="itemsTypesShow && link.items[1]"
                  icon="keyboard_arrow_down"
                  flat dense color="grey-6" no-caps)
                  span.text-white.text-bold {{ itemTypes.find(i => i.id === link.items[1].type).name }}
                  q-menu(dark)
                    div(:style=`{width: '100px'}`).row
                      q-btn(
                        @click="itemTypeSet(1, t.id)"
                        v-for="(t,ti) in itemTypes" :key="t.id" v-close-popup
                        v-if="!['ESSENCE', 'ASSOCIATIVE'].includes(t.id)"
                        flat dense no-caps color='grey-2').full-width {{ t.name }}
    //- name
    div(v-if="link").row.full-width.items-center.content-center.justify-center.q-py-xs
      .row.full-width.justify-center
        div(:style=`{maxWidth: '600px',}`).row.full-width
          q-input(
            v-if="link.type === 'ESSENCE'"
            v-model="link.name"
            borderless dark type="textarea" autogrow autofocus
            placeholder="Как они связаны?"
            :input-style=`{
              fontSize: '18px',
              fontWeight: 'bold',
              textAlign: 'center',
            }`).full-width
      .row.full-width.justify-center.q-pa-md
        transition( appear enter-active-class="animated zoomIn" leave-active-class="animated zoomOut")
          div(
            v-if="link && link.items.length > 0"
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
                  @click="link.type === 'ESSENCE' ? link.type = 'ASSOCIATIVE' : link.type = 'ESSENCE'"
                  :color="link.type === 'ESSENCE' ? 'green': 'grey-8'"
                  :class=`{
                    'b-60': link.type === 'ESSENCE'
                  }`
                  flat dense no-caps dark).full-width Указать суть
              .col
                q-btn(
                  @click="['ESSENCE', 'ASSOCIATIVE'].includes(link.type) ? link.type = 'PROBLEM_SOLUTION' : link.type = 'ASSOCIATIVE'"
                  :color="!['ESSENCE', 'ASSOCIATIVE'].includes(link.type) ? 'green' : 'grey-8'"
                  :class=`{
                    'b-60': !['ESSENCE', 'ASSOCIATIVE'].includes(link.type)
                  }`
                  flat dense no-caps dark).full-width Указать тип
    //- view add wrapper
    .row.full-width.justify-center.q-mt-md
      div(
        :style=`{
          maxWidth: $store.state.ui.pageMaxWidth+'px',
          background: 'rgb(35,35,35)',
          borderRadius: '10px', overflow: 'hidden',
          minHeight: '500px',
        }`).row.full-width
        view-add(v-if="link" :link="link" @item="(item, ii) => itemFound(item, ii)")
  div(v-else).row.full-width
    q-btn(round flat dense color="grey-6" icon="keyboard_arrow_left" @click="$router.back()")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'

export default {
  name: 'pageApp_wsLink',
  components: {
    linkItem: () => import('./link_item.vue'),
    viewAdd: () => import('./view_add/index.vue')
  },
  data () {
    return {
      link: null,
      linkNew: {
        name: '',
        type: 'ASSOCIATIVE',
        items: [],
        wsItemType: 'WS_JOINT',
      },
      publishing: false,
    }
  },
  computed: {
    itemTypes () {
      return [
        {id: 'ESSENCE', name: 'По сути', pair: 'ESSENCE'},
        {id: 'ASSOCIATIVE', name: 'Ассоциация', pair: 'ASSOCIATIVE'},
        {id: 'CAUSE', name: 'Причина', pair: 'EFFECT'},
        {id: 'EFFECT', name: 'Следствие', pair: 'CAUSE'},
        {id: 'PROBLEM', name: 'Проблема', pair: 'SOLUTION'},
        {id: 'SOLUTION', name: 'Решение', pair: 'PROBLEM'},
        {id: 'TRUE', name: 'Правда', pair: 'FALSE'},
        {id: 'FALSE', name: 'Ложь', pair: 'TRUE'},
        {id: 'FROM', name: 'Первое', pair: 'TO'},
        {id: 'TO', name: 'Второе', pair: 'FROM'},
      ]
    },
    itemsTypesShow () {
      if (['ESSENCE', 'ASSOCIATIVE'].includes(this.link.type)) return false
      else return true
    },
    linkNameShow () {
      if (this.link.items[0] && this.link.items[0].type === 'ESSENCE') return true
      if (this.link.items[1] && this.link.tiems[1].type === 'ESSENCE') return true
      else return false
    },
    linkExtended () {
      return ['ESSENCE', 'ASSOCIATIVE'].includes(this.link.type) && this.link.name.length > 0
    }
  },
  watch: {
    'link.name': {
      handler (to, from) {
        if (to.length > 0) this.link.type = 'ESSENCE'
      }
    },
    'link.items.0': {
      deep: true,
      handler (to, from) {
        this.$log('link.items[0] TO', to)
        if (to) {
          if (this.link.items[1]) {
            let pair = this.itemTypes.find(i => i.id === to.type).pair
            this.$log('set PAIR', pair)
            this.link.items[1].type = pair
          }
        }
      }
    },
    'link.items.1': {
      deep: true,
      handler (to, from) {
        this.$log('link.items[1] TO', to)
        if (to) {
          if (this.link.items[0]) {
            let pair = this.itemTypes.find(i => i.id === to.type).pair
            this.$log('set PAIR', pair)
            this.link.items[0].type = pair
          }
        }
      }
    },
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          if (to === 'new') {
            // this.$q.notify({type: 'positive', position: 'top', message: 'Creating new link'})
            this.link = JSON.parse(JSON.stringify(this.linkNew))
            // get first item
            if (this.$route.query.oid) {
              let item = await this.$rxdb.get(RxCollectionEnum.OBJ, this.$route.query.oid)
              this.itemFound(item, 0)
            }
            var unwatch = this.$watch(
              'link',
              async (_from, _to) => {
                this.$log('link TO', to)
                // create node...
                if (unwatch) unwatch()
                let linkInput = JSON.parse(JSON.stringify(this.link))
                let link = await this.$rxdb.set(RxCollectionEnum.WS_JOINT, linkInput)
                this.$router.replace(`/workspace/link/${link.id}`)
              },
              {
                deep: true,
              }
            )
          }
          else {
            let item = await this.$rxdb.get(RxCollectionEnum.WS_JOINT, to)
            this.$log('FOUND link', item)
            this.link = item
          }
        }
      }
    },
  },
  methods: {
    itemTypeSet (index, type) {
      this.$log('itemTypeSet', index, type)
      this.$set(this.link.items[index], 'type', type)
    },
    itemFound (item, index) {
      this.$log('itemFound', item, index)
      let itemInput = {
        type: 'SOLUTION',
        item: item,
      }
      if (index === 0) {
        if (this.link.items[1]) {
          itemInput.type = this.itemTypes.find(i => i.id === this.link.items[1].type).pair
        }
      }
      if (index === 1) {
        if (this.link.items[0]) {
          itemInput.type = this.itemTypes.find(i => i.id === this.link.items[0].type).pair
        }
      }
      this.$set(this.link.items, index, itemInput)
    },
    itemDelete (index) {
      this.$log('itemDelete', index)
      this.$set(this.link.items, index, null)
    },
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        await this.$wait(1000)
        let jointInput = { leftItem: {oid: null}, rightItem: {oid: null} }
        // check 0 item
        if (this.link.items[0]) {
          if (this.link.items[0].item.oid) {
            jointInput.leftItem.oid = this.link.items[0].item.oid
          }
          else if (this.link.items[0].item.oidUrl) {
            // get content by url...
          }
          else if (this.link.items[0].item.wsItemType === 'WS_NODE') {
            // pre publish node
          }
          else {
            throw new Error('Wrong first item!')
          }
        }
        // check 1 item
        if (this.link.items[1]) {
          if (this.link.items[1].item.oid) {
            jointInput.rightItem.oid = this.link.items[1].item.oid
          }
          else if (this.link.items[1].item.oidUrl) {
            // get content by url...
          }
          else if (this.link.items[1].item.wsItemType === 'WS_NODE') {
            // pre publish node...
          }
          else {
            throw new Error('Wrong second item!')
          }
        }
        // essence
        if (this.link.type === 'ESSENCE') {
          if (this.link.name.length === 0) {
            jointInput.jointType = 'ASSOCIATIVE'
          }
          else {
            jointInput.jointType = 'ESSENCE'
            jointInput.name = this.link.name
          }
        }
        else {
          jointInput.jointType = 'ASSOCIATIVE'
        }
        // another types...
        let joint = await NodeApi.jointCreate(jointInput)
        this.$log('link done joint', joint)
        this.$log('publish done')
        this.publishing = false
        this.$router.replace('/link/' + joint.oid).catch(e => e)
        this.$rxdb.remove(this.link.id)
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
