<template lang="pug">
component(
  v-if="joint"
  v-bind="$props"
  :is="$q.screen.gt.sm ? 'view-desktop' : 'view-mobile'"
  :joint="joint")
//- q-layout(view="hHh Lpr lff")
  q-header().b-30
    .row.full-width.justify-center
      .row.full-width.items-center.content-center.q-pa-sm
        q-btn(flat round color="grey-8" icon="keyboard_arrow_left" no-caps @click="$router.back()")
        .col
          .row.full-width.justify-center
            q-btn(no-caps color="green").q-px-md
              span.text-white Связать
            //- span(:style=`{fontSize: '18px'}`).text-white.text-bold Joint creator
            //- edit-name(v-if="joint" :node="joint")
        //- q-btn(round flat color="grey-8" icon="delete_outline" @click="$router.back()")
        q-btn(round flat color="grey-8" icon="more_vert")
        //- q-btn(no-caps color="green") Publish
      div(v-if="joint").row.full-width
        edit-name(v-if="joint" :node="joint").full-width
      div(v-if="joint").row.full-width.q-gutter-xs.q-pr-xs
        div(
          @click="itemOpened = ii"
          v-for="(i,ii) in 2" :key="ii"
          :style=`{maxWidth: itemOpened === ii ? '100%' : '50px'}`
          ).col
          .row.fit.items-end.content-end
            div(
              :style=`{
                background: 'rgb(35,35,35)',
                borderRadius: '10px',
              }`).row.full-width
              img(
                :src="joint.items[0].thumbUrl"
                :style=`{borderRadius: '10px',}`).full-width.fit
              div(
                :style=`{
                  height: '40px',
                  textAlign: 'center',
                }`
                ).row.full-width.items-center.content-center.justify-center
                div(:style=`{height: '40px', width: '40px'}`).row.items-center.content-center.justify-center
                  q-icon(name="select_all" size="24px" color="white")
                span(v-if="itemOpened === ii").text-white alaks dl laksmdlakm slakms dlkams
      //- div(v-if="joint").row.full-width
        edit-name(v-if="joint" :node="joint").full-width
        //- .col
          .row.full-width.justify-end.q-px-md
            span.text-white.text-bold Причина
        //- .col
          .row.full-width.justify-start.q-px-md
            span.text-white.text-bold Следствие
      //- div(
        v-if="joint"
        ).row.full-width.q-gutter-sm.q-pr-sm
        div(
          v-for="(i,ii) in 2" :key="ii"
          ).col
          edit-item(:item="joint.items[ii]")
  //- q-page-container
    q-page(
      :style=`{
        paddingTop: '0px',
      }`
      ).row.full-width.q-px-xs
      kalpa-finder
    //- q-page-container.row.full-width.justify-center
      div(
        v-if="joint"
        :style=`{
          maxWidth: '500px',
        }`
        ).row.full-width.br
        //- edit-name(:node="joint")
        //- q-input(
          v-model="joint.name"
          borderless dark color="grey-6"
          placeholder="В чем суть?"
          ).full-width
        q-btn(
          v-if="joint && joint.items.length === 2"
          color="green" size="xl" no-caps).full-width Publish
      //- .row.full-width.b-40
        div(v-for="(i,ii) in 100" :key="ii").row.full-width.b-40.q-mb-sm.q-py-md {{ii}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsJoint',
  components: {
    // editItem: () => import('./edit_item/index.vue'),
    // editName: () => import('components/node_editor/view_publish/edit_name.vue'),
    viewDesktop: () => import('./view_desktop/index.vue'),
    viewMobile: () => import('./view_mobile/index.vue')
  },
  data () {
    return {
      jointNew: {
        name: '',
        type: 'ASSOCIATIVE',
        items: [],
      },
      joint: null,
      itemOpened: 0,
    }
  },
  methods: {
    itemFound (item) {
      this.$log('itemFound', item)
      this.joint.items.push(item)
    },
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          if (to === 'new') {
            // this.$q.notify({type: 'positive', position: 'top', message: 'Creating new joint'})
            this.joint = JSON.parse(JSON.stringify(this.jointNew))
            // // get first item
            if (this.$route.query.oid) {
              let item = await this.$rxdb.get(RxCollectionEnum.OBJ, this.$route.query.oid)
              this.itemFound(item, 0)
            }
            if (this.$route.query.id) {
              let item = await this.$rxdb.get(RxCollectionEnum.WS_ANY, this.$route.query.id)
              this.itemFound(item, 0)
            }
            // remove it after adding? $router.replace()
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
            if (item) this.joint = item
            else this.$router.replace('/workspace/joints')
          }
        }
      }
    },
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', false])
    // jointItem ?
    // get joint item ?
    let item = this.$store.state.ui.jointEditorItem
    this.$log('item', item)
    if (item) {
      this.itemFound(item)
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
  }
}
</script>
