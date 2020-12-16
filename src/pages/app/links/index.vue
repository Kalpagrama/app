<template lang="pug">
q-layout(view="hHh Lpr lff").b-30
  kalpa-loader(
    v-if="joint"
    :immediate="true"
    :query="jointsQuery" :limit="12"
    @items="jointsUpdated"
    v-slot=`{items, next, nexting}`)
  q-header.b-30
    .row.full-width.justify-center.q-px-sm.q-pt-sm
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
          height: '60px',
          borderRadius: '10px',
        }`).row.full-width.items-center.content-center.b-40.q-px-sm
        q-btn(
          @click="cancel()"
          round flat color="white" icon="west")
        span(:style=`{fontSize: '18px'}`).text-white.text-bold Links
  q-page-container()
    q-page(
      :style=`{
        paddingTop: '8px',
      }`
      ).row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-start.content-start
        .row.full-width
          node-feed(
            v-if="joint"
            :node="joint"
            :showHeader="joint.oid"
            :showActions="joint.oid")
            template(v-slot:items)
              node-editor(
                v-if="itemsLoaded"
                :node="joint"
                :showEditor="jointEditing"
                :itemsEditable="jointEditing ? [1] : []"
                :style=`{}`
                @node="jointEditCancel")
        //- graph
        div(
          v-if="itemsLoaded"
          ).row.full-width.text-white.q-py-md
          //- left side
          .col-6.q-pr-xs
            .row.justify-end
              q-btn(
                @click="itemPrev()"
                flat icon="keyboard_arrow_left" color="grey-8"
                :style=`{width: '40px', heigth: '40px',}`).b-40
              .col.q-pl-xs
                link-item(:item="joint.items[0]")
          //- right side
          .col-6.q-pl-xs
            .row.full-width.justify-start
              .row.full-width.justify-start.q-mb-xs
                q-btn(
                  @click="jointEditStart()"
                  flat color="green" icon="add"
                  :style=`{
                    width: '40px', height: '40px',
                  }`).b-40
              div(
                v-for="(item,ii) in items" :key="item.oid"
                ).row.full-width.justify-start.q-mb-xs
                div(
                  @click="itemClick(item,ii)"
                  ).col.q-pr-xs
                  link-item(
                    :item="item"
                    :style=`{
                      border: item.oid === itemActive ? '3px solid rgb(76,175,79)' : 'none'
                    }`)
                q-btn(
                  @click="itemNext(item,ii)"
                  flat icon="keyboard_arrow_right" color="grey-8"
                  :style=`{width: '40px', heigth: '40px',}`).b-40
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_links',
  components: {
    nodeEditor: () => import('components/node_editor/index.vue'),
    linkItem: () => import('./link_item.vue')
  },
  data () {
    return {
      joint: null,
      jointNew: {
        oid: null,
        items: [],
        name: '',
        vertices: [],
        spheres: [],
        category: 'FUN',
        layout: 'HORIZONTAL',
      },
      jointEditing: false,
      joints: [],
      items: [],
      itemsLoaded: false,
      itemActive: null,
    }
  },
  computed: {
    jointsQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidSphere: this.joint ? this.joint.items[0].oid : false,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        // this.$log('$route.params.oid TO', to)
        if (to) {
          let item = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
          let joint = JSON.parse(JSON.stringify(this.jointNew))
          joint.items[0] = item
          this.$set(this, 'joint', joint)
        }
      }
    }
  },
  methods: {
    jointEditStart () {
      this.$log('nodeEditStart')
      this.$set(this.joint.items, 1, {type: 'ADD'})
      this.itemActive = null
      this.jointEditing = true
      let joint = JSON.parse(JSON.stringify(this.jointNew))
      joint.items = this.joint.items
      this.$set(this, 'joint', joint)
    },
    async jointEditCancel () {
      this.$log('nodeEditCancel')
      this.itemSetInitial()
    },
    itemPrev () {
      this.$log('itemPrev')
      this.$set(this, 'joint', null)
      this.itemsLoaded = false
      this.$router.back()
    },
    itemNext (item, ii) {
      this.$log('itemNext', item, ii)
      this.itemsLoaded = false
      this.$set(this, 'joint', null)
      this.$router.push({params: {oid: item.oid}})
    },
    async itemClick (item, ii) {
      this.$log('itemClick', item, ii)
      this.itemActive = item.oid
      let joint = this.joints[ii]
      for (const p in joint) {
        if (p !== 'items') {
          this.$set(this.joint, p, joint[p])
        }
      }
      this.itemSet(item, 1)
    },
    async itemSet (item, index) {
      this.$log('itemSet', item, index)
      this.$set(this.joint.items, index, item)
    },
    itemSetInitial () {
      this.$log('itemSetInitial')
      if (this.items.length > 0) {
        this.jointEditing = false
        this.itemActive = this.items[0].oid
        let joint = this.joints[0]
        for (const p in joint) {
          if (p !== 'items') {
            this.$set(this.joint, p, joint[p])
          }
        }
        this.itemSet(this.items[0], 1)
      }
      else {
        this.jointEditing = true
        this.itemActive = null
        this.joint.oid = null
        this.itemSet({type: 'ADD'}, 1)
      }
    },
    jointsUpdated (joints) {
      this.$log('jointsUpdated')
      if (joints && joints.length > 0) {
        this.joints = joints
        this.items = joints.reduce((acc, val) => {
          // find joint.items[0] by oid? yep
          let i = val.items.findIndex(i => i.oid === this.joint.items[0].oid)
          let item = val.items[i === 0 ? 1 : 0]
          acc.push(item)
          return acc
        }, [])
      }
      if (this.itemsLoaded) {
        // do nothing...
      }
      else {
        this.itemsLoaded = true
        this.itemSetInitial()
      }
    }
  },
  mounted () {
    // this.$log('mounted')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
  }
}
</script>
