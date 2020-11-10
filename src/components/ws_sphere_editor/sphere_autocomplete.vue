<style lang="sass" scoped>
.sphere-item
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
.column.full-width.b-30
  .row.full-width
    slot(name="header")
    //- .row.full-width.q-pa-md
      span.text-grey-8 Выберите сферу
  .col.full-width.scroll
    kalpa-loader(
      :immediate="true"
      :query="spheresQuery" :limit="1000" v-slot=`{items}`)
      .row.full-width.items-start.content-start.q-px-sm
        //- v-if="!selected.includes(sphere.id)"
        div(
          v-for="(sphere,ii) in items" :key="sphere.id"
          :class=`{
            'b-60': selected.includes(sphere.id),
            'b-40': !selected.includes(sphere.id),
          }`
          :style=`{
            position: 'relative',
            height: '40px',
            borderRadius: '10px',
            //- background: 'rgb(35,35,35)',
          }`
          ).row.full-width.q-mb-xs
          .col.full-height
            q-btn(
              @click="sphereClick(sphere)"
              flat color="white" dense no-caps align="left"
              ).fit.q-pl-md
              span.text-white {{ sphere.name }}
          q-btn(round flat dense color="grey-8" icon="more_vert")
            q-popup-proxy(
              anchor="bottom right" self="top right"
              position="bottom"
              maximized dark)
              div(
                :class=`{
                  'b-30': $q.screen.lt.md
                }`
                :style=`{
                  borderRadius: '10px', overflow: 'hidden',
                  minWidth: '300px',
                }`).row.full-width.items-start.content-start
                //- header
                //- div(
                  v-if="$q.screen.lt.md"
                  :style=`{
                    textAlign: 'center'
                  }`).row.full-width.justify-center.q-py-md
                  span.text-white "{{ node.name }}"
                //- actions
                .row.full-width.items-start.content-start
                  q-btn(
                    v-for="(a,akey) in actions" :key="akey"
                    v-close-popup
                    @click="a.cb(sphere)"
                    flat no-caps
                    :color="a.color || 'white'"
                    :style=`{
                      height: '50px',
                    }`
                    ).row.full-width {{ a.name }}
  .row.full-width
    slot(name="footer")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'sphereAutocomplete',
  props: {
    searchString: {
      type: String,
      default: ''
    },
    selected: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
    }
  },
  computed: {
    spheresQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_SPHERE}}
      // add name filter...
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
    actions () {
      return {
        rename: {
          name: 'Rename',
          cb: (sphere) => {
            this.$log('sphereRename', sphere)
          }
        },
        delete: {
          name: 'Delete',
          cb: async (sphere) => {
            this.$log('sphereDelete', sphere)
            await sphere.remove(true)
            // await this.$rxdb.remove(sphere.id)
          }
        }
      }
    }
  },
  methods: {
    sphereClick (sphere) {
      this.$log('sphereClick', sphere)
      this.$emit('sphere', sphere)
    }
  }
}
</script>
