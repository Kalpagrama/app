<style lang="sass">
.sphere-item
  cursor: pointer
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
//- q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.b-30
        div(
          :style=`{height: '50px'}`).row.full-width.items-center.content-center.justify-between.q-px-md
          span(:style=`{fontSize: '19px'}`).text-white.text-bold {{ $t('wsSpheres_title', 'Сферы') }}
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{maxWidth: '800px'}`).row.full-width
        slot(name="header")
        .row.full-width.q-px-sm
          .col
            div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
              q-input(
                v-model="searchString"
                filled dark dense color="white"
                :debounce="400"
                :placeholder="$t('wsSpheres_searchPlaceholder', 'Найти сферу')"
                ).full-width
                template(v-slot:append)
                  q-btn(
                    v-if="searchString.length > 0"
                    flat dense color="white" icon="clear" @click="searchString = ''")
                  q-btn(
                    flat dense color="white" icon="tune")
          q-btn(
            @click="sphereAdd()"
            round flat dense color="green" icon="add")
  q-page-container
    q-page(:style=`{paddingTop: '16px', paddingBottom: '200px',}`).row.full-width.justify-center
      div(
        :class=`{
          //- 'q-px-xs': $q.screen.width < 800,
        }`
        :style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start.q-px-xs
        kalpa-loader(:mangoQuery="querySpheres" :sliceSize="1000" @items="spheresLoaded")
          template(v-slot=`{items}`)
        kalpa-loader(
          v-if="spheresMapped"
          :mangoQuery="queryItems" :sliceSize="1000" @items="itemsLoaded")
          template(v-slot=`{items}`)
        div(
          v-for="(s,si) in spheresMap" :key="s.id"
          ).col-xs-12.col-sm-6.q-pa-xs
          div(
            @click="sphereClick(s,si)"
            :style=`{
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).row.full-width.b-40.sphere-item
            //- header: sphere.name
            div(
              :style=`{height: '40px'}`
              ).row.full-width.items-center.content-center.q-px-sm
              q-icon(name="blur_on" color="white" size="20px").q-mr-sm
              span.text-white {{ s.name }}
            //- items
            div(v-if="s.items.length > 0").row.full-width.q-pa-sm
              div(
                v-for="(i,ii) in s.items" :key="i.id"
                :style=`{
                  width: '50px', height: '50px',
                  borderRadius: '10px', overflow: 'hidden',
                }`
                ).b-50
                img(
                  :src="i.thumbOid" draggable="false"
                  :style=`{borderRadius: '10px', overflow: 'hidden', objectFit: 'cover'}`
                  ).fit
          //- template(v-slot=`{items}`)
            .row.full-width.items-start.content-start.q-px-sm
              div(v-for="(s,si) in items" :key="i").row.full-width.q-mb-sm
                ws-sphere-item(
                  @clicked="sphereClicked(s)"
                  :id="s.id" :sphere="s"
                  :style=`{borderRadius: '10px', overflow: 'hidden'}`
                  ).full-width.b-40
        //- kalpa-loader(:mangoQuery="mangoQuery" :sliseSize="1000")
          template(v-slot=`{items}`)
            .row.full-width.items-start.content-start.q-px-sm
              div(
                v-for="(s,si) in items" :key="s.id"
                @click="sphereClick(s)"
                ).col-6.q-pr-sm.q-pb-sm
                div(
                  :style=`{borderRadius: '10px', overflow: 'hidden'}`
                  ).row.fit.b-40.sphere-item
                  .row.full-width.items-center.content-center.q-pa-md
                    q-icon(name="blur_on" color="grey-7" size="24px").q-mr-sm
                    span.text-white.text-bold.q-mb-xs {{ s.name }}
                  .row.full-width.items-start.content-start.q-px-sm
                    div(
                      v-for="(i,ii) in s.items" :key="ii"
                      :style=`{
                        width: '50px', height: '50px',
                        borderRadius: '10px', overflow: 'hidden',
                      }`).row.q-mr-sm.q-mb-sm
                      img(
                        :src="i.thumbOid" draggable="false"
                        :style=`{
                          objectFit: 'cover'
                        }`).fit
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsSpheres',
  data () {
    return {
      searchString: '',
      spheresMap: {},
      spheresMapped: false,
    }
  },
  computed: {
    querySpheres () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_SPHERE
        }
      }
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
    queryItems () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_ANY
        }
      }
      return res
    }
  },
  methods: {
    async spheresLoaded (spheres) {
      this.$log('spheresLoaded', spheres)
      this.spheresMapped = false
      this.spheresMap = {}
      await this.$wait(300)
      spheres.map(s => {
        this.$set(this.spheresMap, s.id, {id: s.id, oid: s.oid, name: s.name, items: []})
      })
      this.spheresMapped = true
    },
    itemsLoaded (items) {
      this.$log('itemsLoaded', items)
      items.map(i => {
        if (i.spheres && i.spheres.length > 0) {
          i.spheres.map(s => {
            if (this.spheresMap[s]) {
              this.spheresMap[s].items.push(i)
            }
          })
        }
      })
    },
    sphereClick (sphere) {
      this.$log('sphereClick', sphere)
      this.$router.push(`/workspace/sphere/${sphere.id}`).catch(e => e)
    },
    async sphereAdd () {
      this.$log('sphereAdd')
      let name = prompt('Sphere name', this.searchString)
      if (name) {
        let sphereInput = {
          wsItemType: 'WS_SPHERE',
          name: name,
          items: []
        }
        let sphere = await this.$rxdb.set(RxCollectionEnum.WS_SPHERE, sphereInput)
        this.$router.push(`/workspace/sphere/${sphere.id}`)
        this.searchString = ''
      }
    },
  }
}
</script>
